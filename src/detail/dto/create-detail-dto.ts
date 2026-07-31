import { IsInt, IsNotEmpty, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDetailDto {
    @IsNotEmpty({ message: 'La requête liée est requise' })
    @Type(() => Number)
    @IsInt({ message: 'request_id doit être un entier' })
    request_id!: number;

    @IsNotEmpty({ message: 'Le commentaire est requis' })
    @IsString({ message: 'Le commentaire doit être une chaîne de caractères' })
    comment!: string;
}