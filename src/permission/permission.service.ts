import { ConflictException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './permission.logger';
import { Request, Response } from 'express';

export interface Permission {
    name:string;
    description:string;
}

@Injectable()
export class PermissionService {
    constructor(
        private readonly prisma:PrismaService,
        private readonly logger:LoggerService
    ){}

    // Get all permissions
    async getAllPermissions(){
        this.logger.log("Permissions récupérées avec succès!!")
        return  await this.prisma.permission.findMany({
            where:{deletedAt:null},
            orderBy:{id:'desc'}
        })
    }

    // Get a permission
    async getOnePermission(id:number){
        this.logger.log(`Début de recuperation de la permission d'ID : ${id}`)
        const permission = await this.prisma.permission.findFirst({
            where:{id, deletedAt:null},
            include:{
                roles:true,
            }
        })

        if (!permission) throw new NotFoundException("Permission non trouvé") 
        this.logger.log(`Permission trouvé : ${permission}`)

        return permission;
    }

    // Create a permission
    async createPermission(req:Request,data:Permission){
        this.logger.log(`Début d'insersion d'une permission`)
        let user = req.user

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de l'unicité (email OU téléphone)
            const foundPermission = await tx.permission.findFirst({
                where: {
                    deletedAt: null,
                    name:data.name
                },
            });
            if (foundPermission) {
                throw new ConflictException('Cette permission existe déjà!');
            }

            // Création de la permission
            const newPermission = await tx.permission.create({
                data,
            });

            this.logger.log('Permission insérée avec succès!');
            return newPermission;
        });

        return { message: 'Permission inséré.e avec succès!', user: result };
    }

    // Update a permission
    async updatePermission(req: Request, id: number, data: Permission) {
        this.logger.log(`Début de modification de la permission d'ID : ${id}`);
        this.logger.log(`Données à soumettre : ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérifier que la permission cible existe et n'est pas supprimée
            const existingPermission = await tx.permission.findFirst({
                where: { id, deletedAt: null },
            });

            if (!existingPermission) {
                throw new NotFoundException("Cette permission n'existe pas ou a été supprimée");
            }

            // Vérification de l'unicité du nom (hors elle-même)
            const foundPermission = await tx.permission.findFirst({
                where: {
                    id: { not: id },
                    deletedAt: null,
                    name: data?.name,
                },
            });

            this.logger.log(`Résultat foundPermission: ${JSON.stringify(foundPermission)}`);
            if (foundPermission) {
                throw new ConflictException('Cette permission existe déjà!');
            }

            // Mise à jour — where basé uniquement sur id
            const updatedPermission = await tx.permission.update({
                where: { id }, // 👈 uniquement le champ unique
                data,
            });

            this.logger.log('Permission modifié.e avec succès!');
            return updatedPermission;
        });

        return { message: 'Permission modifié.e avec succès!', permission: result };
    }
    // Delete a permission
    async deletePermission(req:Request,id:number){
        this.logger.log(`Début de suppression de la permission d'ID : ${id}`)
        
        const connectedUser = req.user as any;
        this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

        const result = await this.prisma.$transaction(async(tx)=>{
            // Recherche du compte
            const permission = await tx.permission.findFirst({
                where:{id, deletedAt:null}
            })
    
            if (!permission) throw new NotFoundException("Permission non trouvé") 
            this.logger.log(`Permission trouvé : ${permission}`)

            await tx.permission.update({
                where:{id,deletedAt:null},
                data:{
                    deletedAt: new Date(),
                    deletedById:connectedUser?.sub
                }
            })

            this.logger.log(`Suppression effectuée avec succès! : ${id}`)
            return permission
        })

        return {message:"Permission supprimée avec succès",result}
    }
}
