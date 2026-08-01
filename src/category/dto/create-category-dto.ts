import { IsEmpty, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty({ message: 'Le commentaire est requis' })
    @IsString({ message: 'Le commentaire doit être une chaîne de caractères' })
    name!: string;

    @IsOptional()
    @IsString({ message: 'Le commentaire doit être une chaîne de caractères' })
    description!: string;
}