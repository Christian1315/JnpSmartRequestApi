import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateStatutDto {
    @IsNotEmpty({ message: 'Le nom du statut est requis' })
    @IsString({ message: 'Le nom du statut doit être une chaîne de caractères' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'La description doit être une chaîne de caractères' })
    description!: string;
}