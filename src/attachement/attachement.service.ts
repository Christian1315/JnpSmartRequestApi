import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './attachement.logger';
import { Request as Rq } from 'express';
import { CreateAttachementDto } from './dto/create-attachement-dto';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'documents');

@Injectable()
export class AttachementService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // formattage des données
    attachementFormat = (attachement: any) => {
        const { createdBy, ...restAttachement } = attachement;
        if (createdBy) delete createdBy.password;

        return {
            ...restAttachement,
            createdBy,
             document:attachement.document?
                `${process.env.BASE_API_URL}${attachement.document}`:null
        };
    };

    // suppression du document
    async deleteDocumentFile(document: string) {
        if (document) {
            const filename = path.basename(document);
            const filePath = path.join(UPLOADS_DIR, filename);

            await fs.promises.unlink(filePath).catch((err) => {
                this.logger.log(`Impossible de supprimer le document: ${err.message}`);
            });
        }
    }

    // Get all attachements
    async getAllAttachements() {
        this.logger.log('Pièces jointes récupérées avec succès!!');
        const attachements = await this.prisma.requestAttachement.findMany({
            where: { deletedAt: null },
            include: {
                request: true,
                createdBy: true,
            },
        });
        return attachements.map(this.attachementFormat);
    }

    // Get attachements for a specific request
    async getAttachementsByRequest(requestId: number) {
        this.logger.log(`Récupération des pièces jointes de la requête ID : ${requestId}`);

        const requestFound = await this.prisma.request.findFirst({
            where: { id: requestId, deletedAt: null },
        });
        if (!requestFound) {
            throw new NotFoundException("Cette requête n'existe pas, ou a été supprimée");
        }

        const attachements = await this.prisma.requestAttachement.findMany({
            where: { request_id: requestId, deletedAt: null },
            include: {
                request: true,
                createdBy: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return attachements.map(this.attachementFormat);
    }

    // Get one attachement
    async getOneAttachement(id: number) {
        this.logger.log(`Début de récupération de la pièce jointe d'ID : ${id}`);
        const attachement = await this.prisma.requestAttachement.findFirst({
            where: { id, deletedAt: null },
            include: {
                request: true,
                createdBy: true,
            },
        });

        if (!attachement) throw new NotFoundException('Pièce jointe non trouvée');
        this.logger.log(`Pièce jointe trouvée : ${JSON.stringify(attachement)}`);
        return this.attachementFormat(attachement);
    }

    // Create an attachement
    async createAttachement(req: Rq,id:number, data: CreateAttachementDto, file?: Express.Multer.File) {
        this.logger.log(`Début d'insertion d'une pièce jointe`);

        if (!file) {
            throw new BadRequestException('Le document est requis');
        }

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

            const documentPath = `/uploads/documents/${file.filename}`;

            // Création de la pièce jointe
            const newAttachement = await tx.requestAttachement.create({
                data: {
                    ...data,
                    request_id:requestFound.id,
                    document: documentPath,
                    createdById: connectedUser?.sub,
                },
                include: {
                    request: true,
                    createdBy: true,
                },
            });

            this.logger.log('Pièce jointe insérée avec succès!');
            return newAttachement;
        });

        return { message: 'Pièce jointe insérée avec succès!', attachement: this.attachementFormat(result) };
    }

    // Update an attachement
    async updateAttachement(req: Rq, id: number, data: CreateAttachementDto, file?: Express.Multer.File) {
        this.logger.log(`Début de modification de la pièce jointe d'ID : ${id}`);
        this.logger.log(`Données reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche de la pièce jointe
            const attachementFound = await tx.requestAttachement.findFirst({
                where: { id, deletedAt: null },
            });
            if (!attachementFound) {
                throw new NotFoundException("Cette pièce jointe n'existe pas, ou a été supprimée");
            }

            // Gestion du nouveau document (si un fichier est fourni)
            let documentPath = attachementFound.document;
            if (file) {
                if (attachementFound.document) {
                    await this.deleteDocumentFile(attachementFound.document);
                }
                documentPath = `/uploads/documents/${file.filename}`;
            }

            // Modification de la pièce jointe
            const updatedAttachement = await tx.requestAttachement.update({
                where: { id },
                data: {
                    ...data,
                    document: documentPath,
                },
                include: {
                    request: true,
                    createdBy: true,
                },
            });

            this.logger.log('Pièce jointe modifiée avec succès!');
            return updatedAttachement;
        });

        return { message: 'Pièce jointe modifiée avec succès!', attachement: this.attachementFormat(result) };
    }

    // Delete an attachement (soft delete + suppression du fichier physique)
    async deleteAttachement(req: Rq, id: number) {
        this.logger.log(`Début de suppression de la pièce jointe d'ID : ${id}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;

            const attachement = await tx.requestAttachement.findFirst({
                where: { id, deletedAt: null },
            });

            if (!attachement) throw new NotFoundException('Pièce jointe non trouvée');
            this.logger.log(`Pièce jointe trouvée : ${JSON.stringify(attachement)}`);

            const deletedAttachement = await tx.requestAttachement.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedById: connectedUser?.sub,
                },
            });

            this.logger.log(`Suppression effectuée avec succès! : ${id}`);
            return deletedAttachement;
        });

        // Suppression du fichier physique après la transaction réussie
        if (result.document) {
            await this.deleteDocumentFile(result.document);
        }

        return { message: 'Pièce jointe supprimée avec succès', attachement: result };
    }
}