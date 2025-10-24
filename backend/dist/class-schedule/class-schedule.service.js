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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_schedule_entity_1 = require("./entities/class-schedule.entity");
const classes_service_1 = require("../classes/classes.service");
const teachers_service_1 = require("../teachers/teachers.service");
const subjects_service_1 = require("../subjects/subjects.service");
let ClassScheduleService = class ClassScheduleService {
    constructor(classScheduleRepository, classesService, teachersService, subjectsService) {
        this.classScheduleRepository = classScheduleRepository;
        this.classesService = classesService;
        this.teachersService = teachersService;
        this.subjectsService = subjectsService;
    }
    async create(createClassScheduleDto) {
        await this.classesService.findOne(createClassScheduleDto.classId, createClassScheduleDto.schoolId);
        await this.subjectsService.findOne(createClassScheduleDto.subjectId, createClassScheduleDto.schoolId);
        if (createClassScheduleDto.teacherId) {
            await this.teachersService.findOne(createClassScheduleDto.teacherId, createClassScheduleDto.schoolId);
        }
        await this.checkForSchedulingConflicts(createClassScheduleDto);
        const schedule = this.classScheduleRepository.create(createClassScheduleDto);
        return this.classScheduleRepository.save(schedule);
    }
    async findAll(schoolId) {
        return this.classScheduleRepository.find({
            where: { school: { id: schoolId } },
            relations: ['class', 'subject', 'teacher', 'user'],
        });
    }
    async findOne(id, schoolId) {
        const schedule = await this.classScheduleRepository.findOne({
            where: {
                id,
                school: { id: schoolId }
            },
            relations: ['class', 'subject', 'teacher', 'user', 'school'],
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`Class schedule with ID ${id} not found`);
        }
        return schedule;
    }
    async update(id, schoolId, updateClassScheduleDto) {
        const schedule = await this.findOne(id, schoolId);
        if (updateClassScheduleDto.classId) {
            await this.classesService.findOne(updateClassScheduleDto.classId, schoolId);
        }
        if (updateClassScheduleDto.subjectId) {
            await this.subjectsService.findOne(updateClassScheduleDto.subjectId, schoolId);
        }
        if (updateClassScheduleDto.teacherId) {
            await this.teachersService.findOne(updateClassScheduleDto.teacherId, schoolId);
        }
        await this.checkForSchedulingConflicts({
            ...schedule,
            ...updateClassScheduleDto,
        }, id);
        const updated = this.classScheduleRepository.merge(schedule, updateClassScheduleDto);
        return this.classScheduleRepository.save(updated);
    }
    async remove(id, schoolId) {
        const schedule = await this.findOne(id, schoolId);
        await this.classScheduleRepository.remove(schedule);
    }
    async findByClass(classId, schoolId) {
        return this.classScheduleRepository.find({
            where: {
                class: { id: classId },
                school: { id: schoolId }
            },
            relations: ['subject', 'teacher', 'user', 'class'],
            order: { dayOfWeek: 'ASC', startTime: 'ASC' },
        });
    }
    async findByTeacher(teacherId, schoolId) {
        await this.teachersService.findOne(teacherId, schoolId);
        return this.classScheduleRepository.find({
            where: {
                teacher: { id: teacherId },
                school: { id: schoolId }
            },
            relations: ['class', 'subject', 'teacher', 'user'],
            order: { dayOfWeek: 'ASC', startTime: 'ASC' },
        });
    }
    async checkForSchedulingConflicts(schedule, excludeId) {
        const { classId, subjectId, teacherId, dayOfWeek, startTime, endTime, academicYear, term, schoolId } = schedule;
        const classConflict = await this.classScheduleRepository.findOne({
            where: {
                class: { id: classId },
                dayOfWeek,
                academicYear,
                term,
                school: { id: schoolId },
                ...(excludeId && { id: (0, typeorm_2.Not)(excludeId) }),
                startTime: (0, typeorm_2.LessThan)(endTime),
                endTime: (0, typeorm_2.MoreThan)(startTime),
            },
        });
        if (classConflict) {
            throw new common_1.ConflictException('Class already has a scheduled class during this time slot');
        }
        if (teacherId) {
            const teacherConflict = await this.classScheduleRepository.findOne({
                where: {
                    teacher: { id: teacherId },
                    dayOfWeek,
                    academicYear,
                    term,
                    school: { id: schoolId },
                    ...(excludeId && { id: (0, typeorm_2.Not)(excludeId) }),
                    startTime: (0, typeorm_2.LessThan)(endTime),
                    endTime: (0, typeorm_2.MoreThan)(startTime),
                },
            });
            if (teacherConflict) {
                throw new common_1.ConflictException('Teacher is already assigned to another class during this time slot');
            }
        }
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('End time must be after start time');
        }
    }
};
exports.ClassScheduleService = ClassScheduleService;
exports.ClassScheduleService = ClassScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_schedule_entity_1.ClassSchedule)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => classes_service_1.ClassesService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => teachers_service_1.TeachersService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => subjects_service_1.SubjectsService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        classes_service_1.ClassesService,
        teachers_service_1.TeachersService,
        subjects_service_1.SubjectsService])
], ClassScheduleService);
//# sourceMappingURL=class-schedule.service.js.map