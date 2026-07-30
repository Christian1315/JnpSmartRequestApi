// auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service'; 
import { AuthLoggerService } from './auth.logger';
import { Response,Request } from 'express';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly authLoggerService: AuthLoggerService
    ) {}

    // formattage des données
    userFormat = (user: any) => {
        const {role,...restUser} = user        
        return {
            ...restUser,
            roleName:role.name,
            permissions: user.role?.permissions?.map((pr: any) => ({
                id: pr.id,
                name: pr.name,
            })),
        };
    };

    // login
    async login(email: string, password: string) {
        this.authLoggerService.log("Début d'authentification")

        // Rechercher l'utilisateur par email
        const user = await this.prisma.user.findFirst({
            where: { email, deletedAt: null },
            include:{
                role:{
                    include:{
                        permissions:true
                    }
                }
            }
        });

        if (!user) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        // Comparer le mot de passe fourni avec le hash stocké
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            throw new UnauthorizedException('Identifiants invalides');
        }

        // Générer les tokens
        const payload = { sub: user.id, email: user.email, roleId: user.roleId };
        const accessToken = this.jwtService.sign(payload, { expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '1800') }); // 30 minutes

        const refreshTokenTtl = parseInt(process.env.JWT_REFRESH_EXPIRES_IN ?? '86400', 10); // en secondes
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: refreshTokenTtl,
        });

        // enregistrement du refrehToken en db
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + refreshTokenTtl * 1000) // convert seconds to milliseconds
            }
        });

        // Retirer le mot de passe avant de renvoyer l'utilisateur
        const { password: _, ...safeUser } = user;

        this.authLoggerService.log("Fin d'authentification")
        return { accessToken, refreshToken, user: this.userFormat(safeUser) };
    }

    // refresh
    async refresh(req: Request, res: Response) {
        this.authLoggerService.log('Début du refresh de token...');

        const refreshToken = req.cookies?.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token inexistant!');
        }

        let decoded: any;

        try {
            decoded = this.jwtService.verify(refreshToken, {
            secret: process.env.JWT_REFRESH_SECRET,
            });
        } catch (error) {
            this.authLoggerService.log(`Refresh token invalide: ${error.message}`);
            throw new UnauthorizedException('Refresh token invalide ou expiré!');
        }

        this.authLoggerService.log(`Decoded payload: ${JSON.stringify(decoded)}`);

        const payload = {
            sub: decoded.sub,
            email: decoded.email,
            roleId: decoded.roleId,
        };

        const accessToken = this.jwtService.sign(payload, {
            expiresIn: parseInt(process.env.JWT_EXPIRES_IN ?? '1800', 10),
        });

        this.authLoggerService.log(`New accessToken: ${accessToken}`);

        const isProd = process.env.NODE_ENV === 'production';
        const accessTokenTtl = parseInt(process.env.JWT_EXPIRES_IN ?? '1800', 10);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? 'none' : 'lax',
            maxAge: accessTokenTtl * 1000,
        });

        this.authLoggerService.log(`Refresh effectué avec succès!`);

        res.json({ message: 'Refresh effectué avec succès!', user: payload });
    }

    // logout
    async logout(res:Response){
        this.authLoggerService.log("Début de déconnexion...")
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return { message: 'Déconnexion réussie' };
    }
}