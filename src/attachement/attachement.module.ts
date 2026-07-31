// attachement/attachement.module.ts
import { AttachementService } from './attachement.service'; 
import { AttachementController } from './attachement.controller';
import { LoggerService } from './attachement.logger'; 
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from 'src/middleware/api-key.middleware'; 
import { AuthModule } from 'src/auth/auth.module'; 

@Module({
  imports: [AuthModule],
  providers: [AttachementService, LoggerService], 
  controllers: [AttachementController],
})
export class AttachementModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'attachments/public', method: RequestMethod.GET },
      )
      .forRoutes(AttachementController);
  }
}

