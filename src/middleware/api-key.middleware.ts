import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response, NextFunction } from 'express';
import { AuthLoggerService } from 'src/auth/auth.logger';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(
    private readonly authLoggerService: AuthLoggerService,
    private readonly jwtService: JwtService,
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedException('Accès réfusé! Token invalide!');
    }

    try {
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      req.user = decoded;
      this.authLoggerService.log(`Utilisateur authentifié: ${decoded.sub ?? decoded.id}`);
      next(); // un seul appel
    } catch (error) {
      throw new UnauthorizedException('Accès réfusé! Token invalide!');
    }
  }
}