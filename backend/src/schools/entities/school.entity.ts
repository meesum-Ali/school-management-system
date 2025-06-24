import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, OneToOne } from 'typeorm';

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

  // A school can have many users
  @OneToMany(() => User, user => user.school)
  users: User[];

  // TODO: Add relationships to other school-specific entities like Student, Class, Subject
  // e.g., @OneToMany(() => Student, student => student.school) students: Student[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
