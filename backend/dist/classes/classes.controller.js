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
exports.ClassesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const classes_service_1 = require("./classes.service");
const create_class_dto_1 = require("./dto/create-class.dto");
const update_class_dto_1 = require("./dto/update-class.dto");
const class_dto_1 = require("./dto/class.dto");
const subject_dto_1 = require("../subjects/dto/subject.dto");
const student_dto_1 = require("../students/dto/student.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let ClassesController = class ClassesController {
    constructor(classesService) {
        this.classesService = classesService;
    }
    getSchoolIdFromRequest(req) {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            throw new Error('School ID not found in user context for Admin user.');
        }
        return schoolId;
    }
    async create(createClassDto, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.create(createClassDto, schoolId);
    }
    async findAll(req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.findAll(schoolId);
    }
    async findOne(id, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.findOne(id, schoolId);
    }
    async update(id, updateClassDto, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.update(id, updateClassDto, schoolId);
    }
    async remove(id, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.remove(id, schoolId);
    }
    async assignSubjectToClass(classId, subjectId, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.assignSubject(classId, subjectId, schoolId);
    }
    async removeSubjectFromClass(classId, subjectId, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.removeSubjectFromClass(classId, subjectId, schoolId);
    }
    async listSubjectsForClass(classId, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.listSubjectsForClass(classId, schoolId);
    }
    async listStudentsInClass(classId, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.classesService.listStudentsInClass(classId, schoolId);
    }
};
exports.ClassesController = ClassesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new class (Admin only for their school)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Class created successfully.', type: class_dto_1.ClassDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Conflict - Class name already exists in this school.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_class_dto_1.CreateClassDto, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all classes for the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'List of classes retrieved successfully.', type: [class_dto_1.ClassDto] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a class by ID from the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Class details retrieved successfully.', type: class_dto_1.ClassDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Not Found - Class not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a class by ID in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' }),
    (0, swagger_1.ApiBody)({ type: update_class_dto_1.UpdateClassDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Class updated successfully.', type: class_dto_1.ClassDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Not Found - Class not found.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data or invalid UUID format.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Conflict - Class name already exists on another class.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_class_dto_1.UpdateClassDto, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a class by ID in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'Class ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'Class deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Not Found - Class not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':classId/subjects/:subjectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Assign a subject to a class in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' }),
    (0, swagger_1.ApiParam)({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject to assign' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Subject assigned to class successfully.', type: class_dto_1.ClassDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class or Subject not found.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    __param(0, (0, common_1.Param)('classId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('subjectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "assignSubjectToClass", null);
__decorate([
    (0, common_1.Delete)(':classId/subjects/:subjectId'),
    (0, swagger_1.ApiOperation)({ summary: 'Remove a subject from a class in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' }),
    (0, swagger_1.ApiParam)({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject to remove' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Subject removed from class successfully.', type: class_dto_1.ClassDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class not found, or Subject not found in class in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    __param(0, (0, common_1.Param)('classId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('subjectId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "removeSubjectFromClass", null);
__decorate([
    (0, common_1.Get)(':classId/subjects'),
    (0, swagger_1.ApiOperation)({ summary: 'List all subjects for a class in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'classId', type: 'string', format: 'uuid', description: 'ID of the class' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Subjects for the class retrieved successfully.', type: [subject_dto_1.SubjectDto] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    __param(0, (0, common_1.Param)('classId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "listSubjectsForClass", null);
__decorate([
    (0, common_1.Get)(':classId/students'),
    (0, swagger_1.ApiOperation)({ summary: 'List all students enrolled in a specific class in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'classId', type: 'string', format: 'uuid', description: 'Class ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'List of students in the class.', type: [student_dto_1.StudentDto] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Class not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    __param(0, (0, common_1.Param)('classId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassesController.prototype, "listStudentsInClass", null);
exports.ClassesController = ClassesController = __decorate([
    (0, swagger_1.ApiTags)('Classes Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('classes'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('zitadel'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SCHOOL_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [classes_service_1.ClassesService])
], ClassesController);
//# sourceMappingURL=classes.controller.js.map