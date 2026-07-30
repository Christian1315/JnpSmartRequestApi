import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SeedRoles{
    constructor(private readonly prisma:PrismaService){}

    async init(){
        const roles = [
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

        // Supprimer les rôles existants pour éviter les doublons
        await this.prisma.role.deleteMany();
    
        // insertions
        await this.prisma.role.createMany({
            data: roles
        });
    
        console.log('Rôles inserés avec succès:.');
    }
};
