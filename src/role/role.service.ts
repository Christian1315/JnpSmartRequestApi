import { ConflictException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './role.logger';
import { Request, Response } from 'express';

export interface Role {
    name:string;
    description:string;
    permissionIds:number[]
}

@Injectable()
export class RoleService {
    constructor(
        private readonly prisma:PrismaService,
        private readonly logger:LoggerService
    ){}

    // Get all roles
    async getAllRoles(){
        this.logger.log("Rôles récupérés avec succès!!")
        const roles =  await this.prisma.role.findMany({
            where:{deletedAt:null},
            orderBy:{id:'desc'},
            include:{permissions:{
                include:{permission:true}
            }}
        })

        return roles.map((role) => ({
            ...role,
            permissions: role.permissions?.map((rolePermission) => rolePermission.permission)
        }));
    }

    // Get a role
    async getOneRole(id:number){
        this.logger.log(`Début de recuperation du rôle d'ID : ${id}`)
        const role = await this.prisma.role.findFirst({
            where:{id, deletedAt:null},
            include:{
                permissions:true
            }
        })

        if (!role) throw new NotFoundException("Rôle non trouvé") 
        this.logger.log(`Rôle trouvé : ${role}`)

        return role;
    }

    // Create a role
    async createRole(req:Request,data:Role){
        this.logger.log(`Début d'insersion d'un rôle`)
        let user = req.user

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de l'unicité
            const foundRole = await tx.role.findFirst({
                where: {
                    deletedAt: null,
                    name:data.name
                },
            });
            if (foundRole) {
                throw new ConflictException('Ce rôle existe déjà!');
            }

            const {permissionIds,...resteData} = data
            // Création du rôle
            const newRole = await tx.role.create({
                data:{
                    ...resteData,
                    ...(permissionIds?.length>0 && {
                        permissions: {
                            create: permissionIds.map((permissionId) => ({
                                permission: {
                                    connect: { id: permissionId }
                                }
                            }))
                        },
                    })
                }
            });

            this.logger.log('Rôle inséré avec succès!');
            return newRole;
        });

        return { message: 'Rôle inséré avec succès!', role: result };
    }

    // Update a role
    async updateRole(req: Request, id: number, data: Role) {
        this.logger.log(`Début de modification du rôle d'ID : ${id}`);
        this.logger.log(`Données à soumettre : ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);
            
            // verification de l'existance du rôle
            const found = await tx.role.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!found) {
                throw new NotFoundException('Ce rôle n\'existe pas!!');
            }

            // Vérification de l'unicité
            const foundRole = await tx.role.findFirst({
                where: {
                    deletedAt: null,
                    name:data.name
                },
            });
            if (foundRole) {
                throw new ConflictException('Ce rôle existe déjà!');
            }

            const {permissionIds,...resteData} = data
            // Création du rôle
            const newRole = await tx.role.update({
                where: { id },
                data:{
                    ...resteData,
                    ...(permissionIds?.length>0 && {
                        permissions: {
                            deleteMany:{},//suppression des permissions existantes
                            create: permissionIds.map((permissionId) => ({
                                permission: {
                                    connect: { id: permissionId }
                                }
                            }))
                        },
                    })
                }
            });

            this.logger.log('Rôle inséré avec succès!');
            return newRole;
        });

        return { message: 'Rôle inséré avec succès!', role: result };
    }
    // Delete a role
    async deleteRole(req:Request,id:number){
        this.logger.log(`Début de suppression du rôle d'ID : ${id}`)
        
        const connectedUser = req.user as any;
        this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

        const result = await this.prisma.$transaction(async(tx)=>{
            // Recherche du role
            const role = await tx.role.findFirst({
                where:{id, deletedAt:null}
            })
    
            if (!role) throw new NotFoundException("Rôle non trouvé") 
            this.logger.log(`Role trouvé : ${role}`)

            await tx.role.update({
                where:{id,deletedAt:null},
                data:{
                    deletedAt: new Date(),
                }
            })

            this.logger.log(`Suppression effectuée avec succès! : ${id}`)
            return role
        })

        return {message:"Rôle supprimé avec succès",result}
    }
}
