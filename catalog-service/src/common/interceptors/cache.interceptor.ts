import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CacheInterceptor.name);
  private readonly ttl = 300000; // 5 minutes in milliseconds

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle();
    }

    // Generate cache key from URL and query params
    const cacheKey = this.generateCacheKey(request);

    // Try to get from cache
    const cachedData = await this.cacheManager.get(cacheKey);
    if (cachedData) {
      this.logger.debug(`Cache HIT: ${cacheKey}`);
      return of(cachedData);
    }

    // Execute handler and cache the result
    this.logger.debug(`Cache MISS: ${cacheKey}`);
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, this.ttl);
      }),
    );
  }

  private generateCacheKey(request: any): string {
    const { url, query } = request;
    const queryString = Object.keys(query)
      .sort()
      .map((key) => `${key}=${query[key]}`)
      .join('&');
    return `cache:${url}?${queryString}`;
  }
}
