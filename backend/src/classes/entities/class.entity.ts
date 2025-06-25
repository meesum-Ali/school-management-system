import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

@Entity('classes')
@Index(['name', 'schoolId'], { unique: true }) // Class name should be unique within a school
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  level: string; // e.g., "Grade 10", "Year 5", "Senior KG"

  @Column({ name: 'homeroom_teacher_id', type: 'uuid', nullable: true })
  homeroomTeacherId?: string | null;

  @ManyToOne(() => Teacher, (teacher) => teacher.homeroomClasses, { 
    onDelete: 'SET NULL',
    lazy: true
  })
  @JoinColumn({ name: 'homeroom_teacher_id' })
  homeroomTeacher: Promise<Teacher> | null;

  @ManyToMany(() => SubjectEntity, subject => subject.classes, { 
    cascade: false,
    lazy: true
  })
  @JoinTable({
    name: 'class_subjects', // Name of the join table
    joinColumn: { name: 'class_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: Promise<SubjectEntity[]>;

  @OneToMany(() => Student, (student) => student.currentClass, { 
    cascade: false,
    lazy: true
  })
  students: Promise<Student[]>;

  @OneToMany(() => ClassSchedule, (schedule) => schedule.class, {
    lazy: true
  })
  schedules: Promise<ClassSchedule[]>;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ManyToOne(() => School, { 
    onDelete: 'CASCADE',
    lazy: true
  }) // If school is deleted, its classes are deleted.
  @JoinColumn({ name: 'school_id' })
  school: Promise<School>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
