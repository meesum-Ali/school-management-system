import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'; // class-validator is for DTOs, not directly used by entity save from service
import * as bcrypt from 'bcrypt';

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
  ADMIN = 'admin', // Using lowercase as per original subtask instruction for this enum update
  TEACHER = 'teacher',
  ACCOUNTANT = 'accountant',
  STUDENT = 'student',
  PARENT = 'parent',
}

@Entity('users')
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
    type: 'simple-array',
    enum: UserRole,
    default: [UserRole.STUDENT], // Defaulting new users to STUDENT role
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
