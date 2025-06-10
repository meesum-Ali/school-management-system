// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { User } from './users/entities/user.entity';
import { Student } from './students/student.entity';
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
             PORT: Joi.number().default(5000), // Default here is fine, main.ts uses ConfigService
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
         TypeOrmModule.forRootAsync({
           imports: [ConfigModule], // Make ConfigService available
           useFactory: (configService: ConfigService) => ({
             type: 'postgres',
             host: configService.get<string>('database.host'),
             port: configService.get<number>('database.port'),
             username: configService.get<string>('database.username'),
             password: configService.get<string>('database.password'),
             database: configService.get<string>('database.name'),
             entities: [User, Student], // Explicitly list entities
             synchronize: configService.get<string>('NODE_ENV') !== 'production',
             // You might want to add other TypeORM options like logging, etc.
           }),
           inject: [ConfigService], // Inject ConfigService into the factory
         }),
         StudentsModule,
         UsersModule,
         AuthModule,
         // Import other modules
       ],
       controllers: [AppController],
       providers: [AppService],
     })
     export class AppModule {}