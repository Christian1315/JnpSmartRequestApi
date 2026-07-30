import dotenv from 'dotenv';
import logger from './logger.js';
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined. Set it before running dbTest.js.');
}

const parsedUrl = new URL(databaseUrl);

const adapter = new PrismaMariaDb({
  host: parsedUrl.hostname,
  port: Number(parsedUrl.port) || 3306,
  user: parsedUrl.username,
  password: parsedUrl.password,
  database: parsedUrl.pathname.replace(/^\//, ''),
  connectionLimit: 10,        // évite le pool sous-dimensionné par défaut
  acquireTimeout: 30000,      // 30s avant d'abandonner une demande de connexion
  idleTimeout: 60000,         // ferme les connexions inactives après 60s
});

const prisma = new PrismaClient({ adapter });

// Ferme proprement le pool uniquement à l'arrêt réel du process
async function shutdown() {
  logger.info('Closing Prisma connection pool...');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default prisma;