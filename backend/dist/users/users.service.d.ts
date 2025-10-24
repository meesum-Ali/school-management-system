import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    private mapUserToUserDto;
    create(createUserDto: CreateUserDto): Promise<UserDto>;
    findAll(contextualSchoolId?: string | null): Promise<UserDto[]>;
    findOne(id: string, contextualSchoolId?: string | null): Promise<UserDto>;
    findOneEntity(id: string, contextualSchoolId?: string | null): Promise<User | undefined>;
    findOneByUsername(username: string, schoolId?: string | null): Promise<User | undefined>;
    update(id: string, updateUserDto: UpdateUserDto, contextualSchoolId?: string | null): Promise<UserDto>;
    remove(id: string, contextualSchoolId?: string | null): Promise<void>;
    comparePassword(plainPassword: string, hashedPassword?: string): Promise<boolean>;
}
