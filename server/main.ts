import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { join } from 'path';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // CORS
  app.enableCors();

  // API 前缀
  app.setGlobalPrefix('api', {
    exclude: ['/', '/admin/(.*)', '/products/(.*)', '/product/(.*)', '/payment/(.*)', '/orders/(.*)'],
  });

  // 静态文件（前端构建产物）
  const clientDist = join(process.cwd(), 'dist/client');
  app.useStaticAssets(clientDist);
  app.setBaseViewsDir(clientDist);
  app.setViewEngine('html');

  const logger = new Logger('Bootstrap');
  const host = process.env.SERVER_HOST || '0.0.0.0';
  const port = Number(process.env.SERVER_PORT || process.env.PORT || '3000');

  await app.listen(port, host);
  logger.log(`Server running on ${host}:${port}`);
  logger.log(`API endpoints ready at http://${host}:${port}/api`);
}

bootstrap();
