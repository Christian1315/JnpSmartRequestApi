import { IsString, IsNotEmpty, IsEmail, IsEmpty, IsArray, ArrayNotEmpty, IsInt } from 'class-validator';

export class CreateRoleDto{
    @IsNotEmpty({ message: 'Le nom est requis' })
    @IsString({message:"Le nom doit être un string."})
    name!:string;

    @IsString({message:"La description doit être un string."})
    description!:string;

    @IsArray({ message: 'permissionIds doit être un tableau' })
    @ArrayNotEmpty({ message: 'Ce champ est requis' })
    @IsInt({ each: true, message: 'Chaque permissionId doit être un entier' })
    permissionIds!: number[];
}