import { User } from '../../users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true, nullable: true })
  domain?: string; // For subdomain-based tenancy e.g., schoolA.myapp.com

  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'admin_user_id', nullable: true })
  adminUserId?: string; // UUID of the first admin user for this school

  // School relationships
  @OneToMany(() => User, (user) => user.school, {
    lazy: true,
  })
  users: Promise<User[]>;

  @OneToMany(() => Student, (student) => student.school, {
    lazy: true,
  })
  students: Promise<Student[]>;

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.school, {
    lazy: true,
  })
  classes: Promise<ClassEntity[]>;

  @OneToMany(() => SubjectEntity, (subject) => subject.school, {
    lazy: true,
  })
  subjects: Promise<SubjectEntity[]>;

  @OneToMany(() => Teacher, (teacher) => teacher.school, {
    lazy: true,
  })
  teachers: Promise<Teacher[]>;

  @OneToMany(() => ClassSchedule, (schedule) => schedule.school, {
    lazy: true,
  })
  classSchedules: Promise<ClassSchedule[]>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
