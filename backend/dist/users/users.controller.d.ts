import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    private getContextualSchoolId;
    create(createUserDto: CreateUserDto, req: any): Promise<UserDto>;
    findAll(req: any): Promise<UserDto[]>;
    findOne(id: string, req: any): Promise<UserDto>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<UserDto>;
    remove(id: string, req: any): Promise<void>;
}
