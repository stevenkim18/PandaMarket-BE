import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from './common/filter/prisma-client-exception.filter';
import { winstonLogger } from './common/logger/winston.logger';
import { RequestLoggerInterceptor } from './common/logger/request-logger.interceptor';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: winstonLogger,
  });

  // 정적 파일 서빙 설정
  app.useStaticAssets(join(process.cwd(), 'public'));

  // 유효성 검사 pipe 설정
  app.useGlobalPipes(new ValidationPipe());

  // Prisma 예외 필터 설정
  app.useGlobalFilters(new PrismaClientExceptionFilter());
  app.useGlobalInterceptors(new RequestLoggerInterceptor());

  await app.listen(4000);
}
bootstrap();
