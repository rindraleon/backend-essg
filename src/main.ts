import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: false,
  }));

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:5000',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:4173',
      'https://gateway.tsirylab.com',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  });

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('Backend ITDC')
    .setDescription('Documentation des API ITDC')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // Servir les fichiers statiques (uploads)
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);
  console.debug(`Application is running on: http://localhost:${port}`);

  console.debug(`Documentation is running on: http://localhost:${port}/docs`);
}

bootstrap();
