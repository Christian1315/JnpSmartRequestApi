// site/site.module.ts
import { SiteService } from './site.service';
import { SiteController } from './site.controller';
import { LoggerService } from './site.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [AuthModule], 
  providers: [SiteService, LoggerService],
  controllers: [SiteController],
})
export class SiteModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'sites/public', method: RequestMethod.GET },
      )
      .forRoutes(SiteController);
  }
}