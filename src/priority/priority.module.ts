// priority/priority.module.ts
import { PriorityService } from './priority.service';
import { PriorityController } from './priority.controller';
import { LoggerService } from './priority.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [AuthModule], 
  providers: [PriorityService, LoggerService],
  controllers: [PriorityController],
})
export class PriorityModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'priorities/public', method: RequestMethod.GET },
      )
      .forRoutes(PriorityController);
  }
}