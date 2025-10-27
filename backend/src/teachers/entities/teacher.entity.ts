import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  Index,
  OneToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';

@Entity('teachers')
@Index(['employeeId', 'schoolId'], { unique: true }) // Employee ID should be unique within a school
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', type: 'varchar', length: 50 })
  employeeId: string;

  @Column({ name: 'hire_date', type: 'date' })
  hireDate: Date;

  @Column({ type: 'text', nullable: true })
  qualification?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization?: string;

  // Relations
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.homeroomTeacher, {
    lazy: true,
  })
  homeroomClasses: Promise<ClassEntity[]>;

  @OneToMany(() => ClassSchedule, (schedule) => schedule.teacher, {
    lazy: true,
  })
  classSchedules: Promise<ClassSchedule[]>;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ManyToOne(() => School, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'school_id' })
  school: Promise<School>;

  @OneToOne(() => User, (user) => user.teacherProfile, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn({ name: 'user_id' })
  user: Promise<User>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
