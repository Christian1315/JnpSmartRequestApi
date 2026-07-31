// auth/auth.controller.ts
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login-dto';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('login')
    async login(@Body() LoginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { accessToken, refreshToken, user } = await this.authService.login(
            LoginDto.email,
            LoginDto.password,
        );

        const isProd = process.env.NODE_ENV === 'production';

        const accessTokenTtl = parseInt(process.env.JWT_EXPIRES_IN ?? '1800', 10); // secondes
        const refreshTokenTtl = parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '86400', 10); // secondes

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: accessTokenTtl * 1000, // 30 min en ms
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: refreshTokenTtl * 1000, // 1 jour en ms
        });

        return { user };
    }

    @Post('refresh')
    refresh(@Req() req: Request, @Res() res: Response) {
        return this.authService.refresh(req, res);
    }

    @Post("logout")
    logout(@Res({ passthrough: true }) res: Response) {
       return this.authService.logout(res)
    }
}