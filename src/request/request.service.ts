import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './request.logger';
import { Request as Rq } from 'express';
import { CreateRequestDto } from './dto/create-request-dto';
import * as fs from 'fs';
import * as path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'documents');

@Injectable()
export class RequestService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // suppression du document
    async deleteDocumentFile(document:any) {
        if (document) {
            // "document" est stocké comme "/uploads/documents/xxx.png"
            // on ne garde que le nom du fichier pour le joindre au bon dossier
            const filename = path.basename(document);
            const filePath = path.join(UPLOADS_DIR, filename);

            await fs.promises.unlink(filePath).catch((err) => {
                this.logger.log(`Impossible de supprimer le document: ${err.message}`);
            });
        }
    }
    // formattage des données
    requestFormat = (request: any) => {
        const {demandeur,...restReq} = request
        delete demandeur.password

        return {
            ...restReq,
            demandeur,
            document:request.document?
                `${process.env.BASE_API_URL}${request.document}`:null
        };
    };

    // Get all request
    async getAllRequests() {
        this.logger.log('Request récupérées avec succès!!');
        const requests = await this.prisma.request.findMany({
            where: { deletedAt: null },
            include: {
                demandeur: true,
                category: true,
                priority: true,
                site: true,
                statut: true,
            },
        });
        return requests.map(this.requestFormat);
    }

    // Get a request
    async getOneRequest(id: number) {
        this.logger.log(`Début de recuperation de la requete d'ID : ${id}`);
        const request = await this.prisma.request.findFirst({
            where: { id, deletedAt: null },
            include: {
                demandeur: true,
                category: true,
                priority: true,
                site: true,
                statut: true,
            },
        });

        if (!request) throw new NotFoundException('Demande non trouvé');
        this.logger.log(`User trouvé : ${request}`);
        return this.requestFormat(request);
    }

    // Create a request
    async createRequest(req: Rq, data: CreateRequestDto, file?: Express.Multer.File) {
        this.logger.log(`Début d'insertion d'une request`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de la catégorie choisie
            const categoryFound = await tx.categorie.findFirst({
                where: { id: data.category_id, deletedAt: null },
            });
            if (!categoryFound) {
                throw new NotFoundException("Cette catégorie n'existe pas, ou a été supprimée");
            }

            // Vérification de la priorité choisie
            const priorityFound = await tx.prioritie.findFirst({
                where: { id: data.priority_id, deletedAt: null },
            });
            if (!priorityFound) {
                throw new NotFoundException("Cette priorité n'existe pas, ou a été supprimée");
            }

            // Vérification du site choisi
            const siteFound = await tx.site.findFirst({
                where: { id: data.site_id, deletedAt: null },
            });
            if (!siteFound) {
                throw new NotFoundException("Ce site ou département n'existe pas, ou a été supprimé");
            }

            // Vérification du statut (optionnel)
            if (data.statut_id) {
                const statutFound = await tx.statut.findFirst({
                    where: { id: data.statut_id, deletedAt: null },
                });
                if (!statutFound) {
                    throw new NotFoundException("Ce statut n'existe pas, ou a été supprimé");
                }
            }

            // Chemin du document uploadé (si présent)
            const documentPath = file ? `/uploads/documents/${file.filename}` : undefined;

            // Création de la requête
            const newRequest = await tx.request.create({
                data: {
                    ...data,
                    date:new Date(data.date),
                    statut_id: data.statut_id ?? 1, // si non fourni, on met le statut par défaut (1)
                    document: documentPath,
                    demandeur_id: connectedUser?.sub,
                    createdById: connectedUser?.sub,
                },
            });

            // Génération du code basé sur l'id réel (évite les races)
            const code = `REQ-${String(newRequest.id).padStart(4, '0')}`;

            const finalRequest = await tx.request.update({
                where: { id: newRequest.id },
                data: { code },
            });

            this.logger.log('Demande insérée avec succès!');
            return finalRequest;
        });

        return { message: 'Demande insérée avec succès!', demande: result };
    }

    // Update a request
    async updateRequest(req: Rq, id: number, data: CreateRequestDto, file?: Express.Multer.File) {
        this.logger.log(`Début de modification du user d'ID : ${id}`);
        this.logger.log(`ID utilisateur à exclure: ${id}, type: ${typeof id}`);
        this.logger.log(`Données reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche de la requete
            const requeteFound = await tx.request.findFirst({
                where: { id, deletedAt: null },
            });
            if (!requeteFound) {
                throw new NotFoundException("Cette requete n'existe pas, ou a été supprimée");
            }

            // Vérification de la catégorie choisie
            const categoryFound = await tx.categorie.findFirst({
                where: { id: data.category_id, deletedAt: null },
            });
            if (!categoryFound) {
                throw new NotFoundException("Cette catégorie n'existe pas, ou a été supprimée");
            }

            // Vérification de la priorité choisie
            const priorityFound = await tx.prioritie.findFirst({
                where: { id: data.priority_id, deletedAt: null },
            });
            if (!priorityFound) {
                throw new NotFoundException("Cette priorité n'existe pas, ou a été supprimée");
            }

            // Vérification du site choisi
            const siteFound = await tx.site.findFirst({
                where: { id: data.site_id, deletedAt: null },
            });
            if (!siteFound) {
                throw new NotFoundException("Ce site ou département n'existe pas, ou a été supprimé");
            }

            // Vérification du statut (optionnel)
            if (data.statut_id) {
                const statutFound = await tx.statut.findFirst({
                    where: { id: data.statut_id, deletedAt: null },
                });
                if (!statutFound) {
                    throw new NotFoundException("Ce statut n'existe pas, ou a été supprimé");
                }
            }

            // Gestion du nouveau document (si un fichier est fourni)
            let documentPath = requeteFound.document; // garde l'ancien par défaut
            if (file) {
                // Supprime l'ancien fichier physique s'il existe
                if (requeteFound.document) {
                    const oldFilePath = `.${requeteFound.document}`;
                    fs.unlink(oldFilePath, (err) => {
                        if (err) this.logger.log(`Impossible de supprimer l'ancien fichier: ${err.message}`);
                    });
                }
                documentPath = `/uploads/documents/${file.filename}`;
            }

            // Modification de la requête
            const updtedRequest = await tx.request.update({
                where: { id },
                data: {
                    ...data,
                    date:new Date(data.date),
                    document: documentPath,
                },
            });

            this.logger.log('Demande modifiée avec succès!');
            return updtedRequest;
        });

        return { message: 'Demande modifiée avec succès!', demande: result };
    }

    // Delete a requete
    async deleteRequete(req:Rq,id: number) {
        this.logger.log(`Début de suppression de la requete d'ID : ${id}`);
        const connectedUser = req.user as any;
        this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            // Recherche de la requete
            const request = await tx.request.findFirst({
                where: { id, deletedAt: null },
            });

            if (!request) throw new NotFoundException('Demande non trouvé');
            this.logger.log(`Requete trouvée : ${request}`);

            await tx.request.update({
                where: { id },
                data:{
                    deletedAt:new Date(),
                    deletedById:connectedUser?.sub
                }
            });

            
            // suppression du document
            await this.deleteDocumentFile(request.document);

            this.logger.log(`Suppression effectuée avec succès! : ${id}`);
            return request;
        });

        return { message: 'Requête supprimée avec succès', result };
    }
}