import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));

  // Force 127.0.0.1 (IPv4) instead of letting it default to [::1] (IPv6)
  await app.listen(3001, '127.0.0.1');

  console.log(`Application is running on: http://127.0.0.1:3001`);
}
bootstrap();
