"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('port');
    const apiPrefix = configService.get('apiPrefix');
    app.setGlobalPrefix(apiPrefix);
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
    }));
    const allowedOrigins = [
        'http://localhost:3001',
        'http://localhost:3000',
        'http://frontend:3000',
    ];
    if (configService.get('NODE_ENV') === 'production') {
        allowedOrigins.push('https://your-production-frontend-domain.com');
    }
    app.enableCors({
        origin: (origin, callback) => {
            if (!origin)
                return callback(null, true);
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
                return callback(new Error(msg), false);
            }
            return callback(null, true);
        },
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('School Management System API')
        .setDescription('API documentation for the School Management System')
        .setVersion(configService.get('appVersion') || '1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    const apiDocsPath = configService.get('apiDocsPath') || '/api-docs';
    swagger_1.SwaggerModule.setup(apiDocsPath, app, document);
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`API Documentation available at ${await app.getUrl()}${apiDocsPath}`);
}
bootstrap();
//# sourceMappingURL=main.js.map