import { ConflictException, Injectable, NotFoundException, Param } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './role.logger';
import { Request, Response } from 'express';

export interface Role {
    name:string;
    description:string;
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
        return  await this.prisma.role.findMany({
            where:{deletedAt:null}
        })
    }

    // Get a role
    async getOneRole(id:number){
        this.logger.log(`Début de recuperation du role d'ID : ${id}`)
        const role = await this.prisma.role.findFirst({
            where:{id, deletedAt:null},
            include:{
                permissions:true,
                users:true,
            }
        })

        if (!role) throw new NotFoundException("Rôle non trouvé") 
        this.logger.log(`Rôle trouvé : ${role}`)

        return role;
    }

    // Create a role
    async createRole(req:Request,data:Role){
        this.logger.log(`Début d'insersion d'un role`)
        let user = req.user

        this.logger.log(`User connected ${user}`)

        const foundRole = await this.prisma.role.findFirst({
            where:{name:data?.name,deletedAt:null}
        })
       
        if (foundRole) throw new ConflictException("Ce rôle existe déjà!")
        return this.prisma.role.create({data })
    }

    // Update a role
    async updateRole(id:number,data:Role){
        this.logger.log(`Début de modification du role d'ID : ${id}`)
        const role = await this.prisma.role.findFirst({
            where:{id, deletedAt:null}
        })

        if (!role) throw new NotFoundException("Rôle non trouvé") 
        this.logger.log(`Rôle trouvé : ${role}`)

        const foundRole = await this.prisma.role.findFirst({
            where:{name:data?.name,deletedAt:null}
        })
       
        if (foundRole) throw new ConflictException("Ce rôle existe déjà!")

        return this.prisma.role.update({
            where:{id},
            data
         })
    }

    // Delete a role
    async deleteRole(id:number){
        this.logger.log(`Début de suppression du rôle d'ID : ${id}`)
        const role = await this.prisma.role.findFirst({
            where:{id, deletedAt:null}
        })

        if (!role) throw new NotFoundException("Rôle non trouvé") 
        this.logger.log(`Rôle trouvé : ${role}`)

        await this.prisma.role.delete({
            where:{id}
        })

        return {message:"Rôle supprimé avec succès"}
    }
}
