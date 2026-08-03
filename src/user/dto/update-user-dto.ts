import { IsString, IsInt, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength, Matches, ValidateIf } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsNotEmpty({ message: 'Le nom complet est requis' })
    @IsString({ message: 'Le nom complet doit être un string.' })
    fullname?: string;

    @IsOptional()
    @IsString({ message: 'Le phone doit être un string.' })
    phone?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Ce champ doit être de type email ' })
    email?: string;

    // Validé uniquement si `password` OU `confirm_password` est renseigné
    @ValidateIf((dto) => !!dto.password || !!dto.confirm_password)
    @IsNotEmpty({ message: 'Ce Champ est requis!' })
    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    @MaxLength(10, { message: 'Le mot de passe ne doit pas dépasser 10 caractères' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
    })
    password?: string;

    @ValidateIf((dto) => !!dto.password || !!dto.confirm_password)
    @IsNotEmpty({ message: 'Ce Champ est requis!' })
    @IsString({ message: 'Le mot de passe de confirmation doit être une chaîne de caractères' })
    @MinLength(8, { message: 'Le mot de passe de confirmation doit contenir au moins 8 caractères' })
    @MaxLength(10, { message: 'Le mot de passe de confirmation ne doit pas dépasser 10 caractères' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe de confirmation doit contenir au moins une majuscule, une minuscule et un chiffre',
    })
    confirm_password?: string;

    @IsOptional()
    @IsInt({ message: 'Ce Champ doit être un entier' })
    roleId?: number;
}