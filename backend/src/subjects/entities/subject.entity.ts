import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToMany,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { ClassSchedule } from '../../class-schedule/entities/class-schedule.entity';

@Entity('subjects')
@Index(['name', 'schoolId'], { unique: true }) // Subject name should be unique within a school
@Index(['code', 'schoolId'], {
  unique: true,
  where: `"code" IS NOT NULL AND "school_id" IS NOT NULL`,
}) // Subject code should be unique within a school if provided
export class SubjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  // Code is unique within a school, if provided.
  @Column({ type: 'varchar', length: 50, nullable: true })
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ManyToOne(() => School, {
    onDelete: 'CASCADE',
    lazy: true,
  }) // If school is deleted, its subjects are deleted.
  @JoinColumn({ name: 'school_id' })
  school: Promise<School>;

  @ManyToMany(() => ClassEntity, (cls) => cls.subjects, {
    cascade: false,
    lazy: true,
  })
  classes: Promise<ClassEntity[]>;

  @OneToMany(() => ClassSchedule, (schedule) => schedule.subject, {
    lazy: true,
  })
  classSchedules: Promise<ClassSchedule[]>;
}
