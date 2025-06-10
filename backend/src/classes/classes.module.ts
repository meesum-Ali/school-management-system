import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassEntity } from './entities/class.entity';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ClassEntity])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService], // Optional: export if other modules will use ClassesService directly
})
export class ClassesModule {}
