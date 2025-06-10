import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT_ROLE = 'student', // To avoid conflict with Student entity/domain if any
  ACCOUNTANT = 'accountant',
  PARENT = 'parent',
  USER = 'user', // General user
}

@Entity('users') // Explicitly naming the table 'users'
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @IsNotEmpty({ message: 'Email should not be empty' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' }) // Validation for DTO, not directly on entity for saving
  password: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'simple-array', // Stores array as comma-separated string or uses native array types if supported
    default: [UserRole.USER],
  })
  roles: UserRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) { // Only hash if password is provided (e.g. on create or if explicitly being updated)
      const saltRounds = 10; // Or read from config
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Method to compare password (useful in AuthService or UsersService if checking password)
  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}
