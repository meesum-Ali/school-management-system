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
exports.UpdateStudentDto = exports.CreateStudentDto = exports.StudentDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class StudentDto {
}
exports.StudentDto = StudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Unique identifier of the student (UUID)' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StudentDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'First name of the student' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name should not be empty' }),
    __metadata("design:type", String)
], StudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'Last name of the student' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name should not be empty' }),
    __metadata("design:type", String)
], StudentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2005-04-15', description: 'Date of birth of the student (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Date of birth should not be empty' }),
    __metadata("design:type", Date)
], StudentDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com', description: 'Email address of the student' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email should not be empty' }),
    __metadata("design:type", String)
], StudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STU20230001', description: 'Unique student ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Student ID should not be empty' }),
    __metadata("design:type", String)
], StudentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID of the class the student belongs to (UUID)',
        nullable: true
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StudentDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z', description: 'Date when the student was created' }),
    __metadata("design:type", Date)
], StudentDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2023-01-01T00:00:00.000Z', description: 'Date when the student was last updated' }),
    __metadata("design:type", Date)
], StudentDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: 'Grade 10-A',
        description: 'Name of the current class the student belongs to',
        nullable: true
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], StudentDto.prototype, "currentClassName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-a-school', description: 'School ID the student belongs to.' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], StudentDto.prototype, "schoolId", void 0);
class CreateStudentDto {
}
exports.CreateStudentDto = CreateStudentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'First name of the student' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'First name should not be empty' }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'Last name of the student' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Last name should not be empty' }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2005-04-15', description: 'Date of birth of the student (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Date of birth should not be empty' }),
    __metadata("design:type", Date)
], CreateStudentDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'john.doe@example.com', description: 'Email address of the student' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email should not be empty' }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'STU20230001', description: 'Unique student ID' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Student ID should not be empty' }),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'ID of the class the student belongs to (UUID)',
        nullable: true
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateStudentDto.prototype, "classId", void 0);
class UpdateStudentDto {
}
exports.UpdateStudentDto = UpdateStudentDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John', description: 'Updated first name of the student' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Doe', description: 'Updated last name of the student' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2005-04-15', description: 'Updated date of birth (YYYY-MM-DD)' }),
    (0, class_validator_1.IsDateString)({}, { message: 'Date of birth must be a valid date string (YYYY-MM-DD)' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], UpdateStudentDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john.doe@example.com', description: 'Updated email address' }),
    (0, class_validator_1.IsEmail)({}, { message: 'Please provide a valid email address' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'STU20230001', description: 'Updated student ID' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "studentId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        example: '123e4567-e89b-12d3-a456-426614174000',
        description: 'Updated class ID (UUID)',
        nullable: true
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "classId", void 0);
//# sourceMappingURL=student.dto.js.map