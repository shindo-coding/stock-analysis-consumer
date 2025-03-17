import { Injectable, OnModuleInit } from '@nestjs/common';
import { logMessage } from '../logging/custom.logger';
import { PrismaClient } from 'shindo-coding-typed-prisma-package';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      logMessage('error', error);
    }
  }
}
