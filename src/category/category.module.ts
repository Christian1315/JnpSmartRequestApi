// category/category.module.ts
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { LoggerService } from './category.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [AuthModule], 
  providers: [CategoryService, LoggerService],
  controllers: [CategoryController],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'categories/public', method: RequestMethod.GET },
      )
      .forRoutes(CategoryController);
  }
}