import { IsString, IsInt, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRequestDto {
    // @IsNotEmpty({ message: 'Le demandeur est requis' })
    // @Type(() => Number)
    // @IsInt({ message: 'Le demandeur doit être un entier.' })
    // demandeur_id!: number;

    @IsNotEmpty({ message: 'La catégorie est requise' })
    @Type(() => Number)
    @IsInt({ message: 'La catégorie doit être un entier.' })
    category_id!: number;

    @IsNotEmpty({ message: 'La priorité est requise' })
    @Type(() => Number)
    @IsInt({ message: 'La priorité doit être un entier.' })
    priority_id!: number;

    @IsNotEmpty({ message: 'Le site ou département est requis' })
    @Type(() => Number)
    @IsInt({ message: 'Le site doit être un entier.' })
    site_id!: number;

    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Le statut doit être un entier.' })
    statut_id?: number;

    @IsNotEmpty({ message: 'Le titre est requis!' })
    @IsString({ message: 'Le titre doit être une chaîne de caractères' })
    title!: string;

    @IsNotEmpty()
    @IsString({ message: 'La description doit être une chaîne de caractères' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'Le document doit être une chaîne de caractères' })
    document?: string; // sera écrasé par le fichier uploadé, garde-le optionnel

    @IsNotEmpty({ message: 'La date est requise!' })
    @IsDateString({}, { message: 'La date doit être une date valide' })
    date!: string;
}