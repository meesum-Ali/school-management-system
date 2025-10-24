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
exports.UpdateClassScheduleDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_class_schedule_dto_1 = require("./create-class-schedule.dto");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
const class_schedule_entity_1 = require("../entities/class-schedule.entity");
class UpdateClassScheduleDto extends (0, mapped_types_1.PartialType)(create_class_schedule_dto_1.CreateClassScheduleDto) {
}
exports.UpdateClassScheduleDto = UpdateClassScheduleDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the class',
        required: false,
        format: 'uuid'
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the subject',
        required: false,
        format: 'uuid'
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the teacher',
        required: false,
        format: 'uuid'
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day of the week for the class',
        enum: class_schedule_entity_1.DayOfWeek,
        enumName: 'DayOfWeek',
        required: false
    }),
    (0, class_validator_1.IsEnum)(class_schedule_entity_1.DayOfWeek),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Start time of the class in HH:MM:SS format',
        example: '09:00:00',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Invalid time format. Use HH:MM:SS or HH:MM',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'End time of the class in HH:MM:SS format',
        example: '10:30:00',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
        message: 'Invalid time format. Use HH:MM:SS or HH:MM',
    }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Room number where the class will be held',
        required: false,
        example: 'A101'
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "roomNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic year in YYYY-YYYY format',
        example: '2023-2024',
        required: false
    }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic term',
        enum: class_schedule_entity_1.TermEnum,
        enumName: 'TermEnum',
        required: false
    }),
    (0, class_validator_1.IsEnum)(class_schedule_entity_1.TermEnum),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the school',
        format: 'uuid',
        required: false
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user updating the schedule (for backward compatibility)',
        required: false,
        format: 'uuid'
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateClassScheduleDto.prototype, "userId", void 0);
//# sourceMappingURL=update-class-schedule.dto.js.map