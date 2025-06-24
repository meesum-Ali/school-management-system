import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { SubjectEntity } from '../../subjects/entities/subject.entity';
import { Student } from '../../students/entities/student.entity';
// import { User } from '../../users/entities/user.entity';

@Entity('classes')
@Unique(['name'])
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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
