import { Injectable, NotFoundException, ConflictException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
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
    });
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const { username, email, password, roles, ...restOfDto } = createUserDto;

    // Check for existing username or email
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = new User();
    user.username = username;
    user.email = email;
    user.password = password; // Hashing will be done by @BeforeInsert in User entity
    user.firstName = restOfDto.firstName;
    user.lastName = restOfDto.lastName;
    user.roles = roles || [UserRole.USER]; // Default role if not provided
    user.isActive = restOfDto.isActive === undefined ? true : restOfDto.isActive;


    try {
      const savedUser = await this.usersRepository.save(user);
      return this.mapUserToUserDto(savedUser);
    } catch (error) {
      // Catch unique constraint violation if @BeforeInsert hashing and save happen non-atomically
      // or if there's a race condition not caught by the initial check.
      // TypeORM specific error code for unique violation might vary by DB (e.g., '23505' for PostgreSQL)
      if (error instanceof QueryFailedError && (error as any).code === '23505') {
         // Check message to see if it's username or email
        if (error.message.includes('users_username_key') || error.message.includes('UQ_username')) { // Adjust based on actual constraint name
            throw new ConflictException('Username already exists.');
        } else if (error.message.includes('users_email_key') || error.message.includes('UQ_email')) { // Adjust
            throw new ConflictException('Email already exists.');
        }
      }
      throw new InternalServerErrorException('Error creating user.');
    }
  }

  async findAll(): Promise<UserDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => this.mapUserToUserDto(user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    return this.mapUserToUserDto(user);
  }

  async findOneEntity(id: string): Promise<User | undefined> {
    return this.usersRepository.findOneBy({ id });
  }


  async findOneByUsername(username: string): Promise<User | undefined> {
    // Used by AuthService, should return the full entity including password
    return this.usersRepository.findOne({ where: { username } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const { password, ...restOfDto } = updateUserDto;

    // Ensure that if username or email is being updated, they are unique
    if (restOfDto.username) {
      const existingUser = await this.usersRepository.findOne({ where: { username: restOfDto.username } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Username '${restOfDto.username}' already exists.`);
      }
    }
    if (restOfDto.email) {
      const existingUser = await this.usersRepository.findOne({ where: { email: restOfDto.email } });
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`Email '${restOfDto.email}' already exists.`);
      }
    }

    const userToUpdate = await this.usersRepository.preload({
      id: id,
      ...restOfDto, // Apply other updates
    });

    if (!userToUpdate) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    // Handle password update separately if provided
    if (password) {
      const saltRounds = 10;
      userToUpdate.password = await bcrypt.hash(password, saltRounds);
    }

    try {
        const updatedUser = await this.usersRepository.save(userToUpdate);
        return this.mapUserToUserDto(updatedUser);
    } catch (error) {
        if (error instanceof QueryFailedError && (error as any).code === '23505') {
            if (error.message.includes('users_username_key') || error.message.includes('UQ_username')) {
                throw new ConflictException('Username already exists.');
            } else if (error.message.includes('users_email_key') || error.message.includes('UQ_email')) {
                throw new ConflictException('Email already exists.');
            }
        }
        throw new InternalServerErrorException('Error updating user.');
    }
  }

  async remove(id: string): Promise<void> { // Consider soft delete
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    // Soft delete:
    // user.isActive = false;
    // await this.usersRepository.save(user);
    // Hard delete:
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      // This case should ideally be caught by the findOneBy check, but as a safeguard:
      throw new NotFoundException(`User with ID "${id}" not found or already deleted.`);
    }
  }

  // Helper for AuthService to compare password
  async comparePassword(plainPassword: string, hashedPassword?: string): Promise<boolean> {
    if (!hashedPassword) return false;
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}
