import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePriorityDto {
    @IsNotEmpty({ message: 'Le nom de la priorité est requis' })
    @IsString({ message: 'Le nom de la priorité doit être une chaîne de caractères' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'La description doit être une chaîne de caractères' })
    description!: string;
}