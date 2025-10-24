"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("./entities/user.entity");
const user_dto_1 = require("./dto/user.dto");
let UsersService = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    mapUserToUserDto(user) {
        return new user_dto_1.UserDto({
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            isActive: user.isActive,
            roles: user.roles,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            schoolId: user.schoolId,
        });
    }
    async create(createUserDto) {
        const { username, email, password, roles, schoolId: schoolIdFromDto, ...restOfDto } = createUserDto;
        const targetSchoolId = schoolIdFromDto;
        const whereClauses = [];
        if (targetSchoolId) {
            whereClauses.push({ username, schoolId: targetSchoolId });
            whereClauses.push({ email, schoolId: targetSchoolId });
        }
        else {
            whereClauses.push({ username, schoolId: null });
            whereClauses.push({ email, schoolId: null });
        }
        const existingUser = await this.usersRepository.findOne({ where: whereClauses });
        if (existingUser) {
            if (existingUser.username === username) {
                throw new common_1.ConflictException(`Username "${username}" already exists` + (targetSchoolId ? ` in this school.` : `.`));
            }
            if (existingUser.email === email) {
                throw new common_1.ConflictException(`Email "${email}" already exists` + (targetSchoolId ? ` in this school.` : `.`));
            }
        }
        const user = new user_entity_1.User();
        user.schoolId = targetSchoolId;
        user.username = username;
        user.email = email;
        user.password = password;
        user.firstName = restOfDto.firstName;
        user.lastName = restOfDto.lastName;
        if (roles) {
            user.roles = roles;
        }
        user.isActive =
            restOfDto.isActive === undefined ? true : restOfDto.isActive;
        try {
            const savedUser = await this.usersRepository.save(user);
            return this.mapUserToUserDto(savedUser);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError &&
                error.code === '23505') {
                if (error.message.includes('users_username_key') ||
                    error.message.includes('UQ_username')) {
                    throw new common_1.ConflictException('Username already exists.');
                }
                else if (error.message.includes('users_email_key') ||
                    error.message.includes('UQ_email')) {
                    throw new common_1.ConflictException('Email already exists.');
                }
            }
            throw new common_1.InternalServerErrorException('Error creating user.');
        }
    }
    async findAll(contextualSchoolId) {
        let users;
        if (contextualSchoolId) {
            users = await this.usersRepository.find({ where: { schoolId: contextualSchoolId } });
        }
        else {
            users = await this.usersRepository.find();
        }
        return users.map((user) => this.mapUserToUserDto(user));
    }
    async findOne(id, contextualSchoolId) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        if (contextualSchoolId && user.schoolId !== contextualSchoolId) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found within your school context.`);
        }
        return this.mapUserToUserDto(user);
    }
    async findOneEntity(id, contextualSchoolId) {
        const queryBuilder = this.usersRepository.createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :id', { id });
        const user = await queryBuilder.getOne();
        if (user && contextualSchoolId && user.schoolId !== contextualSchoolId) {
            return undefined;
        }
        return user;
    }
    async findOneByUsername(username, schoolId) {
        const queryBuilder = this.usersRepository.createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.username = :username', { username });
        if (schoolId !== undefined) {
            if (schoolId === null) {
                queryBuilder.andWhere('user.schoolId IS NULL');
            }
            else {
                queryBuilder.andWhere('user.schoolId = :schoolId', { schoolId });
            }
        }
        const user = await queryBuilder.getOne();
        if (user && user.password) {
            return user;
        }
        return user;
    }
    async update(id, updateUserDto, contextualSchoolId) {
        const { password, schoolId: schoolIdFromDto, ...restOfDto } = updateUserDto;
        if (schoolIdFromDto) {
            throw new common_1.ConflictException('Changing schoolId is not permitted via this endpoint.');
        }
        const userToUpdate = await this.usersRepository.findOneBy({ id });
        if (!userToUpdate) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        if (contextualSchoolId && userToUpdate.schoolId !== contextualSchoolId) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found within your school context for update.`);
        }
        if (restOfDto.username && restOfDto.username !== userToUpdate.username) {
            const existingUser = await this.usersRepository.findOne({
                where: { username: restOfDto.username, schoolId: userToUpdate.schoolId },
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException(`Username '${restOfDto.username}' already exists` + (userToUpdate.schoolId ? ` in this school.` : '.'));
            }
        }
        if (restOfDto.email && restOfDto.email !== userToUpdate.email) {
            const existingUser = await this.usersRepository.findOne({
                where: { email: restOfDto.email, schoolId: userToUpdate.schoolId },
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException(`Email '${restOfDto.email}' already exists` + (userToUpdate.schoolId ? ` in this school.` : '.'));
            }
        }
        const { schoolId, ...validRestOfDto } = restOfDto;
        Object.assign(userToUpdate, validRestOfDto);
        if (password) {
            const saltRounds = 10;
            userToUpdate.password = await bcrypt.hash(password, saltRounds);
        }
        try {
            const updatedUser = await this.usersRepository.save(userToUpdate);
            return this.mapUserToUserDto(updatedUser);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError &&
                error.code === '23505') {
                if (error.message.includes('users_username_key') ||
                    error.message.includes('UQ_username')) {
                    throw new common_1.ConflictException('Username already exists.');
                }
                else if (error.message.includes('users_email_key') ||
                    error.message.includes('UQ_email')) {
                    throw new common_1.ConflictException('Email already exists.');
                }
            }
            throw new common_1.InternalServerErrorException('Error updating user.');
        }
    }
    async remove(id, contextualSchoolId) {
        const user = await this.usersRepository.findOneBy({ id });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found`);
        }
        if (contextualSchoolId && user.schoolId !== contextualSchoolId) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found within your school context for deletion.`);
        }
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`User with ID "${id}" not found or already deleted.`);
        }
    }
    async comparePassword(plainPassword, hashedPassword) {
        if (!hashedPassword)
            return false;
        return bcrypt.compare(plainPassword, hashedPassword);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map