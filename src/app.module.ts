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
  ],
  controllers: [AppController],
  providers: [AppService], 
})
export class AppModule {}