/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { environment } from './environments/environment';
import { urlencoded, json } from 'express';
import { PerformanceInterceptor } from './config/performance.interceptor';

async function bootstrap() {
  const globalPrefix = 'api';
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);

  const config = new DocumentBuilder()
    .setTitle('tskmgr')
    .setDescription('tskmgr API description')
    .setVersion(environment.version)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, document);

  app.use(json({ limit: '5mb' }));
  app.use(urlencoded({ extended: true, limit: '5mb' }));
  app.useGlobalInterceptors(new PerformanceInterceptor());

  const port = process.env.PORT || 3333;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
