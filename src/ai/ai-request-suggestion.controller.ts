import { Body, Controller, Post } from '@nestjs/common';
import { AiRequestSuggestionService } from './ai-request-suggestion.service';
import { SuggestRequestDto } from './dto/suggest-request.dto';

@Controller('ai')
export class AiRequestSuggestionController {
    constructor(private readonly service: AiRequestSuggestionService) { }

    // POST /ai/requests/suggest
    // ⚠️ Cet endpoint ne modifie AUCUNE donnée en base — il ne fait que proposer
    // des valeurs. C'est au front d'appliquer (ou non) la suggestion après
    // validation explicite de l'utilisateur, via les endpoints CRUD habituels.
    @Post('analyze-request')
    async suggest(@Body() dto: SuggestRequestDto) {
        return this.service.suggest(dto);
    }
}