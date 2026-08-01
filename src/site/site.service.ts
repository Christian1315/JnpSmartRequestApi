import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './site.logger';
import { Request as Rq } from 'express';
import { CreateSiteDto } from './dto/create-site-dto';

@Injectable()
export class SiteService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // Get all sites
    async getAllSites() {
        this.logger.log('Sites récupérés avec succès!!');
   
        const sites = await this.prisma.site.findMany({
            where: { deletedAt: null },
            orderBy:{id:'desc'},
            include: {
                requests: true,
            },
        });
        return sites;
    }

    // Get a Site
    async getOneSite(id: number) {
        this.logger.log(`Début de récupération du site d'ID : ${id}`);
        const site = await this.prisma.site.findFirst({
            where: { id, deletedAt: null },
            include: {
                requests: true,
            },
        });

        if (!site) throw new NotFoundException('site non trouve');
        this.logger.log(`site trouve : ${JSON.stringify(site)}`);
        return site;
    }

    // Create a catégory
    async createSite(req: Rq, data: CreateSiteDto) {
        this.logger.log(`Début d'insertion d'une site`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de l'existance de la site
            const SiteFound = await tx.site.findFirst({
                where: { name:data.name, deletedAt: null },
            });
            if (SiteFound) {
                throw new BadRequestException("ce site existe déjà");
            }

            // Création de la site
            const newSite = await tx.site.create({
                data: {
                    ...data,
                    createdById: connectedUser?.sub,
                },
                include: {
                    requests: true,
                },
            });

            this.logger.log('site insére avec succès!');
            return newSite;
        });

        return { message: 'site', site: result };
    }

    // Update a site
    async updateSite(req: Rq, id: number, data: CreateSiteDto) {
        this.logger.log(`Début de modification de la site d'ID : ${id}`);
        this.logger.log(`Donnes reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche du commentaire
            const site = await tx.site.findFirst({
                where: { id, deletedAt: null },
            });
            if (!site) {
                throw new NotFoundException("ce site n'existe pas, ou a été supprime");
            }

            // Modification du commentaire
            const updateSite = await tx.site.update({
                where: { id },
                data,
                include: {
                    requests: true,
                },
            });

            this.logger.log('site modifié avec succès!');
            return updateSite;
        });

        return { message: 'site modifie avec succès!', site: result };
    }

    // Delete a site 
    async deleteSite(req: Rq, id: number) {
        this.logger.log(`Début de suppression de la site d'ID : ${id}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;

            const site = await tx.site.findFirst({
                where: { id, deletedAt: null },
            });

            if (!site) throw new NotFoundException('site non trouvé');
            this.logger.log(`site trouvé : ${JSON.stringify(site)}`);

            const deletedSite = await tx.site.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedById: connectedUser?.sub,
                },
            });

            this.logger.log(`Suppression effectue avec succès! : ${id}`);
            return deletedSite;
        });

        return { message: 'site supprime avec succès', site: result };
    }
}