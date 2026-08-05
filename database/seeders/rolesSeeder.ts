import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SeedRoles {
    constructor(private readonly prisma: PrismaService) {}

    async init() {

        const data = [
            {
                name: 'Super Administrateur',
                description: 'Administrateur du système avec tous les privilèges'
            },
            {
                name: 'Administrateur',
                description: 'Administrateur avec des privilèges limités'
            },
            {
                name: "Demandeur",
                description: "La personne ayant le privilège de faire des demandes"
            },
            {
                name: "Responsable de traitement",
                description: "Responsabilités de traitement des demandes"
            }
        ];

        // TRUNCATE avec RESTART IDENTITY : vide la table ET remet la séquence auto-increment à 1
        

        // rolesSeeder.ts
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE roles;`);
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

        // await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "roles" RESTART IDENTITY CASCADE;`
        // );

        // insertions
        await this.prisma.role.createMany({
            data: data
        });

        console.log('Rôles insérés avec succès.');
    }
}