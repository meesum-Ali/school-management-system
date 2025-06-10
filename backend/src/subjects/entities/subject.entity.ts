import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, ManyToMany } from 'typeorm';
import { ClassEntity } from '../../classes/entities/class.entity';

@Entity('subjects')
@Unique(['name'])
@Unique(['code'])
export class SubjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true }) // Making code unique in DB as well
  code?: string | null;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => ClassEntity, cls => cls.subjects, { cascade: false })
  classes: ClassEntity[];
}
