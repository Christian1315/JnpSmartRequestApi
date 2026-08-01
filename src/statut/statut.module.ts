// statut/statut.module.ts
import { StatutService } from './statut.service';
import { StatutController } from './statut.controller';
import { LoggerService } from './statut.logger';
import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { ApiKeyMiddleware } from '../middleware/api-key.middleware';
import { AuthModule } from '../auth/auth.module'; 

@Module({
  imports: [AuthModule], 
  providers: [StatutService, LoggerService],
  controllers: [StatutController],
})
export class StatutModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ApiKeyMiddleware)
      .exclude(
        { path: 'statuts/public', method: RequestMethod.GET },
      )
      .forRoutes(StatutController);
  }
}