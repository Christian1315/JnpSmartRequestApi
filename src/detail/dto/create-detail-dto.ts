import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateDetailDto {
    @IsNotEmpty({ message: 'Le commentaire est requis' })
    @IsString({ message: 'Le commentaire doit être une chaîne de caractères' })
    comment!: string;
}