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
exports.Teacher = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const school_entity_1 = require("../../schools/entities/school.entity");
const class_entity_1 = require("../../classes/entities/class.entity");
const class_schedule_entity_1 = require("../../class-schedule/entities/class-schedule.entity");
let Teacher = class Teacher {
};
exports.Teacher = Teacher;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Teacher.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'employee_id', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], Teacher.prototype, "employeeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'hire_date', type: 'date' }),
    __metadata("design:type", Date)
], Teacher.prototype, "hireDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Teacher.prototype, "qualification", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Teacher.prototype, "specialization", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Teacher.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_entity_1.ClassEntity, (classEntity) => classEntity.homeroomTeacher, {
        lazy: true
    }),
    __metadata("design:type", Promise)
], Teacher.prototype, "homeroomClasses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_schedule_entity_1.ClassSchedule, (schedule) => schedule.teacher, {
        lazy: true
    }),
    __metadata("design:type", Promise)
], Teacher.prototype, "classSchedules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'school_id', type: 'uuid' }),
    __metadata("design:type", String)
], Teacher.prototype, "schoolId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School, {
        onDelete: 'CASCADE',
        lazy: true
    }),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", Promise)
], Teacher.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.teacherProfile, {
        onDelete: 'CASCADE',
        lazy: true
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Promise)
], Teacher.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Teacher.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Teacher.prototype, "updatedAt", void 0);
exports.Teacher = Teacher = __decorate([
    (0, typeorm_1.Entity)('teachers'),
    (0, typeorm_1.Index)(['employeeId', 'schoolId'], { unique: true })
], Teacher);
//# sourceMappingURL=teacher.entity.js.map