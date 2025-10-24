import { UserRole } from '../entities/user.entity';
export declare class CreateUserDto {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    roles?: UserRole[];
    isActive?: boolean;
    schoolId?: string;
}
