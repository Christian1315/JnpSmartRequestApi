import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePermissionDto{
    @IsNotEmpty({ message: 'Le nom est requis' })
    @IsString({message:"Le nom doit être un string."})
    name!:string;

    @IsString({message:"La description doit être un string."})
    description!:string;
}