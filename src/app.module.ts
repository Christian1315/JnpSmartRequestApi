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

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    RequestModule,
    DetailModule,
  ],
  controllers: [AppController], // 👈 uniquement le controller propre à AppModule
  providers: [AppService], // 👈 uniquement le provider propre à AppModule
})
export class AppModule {}