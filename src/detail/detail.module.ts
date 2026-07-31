// request/request.module.ts
import { DetailService } from './detail.service';
import { DetailController } from './detail.controller';
import { LoggerService } from './detail.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; // 👈 AJOUTE CET IMPORT

@Module({
  imports: [AuthModule], 
  providers: [DetailService, LoggerService],
  controllers: [DetailController],
})
export class DetailModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'comments/public', method: RequestMethod.GET },
      )
      .forRoutes(DetailController);
  }
}