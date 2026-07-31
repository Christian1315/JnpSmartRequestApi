import { IsOptional, IsString } from 'class-validator';

export class CreateAttachementDto {
    @IsOptional()
    @IsString({ message: 'Le document doit être une chaîne de caractères' })
    document?: string; // sera écrasé par le fichier uploadé, garde-le optionnel
}