import * as bcrypt from 'bcrypt';
import { PrismaService } from "../../prisma/prisma.service";
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserSeeders {
    constructor(private readonly prisma: PrismaService) {}

    async init() {
        const users = [
            {
                fullname: 'Super administrateur',
                email: "admin@gmail.com",
                password: await bcrypt.hash('admin@2026', 10),
                roleId: 1, // affectation du premier role
            },
        ];

        // Supprimer les users existants pour éviter les doublons
        await this.prisma.user.deleteMany();

        // Insertion de nouveaux users
        await this.prisma.user.createMany({
            data: users,
        });

        console.log('Users insérés avec succès.');
    }
}