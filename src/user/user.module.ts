// user/user.module.ts
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LoggerService } from './user.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; // 👈 AJOUTE CET IMPORT

@Module({
  imports: [AuthModule], // 👈 AJOUTE CETTE LIGNE
  providers: [UserService, LoggerService],
  controllers: [UserController],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'users/public', method: RequestMethod.GET },
      )
      .forRoutes(UserController);
  }
}