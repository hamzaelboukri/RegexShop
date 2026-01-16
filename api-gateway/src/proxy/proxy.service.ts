import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ServicesConfig, ServiceName } from '../config';

export interface ProxyRequestOptions {
  service: ServiceName;
  path: string;
  method: string;
  body?: unknown;
  headers?: Record<string, string>;
  query?: Record<string, string>;
}

export interface ProxyResponse {
  data: unknown;
  status: number;
  headers: Record<string, string>;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  /**
   * Forward request to a microservice
   */
  async forward(options: ProxyRequestOptions): Promise<ProxyResponse> {
    const { service, path, method, body, headers = {}, query } = options;
    const serviceConfig = ServicesConfig[service];

    if (!serviceConfig) {
      throw new HttpException(
        `Unknown service: ${service}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Build the target URL
    let targetUrl = `${serviceConfig.url}${path}`;
    
    // Add query parameters if present
    if (query && Object.keys(query).length > 0) {
      const queryString = new URLSearchParams(query).toString();
      targetUrl += `?${queryString}`;
    }

    this.logger.debug(`Proxying ${method} request to ${targetUrl}`);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...this.filterHeaders(headers),
        },
      };

      // Add body for non-GET requests
      if (body && method !== 'GET' && method !== 'HEAD') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(targetUrl, fetchOptions);
      
      // Get response data
      const contentType = response.headers.get('content-type');
      let data: unknown;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Extract response headers we want to forward
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        if (this.shouldForwardResponseHeader(key)) {
          responseHeaders[key] = value;
        }
      });

      return {
        data,
        status: response.status,
        headers: responseHeaders,
      };
    } catch (error) {
      this.logger.error(
        `Failed to proxy request to ${serviceConfig.name}: ${(error as Error).message}`,
      );

      // Check if service is unavailable
      if ((error as NodeJS.ErrnoException).code === 'ECONNREFUSED') {
        throw new HttpException(
          {
            message: `Service ${serviceConfig.name} is unavailable`,
            service: serviceConfig.name,
          },
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      throw new HttpException(
        {
          message: `Failed to connect to ${serviceConfig.name}`,
          error: (error as Error).message,
        },
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  /**
   * Filter request headers to forward
   */
  private filterHeaders(headers: Record<string, string>): Record<string, string> {
    const headersToForward = [
      'authorization',
      'x-request-id',
      'x-correlation-id',
      'accept',
      'accept-language',
      'user-agent',
    ];

    const filtered: Record<string, string> = {};
    
    for (const [key, value] of Object.entries(headers)) {
      const lowerKey = key.toLowerCase();
      if (headersToForward.includes(lowerKey)) {
        filtered[key] = value;
      }
    }

    return filtered;
  }

  /**
   * Check if response header should be forwarded
   */
  private shouldForwardResponseHeader(header: string): boolean {
    const headersToForward = [
      'content-type',
      'x-request-id',
      'x-correlation-id',
      'x-ratelimit-limit',
      'x-ratelimit-remaining',
    ];

    return headersToForward.includes(header.toLowerCase());
  }

  /**
   * Check service health
   */
  async checkServiceHealth(service: ServiceName): Promise<{
    name: string;
    status: 'healthy' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }> {
    const serviceConfig = ServicesConfig[service];
    const startTime = Date.now();

    try {
      const response = await fetch(`${serviceConfig.url}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const responseTime = Date.now() - startTime;

      if (response.ok) {
        return {
          name: serviceConfig.name,
          status: 'healthy',
          responseTime,
        };
      }

      return {
        name: serviceConfig.name,
        status: 'unhealthy',
        responseTime,
        error: `HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        name: serviceConfig.name,
        status: 'unhealthy',
        error: (error as Error).message,
      };
    }
  }

  /**
   * Check all services health
   */
  async checkAllServicesHealth(): Promise<
    Array<{
      name: string;
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    }>
  > {
    const services = Object.keys(ServicesConfig) as ServiceName[];
    const healthChecks = services.map((service) => this.checkServiceHealth(service));
    return Promise.all(healthChecks);
  }
}
