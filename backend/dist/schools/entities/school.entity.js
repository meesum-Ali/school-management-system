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
exports.School = void 0;
const user_entity_1 = require("../../users/entities/user.entity");
const typeorm_1 = require("typeorm");
const student_entity_1 = require("../../students/entities/student.entity");
const class_entity_1 = require("../../classes/entities/class.entity");
const subject_entity_1 = require("../../subjects/entities/subject.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
const class_schedule_entity_1 = require("../../class-schedule/entities/class-schedule.entity");
let School = class School {
};
exports.School = School;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], School.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], School.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, nullable: true }),
    __metadata("design:type", String)
], School.prototype, "domain", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], School.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'admin_user_id', nullable: true }),
    __metadata("design:type", String)
], School.prototype, "adminUserId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => user_entity_1.User, (user) => user.school, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], School.prototype, "users", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_entity_1.Student, (student) => student.school, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], School.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_entity_1.ClassEntity, (classEntity) => classEntity.school, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], School.prototype, "classes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => subject_entity_1.SubjectEntity, (subject) => subject.school, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], School.prototype, "subjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => teacher_entity_1.Teacher, (teacher) => teacher.school, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], School.prototype, "teachers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_schedule_entity_1.ClassSchedule, (schedule) => schedule.school, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], School.prototype, "classSchedules", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], School.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], School.prototype, "updatedAt", void 0);
exports.School = School = __decorate([
    (0, typeorm_1.Entity)('schools')
], School);
//# sourceMappingURL=school.entity.js.map