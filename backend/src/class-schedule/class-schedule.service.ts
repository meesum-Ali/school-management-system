import { 
  Injectable, 
  NotFoundException, 
  BadRequestException, 
  ConflictException, 
  forwardRef, 
  Inject 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { 
  Repository, 
  Not, 
  LessThan, 
  MoreThan,
  In 
} from 'typeorm';
import { ClassSchedule } from './entities/class-schedule.entity';
import { CreateClassScheduleDto } from './dto/create-class-schedule.dto';
import { UpdateClassScheduleDto } from './dto/update-class-schedule.dto';
import { ClassesService } from '../classes/classes.service';
import { TeachersService } from '../teachers/teachers.service';
import { SubjectsService } from '../subjects/subjects.service';

@Injectable()
export class ClassScheduleService {
  constructor(
    @InjectRepository(ClassSchedule)
    private readonly classScheduleRepository: Repository<ClassSchedule>,
    @Inject(forwardRef(() => ClassesService))
    private readonly classesService: ClassesService,
    @Inject(forwardRef(() => TeachersService))
    private readonly teachersService: TeachersService,
    @Inject(forwardRef(() => SubjectsService))
    private readonly subjectsService: SubjectsService,
  ) {}

  async create(createClassScheduleDto: CreateClassScheduleDto): Promise<ClassSchedule> {
    // Validate class exists
    await this.classesService.findOne(createClassScheduleDto.classId, createClassScheduleDto.schoolId);
    
    // Validate subject exists
    await this.subjectsService.findOne(createClassScheduleDto.subjectId, createClassScheduleDto.schoolId);
    
    // Validate teacher exists if provided
    if (createClassScheduleDto.teacherId) {
      await this.teachersService.findOne(createClassScheduleDto.teacherId, createClassScheduleDto.schoolId);
    }
    
    // Check for scheduling conflicts
    await this.checkForSchedulingConflicts(createClassScheduleDto);
    
    const schedule = this.classScheduleRepository.create(createClassScheduleDto);
    return this.classScheduleRepository.save(schedule);
  }

  async findAll(schoolId: string): Promise<ClassSchedule[]> {
    return this.classScheduleRepository.find({
      where: { school: { id: schoolId } },
      relations: ['class', 'subject', 'teacher', 'user'],
    });
  }

  async findOne(id: string, schoolId: string): Promise<ClassSchedule> {
    const schedule = await this.classScheduleRepository.findOne({
      where: { 
        id,
        school: { id: schoolId } 
      },
      relations: ['class', 'subject', 'teacher', 'user', 'school'],
    });

    if (!schedule) {
      throw new NotFoundException(`Class schedule with ID ${id} not found`);
    }

    return schedule;
  }

  async update(
    id: string,
    schoolId: string,
    updateClassScheduleDto: UpdateClassScheduleDto,
  ): Promise<ClassSchedule> {
    const schedule = await this.findOne(id, schoolId);
    
    // If class is being updated, validate it exists
    if (updateClassScheduleDto.classId) {
      await this.classesService.findOne(updateClassScheduleDto.classId, schoolId);
    }
    
    // If subject is being updated, validate it exists
    if (updateClassScheduleDto.subjectId) {
      await this.subjectsService.findOne(updateClassScheduleDto.subjectId, schoolId);
    }
    
    // If teacher is being updated, validate it exists
    if (updateClassScheduleDto.teacherId) {
      await this.teachersService.findOne(updateClassScheduleDto.teacherId, schoolId);
    }
    
    // Check for scheduling conflicts, excluding the current schedule
    await this.checkForSchedulingConflicts({
      ...schedule,
      ...updateClassScheduleDto,
    }, id);
    
    const updated = this.classScheduleRepository.merge(schedule, updateClassScheduleDto);
    return this.classScheduleRepository.save(updated);
  }

  async remove(id: string, schoolId: string): Promise<void> {
    const schedule = await this.findOne(id, schoolId);
    await this.classScheduleRepository.remove(schedule);
  }

  async findByClass(classId: string, schoolId: string): Promise<ClassSchedule[]> {
    return this.classScheduleRepository.find({
      where: { 
        class: { id: classId },
        school: { id: schoolId } 
      },
      relations: ['subject', 'teacher', 'user', 'class'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }

  async findByTeacher(teacherId: string, schoolId: string): Promise<ClassSchedule[]> {
    // Validate teacher exists
    await this.teachersService.findOne(teacherId, schoolId);
    
    return this.classScheduleRepository.find({
      where: { 
        teacher: { id: teacherId },
        school: { id: schoolId } 
      },
      relations: ['class', 'subject', 'teacher', 'user'],
      order: { dayOfWeek: 'ASC', startTime: 'ASC' },
    });
  }
  
  /**
   * Check for scheduling conflicts with existing schedules
   * @param schedule The schedule to check
   * @param excludeId Optional ID to exclude from conflict check (for updates)
   * @private
   */
  private async checkForSchedulingConflicts(
    schedule: CreateClassScheduleDto | UpdateClassScheduleDto,
    excludeId?: string
  ): Promise<void> {
    const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, academicYear, term, schoolId } = schedule;
    
    // Check for class schedule conflict
    const classConflict = await this.classScheduleRepository.findOne({
      where: {
        class: { id: classId },
        dayOfWeek,
        academicYear,
        term,
        school: { id: schoolId },
        ...(excludeId && { id: Not(excludeId) }),
        // Check for time overlap
        startTime: LessThan(endTime),
        endTime: MoreThan(startTime),
      },
    });
    
    if (classConflict) {
      throw new ConflictException('Class already has a scheduled class during this time slot');
    }
    
    // Check for teacher schedule conflict if teacher is assigned
    if (teacherId) {
      const teacherConflict = await this.classScheduleRepository.findOne({
        where: {
          teacher: { id: teacherId },
          dayOfWeek,
          academicYear,
          term,
          school: { id: schoolId },
          ...(excludeId && { id: Not(excludeId) }),
          // Check for time overlap
          startTime: LessThan(endTime),
          endTime: MoreThan(startTime),
        },
      });
      
      if (teacherConflict) {
        throw new ConflictException('Teacher is already assigned to another class during this time slot');
      }
    }
    
    // Check if start time is before end time
    if (startTime >= endTime) {
      throw new BadRequestException('End time must be after start time');
    }
  }
}
