import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './statut.logger';
import { CreateStatutDto } from './dto/create-statut-dto'; 
import { Request } from 'express';

@Injectable()
export class StatutService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // Get all statuts
    async getAllStatuts() {
        this.logger.log('Statuts récupérés avec succès!!');
   
        const Statuts = await this.prisma.statut.findMany({
            where: { deletedAt: null },
            orderBy:{id:'desc'},
            include: {
                requests: true,
            },
        });
        return Statuts;
    }

    // Get a statut
    async getOneStatut(id: number) {
        this.logger.log(`Début de récupération du Statut d'ID : ${id}`);
        const statut = await this.prisma.statut.findFirst({
            where: { id, deletedAt: null },
            include: {
                requests: true,
            },
        });

        if (!statut) throw new NotFoundException('statut non trouve');
        this.logger.log(`statut trouve : ${JSON.stringify(statut)}`);
        return statut;
    }

    // Create a catégory
    async createStatut(req: Request, data: CreateStatutDto) {
        this.logger.log(`Début d'insertion d'une statut`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de l'existance de la Statut
            const statutFound = await tx.statut.findFirst({
                where: { name:data.name, deletedAt: null },
            });
            if (statutFound) {
                throw new BadRequestException("ce statut existe déjà");
            }

            // Création de la statut
            const newtatut = await tx.statut.create({
                data: {
                    ...data,
                    createdById: connectedUser?.sub,
                },
                include: {
                    requests: true,
                },
            });

            this.logger.log('statut insére avec succès!');
            return newtatut;
        });

        return { message: 'statut', statut: result };
    }

    // Update a statut
    async updateStatut(req: Request, id: number, data: CreateStatutDto) {
        this.logger.log(`Début de modification de la statut d'ID : ${id}`);
        this.logger.log(`Donnes reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche du commentaire
            const statut = await tx.statut.findFirst({
                where: { id, deletedAt: null },
            });
            if (!statut) {
                throw new NotFoundException("ce statut n'existe pas, ou a été supprime");
            }

            // Modification du commentaire
            const updatetatut = await tx.statut.update({
                where: { id },
                data,
                include: {
                    requests: true,
                },
            });

            this.logger.log('statut modifié avec succès!');
            return updatetatut;
        });

        return { message: 'statut modifie avec succès!', statut: result };
    }

    // Delete a statut 
    async deleteStatut(req: Request, id: number) {
        this.logger.log(`Début de suppression de la Statut d'ID : ${id}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;

            const statut = await tx.statut.findFirst({
                where: { id, deletedAt: null },
            });

            if (!statut) throw new NotFoundException('statut non trouvé');
            this.logger.log(`statut trouvé : ${JSON.stringify(statut)}`);

            const deletedStatut = await tx.statut.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedById: connectedUser?.sub,
                },
            });

            this.logger.log(`Suppression effectue avec succès! : ${id}`);
            return deletedStatut;
        });

        return { message: 'statut supprime avec succès', statut: result };
    }
}