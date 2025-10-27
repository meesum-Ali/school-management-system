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
exports.ClassSchedule = exports.TermEnum = exports.DayOfWeek = void 0;
const typeorm_1 = require("typeorm");
const class_entity_1 = require("../../classes/entities/class.entity");
const subject_entity_1 = require("../../subjects/entities/subject.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const school_entity_1 = require("../../schools/entities/school.entity");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
var DayOfWeek;
(function (DayOfWeek) {
    DayOfWeek["MONDAY"] = "MONDAY";
    DayOfWeek["TUESDAY"] = "TUESDAY";
    DayOfWeek["WEDNESDAY"] = "WEDNESDAY";
    DayOfWeek["THURSDAY"] = "THURSDAY";
    DayOfWeek["FRIDAY"] = "FRIDAY";
    DayOfWeek["SATURDAY"] = "SATURDAY";
    DayOfWeek["SUNDAY"] = "SUNDAY";
})(DayOfWeek || (exports.DayOfWeek = DayOfWeek = {}));
var TermEnum;
(function (TermEnum) {
    TermEnum["FIRST_TERM"] = "FIRST_TERM";
    TermEnum["SECOND_TERM"] = "SECOND_TERM";
    TermEnum["THIRD_TERM"] = "THIRD_TERM";
})(TermEnum || (exports.TermEnum = TermEnum = {}));
let ClassSchedule = class ClassSchedule {
    validateTimeSlot() {
        if (this.startTime >= this.endTime) {
            throw new Error('End time must be after start time');
        }
    }
};
exports.ClassSchedule = ClassSchedule;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier of the class schedule' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClassSchedule.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to the class' }),
    (0, typeorm_1.ManyToOne)(() => class_entity_1.ClassEntity, (classEntity) => classEntity.schedules, {
        onDelete: 'CASCADE',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'class_id' }),
    __metadata("design:type", Promise)
], ClassSchedule.prototype, "class", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the class' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({ name: 'class_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "classId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to the subject' }),
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.SubjectEntity, (subject) => subject.classSchedules, {
        onDelete: 'CASCADE',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'subject_id' }),
    __metadata("design:type", Promise)
], ClassSchedule.prototype, "subject", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the subject' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({ name: 'subject_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "subjectId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to the teacher', required: false }),
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher, {
        onDelete: 'SET NULL',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'teacher_id' }),
    __metadata("design:type", Promise)
], ClassSchedule.prototype, "teacher", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'ID of the teacher', required: false }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.ValidateIf)((o) => o.teacherId !== null && o.teacherId !== undefined),
    (0, typeorm_1.Column)({ name: 'teacher_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "teacherId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Day of the week for the class',
        enum: DayOfWeek,
        enumName: 'day_of_week_enum',
    }),
    (0, class_validator_1.IsEnum)(DayOfWeek),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: DayOfWeek,
        enumName: 'day_of_week_enum',
    }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "dayOfWeek", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Start time of the class (HH:MM:SS)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "startTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'End time of the class (HH:MM:SS)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({ type: 'time' }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "endTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Room number where the class is held',
        required: false,
    }),
    (0, class_validator_1.IsString)(),
    (0, typeorm_1.Column)({ name: 'room_number', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "roomNumber", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Academic year (e.g., 2023-2024)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({ name: 'academic_year', type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "academicYear", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'School ID' }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({ name: 'school_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "schoolId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Reference to the school' }),
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School, {
        onDelete: 'CASCADE',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", Promise)
], ClassSchedule.prototype, "school", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Academic term',
        enum: TermEnum,
        enumName: 'term_enum',
    }),
    (0, class_validator_1.IsEnum)(TermEnum),
    (0, class_validator_1.IsNotEmpty)(),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TermEnum,
        enumName: 'term_enum',
    }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "term", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Reference to the user who created the schedule',
        required: false,
    }),
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, {
        onDelete: 'SET NULL',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Promise)
], ClassSchedule.prototype, "user", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'ID of the user who created the schedule',
        required: false,
    }),
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.ValidateIf)((o) => o.userId !== null && o.userId !== undefined),
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ClassSchedule.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when the record was created' }),
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ClassSchedule.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when the record was last updated' }),
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ClassSchedule.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ClassSchedule.prototype, "validateTimeSlot", null);
exports.ClassSchedule = ClassSchedule = __decorate([
    (0, typeorm_1.Entity)('class_schedule'),
    (0, typeorm_1.Index)('IDX_UNIQUE_CLASS_SCHEDULE_SLOT', ['classId', 'dayOfWeek', 'startTime', 'academicYear', 'term', 'schoolId'], {
        unique: true,
    }),
    (0, typeorm_1.Index)('IDX_TEACHER_SCHEDULE_CONFLICT', ['teacherId', 'dayOfWeek', 'startTime', 'academicYear', 'term'], {
        unique: false,
    })
], ClassSchedule);
//# sourceMappingURL=class-schedule.entity.js.map