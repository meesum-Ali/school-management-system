import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private mapUserToUserDto(user: User): UserDto {
    return new UserDto({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      schoolId: user.schoolId, // Include schoolId
    });
  }

  async create(createUserDto: CreateUserDto, // Current authenticated user (for context)
    // schoolIdFromContext?: string | null
  ): Promise<UserDto> {
    const { username, email, password, roles, schoolId: schoolIdFromDto, ...restOfDto } = createUserDto;

    // Determine the schoolId for the new user.
    // This logic will be refined. For now, SUPER_ADMIN can specify it.
    // Otherwise, it might come from the admin's context, or be null for a new SUPER_ADMIN.
    const targetSchoolId = schoolIdFromDto; // This needs to be contextual later

    // Check for existing username or email within the target school or globally
    const whereClauses: any[] = [];
    if (targetSchoolId) {
      whereClauses.push({ username, schoolId: targetSchoolId });
      whereClauses.push({ email, schoolId: targetSchoolId });
    } else {
      // Global user (e.g. SUPER_ADMIN), check for global uniqueness
      whereClauses.push({ username, schoolId: null });
      whereClauses.push({ email, schoolId: null });
    }
    const existingUser = await this.usersRepository.findOne({ where: whereClauses });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException(`Username "${username}" already exists` + (targetSchoolId ? ` in this school.` : `.`));
      }
      if (existingUser.email === email) {
        throw new ConflictException(`Email "${email}" already exists` + (targetSchoolId ? ` in this school.` : `.`));
      }
    }

    const user = new User();
    user.schoolId = targetSchoolId; // Set the schoolId
    user.username = username;
    user.email = email;
    user.password = password; // Hashing will be done by @BeforeInsert in User entity
    user.firstName = restOfDto.firstName;
    user.lastName = restOfDto.lastName;
    if (roles) {
      // Only set roles if provided in DTO
      user.roles = roles;
    }
    // If roles is not provided in DTO, TypeORM will use the entity's default ([UserRole.STUDENT])
    user.isActive =
      restOfDto.isActive === undefined ? true : restOfDto.isActive;

    try {
      const savedUser = await this.usersRepository.save(user);
      return this.mapUserToUserDto(savedUser);
    } catch (error) {
      // Catch unique constraint violation if @BeforeInsert hashing and save happen non-atomically
      // or if there's a race condition not caught by the initial check.
      // TypeORM specific error code for unique violation might vary by DB (e.g., '23505' for PostgreSQL)
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        // Check message to see if it's username or email
        if (
          error.message.includes('users_username_key') ||
          error.message.includes('UQ_username')
        ) {
          // Adjust based on actual constraint name
          throw new ConflictException('Username already exists.');
        } else if (
          error.message.includes('users_email_key') ||
          error.message.includes('UQ_email')
        ) {
          // Adjust
          throw new ConflictException('Email already exists.');
        }
      }
      throw new InternalServerErrorException('Error creating user.');
    }
  }

  async findAll(contextualSchoolId?: string | null): Promise<UserDto[]> {
    let users: User[];
    if (contextualSchoolId) {
      // If a schoolId is provided (e.g., for a school admin), filter by that school
      users = await this.usersRepository.find({ where: { schoolId: contextualSchoolId } });
    } else {
      // If no schoolId (e.g., for SUPER_ADMIN viewing all users, or global users)
      // This might need further refinement based on who is calling and what they should see
      // For now, it fetches all users. A SUPER_ADMIN might also want to see users with schoolId=null.
      users = await this.usersRepository.find();
    }
    return users.map((user) => this.mapUserToUserDto(user));
  }

  async findOne(id: string, contextualSchoolId?: string | null): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    // Authorization check: if contextualSchoolId is provided, ensure user belongs to that school
    if (contextualSchoolId && user.schoolId !== contextualSchoolId) {
      throw new NotFoundException( // Or ForbiddenException, but NotFound hides existence
        `User with ID "${id}" not found within your school context.`,
      );
    }
    return this.mapUserToUserDto(user);
  }

  async findOneEntity(id: string, contextualSchoolId?: string | null): Promise<User | undefined> {
    const user = await this.usersRepository.findOneBy({ id });
    if (user && contextualSchoolId && user.schoolId !== contextualSchoolId) {
      // For internal service use, returning undefined might be better than throwing
      return undefined;
    }
    return user;
  }

  async findOneByUsername(username: string, schoolId?: string | null): Promise<User | undefined> {
    // Used by AuthService, should return the full entity including password
    // If schoolId is provided, it's a school-specific user.
    // If schoolId is explicitly null, it's a global user.
    // If schoolId is undefined, it could be either, but this needs careful handling in AuthService.
    // For now, assume AuthService will provide the correct schoolId (or null for global users).
    if (schoolId === undefined) {
      // This case is ambiguous for multi-tenant usernames.
      // It might find a global user OR a user from *any* school if username is not globally unique.
      // This behavior needs to be carefully managed by the caller (AuthService).
      // Consider requiring schoolId to be explicitly null for global users.
      return this.usersRepository.findOne({ where: { username } });
    }
    return this.usersRepository.findOne({ where: { username, schoolId } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, contextualSchoolId?: string | null): Promise<UserDto> {
    const { password, schoolId: schoolIdFromDto, ...restOfDto } = updateUserDto as any; // schoolId should not be in UpdateUserDto for regular updates

    if (schoolIdFromDto) {
      // Prevent changing schoolId via this standard update method.
      // This should be a separate, more controlled administrative action if needed.
      throw new ConflictException('Changing schoolId is not permitted via this endpoint.');
    }

    const userToUpdate = await this.usersRepository.findOneBy({ id });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Authorization: Ensure user being updated is within the admin's school context (if applicable)
    if (contextualSchoolId && userToUpdate.schoolId !== contextualSchoolId) {
      throw new NotFoundException( // Or ForbiddenException
        `User with ID "${id}" not found within your school context for update.`,
      );
    }

    // Ensure that if username or email is being updated, they are unique within the user's school context
    if (restOfDto.username && restOfDto.username !== userToUpdate.username) {
      const existingUser = await this.usersRepository.findOne({
        where: { username: restOfDto.username, schoolId: userToUpdate.schoolId }, // Check within the same schoolId context
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `Username '${restOfDto.username}' already exists` + (userToUpdate.schoolId ? ` in this school.` : '.')
        );
      }
    }
    if (restOfDto.email && restOfDto.email !== userToUpdate.email) {
      const existingUser = await this.usersRepository.findOne({
        where: { email: restOfDto.email, schoolId: userToUpdate.schoolId }, // Check within the same schoolId context
      });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(
          `Email '${restOfDto.email}' already exists` + (userToUpdate.schoolId ? ` in this school.` : '.')
        );
      }
    }

    // Merge the updates, excluding schoolId if it was somehow passed
    const { schoolId, ...validRestOfDto } = restOfDto;
    Object.assign(userToUpdate, validRestOfDto);


    // Handle password update separately if provided
    if (password) {
      const saltRounds = 10;
      userToUpdate.password = await bcrypt.hash(password, saltRounds);
    }

    try {
      const updatedUser = await this.usersRepository.save(userToUpdate);
      return this.mapUserToUserDto(updatedUser);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        if (
          error.message.includes('users_username_key') ||
          error.message.includes('UQ_username')
        ) {
          throw new ConflictException('Username already exists.');
        } else if (
          error.message.includes('users_email_key') ||
          error.message.includes('UQ_email')
        ) {
          throw new ConflictException('Email already exists.');
        }
      }
      throw new InternalServerErrorException('Error updating user.');
    }
  }

  async remove(id: string, contextualSchoolId?: string | null): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Authorization: Ensure user being deleted is within the admin's school context (if applicable)
    if (contextualSchoolId && user.schoolId !== contextualSchoolId) {
      throw new NotFoundException( // Or ForbiddenException
        `User with ID "${id}" not found within your school context for deletion.`,
      );
    }

    // Consider soft delete:
    // user.isActive = false;
    // await this.usersRepository.save(user);
    // Hard delete:
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      // This case should ideally be caught by the findOneBy check, but as a safeguard:
      throw new NotFoundException(
        `User with ID "${id}" not found or already deleted.`,
      );
    }
  }

  // Helper for AuthService to compare password
  async comparePassword(
    plainPassword: string,
    hashedPassword?: string,
  ): Promise<boolean> {
    if (!hashedPassword) return false;
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
