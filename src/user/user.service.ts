import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoggerService } from './user.logger';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

export interface User {
    fullname:string;
    phone:string;
    email:string
    roleId:number,
    password:string,
    confirm_password:string,
}

@Injectable()
export class UserService {
    constructor(
        private readonly prisma:PrismaService,
        private readonly logger:LoggerService
    ){}

    // formattage des données
    userFormat = (user:any)=>{
        delete user.password
        return {
            ...user
        }
    }

    // Get all users
    async getAllUsers(){
        this.logger.log("Users récupérées avec succès!!")
        const users =  await this.prisma.user.findMany({
            where:{deletedAt:null},
            include:{role:true}
        })

        return users.map(this.userFormat)
    }

    // Get a user
    async getOneUser(id:number){
        this.logger.log(`Début de recuperation du user d'ID : ${id}`)
        const user = await this.prisma.user.findFirst({
            where:{id, deletedAt:null},
            include:{
                role:{
                    include:{
                        permissions:true
                    }
                }
            }
        })

        if (!user) throw new NotFoundException("Utilisateur non trouvé") 
        this.logger.log(`User trouvé : ${user}`)

        return this.userFormat(user);
    }

    // Create a user
    async createUser(req: Request, data: User) {
        this.logger.log(`Début d'insertion d'un user`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification de la conformité des mots de passe
            const { password, confirm_password } = data;
            if (password !== confirm_password) {
                throw new BadRequestException('Les mots de passe ne sont pas conformes!');
            }

            // Vérification du rôle choisi
            const roleFound = await tx.role.findFirst({
                where: { id: data.roleId, deletedAt: null },
            });
            if (!roleFound) {
                throw new NotFoundException("Ce rôle n'existe pas");
            }

            // Vérification de l'unicité (email OU téléphone)
            const foundUser = await tx.user.findFirst({
                where: {
                    deletedAt: null,
                    OR: [
                        { email: data.email },
                        { phone: data.phone },
                    ],
                },
            });
            if (foundUser) {
                throw new ConflictException('Cet utilisateur existe déjà!');
            }

            // Hash du mot de passe avant stockage
            const hashedPassword = await bcrypt.hash(password, 10);

            const {confirm_password:__,...restData} = data
            // Création de l'utilisateur
            const newUser = await tx.user.create({
                data: {
                    ...restData,
                    createdById:connectedUser?.sub,
                    password: hashedPassword,
                },
            });

            this.logger.log('User inséré.e avec succès!');
            // on doit pas afficher le password 
            const {password:_,...userData} = newUser
            return userData;
        });

        return { message: 'User inséré.e avec succès!', user: result };
    }

    // Update a user
    async updateUser(req:Request ,id:number,data:User){
        this.logger.log(`Début de modification du user d'ID : ${id}`)
        this.logger.log(`ID utilisateur à exclure: ${id}, type: ${typeof id}`);
        this.logger.log(`Données reçues: ${JSON.stringify(data)}`);

        const result = await this.prisma.$transaction(async (tx) => {
            const connectedUser = req.user as any;
            this.logger.log(`User connecté: ${JSON.stringify(connectedUser)}`);

            // Vérification du rôle choisi
            const roleFound = await tx.role.findFirst({
                where: { id: data.roleId, deletedAt: null },
            });

            if (!roleFound) {
                throw new NotFoundException("Ce rôle n'existe pas");
            }

            // Vérification de l'unicité (email OU téléphone)
            const foundUser = await tx.user.findFirst({
                where: {
                    id: { not: id },
                    deletedAt: null,
                    OR: [
                        { email: data.email },
                        { phone: data.phone},
                    ],
                },
            }) as any;

            this.logger.log(`Résultat foundUser: ${JSON.stringify(foundUser)}`);
            if (foundUser) {
                throw new ConflictException('Cet utilisateur existe déjà!');
            }

            // Hash du mot de passe avant stockage
            const hashedPassword =data.password?
             await bcrypt.hash(data.password, 10):foundUser?.password;

            // Création de l'utilisateur
            const {confirm_password,..._userData} = data
            const updatedUser = await tx.user.update({
                where:{id},
                data: {
                    ..._userData,
                    password: hashedPassword,
                },
            });

            this.logger.log('User modifié.e avec succès!');
            // on doit pas afficher le password 
            const {password:_,...userData} = updatedUser
            return userData;
        });

        return { message: 'User modifié.e avec succès!', user: result };
    }

    // Delete a user
    async deleteUser(id:number){
        this.logger.log(`Début de suppression du user d'ID : ${id}`)
        
        const result = await this.prisma.$transaction(async(tx)=>{
            // Recherche du compte
            const user = await tx.user.findFirst({
                where:{id, deletedAt:null}
            })
    
            if (!user) throw new NotFoundException("Utilisateur non trouvé") 
            this.logger.log(`User trouvé : ${user}`)

            // Blocage de suppression du compte Super Admin
            if (id==1) throw new BadRequestException("Vous n'êtes pas autoriré à supprimé le compte Super Administrateur!")

            await tx.user.delete({
                where:{id}
            })

            this.logger.log(`Suppression effectuée avec succès! : ${id}`)
            return user
        })

        return {message:"Utilisateur supprimé avec succès",result}
    }
}
