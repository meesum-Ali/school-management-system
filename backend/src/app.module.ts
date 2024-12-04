// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
     // Import other modules as needed

     @Module({
       imports: [
         ConfigModule.forRoot({
           isGlobal: true,
           load: [configuration],
           validationSchema: Joi.object({
             NODE_ENV: Joi.string()
               .valid('development', 'production', 'test')
               .default('development'),
             PORT: Joi.number().default(5000),
             DATABASE_HOST: Joi.string().required(),
             DATABASE_PORT: Joi.number().required(),
             DATABASE_USER: Joi.string().required(),
             DATABASE_PASSWORD: Joi.string().required(),
             DATABASE_NAME: Joi.string().required(),
             JWT_SECRET: Joi.string().required(),
             JWT_EXPIRATION: Joi.string().default('3600s'),
             LOG_LEVEL: Joi.string().default('debug'),
             API_PREFIX: Joi.string().default('/api'),
           }),
         }),
         TypeOrmModule.forRoot({
           type: 'postgres',
           host: process.env.DATABASE_HOST,
           port: parseInt(process.env.DATABASE_PORT, 10),
           username: process.env.DATABASE_USER,
           password: process.env.DATABASE_PASSWORD,
           database: process.env.DATABASE_NAME,
           entities: [__dirname + '/**/*.entity{.ts,.js}'],
           synchronize: true, // ⚠️ Disable in production
         }),
         // Import other modules
       ],
       controllers: [AppController],
       providers: [AppService],
     })
     export class AppModule {}