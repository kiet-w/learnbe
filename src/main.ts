import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = Number(configService.get<string>('PORT') ?? 3000);
  app.use(cookieParser());

  // Đăng ký Exception Filter toàn cục
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
}
bootstrap();
