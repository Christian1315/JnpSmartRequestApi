import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/transform.interceptor';
import { CustomValidationPipe } from '../prisma/validation.pipe';

// authentification
import cookieParser from 'cookie-parser';

// fichier
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // gestion des cookies
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL, // ex: 'http://localhost:5173'
    credentials: true, // indispensable pour que les cookies passent en cross-origin
  });

  // Création des dossiers d'upload s'ils n'existent pas
  const uploadDirs = ['./uploads', './uploads/documents'];
  uploadDirs.forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Dossier créé: ${dir}`);
    }
  });

  
  // gestion des fichiers statiques
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/api/uploads',
  });
  app.setGlobalPrefix('api'); // ajoute /api devant toutes les routes

  // validation des requests
  app.useGlobalPipes(CustomValidationPipe);

  // reformatage des données output
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();