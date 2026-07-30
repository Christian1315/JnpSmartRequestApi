import { IsString, IsEmail,IsNotEmpty } from 'class-validator';

export class LoginDto{
    @IsEmail({},{message:"Ce champ doit être de type email "})
    @IsNotEmpty({message:"Le mail ou l'identifiant est réquis!"})
    email!:string

    @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
    @IsNotEmpty({message:"Le mot de passe est réquis!"})
    password!: string;
}