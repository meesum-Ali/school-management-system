import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SchoolsService } from '../schools/schools.service'; // Import SchoolsService

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly schoolsService: SchoolsService, // Inject SchoolsService
  ) {}

  // The login and token generation logic will be handled by Keycloak.
  // This service can be used for other authentication-related tasks in the future.
}
