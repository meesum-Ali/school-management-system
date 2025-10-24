import { UserRole } from '../entities/user.entity';
export declare class UserDto {
    id: string;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    isActive: boolean;
    roles: UserRole[];
    createdAt: Date;
    updatedAt: Date;
    schoolId?: string | null;
    constructor(partial: Partial<UserDto>);
}
