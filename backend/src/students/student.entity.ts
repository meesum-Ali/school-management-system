import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsEmail, IsDateString } from 'class-validator';
import { ClassEntity } from '../../classes/entities/class.entity';

@Entity('students') // Explicitly naming the table
@Unique(['email'])
@Unique(['studentId'])
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

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.students, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'classId' }) // This explicitly defines the FK column name
  currentClass: ClassEntity | null;

  @Column({ type: 'uuid', name: 'classId', nullable: true }) // Foreign key column
  classId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
