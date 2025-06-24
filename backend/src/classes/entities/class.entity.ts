import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToMany, JoinTable, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Student } from '../../students/entities/student.entity';
import { School } from '../../schools/entities/school.entity';
// import { User } from '../../users/entities/user.entity';

@Entity('classes')
@Index(['name', 'schoolId'], { unique: true }) // Class name should be unique within a school
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  level: string; // e.g., "Grade 10", "Year 5", "Senior KG"

  @Column({ type: 'uuid', nullable: true })
  homeroomTeacherId?: string | null; // TODO: Link to User entity (Teacher role) more formally later.

  @ManyToMany(() => SubjectEntity, subject => subject.classes, { cascade: false })
  @JoinTable({
    name: 'class_subjects', // Name of the join table
    joinColumn: { name: 'class_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  })
  subjects: SubjectEntity[];

  @OneToMany(() => Student, (student) => student.currentClass, { cascade: false }) // cascade might be true for other operations, but for now false
  students: Student[];

  @Column({ name: 'school_id', type: 'uuid' })
  schoolId: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' }) // If school is deleted, its classes are deleted.
  @JoinColumn({ name: 'school_id' })
  school: School;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
