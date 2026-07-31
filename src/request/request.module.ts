// request/request.module.ts
import { RequestService } from './request.service';
import { RequestController } from './request.controller';
import { LoggerService } from './request.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; // 👈 AJOUTE CET IMPORT

@Module({
  imports: [AuthModule], 
  providers: [RequestService, LoggerService],
  controllers: [RequestController],
})
export class RequestModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'requests/public', method: RequestMethod.GET },
      )
      .forRoutes(RequestController);
  }
}