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
exports.SubjectsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const subjects_service_1 = require("./subjects.service");
const create_subject_dto_1 = require("./dto/create-subject.dto");
const update_subject_dto_1 = require("./dto/update-subject.dto");
const subject_dto_1 = require("./dto/subject.dto");
const class_dto_1 = require("../classes/dto/class.dto");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const user_entity_1 = require("../users/entities/user.entity");
let SubjectsController = class SubjectsController {
    constructor(subjectsService) {
        this.subjectsService = subjectsService;
    }
    getSchoolIdFromRequest(req) {
        const schoolId = req.user?.schoolId;
        if (!schoolId) {
            throw new Error('School ID not found in user context for Admin user.');
        }
        return schoolId;
    }
    async create(createSubjectDto, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.subjectsService.create(createSubjectDto, schoolId);
    }
    async findAll(req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.subjectsService.findAll(schoolId);
    }
    async findOne(id, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.subjectsService.findOne(id, schoolId);
    }
    async update(id, updateSubjectDto, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.subjectsService.update(id, updateSubjectDto, schoolId);
    }
    async remove(id, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.subjectsService.remove(id, schoolId);
    }
    async listClassesForSubject(subjectId, req) {
        const schoolId = this.getSchoolIdFromRequest(req);
        return this.subjectsService.listClassesForSubject(subjectId, schoolId);
    }
};
exports.SubjectsController = SubjectsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new subject for the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CREATED, description: 'Subject created successfully.', type: subject_dto_1.SubjectDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Conflict - Subject name or code already exists in this school.' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_subject_dto_1.CreateSubjectDto, Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get all subjects for the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'List of subjects retrieved successfully.', type: [subject_dto_1.SubjectDto] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get a subject by ID from the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'Subject ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Subject details retrieved successfully.', type: subject_dto_1.SubjectDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Not Found - Subject not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update a subject by ID in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'Subject ID' }),
    (0, swagger_1.ApiBody)({ type: update_subject_dto_1.UpdateSubjectDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Subject updated successfully.', type: subject_dto_1.SubjectDto }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Not Found - Subject not found.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid input data or invalid UUID format.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.CONFLICT, description: 'Conflict - Subject name or code already exists on another subject.' }),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_subject_dto_1.UpdateSubjectDto, Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a subject by ID in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string', format: 'uuid', description: 'Subject ID' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NO_CONTENT, description: 'Subject deleted successfully.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Not Found - Subject not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.BAD_REQUEST, description: 'Bad Request - Invalid UUID format.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized - Token missing or invalid.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden - User does not have ADMIN role or school context missing.' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':subjectId/classes'),
    (0, swagger_1.ApiOperation)({ summary: 'List all classes for a subject in the admin\'s school (Admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'subjectId', type: 'string', format: 'uuid', description: 'ID of the subject' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.OK, description: 'Classes for the subject retrieved successfully.', type: [class_dto_1.ClassDto] }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.NOT_FOUND, description: 'Subject not found in this school.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' }),
    (0, swagger_1.ApiResponse)({ status: common_1.HttpStatus.FORBIDDEN, description: 'Forbidden.' }),
    __param(0, (0, common_1.Param)('subjectId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SubjectsController.prototype, "listClassesForSubject", null);
exports.SubjectsController = SubjectsController = __decorate([
    (0, swagger_1.ApiTags)('Subjects Management'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('subjects'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('zitadel'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_entity_1.UserRole.SCHOOL_ADMIN),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })),
    __metadata("design:paramtypes", [subjects_service_1.SubjectsService])
], SubjectsController);
//# sourceMappingURL=subjects.controller.js.map