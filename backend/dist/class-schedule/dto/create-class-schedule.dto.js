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
exports.CreateClassScheduleDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_schedule_entity_1 = require("../entities/class-schedule.entity");
class CreateClassScheduleDto {
}
exports.CreateClassScheduleDto = CreateClassScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the class' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the subject' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the teacher (optional)' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day of the week for the class',
        enum: class_schedule_entity_1.DayOfWeek,
        enumName: 'DayOfWeek'
    }),
    (0, class_validator_1.IsEnum)(class_schedule_entity_1.DayOfWeek),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time of the class in HH:MM:SS format',
        example: '09:00:00'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Invalid time format. Use HH:MM:SS or HH:MM',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time of the class in HH:MM:SS format',
        example: '10:30:00'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Invalid time format. Use HH:MM:SS or HH:MM',
    }),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Room number where the class will be held',
        required: false,
        example: 'A101'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "roomNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year in YYYY-YYYY format',
        example: '2023-2024'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic term',
        enum: class_schedule_entity_1.TermEnum,
        enumName: 'TermEnum'
    }),
    (0, class_validator_1.IsEnum)(class_schedule_entity_1.TermEnum),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the school',
        format: 'uuid'
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user creating the schedule (for backward compatibility)',
        required: false,
        format: 'uuid'
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateClassScheduleDto.prototype, "userId", void 0);
//# sourceMappingURL=create-class-schedule.dto.js.map