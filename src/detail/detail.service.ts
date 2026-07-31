import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './detail.logger';
import { Request as Rq } from 'express';
import { CreateDetailDto } from './dto/create-detail-dto';

@Injectable()
export class DetailService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // formattage des données
    detailFormat = (detail: any) => {
        const { createdBy, ...restDetail } = detail;
        if (createdBy) delete createdBy.password;

        return {
            ...restDetail,
            createdBy,
        };
    };

    // Get all details
    async getAllDetails() {
        this.logger.log('Details récupérés avec succès!!');
        const details = await this.prisma.requestDetail.findMany({
            where: { deletedAt: null },
            include: {
                request: true,
                createdBy: true,
            },
        });
        return details.map(this.detailFormat);
    }

    // Get details for a specific request
    async getDetailsByRequest(requestId: number) {
        this.logger.log(`Récupération des détails de la requête ID : ${requestId}`);

        const requestFound = await this.prisma.request.findFirst({
            where: { id: requestId, deletedAt: null },
        });
        if (!requestFound) {
            throw new NotFoundException("Cette requête n'existe pas, ou a été supprimée");
        }

        const details = await this.prisma.requestDetail.findMany({
            where: { request_id: requestId, deletedAt: null },
            include: {
                request: true,
                createdBy: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return details.map(this.detailFormat);
    }

    // Get a detail
    async getOneDetail(id: number) {
        this.logger.log(`Début de récupération du détail d'ID : ${id}`);
        const detail = await this.prisma.requestDetail.findFirst({
            where: { id, deletedAt: null },
            include: {
                request: true,
                createdBy: true,
            },
        });

        if (!detail) throw new NotFoundException('Détail non trouvé');
        this.logger.log(`Détail trouvé : ${JSON.stringify(detail)}`);
        return this.detailFormat(detail);
    }

    // Create a detail
    async createDetail(req: Rq,id:number, data: CreateDetailDto) {
        this.logger.log(`Début d'insertion d'un détail`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de la requête liée
            const requestFound = await tx.request.findFirst({
                where: { id, deletedAt: null },
            });
            if (!requestFound) {
                throw new NotFoundException("Cette requête n'existe pas, ou a été supprimée");
            }

            // Création du détail
            const newDetail = await tx.requestDetail.create({
                data: {
                    ...data,
                    request_id:id,
                    createdById: connectedUser?.sub,
                },
                include: {
                    request: true,
                    createdBy: true,
                },
            });

            this.logger.log('Détail inséré avec succès!');
            return newDetail;
        });

        return { message: 'Détail inséré avec succès!', detail: this.detailFormat(result) };
    }

    // Update a detail
    async updateDetail(req: Rq, id: number, data: CreateDetailDto) {
        this.logger.log(`Début de modification du détail d'ID : ${id}`);
        this.logger.log(`Données reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche du détail
            const detailFound = await tx.requestDetail.findFirst({
                where: { id, deletedAt: null },
            });
            if (!detailFound) {
                throw new NotFoundException("Ce détail n'existe pas, ou a été supprimé");
            }

            // Modification du détail
            const updatedDetail = await tx.requestDetail.update({
                where: { id },
                data,
                include: {
                    request: true,
                    createdBy: true,
                },
            });

            this.logger.log('Détail modifié avec succès!');
            return updatedDetail;
        });

        return { message: 'Détail modifié avec succès!', detail: this.detailFormat(result) };
    }

    // Delete a detail (soft delete)
    async deleteDetail(req: Rq, id: number) {
        this.logger.log(`Début de suppression du détail d'ID : ${id}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;

            const detail = await tx.requestDetail.findFirst({
                where: { id, deletedAt: null },
            });

            if (!detail) throw new NotFoundException('Détail non trouvé');
            this.logger.log(`Détail trouvé : ${JSON.stringify(detail)}`);

            const deletedDetail = await tx.requestDetail.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedById: connectedUser?.sub,
                },
            });

            this.logger.log(`Suppression effectuée avec succès! : ${id}`);
            return deletedDetail;
        });

        return { message: 'Détail supprimé avec succès', detail: result };
    }
}