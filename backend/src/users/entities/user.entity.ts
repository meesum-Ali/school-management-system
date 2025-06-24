import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'; // class-validator is for DTOs, not directly used by entity save from service
import * as bcrypt from 'bcrypt';
import { School } from '../../schools/entities/school.entity';

/*
  Preliminary Role Permissions (for User & Student Management):
  - ADMIN:
    - Users: Create, Read (All), Update, Delete
    - Students: Create, Read (All), Update, Delete
  - TEACHER:
    - Users: Read (Self - future), Update (Self - future)
    - Students: Read (Assigned Students - future), Update (Grades/Attendance for Assigned - future)
  - ACCOUNTANT:
    - Users: No direct CRUD.
    - Students: Read (Potentially for fee purposes - future).
  - STUDENT (as a User role, if they can log in):
    - Users: Read (Self - future), Update (Self - future)
    - Students: Read (Self - future)
  - PARENT:
    - Users: Read (Self - future), Update (Self - future)
    - Students: Read (Their Children - future)
*/
export enum UserRole {
  SUPER_ADMIN = 'super_admin', // New role for managing schools and top-level settings
  ADMIN = 'admin', // School-level admin
  TEACHER = 'teacher',
  ACCOUNTANT = 'accountant',
  STUDENT = 'student',
  PARENT = 'parent',
}

@Entity('users')
@Index(['email', 'schoolId'], { unique: true, where: `"schoolId" IS NOT NULL` }) // Unique email per school
@Index(['username', 'schoolId'], { unique: true, where: `"schoolId" IS NOT NULL` }) // Unique username per school
@Index(['email'], { unique: true, where: `"schoolId" IS NULL` }) // Globally unique email for users not tied to a school (e.g. super_admin)
@Index(['username'], { unique: true, where: `"schoolId" IS NULL` }) // Globally unique username for users not tied to a school
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // For users associated with a school, username is unique within that school.
  // For global users (schoolId is NULL), username is globally unique.
  @Column({ type: 'varchar', length: 255 })
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  // For users associated with a school, email is unique within that school.
  // For global users (schoolId is NULL), email is globally unique.
  @Column({ type: 'varchar', length: 255 })
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
    type: 'simple-array',
    enum: UserRole,
    default: [UserRole.STUDENT], // Defaulting new users to STUDENT role
  })
  roles: UserRole[];

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  schoolId?: string | null; // Nullable for global users like SUPER_ADMIN

  @ManyToOne(() => School, school => school.users, { nullable: true, onDelete: 'CASCADE' }) // onDelete: 'CASCADE' means if a school is deleted, its users are deleted. Or use 'SET NULL' if users can exist without a school.
  @JoinColumn({ name: 'school_id' })
  school?: School | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
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
