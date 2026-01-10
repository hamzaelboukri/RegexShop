import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

let PrismaClient: any;

// Dynamic import to avoid build-time issues
async function getPrismaClient() {
  if (!PrismaClient) {
    const module = (await import('@prisma/client')) as any;
    PrismaClient = module.PrismaClient;
  }
  return PrismaClient;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prismaClient: any;

  async initClient() {
    const PC = await getPrismaClient();
    if (!this.prismaClient) {
      this.prismaClient = new PC();
    }
    return this.prismaClient;
  }

  // Proxy all properties and methods to the actual PrismaClient
  get order() {
    return this.prismaClient.order;
  }

  get orderItem() {
    return this.prismaClient.orderItem;
  }

  $queryRaw(query: any) {
    return this.prismaClient.$queryRaw(query);
  }

  $executeRaw(query: any) {
    return this.prismaClient.$executeRaw(query);
  }

  $transaction(fn: any) {
    return this.prismaClient.$transaction(fn);
  }

  async onModuleInit() {
    await this.initClient();
    await this.prismaClient.$connect();
  }

  async onModuleDestroy() {
    if (this.prismaClient) {
      await this.prismaClient.$disconnect();
    }
  }
}
