import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SeedTools {
    constructor(private readonly prisma: PrismaService) {}

    async init() {
        const tools = {
            sites: [
                { name: 'Aïbatin' },
                { name: 'Togoudo' },
                { name: 'Calavi' },
                { name: 'Zongo' },
                { name: 'Zogbo' },
                { name: 'Gbegamey' },
                { name: 'Sainte Rita' },
                { name: 'Zogbadjè' },
                { name: 'Akpakpa Yagbé' },
            ],

            statuts: [
                { name: 'Brouillon', description: "La demande est à l'état brouillon" },
                { name: 'Soumise', description: 'La demande est déjà soumise.' },
                { name: 'En analyse', description: "La demande est en cours d'analyse." },
                { name: 'Approuvée', description: 'La demande est approuvée.' },
                { name: 'Rejetée', description: 'La demande est rejetée.' },
                { name: 'En cours de traitement', description: 'La demande est en cours de traitement.' },
                { name: 'Clôturée', description: 'La demande est Clôturée.' },
                { name: 'Résolue', description: 'La demande est résolue.' },
            ],

            categories: [
                { name: 'Informatique', description: "Demande de la Informatique" },
                { name: 'Maintenance/Technique', description: "Demande de la Maintenance/Technique" },
                { name: 'Logistique/Fournitures', description: "Demande de la Logistique/Fournitures" },
                { name: 'RH', description: "Demande de la RH" },
                { name: 'Sécurité', description: "Demande de la Sécurité" },
                { name: 'Finance/Comptabilité', description: "Demande de la Finance/Comptabilité" },
                { name: 'Communication', description: "Demande de la Communication" },
                { name: 'Autre', description: "Les Autres" },
            ],

            priorities: [
                { name: 'Très urgent', description: "Demande très urgent" },
                { name: 'Urgent', description: "Demande urgent" },
                { name: 'Moins Urgent', description: "Demande moins urgent" },
            ],
        };
        
        
        // TRUNCATE avec RESTART IDENTITY : vide la table ET remet la séquence auto-increment à 1
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 0;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE sites;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE categories;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE statuts;`);
        await this.prisma.$executeRawUnsafe(`TRUNCATE TABLE priorities;`);
        await this.prisma.$executeRawUnsafe(`SET FOREIGN_KEY_CHECKS = 1;`);

        // await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "sites" RESTART IDENTITY CASCADE;`
        // );
        //  await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "categories" RESTART IDENTITY CASCADE;`
        // );
        //  await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "statuts" RESTART IDENTITY CASCADE;`
        // );
        //  await this.prisma.$executeRawUnsafe(
        //     `TRUNCATE TABLE "priorities" RESTART IDENTITY CASCADE;`
        // );

        // // Supprimer les outils existants pour éviter les doublons
        // await Promise.all([
        //     this.prisma.site.deleteMany(),
        //     this.prisma.categorie.deleteMany(),
        //     this.prisma.statut.deleteMany(),
        //     this.prisma.prioritie.deleteMany(),
        // ]);

        // Insertions
        await Promise.all([
            this.prisma.site.createMany({ data: tools.sites }),
            this.prisma.categorie.createMany({ data: tools.categories }),
            this.prisma.statut.createMany({ data: tools.statuts }),
            this.prisma.prioritie.createMany({ data: tools.priorities }),
        ]);

        console.log('Tools (sites, categories, statuts, priorités) insérés avec succès.');
    }
}