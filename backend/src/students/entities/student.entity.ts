import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { IsNotEmpty, IsEmail, IsDateString } from 'class-validator';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';

@Entity('students') // Explicitly naming the table
@Index(['email', 'schoolId'], { unique: true }) // Email should be unique within a school
@Index(['studentId', 'schoolId'], { unique: true }) // studentId should be unique within a school
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'First name should not be empty' })
  firstName: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Last name should not be empty' })
  lastName: string;

  @Column({ type: 'date' })
  @IsDateString({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)'}) // For DTO validation, entity type is Date
  @IsNotEmpty({ message: 'Date of birth should not be empty' })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 255 })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @Column({ type: 'varchar', length: 50 }) // Assuming studentId might have a certain length
  @IsNotEmpty({ message: 'Student ID should not be empty' })
  studentId: string;

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, { 
    nullable: true, 
    onDelete: 'SET NULL',
    lazy: true
  })
  @JoinColumn({ name: 'classId' }) // This explicitly defines the FK column name
  currentClass: Promise<ClassEntity> | null;

  @Column({ type: 'uuid', name: 'classId', nullable: true }) // Foreign key column
  classId: string | null;

  @Column({ name: 'school_id', type: 'uuid' }) // Not nullable, a student must belong to a school
  schoolId: string;

  @ManyToOne(() => School, { 
    onDelete: 'CASCADE',
    lazy: true
  }) // If school is deleted, its students are deleted.
  @JoinColumn({ name: 'school_id' })
  school: Promise<School>;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @OneToOne(() => User, (user) => user.studentProfile, { 
    onDelete: 'CASCADE',
    lazy: true
  })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
