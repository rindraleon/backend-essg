import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import * as fs from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter(), new HttpExceptionFilter());

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Backend ESSG')
    .setDescription('Documentation des API ESSG')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const uploadPath = configService.get<string>('UPLOAD_PATH') || 'uploads';
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  app.use(`/${uploadPath}`, express.static(join(process.cwd(), uploadPath)));

  const port = configService.get<number>('APP_PORT') || 3000;
  await app.listen(port);
  logger.log(`Application démarrée sur http://localhost:${port}`);
  logger.log(`Documentation disponible sur http://localhost:${port}/docs`);
}

void bootstrap();
