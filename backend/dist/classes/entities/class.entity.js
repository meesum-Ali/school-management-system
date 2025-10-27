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
exports.ClassEntity = void 0;
const typeorm_1 = require("typeorm");
const subject_entity_1 = require("../../subjects/entities/subject.entity");
const student_entity_1 = require("../../students/entities/student.entity");
const school_entity_1 = require("../../schools/entities/school.entity");
const class_schedule_entity_1 = require("../../class-schedule/entities/class-schedule.entity");
const teacher_entity_1 = require("../../teachers/entities/teacher.entity");
let ClassEntity = class ClassEntity {
};
exports.ClassEntity = ClassEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ClassEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ClassEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ClassEntity.prototype, "level", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'homeroom_teacher_id', type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ClassEntity.prototype, "homeroomTeacherId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => teacher_entity_1.Teacher, (teacher) => teacher.homeroomClasses, {
        onDelete: 'SET NULL',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'homeroom_teacher_id' }),
    __metadata("design:type", Promise)
], ClassEntity.prototype, "homeroomTeacher", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => subject_entity_1.SubjectEntity, (subject) => subject.classes, {
        cascade: false,
        lazy: true,
    }),
    (0, typeorm_1.JoinTable)({
        name: 'class_subjects',
        joinColumn: { name: 'class_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'subject_id', referencedColumnName: 'id' },
    }),
    __metadata("design:type", Promise)
], ClassEntity.prototype, "subjects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_entity_1.Student, (student) => student.currentClass, {
        cascade: false,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], ClassEntity.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_schedule_entity_1.ClassSchedule, (schedule) => schedule.class, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], ClassEntity.prototype, "schedules", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'school_id', type: 'uuid' }),
    __metadata("design:type", String)
], ClassEntity.prototype, "schoolId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School, {
        onDelete: 'CASCADE',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", Promise)
], ClassEntity.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ClassEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], ClassEntity.prototype, "updatedAt", void 0);
exports.ClassEntity = ClassEntity = __decorate([
    (0, typeorm_1.Entity)('classes'),
    (0, typeorm_1.Index)(['name', 'schoolId'], { unique: true })
], ClassEntity);
//# sourceMappingURL=class.entity.js.map