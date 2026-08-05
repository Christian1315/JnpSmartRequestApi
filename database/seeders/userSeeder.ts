import * as bcrypt from 'bcrypt';
import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSeeders {
    constructor(private readonly prisma: PrismaService) {}

    async init() {
        // Récupère dynamiquement le rôle admin par son nom, peu importe son ID réel
        const adminRole = await this.prisma.role.findFirst({
            where: { name: 'Super Administrateur' },
        });

        if (!adminRole) {
            throw new Error('Rôle "Super Administrateur" introuvable — vérifiez que rolesSeeder tourne avant userSeeder.');
        }

        const data = [
            {
                fullname: 'Super administrateur',
                email: "admin@gmail.com",
                phone:"0156854397",
                password: await bcrypt.hash('admin@2026', 10),
                roleId: adminRole.id,
            },
        ];


        // TRUNCATE avec RESTART IDENTITY : vide la table ET remet la séquence auto-increment à 1
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE users;`);
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);
        
        // await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "users" RESTART IDENTITY CASCADE;`
        // );

        // // Supprimer les users existants pour éviter les doublons
        // await this.prisma.user.deleteMany();

        // Insertion de nouveaux users
        await this.prisma.user.createMany({
            data: data,
        });

        console.log('Users insérés avec succès.');
    }
}