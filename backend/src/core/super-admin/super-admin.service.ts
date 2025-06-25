import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../../users/entities/user.entity';

@Injectable()
export class SuperAdminService implements OnModuleInit {
  private readonly logger = new Logger(SuperAdminService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.createSuperAdminIfNotExists();
  }

  private async createSuperAdminIfNotExists() {
    const username = this.configService.get<string>('SUPERADMIN_USERNAME', 'meesum');
    const email = this.configService.get<string>('SUPERADMIN_EMAIL', 'meesum@example.com');
    const password = this.configService.get<string>('SUPERADMIN_PASSWORD', 'ChangeMe123!');

    try {
      const existingUser = await this.usersRepository.findOne({ 
        where: { username },
        withDeleted: true // Include soft-deleted users
      });
      
      if (existingUser) {
        // Check if we need to update the existing user
        let needsUpdate = false;
        
        // Ensure the user has the SUPER_ADMIN role
        if (!existingUser.roles.includes(UserRole.SUPER_ADMIN)) {
          existingUser.roles = [UserRole.SUPER_ADMIN];
          needsUpdate = true;
        }
        
        // Update other fields if they don't match
        if (existingUser.email !== email) {
          existingUser.email = email;
          needsUpdate = true;
        }
        
        if (existingUser.firstName !== 'Super') {
          existingUser.firstName = 'Super';
          needsUpdate = true;
        }
        
        if (existingUser.lastName !== 'Admin') {
          existingUser.lastName = 'Admin';
          needsUpdate = true;
        }
        
        if (existingUser.isActive !== true) {
          existingUser.isActive = true;
          needsUpdate = true;
        }
        
        if (existingUser.schoolId !== null) {
          existingUser.schoolId = null;
          needsUpdate = true;
        }
        
        // Ensure the password is properly hashed
        if (!existingUser.password || !existingUser.password.startsWith('$2b$')) {
          const saltRounds = 10;
          existingUser.password = await bcrypt.hash(password, saltRounds);
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await this.usersRepository.save(existingUser);
          this.logger.log(`Updated existing user '${username}' to super admin`);
        } else {
          this.logger.log(`Super admin user '${username}' already exists with correct configuration`);
        }
        return;
      }

      // Create a new user with the correct property names that match the User entity
      const user = new User();
      user.username = username;
      user.email = email;
      // Set the password directly to the hashed value to ensure consistency
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      user.password = hashedPassword;
      user.firstName = 'Super';
      user.lastName = 'Admin';
      user.roles = [UserRole.SUPER_ADMIN];
      user.isActive = true;
      user.schoolId = null; // Explicitly set to null for super admin

      await this.usersRepository.save(user);
      this.logger.log(`Super admin user '${username}' created successfully`);
    } catch (error) {
      this.logger.error(`Error creating/updating super admin: ${error.message}`, error.stack);
      throw error;
    }
  }
}
