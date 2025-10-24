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
exports.SubjectDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_basic_dto_1 = require("../../classes/dto/class-basic.dto");
class SubjectDto {
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.SubjectDto = SubjectDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'd1e2f3a4-b5c6-7890-1234-567890abcdef', description: 'Unique identifier of the subject (UUID)' }),
    __metadata("design:type", String)
], SubjectDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Introduction to Algebra', description: 'Name of the subject' }),
    __metadata("design:type", String)
], SubjectDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'MATH101', description: 'Unique code for the subject', nullable: true }),
    __metadata("design:type", String)
], SubjectDto.prototype, "code", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'Basic concepts of algebra for beginners.', description: 'Description of the subject', nullable: true }),
    __metadata("design:type", String)
], SubjectDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: () => [class_basic_dto_1.ClassBasicDto], description: 'List of classes this subject is part of' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], SubjectDto.prototype, "classes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the subject record was created' }),
    __metadata("design:type", Date)
], SubjectDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date and time when the subject record was last updated' }),
    __metadata("design:type", Date)
], SubjectDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'uuid-of-a-school', description: 'School ID the subject belongs to.' }),
    __metadata("design:type", String)
], SubjectDto.prototype, "schoolId", void 0);
//# sourceMappingURL=subject.dto.js.map