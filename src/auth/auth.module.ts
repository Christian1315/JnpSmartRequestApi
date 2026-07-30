// auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt'; // JwtService n'est pas utilisé directement ici, tu peux enlever l'import si inutile
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthLoggerService } from './auth.logger';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '86400', 10)}, // en secondes },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, AuthLoggerService],
  exports: [AuthService, AuthLoggerService, JwtModule], // 👈 JwtModule ajouté ici
})
export class AuthModule {}