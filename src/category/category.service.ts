import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './category.logger';
import { Request as Rq } from 'express';
import { CreateCategoryDto } from './dto/create-category-dto';

@Injectable()
export class CategoryService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly logger: LoggerService,
    ) {}

    // Get all categories
    async getAllCategories() {
        this.logger.log('Categories récupérés avec succès!!');
   
        const categories = await this.prisma.categorie.findMany({
            where: { deletedAt: null },
            include: {
                requests: true,
            },
        });
        return categories;
    }

    // Get a category
    async getOneCategory(id: number) {
        this.logger.log(`Début de récupération de la catégorie d'ID : ${id}`);
        const categorie = await this.prisma.categorie.findFirst({
            where: { id, deletedAt: null },
            include: {
                requests: true,
            },
        });

        if (!categorie) throw new NotFoundException('catégorie non trouvée');
        this.logger.log(`Catégorie trouvée : ${JSON.stringify(categorie)}`);
        return categorie;
    }

    // Create a catégory
    async createCategory(req: Rq, data: CreateCategoryDto) {
        this.logger.log(`Début d'insertion d'une catégorie`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de l'existance de la categorie
            const categoryFound = await tx.categorie.findFirst({
                where: { name:data.name, deletedAt: null },
            });
            if (categoryFound) {
                throw new BadRequestException("Cette catégorie existe déjà");
            }

            // Création de la catégorie
            const newCategory = await tx.categorie.create({
                data: {
                    ...data,
                    createdById: connectedUser?.sub,
                },
                include: {
                    requests: true,
                },
            });

            this.logger.log('Catégorie insérée avec succès!');
            return newCategory;
        });

        return { message: 'Catégorie', category: result };
    }

    // Update a category
    async updateCategory(req: Rq, id: number, data: CreateCategoryDto) {
        this.logger.log(`Début de modification de la catégorie d'ID : ${id}`);
        this.logger.log(`Données reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Recherche du commentaire
            const categorie = await tx.categorie.findFirst({
                where: { id, deletedAt: null },
            });
            if (!categorie) {
                throw new NotFoundException("Cette catégorie n'existe pas, ou a été supprimée");
            }

            // Modification du commentaire
            const updateCategory = await tx.categorie.update({
                where: { id },
                data,
                include: {
                    requests: true,
                },
            });

            this.logger.log('categorie modifiée avec succès!');
            return updateCategory;
        });

        return { message: 'Catégorie modifiée avec succès!', category: result };
    }

    // Delete a category 
    async deleteCategory(req: Rq, id: number) {
        this.logger.log(`Début de suppression de la categorie d'ID : ${id}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;

            const category = await tx.categorie.findFirst({
                where: { id, deletedAt: null },
            });

            if (!category) throw new NotFoundException('catégorie non trouvé');
            this.logger.log(`catégorie trouvé : ${JSON.stringify(category)}`);

            const deletedCategory = await tx.categorie.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                    deletedById: connectedUser?.sub,
                },
            });

            this.logger.log(`Suppression effectuée avec succès! : ${id}`);
            return deletedCategory;
        });

        return { message: 'Catégorie supprimée avec succès', category: result };
    }
}