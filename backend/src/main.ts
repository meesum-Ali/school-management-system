import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('port');
  const apiPrefix = configService.get<string>('apiPrefix');

  app.setGlobalPrefix(apiPrefix);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties that do not have any decorators
      forbidNonWhitelisted: true, // Throws an error if non-whitelisted values are present
      transform: true, // Automatically transforms payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Allows conversion of path/query params to expected types
      },
    }),
  );

  // CORS Configuration
  app.enableCors({
    origin: configService.get<string>('NODE_ENV') === 'production'
      ? 'https://your-production-frontend-domain.com' // Replace with actual production frontend URL
      : 'http://localhost:3000', // For local development (Next.js default port)
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger Setup
  const swaggerConfig = new DocumentBuilder()
    .setTitle('School Management System API')
    .setDescription('API documentation for the School Management System')
    .setVersion(configService.get<string>('appVersion') || '1.0') // Use 'appVersion' from config
    .addBearerAuth() // For JWT
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  const apiDocsPath = configService.get<string>('apiDocsPath') || '/api-docs'; // Use 'apiDocsPath'
  SwaggerModule.setup(apiDocsPath, app, document);

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`API Documentation available at ${await app.getUrl()}${apiDocsPath}`);
}
bootstrap();
