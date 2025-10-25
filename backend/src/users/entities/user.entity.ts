import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, JoinColumn, Index, OneToMany, OneToOne } from 'typeorm';
import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator'; // class-validator is for DTOs, not directly used by entity save from service
import * as bcrypt from 'bcrypt';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';

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
  SUPER_ADMIN = 'SUPER_ADMIN', // Role for managing schools and top-level settings
  SCHOOL_ADMIN = 'SCHOOL_ADMIN', // School administrator role
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  // Note: 'admin' and 'accountant' roles are not defined in the database enum
}

@Entity('users')
@Index(['email', 'schoolId'], { unique: true, where: `"school_id" IS NOT NULL` }) // Unique email per school
@Index(['username', 'schoolId'], { unique: true, where: `"school_id" IS NOT NULL` }) // Unique username per school
@Index(['email'], { unique: true, where: `"school_id" IS NULL` }) // Globally unique email for users not tied to a school (e.g. super_admin)
@Index(['username'], { unique: true, where: `"school_id" IS NULL` }) // Globally unique username for users not tied to a school
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

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' }) // Validation for DTO, not directly on entity for saving
  password: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100, nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100, nullable: true })
  lastName?: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({
    type: 'text',
    array: true,
    default: () => 'array[\'STUDENT\'::text]', // Defaulting new users to STUDENT role
    transformer: {
      to: (value: UserRole[]) => value,
      from: (value: string[]) => value
    }
  })
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  schoolId?: string | null; // Nullable for global users like SUPER_ADMIN

  @ManyToOne(() => School, school => school.users, { 
    nullable: true, 
    onDelete: 'CASCADE',
    lazy: true
  }) // onDelete: 'CASCADE' means if a school is deleted, its users are deleted.
  @JoinColumn({ name: 'school_id' })
  school: Promise<School> | null;

  @OneToOne(() => Student, (student) => student.user, { 
    cascade: false,
    lazy: true
  })
  studentProfile: Promise<Student>;

  @OneToOne(() => Teacher, (teacher) => teacher.user, { 
    cascade: false,
    lazy: true
  })
  teacherProfile: Promise<Teacher>;

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
    console.log('Comparing password attempt...');
    console.log('Attempt:', attempt);
    console.log('Stored hash:', this.password);
    console.log('Hash length:', this.password?.length);
    
    if (!this.password) {
      console.error('No password hash available for comparison');
      return false;
    }
    
    try {
      // Ensure the stored hash is a valid bcrypt hash
      if (!this.password.startsWith('$2b$') && !this.password.startsWith('$2a$') && !this.password.startsWith('$2y$')) {
        console.error('Invalid bcrypt hash format');
        return false;
      }
      
      const result = await bcrypt.compare(attempt, this.password);
      console.log('Password comparison result:', result);
      return result;
    } catch (error) {
      console.error('Error comparing passwords:', error);
      return false;
    }
  }
}
