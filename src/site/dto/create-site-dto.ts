import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSiteDto {
    @IsNotEmpty({ message: 'Le nom du site est requis' })
    @IsString({ message: 'Le nom du site doit être une chaîne de caractères' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'La description doit être une chaîne de caractères' })
    description!: string;
}