import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';
import configuration from './configuration';
import { User } from './users/entities/user.entity';
import { Student } from './students/entities/student.entity';
import { ClassEntity } from './classes/entities/class.entity';
import { SubjectEntity } from './subjects/entities/subject.entity';
import { School } from './schools/entities/school.entity';
import { Teacher } from './teachers/entities/teacher.entity';
import { ClassSchedule } from './class-schedule/entities/class-schedule.entity';

const envFile = process.env.ENV_FILE;
if (envFile) {
  loadEnv({ path: envFile });
} else {
  loadEnv();
}

const appConfig = configuration();
const dbConfig = appConfig.database;

if (!dbConfig.host || !dbConfig.port || !dbConfig.username || !dbConfig.database) {
  throw new Error('Database configuration is incomplete. Please check your environment variables.');
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: dbConfig.host,
  port: dbConfig.port,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  entities: [User, Student, ClassEntity, SubjectEntity, School, Teacher, ClassSchedule],
  migrations: [
    resolve(__dirname, './migrations/*.ts'),
    resolve(__dirname, './migrations/*.js'),
  ],
  migrationsTableName: 'typeorm_migrations',
  synchronize: false,
  logging: false,
});

export default AppDataSource;
