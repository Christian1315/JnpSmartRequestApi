import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { PrismaService } from '../../prisma/prisma.service'; // ⚠️ adapte le chemin à ton projet
import { SuggestRequestDto } from './dto/suggest-request.dto';
// (déjà correct si suggest-request.dto.ts est bien dans src/ai/dto/)

export type RequestSuggestion = {
    title: string | null;
    description: string | null;
    categoryId: number | null;
    priorityId: number | null;
    siteId: number | null; // "service responsable" — adapte le nom si ton entité s'appelle "Service"
    missingInfo: string[];
    clarificationQuestion: string | null;
};

@Injectable()
export class AiRequestSuggestionService {
    private readonly openai: OpenAI;

    constructor(private readonly prisma: PrismaService) {
        // ⚠️ Utilise l'API Gemini via son endpoint compatible OpenAI.
        // Pour repasser sur OpenAI plus tard : retire baseURL et remets OPENAI_API_KEY.
        this.openai = new OpenAI({
            apiKey: process.env.GEMINI_API_KEY,
            baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
        });
    }

    async suggest(dto: SuggestRequestDto): Promise<RequestSuggestion> {
        const [categories, priorities, sites] = await Promise.all([
            this.prisma.categorie.findMany({ select: { id: true, name: true } }),
            this.prisma.prioritie.findMany({ select: { id: true, name: true } }),
            this.prisma.site.findMany({ select: { id: true, name: true } }),
        ]);

        const systemPrompt = this.buildSystemPrompt(categories, priorities, sites);

        const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: dto.description },
            ...(dto.conversation ?? []).map((m) => ({ role: m.role, content: m.content }) as OpenAI.Chat.ChatCompletionMessageParam),
        ];

        let completion: OpenAI.Chat.ChatCompletion;
        try {
            console.log()
            completion = await this.openai.chat.completions.create({
                model: 'gemini-flash-latest',
                messages,
                temperature: 0.3,
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: 'request_suggestion',
                        strict: true,
                        schema: {
                            type: 'object',
                            additionalProperties: false,
                            properties: {
                                title: { type: ['string', 'null'] },
                                description: { type: ['string', 'null'] },
                                categoryId: { type: ['integer', 'null'] },
                                priorityId: { type: ['integer', 'null'] },
                                siteId: { type: ['integer', 'null'] },
                                missingInfo: { type: 'array', items: { type: 'string' } },
                                clarificationQuestion: { type: ['string', 'null'] },
                            },
                            required: [
                                'title', 'description', 'categoryId', 'priorityId',
                                'siteId', 'missingInfo', 'clarificationQuestion',
                            ],
                        },
                    },
                },
            });
        } catch (err) {
            // 🔍 log temporaire de debug — à retirer une fois le problème identifié
            console.error('Erreur appel Gemini :', err?.response?.data ?? err);
            throw new InternalServerErrorException("Erreur lors de l'appel au service IA. Veuillez réessayer.");
        }

        const raw = completion.choices[0]?.message?.content;
        if (!raw) {
            throw new InternalServerErrorException("Réponse vide du service IA.");
        }

        try {
            return JSON.parse(raw) as RequestSuggestion;
        } catch {
            throw new InternalServerErrorException("Réponse du service IA illisible.");
        }
    }

    private buildSystemPrompt(
        categories: { id: number; name: string }[],
        priorities: { id: number; name: string }[],
        sites: { id: number; name: string }[],
    ): string {
        return `
Tu es un assistant qui aide à structurer des demandes internes à partir d'une description en langage naturel.

Ta tâche :
1. Génère TOUJOURS un titre, même à partir d'un texte très court ou vague (ex: un seul mot). "climatisation" → titre possible : "Problème de climatisation". Ne renvoie JAMAIS null sur "title".
2. Génère TOUJOURS une description reformulée, même minimale, à partir de ce qui est fourni. "climatisation" → description possible : "L'utilisateur signale un problème lié à la climatisation. Aucun autre détail n'a été fourni pour le moment." Ne renvoie JAMAIS null sur "description".
3. Propose une catégorie, une priorité et un service responsable, UNIQUEMENT parmi les listes ci-dessous. Si aucune option ne correspond avec certitude, renvoie null pour CE champ précis uniquement — sans que ça affecte title/description.
4. Si des informations importantes manquent pour traiter la demande (lieu, urgence, symptôme précis, équipement concerné...), liste-les dans "missingInfo" et pose UNE seule question de clarification dans "clarificationQuestion" (la plus utile pour avancer). C'est le mécanisme prévu pour gérer un texte pauvre — pas le null sur title/description. Si tout est suffisamment clair, laisse "missingInfo" vide et "clarificationQuestion" à null.
5. Ne fournis jamais autre chose que le JSON demandé. N'invente jamais d'identifiant qui n'existe pas dans les listes fournies.

Catégories disponibles : ${categories.map((c) => `${c.id}=${c.name}`).join(', ') || 'aucune'}
Priorités disponibles : ${priorities.map((p) => `${p.id}=${p.name}`).join(', ') || 'aucune'}
Services responsables disponibles : ${sites.map((s) => `${s.id}=${s.name}`).join(', ') || 'aucun'}
`.trim();
    }
}