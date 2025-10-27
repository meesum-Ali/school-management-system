import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from './entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsV2Controller } from './students-v2.controller';
import { StudentsService } from './students.service';
import { ClassesModule } from '../classes/classes.module';

// DDD Architecture: Application Layer (Use Cases)
import {
  CreateStudentUseCase,
  EnrollStudentUseCase,
  UnenrollStudentUseCase,
  UpdateStudentUseCase,
  GetStudentByIdUseCase,
  GetStudentByEmailUseCase,
  ListStudentsUseCase,
  GetStudentsByClassUseCase,
} from './application/use-cases';

// DDD Architecture: Infrastructure Layer (Repository Adapter)
import { StudentRepositoryAdapter } from './infrastructure/adapters';
import { IStudentRepository } from './domain/repositories';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student]),
    ClassesModule, // Import ClassesModule to access ClassesService (DDD: proper module boundaries)
  ],
  controllers: [StudentsController, StudentsV2Controller],
  providers: [
    // Legacy service (keep for backward compatibility during migration)
    StudentsService,

    // DDD: Repository adapter (Infrastructure → Domain interface)
    {
      provide: 'IStudentRepository',
      useClass: StudentRepositoryAdapter,
    },

    // DDD: Use Cases (Application Layer)
    {
      provide: CreateStudentUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new CreateStudentUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: EnrollStudentUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new EnrollStudentUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: UnenrollStudentUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new UnenrollStudentUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: UpdateStudentUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new UpdateStudentUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: GetStudentByIdUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new GetStudentByIdUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: GetStudentByEmailUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new GetStudentByEmailUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: ListStudentsUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new ListStudentsUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
    {
      provide: GetStudentsByClassUseCase,
      useFactory: (repository: IStudentRepository) => {
        return new GetStudentsByClassUseCase(repository);
      },
      inject: ['IStudentRepository'],
    },
  ],
  exports: [
    StudentsService, // Keep exporting for backward compatibility
    'IStudentRepository', // Export repository for other modules if needed
  ],
})
export class StudentsModule {}
