import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from 'prisma/prisma.module';
import { RoleModule } from './role/role.module';
import { PermissionModule } from './permission/permission.module';
import { RequestModule } from './request/request.module';
import { DetailModule } from './detail/detail.module';
import { AttachementModule } from './attachement/attachement.module';
import { CategoryModule } from './category/category.module';
import { SiteModule } from './site/site.module';
import { StatutModule } from './statut/statut.module';
import { PriorityModule } from './priority/priority.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    RequestModule,
    DetailModule,
    AttachementModule,
    CategoryModule,
    SiteModule,
    StatutModule,
    PriorityModule,
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}