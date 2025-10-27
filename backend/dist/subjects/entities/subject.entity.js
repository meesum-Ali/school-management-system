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
exports.SubjectEntity = void 0;
const typeorm_1 = require("typeorm");
const class_entity_1 = require("../../classes/entities/class.entity");
const school_entity_1 = require("../../schools/entities/school.entity");
const class_schedule_entity_1 = require("../../class-schedule/entities/class-schedule.entity");
let SubjectEntity = class SubjectEntity {
};
exports.SubjectEntity = SubjectEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SubjectEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SubjectEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], SubjectEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SubjectEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SubjectEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SubjectEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'school_id', type: 'uuid' }),
    __metadata("design:type", String)
], SubjectEntity.prototype, "schoolId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School, {
        onDelete: 'CASCADE',
        lazy: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", Promise)
], SubjectEntity.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => class_entity_1.ClassEntity, (cls) => cls.subjects, {
        cascade: false,
        lazy: true,
    }),
    __metadata("design:type", Promise)
], SubjectEntity.prototype, "classes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_schedule_entity_1.ClassSchedule, (schedule) => schedule.subject, {
        lazy: true,
    }),
    __metadata("design:type", Promise)
], SubjectEntity.prototype, "classSchedules", void 0);
exports.SubjectEntity = SubjectEntity = __decorate([
    (0, typeorm_1.Entity)('subjects'),
    (0, typeorm_1.Index)(['name', 'schoolId'], { unique: true }),
    (0, typeorm_1.Index)(['code', 'schoolId'], {
        unique: true,
        where: `"code" IS NOT NULL AND "school_id" IS NOT NULL`,
    })
], SubjectEntity);
//# sourceMappingURL=subject.entity.js.map