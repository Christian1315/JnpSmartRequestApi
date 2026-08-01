import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './priority.logger';
import { Request as Rq } from 'express';
import { CreatePriorityDto } from './dto/create-priority-dto';

@Injectable()
export class PriorityService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // Get all priorities
    async getAllPriorities() {
        this.logger.log('Prioritis récupérés avec succès!!');
   
        const Priorities = await this.prisma.prioritie.findMany({
            where: { deletedAt: null },
            orderBy:{id:'desc'},
            include: {
                requests: true,
            },
        });
        return Priorities;
    }

    // Get a Prioritie
    async getOnePrioritie(id: number) {
        this.logger.log(`Début de récupération du prioritie d'ID : ${id}`);
        const prioritie = await this.prisma.prioritie.findFirst({
            where: { id, deletedAt: null },
            include: {
                requests: true,
            },
        });

        if (!prioritie) throw new NotFoundException('priorié non trouve');
        this.logger.log(`prioritie trouve : ${JSON.stringify(prioritie)}`);
        return prioritie;
    }

    // Create a catégory
    async createPrioritie(req: Rq, data: CreatePriorityDto) {
        this.logger.log(`Début d'insertion d'une prioritie`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de l'existance de la Prioritie
            const prioritieFound = await tx.prioritie.findFirst({
                where: { name:data.name, deletedAt: null },
            });
            if (prioritieFound) {
                throw new BadRequestException("Cette priorité existe déjà");
            }

            // Création de la prioritie
            const newPrioritie = await tx.prioritie.create({
                data: {
                    ...data,
                    createdById: connectedUser?.sub,
                },
                include: {
                    requests: true,
                },
            });

            this.logger.log('prioritie insére avec succès!');
            return newPrioritie;
        });

        return { message: 'prioritie', prioritie: result };
    }

    // Update a prioritie
    async updatePrioritie(req: Rq, id: number, data: CreatePriorityDto) {
        this.logger.log(`Début de modification de la prioritie d'ID : ${id}`);
        this.logger.log(`Donnes reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche du commentaire
            const prioritie = await tx.prioritie.findFirst({
                where: { id, deletedAt: null },
            });
            if (!prioritie) {
                throw new NotFoundException("Cette prioritie n'existe pas, ou a été supprime");
            }

            // Modification du commentaire
            const updatePrioritie = await tx.prioritie.update({
                where: { id },
                data,
                include: {
                    requests: true,
                },
            });

            this.logger.log('prioritie modifié avec succès!');
            return updatePrioritie;
        });

        return { message: 'prioritie modifie avec succès!', Prioritie: result };
    }

    // Delete a Prioritie 
    async deletePrioritie(req: Rq, id: number) {
        this.logger.log(`Début de suppression de la Prioritie d'ID : ${id}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;

            const prioritie = await tx.prioritie.findFirst({
                where: { id, deletedAt: null },
            });

            if (!prioritie) throw new NotFoundException('prioritie non trouvé');
            this.logger.log(`prioritie trouvé : ${JSON.stringify(prioritie)}`);

            const deletedPrioritie = await tx.prioritie.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedById: connectedUser?.sub,
                },
            });

            this.logger.log(`Suppression effectue avec succès! : ${id}`);
            return deletedPrioritie;
        });

        return { message: 'prioritie supprime avec succès', prioritie: result };
    }
}