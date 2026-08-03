import { Type } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString, MinLength, ValidateNested } from 'class-validator';

export class ConversationMessageDto {
    @IsIn(['user', 'assistant'])
    role!: 'user' | 'assistant';

    @IsString()
    content!: string;
}

export class SuggestRequestDto {
    // Le texte brut saisi par l'utilisateur (langage naturel, non structuré)
    @IsString()
    @MinLength(5, { message: 'Merci de décrire un minimum la demande avant de générer une suggestion.' })
    description!: string;

    // Historique de la conversation de clarification (vide au premier appel,
    // puis alimenté à chaque question/réponse de clarification)
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ConversationMessageDto)
    conversation?: ConversationMessageDto[];
}