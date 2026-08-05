import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SeedPermissions {
    constructor(private readonly prisma:PrismaService){}

    async init(){
        const createCrudPermissions = (permission:string, name:string) => {
            return [
                { name: `${name}.view`, description: `Voir les ${permission}` },
                { name: `${name}.create`, description: `Créer des ${permission}` },
                { name: `${name}.edit`, description: `Modifier les ${permission}` },
                { name: `${name}.delete`, description: `Supprimer des ${permission}` },
                { name: `${name}.validate`, description: `Valider les ${permission}` },
            ];
        }

        const permissions = [
            ...createCrudPermissions('utilisateurs', 'user'),
            ...createCrudPermissions('rôles', 'role'),
            ...createCrudPermissions('permissions', 'permission'),
            ...createCrudPermissions('demandes', 'commande'),
            ...createCrudPermissions('categories', 'categorie'),
            ...createCrudPermissions('priorites', 'priorite'),
            ...createCrudPermissions('sites', 'site'),
            ...createCrudPermissions('statuts', 'statut'),
        ];
        
        // TRUNCATE avec RESTART IDENTITY : vide la table ET remet la séquence auto-increment à 1
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE permissions;`);
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

        // await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "permissions" RESTART IDENTITY CASCADE;`
        // );

        // // Supprimer les permissions existantes pour éviter les doublons
        // await this.prisma.permission.deleteMany();
    
        // insertions
        await this.prisma.permission.createMany({
            data: permissions
        });
        console.log('Permissions inserées avec succès:.');
    }
};
