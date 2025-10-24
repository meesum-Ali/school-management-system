import { UsersService } from '../users/users.service';
import { SchoolsService } from '../schools/schools.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private readonly usersService;
    private readonly schoolsService;
    private readonly jwtService;
    constructor(usersService: UsersService, schoolsService: SchoolsService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: any;
    }>;
}
