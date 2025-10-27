// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ClassesModule } from './classes/classes.module';
import { SubjectsModule } from './subjects/subjects.module';
import { SchoolsModule } from './schools/schools.module';
import { TeachersModule } from './teachers/teachers.module';
import { ClassScheduleModule } from './class-schedule/class-schedule.module';
import { User } from './users/entities/user.entity';
import { Student } from './students/entities/student.entity';
import { ClassEntity } from './classes/entities/class.entity';
import { SubjectEntity } from './subjects/entities/subject.entity';
import { School } from './schools/entities/school.entity';
import { Teacher } from './teachers/entities/teacher.entity';
import { ClassSchedule } from './class-schedule/entities/class-schedule.entity';
import { HealthModule } from './health/health.module';
import { SuperAdminModule } from './core/super-admin/super-admin.module';
import { ZitadelModule } from './zitadel/zitadel.module';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
// Import other modules as needed

@Module({
  imports: [
    ZitadelModule,
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
    StudentsModule,
    UsersModule,
    AuthModule,
    ClassesModule,
    SubjectsModule,
    SchoolsModule,
    TeachersModule,
    ClassScheduleModule,
    HealthModule,
    SuperAdminModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        return {
          ...dbConfig,
          autoLoadEntities: true,
          synchronize: false, // Disabled - use migrations instead
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Zitadel auth is handled via @UseGuards(AuthGuard('zitadel')) on controllers
    // No global guard needed - use @Public() decorator for public routes
  ],
})
export class AppModule {}
