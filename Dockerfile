# ---------- Base ----------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl

# ---------- Dependencies (avec devDependencies pour le build) ----------
FROM base AS deps
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

# ---------- Build ----------
FROM base AS build
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# ---------- Production dependencies uniquement ----------
FROM base AS prod-deps
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --ignore-scripts
RUN npx prisma generate

# ---------- Image finale ----------
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY package*.json ./

# Utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Créer le dossier d'uploads et donner les droits au bon utilisateur
RUN mkdir -p uploads/documents && chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
