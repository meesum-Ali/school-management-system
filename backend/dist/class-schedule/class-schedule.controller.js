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
exports.ClassScheduleController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_schedule_service_1 = require("./class-schedule.service");
const create_class_schedule_dto_1 = require("./dto/create-class-schedule.dto");
const update_class_schedule_dto_1 = require("./dto/update-class-schedule.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const class_schedule_entity_1 = require("./entities/class-schedule.entity");
let ClassScheduleController = class ClassScheduleController {
    constructor(classScheduleService) {
        this.classScheduleService = classScheduleService;
    }
    async create(createClassScheduleDto, req) {
        if (req.user.role === user_entity_1.UserRole.TEACHER) {
            if (createClassScheduleDto.teacherId && createClassScheduleDto.teacherId !== req.user.id) {
                throw new common_1.ForbiddenException('You can only assign yourself as a teacher');
            }
            createClassScheduleDto.teacherId = req.user.id;
        }
        return this.classScheduleService.create({
            ...createClassScheduleDto,
            schoolId: req.user.schoolId,
            userId: req.user.role === user_entity_1.UserRole.TEACHER ? req.user.id : createClassScheduleDto.userId,
        });
    }
    async findAll(req) {
        return this.classScheduleService.findAll(req.user.schoolId);
    }
    async findByClass(classId, req) {
        return this.classScheduleService.findByClass(classId, req.user.schoolId);
    }
    async findByTeacher(teacherId, req) {
        if (req.user.role === user_entity_1.UserRole.TEACHER &&
            req.user.teacherId !== teacherId) {
            teacherId = req.user.teacherId;
        }
        return this.classScheduleService.findByTeacher(teacherId, req.user.schoolId);
    }
    async findOne(id, req) {
        return this.classScheduleService.findOne(id, req.user.schoolId);
    }
    async update(id, updateClassScheduleDto, req) {
        if (req.user.role === user_entity_1.UserRole.TEACHER) {
            const schedule = await this.classScheduleService.findOne(id, req.user.schoolId);
            if (schedule.teacherId !== req.user.teacherId) {
                throw new common_1.ForbiddenException('You can only update your own schedules');
            }
        }
        return this.classScheduleService.update(id, req.user.schoolId, updateClassScheduleDto);
    }
    async remove(id, req) {
        if (req.user.role === user_entity_1.UserRole.TEACHER) {
            const schedule = await this.classScheduleService.findOne(id, req.user.schoolId);
            if (schedule.teacherId !== req.user.teacherId) {
                throw new common_1.ForbiddenException('You can only delete your own schedules');
            }
        }
        await this.classScheduleService.remove(id, req.user.schoolId);
    }
};
exports.ClassScheduleController = ClassScheduleController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new class schedule' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'The class schedule has been successfully created.', type: class_schedule_entity_1.ClassSchedule }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Scheduling conflict detected' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_schedule_dto_1.CreateClassScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all class schedules for the current school' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return all class schedules.', type: [class_schedule_entity_1.ClassSchedule] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('class/:classId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get class schedules by class ID' }),
    (0, swagger_1.ApiParam)({ name: 'classId', description: 'ID of the class' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return class schedules for the specified class.', type: [class_schedule_entity_1.ClassSchedule] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('classId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "findByClass", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get schedules for a specific teacher' }),
    (0, swagger_1.ApiParam)({ name: 'teacherId', description: 'ID of the teacher' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return schedules for the specified teacher.', type: [class_schedule_entity_1.ClassSchedule] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Teacher not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('teacherId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "findByTeacher", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a specific class schedule by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID of the class schedule' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Return the requested class schedule.', type: class_schedule_entity_1.ClassSchedule }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class schedule not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a class schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID of the class schedule to update' }),
    (0, swagger_1.ApiBody)({ type: update_class_schedule_dto_1.UpdateClassScheduleDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'The class schedule has been updated.', type: class_schedule_entity_1.ClassSchedule }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class schedule not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Scheduling conflict detected' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_schedule_dto_1.UpdateClassScheduleDto, Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a class schedule' }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'ID of the class schedule to delete' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'The class schedule has been deleted.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class schedule not found' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassScheduleController.prototype, "remove", null);
exports.ClassScheduleController = ClassScheduleController = __decorate([
    (0, swagger_1.ApiTags)('Class Schedule'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('class-schedule'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('zitadel'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SCHOOL_ADMIN, user_entity_1.UserRole.TEACHER),
    __metadata("design:paramtypes", [class_schedule_service_1.ClassScheduleService])
], ClassScheduleController);
//# sourceMappingURL=class-schedule.controller.js.map