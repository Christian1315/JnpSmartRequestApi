import { Module } from '@nestjs/common';
import { AiRequestSuggestionController } from './ai-request-suggestion.controller';
import { AiRequestSuggestionService } from './ai-request-suggestion.service';
// import { PrismaModule } from '../prisma/prisma.module'; // ⚠️ décommente si PrismaService vient d'un module dédié

@Module({
    // imports: [PrismaModule],
    controllers: [AiRequestSuggestionController],
    providers: [AiRequestSuggestionService],
})
export class AiModule { }