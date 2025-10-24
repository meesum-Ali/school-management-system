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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const student_dto_1 = require("../../students/dto/student.dto");
const subject_basic_dto_1 = require("../../subjects/dto/subject-basic.dto");
class ClassDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.ClassDto = ClassDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'c1d2e3f4-a5b6-7890-1234-567890abcdef', description: 'Unique identifier of the class (UUID)' }),
    __metadata("design:type", String)
], ClassDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Mathematics 10A', description: 'Name of the class' }),
    __metadata("design:type", String)
], ClassDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Grade 10', description: 'Level or grade of the class' }),
    __metadata("design:type", String)
], ClassDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', description: 'UUID of the homeroom teacher (User ID)', nullable: true }),
    __metadata("design:type", String)
], ClassDto.prototype, "homeroomTeacherId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => [subject_basic_dto_1.SubjectBasicDto], description: 'List of subjects associated with this class' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], ClassDto.prototype, "subjects", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => [student_dto_1.StudentDto], description: 'List of students enrolled in this class (if requested)' }),
    __metadata("design:type", Array)
], ClassDto.prototype, "students", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the class record was created' }),
    __metadata("design:type", Date)
], ClassDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the class record was last updated' }),
    __metadata("design:type", Date)
], ClassDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-a-school', description: 'School ID the class belongs to.' }),
    __metadata("design:type", String)
], ClassDto.prototype, "schoolId", void 0);
//# sourceMappingURL=class.dto.js.map