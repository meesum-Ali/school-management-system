import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectEntity } from './entities/subject.entity';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectEntity])],
  controllers: [SubjectsController],
  providers: [SubjectsService],
  exports: [
    SubjectsService, // Optional: export the service
    TypeOrmModule.forFeature([SubjectEntity]) // Export the repository to make it available for other modules
  ]
})
export class SubjectsModule {}
