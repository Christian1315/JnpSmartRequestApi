import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './utils/transform.interceptor';
import { ValidationPipe } from '@nestjs/common';
import { CustomValidationPipe } from '../prisma/validation.pipe';

// authentification
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: process.env.FRONTEND_URL, // ex: 'http://localhost:5173'
    credentials: true, // indispensable pour que les cookies passent en cross-origin
  });

  app.useGlobalPipes(CustomValidationPipe);

  // app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true,        // strips unknown properties
  //   forbidNonWhitelisted: true, // throws if unknown properties are sent
  //   transform: true,        // auto-transforms payloads to DTO instances
  // }))
  app.useGlobalInterceptors(new TransformInterceptor())

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
