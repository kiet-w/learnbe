import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionFilter } from './00-index/01-codebase-reading-guide/common/filters/all-exception.filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted:true, transform:true }));
  app.useGlobalFilters(new AllExceptionFilter())
  await app.listen(process.env.PORT ?? 4000);
}
void bootstrap();
