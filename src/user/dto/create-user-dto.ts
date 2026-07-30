import { IsString, IsInt, IsEmail, IsNotEmpty, IsEmpty, MinLength, MaxLength, Matches } from 'class-validator';

export class CreateUserDto{
    @IsNotEmpty({ message: 'Le nom complet est requis' })
    @IsString({message:"Le nom complet doit être un string."})
    fullname!:string;

    @IsString({message:"Le phone doit être un string."})
    phone!:string;

    @IsEmail()
    @IsEmail({},{message:"Ce champ doit être de type email "})
    email!:string

    @IsNotEmpty({message:"Ce Champ est requis!"})
    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
    @MaxLength(10, { message: 'Le mot de passe ne doit pas dépasser 10 caractères' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
    })
    password!: string;

    @IsString({ message: 'Le mot de passe de confirmation doit être une chaîne de caractères' })
    @MinLength(8, { message: 'Le mot de passe de confirmation doit contenir au moins 8 caractères' })
    @MaxLength(10, { message: 'Le mot de passe de confirmation ne doit pas dépasser 10 caractères' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Le mot de passe de confirmation doit contenir au moins une majuscule, une minuscule et un chiffre',
    })
    confirm_password!: string;

    @IsNotEmpty({message:"Ce Champ est réquiq!"})
    @IsInt({message:"Ce Champ doit être un entier"})
    roleId!:number
}