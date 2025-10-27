import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { ClassEntity } from '../../classes/entities/class.entity';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateIf,
} from 'class-validator';

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY',
}

export enum TermEnum {
  FIRST_TERM = 'FIRST_TERM',
  SECOND_TERM = 'SECOND_TERM',
  THIRD_TERM = 'THIRD_TERM',
}

@Entity('class_schedule')
@Index(
  'IDX_UNIQUE_CLASS_SCHEDULE_SLOT',
  ['classId', 'dayOfWeek', 'startTime', 'academicYear', 'term', 'schoolId'],
  {
    unique: true,
  },
)
@Index(
  'IDX_TEACHER_SCHEDULE_CONFLICT',
  ['teacherId', 'dayOfWeek', 'startTime', 'academicYear', 'term'],
  {
    unique: false,
  },
)
export class ClassSchedule {
  @ApiProperty({ description: 'Unique identifier of the class schedule' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Reference to the class' })
  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.schedules, {
    onDelete: 'CASCADE',
    lazy: true, // Enable lazy loading
  })
  @JoinColumn({ name: 'class_id' })
  class: Promise<ClassEntity>;

  @ApiProperty({ description: 'ID of the class' })
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'class_id', type: 'uuid' })
  classId: string;

  @ApiProperty({ description: 'Reference to the subject' })
  @ManyToOne(() => SubjectEntity, (subject) => subject.classSchedules, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'subject_id' })
  subject: Promise<SubjectEntity>;

  @ApiProperty({ description: 'ID of the subject' })
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'subject_id', type: 'uuid' })
  subjectId: string;

  @ApiProperty({ description: 'Reference to the teacher', required: false })
  @ManyToOne(() => Teacher, {
    onDelete: 'SET NULL',
    lazy: true,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Promise<Teacher>;

  @ApiProperty({ description: 'ID of the teacher', required: false })
  @IsUUID()
  @ValidateIf((o) => o.teacherId !== null && o.teacherId !== undefined)
  @Column({ name: 'teacher_id', type: 'uuid', nullable: true })
  teacherId?: string;

  @ApiProperty({
    description: 'Day of the week for the class',
    enum: DayOfWeek,
    enumName: 'day_of_week_enum',
  })
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  @Column({
    type: 'enum',
    enum: DayOfWeek,
    enumName: 'day_of_week_enum',
  })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ description: 'Start time of the class (HH:MM:SS)' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'time' })
  startTime: string;

  @ApiProperty({ description: 'End time of the class (HH:MM:SS)' })
  @IsString()
  @IsNotEmpty()
  @Column({ type: 'time' })
  endTime: string;

  @ApiProperty({
    description: 'Room number where the class is held',
    required: false,
  })
  @IsString()
  @Column({ name: 'room_number', type: 'varchar', length: 20, nullable: true })
  roomNumber?: string;

  @ApiProperty({ description: 'Academic year (e.g., 2023-2024)' })
  @IsString()
  @IsNotEmpty()
  @Column({ name: 'academic_year', type: 'varchar', length: 20 })
  academicYear: string;

  @ApiProperty({ description: 'School ID' })
  @IsUUID()
  @IsNotEmpty()
  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ApiProperty({ description: 'Reference to the school' })
  @ManyToOne(() => School, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'school_id' })
  school: Promise<School>;

  @ApiProperty({
    description: 'Academic term',
    enum: TermEnum,
    enumName: 'term_enum',
  })
  @IsEnum(TermEnum)
  @IsNotEmpty()
  @Column({
    type: 'enum',
    enum: TermEnum,
    enumName: 'term_enum',
  })
  term: TermEnum;

  // For backward compatibility with direct user_id reference
  @ApiProperty({
    description: 'Reference to the user who created the schedule',
    required: false,
  })
  @ManyToOne(() => User, {
    onDelete: 'SET NULL',
    lazy: true,
  })
  @JoinColumn({ name: 'user_id' })
  user?: Promise<User>;

  @ApiProperty({
    description: 'ID of the user who created the schedule',
    required: false,
  })
  @IsUUID()
  @ValidateIf((o) => o.userId !== null && o.userId !== undefined)
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string;

  @ApiProperty({ description: 'Date when the record was created' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Date when the record was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateTimeSlot() {
    if (this.startTime >= this.endTime) {
      throw new Error('End time must be after start time');
    }
  }
}
