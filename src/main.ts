import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/exceptions/http-exception.filter';
import { CustomLogger } from './common/services/logger.service';
import { DatabaseSeeder } from './database/seeders/database.seeder';


async function bootstrap() {
  const logger = new CustomLogger();
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Bookstore Management API')
    .setDescription('API documentation for Bookstore Management System')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
      },
      'access-token',
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('books', 'Book management endpoints')
    .addTag('bookstores', 'Bookstore management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const exceptionFilter = app.get(AllExceptionsFilter);
  app.useGlobalFilters(exceptionFilter);
  
  const seeder = app.get(DatabaseSeeder);
  await seeder.seed();

  await app.listen(3000);
  logger.log(`Application is running on: http://localhost:3000`, 'Bootstrap');
}
bootstrap();
