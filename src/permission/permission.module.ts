// user/user.module.ts
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { LoggerService } from './permission.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; // 👈 AJOUTE CET IMPORT

@Module({
  imports: [AuthModule], // 👈 AJOUTE CETTE LIGNE
  providers: [PermissionService, LoggerService],
  controllers: [PermissionController],
})
export class PermissionModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'permissions/public', method: RequestMethod.GET },
      )
      .forRoutes(PermissionController);
  }
}