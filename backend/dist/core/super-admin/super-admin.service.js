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
var SuperAdminService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuperAdminService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../../users/entities/user.entity");
let SuperAdminService = SuperAdminService_1 = class SuperAdminService {
    constructor(usersRepository, configService) {
        this.usersRepository = usersRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(SuperAdminService_1.name);
    }
    async onModuleInit() {
        await this.createSuperAdminIfNotExists();
    }
    async createSuperAdminIfNotExists() {
        const username = this.configService.get('SUPERADMIN_USERNAME', 'meesum');
        const email = this.configService.get('SUPERADMIN_EMAIL', 'meesum@example.com');
        const password = this.configService.get('SUPERADMIN_PASSWORD', 'ChangeMe123!');
        try {
            const existingUser = await this.usersRepository.findOne({
                where: { username },
                withDeleted: true
            });
            if (existingUser) {
                let needsUpdate = false;
                if (!existingUser.roles.includes(user_entity_1.UserRole.SUPER_ADMIN)) {
                    existingUser.roles = [user_entity_1.UserRole.SUPER_ADMIN];
                    needsUpdate = true;
                }
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
                if (!existingUser.password || !existingUser.password.startsWith('$2b$')) {
                    const saltRounds = 10;
                    existingUser.password = await bcrypt.hash(password, saltRounds);
                    needsUpdate = true;
                }
                if (needsUpdate) {
                    await this.usersRepository.save(existingUser);
                    this.logger.log(`Updated existing user '${username}' to super admin`);
                }
                else {
                    this.logger.log(`Super admin user '${username}' already exists with correct configuration`);
                }
                return;
            }
            const user = new user_entity_1.User();
            user.username = username;
            user.email = email;
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            user.password = hashedPassword;
            user.firstName = 'Super';
            user.lastName = 'Admin';
            user.roles = [user_entity_1.UserRole.SUPER_ADMIN];
            user.isActive = true;
            user.schoolId = null;
            await this.usersRepository.save(user);
            this.logger.log(`Super admin user '${username}' created successfully`);
        }
        catch (error) {
            this.logger.error(`Error creating/updating super admin: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.SuperAdminService = SuperAdminService;
exports.SuperAdminService = SuperAdminService = SuperAdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService])
], SuperAdminService);
//# sourceMappingURL=super-admin.service.js.map