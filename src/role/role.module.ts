// user/user.module.ts
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import { LoggerService } from './role.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; // 👈 AJOUTE CET IMPORT

@Module({
  imports: [AuthModule], // 👈 AJOUTE CETTE LIGNE
  providers: [RoleService, LoggerService],
  controllers: [RoleController],
})
export class RoleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'roles/public', method: RequestMethod.GET },
      )
      .forRoutes(RoleController);
  }
}