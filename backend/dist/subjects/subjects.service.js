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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subject_entity_1 = require("./entities/subject.entity");
const subject_dto_1 = require("./dto/subject.dto");
let SubjectsService = class SubjectsService {
    constructor(subjectsRepository) {
        this.subjectsRepository = subjectsRepository;
    }
    async mapSubjectToSubjectDto(subjectEntity) {
        const subjectDto = new subject_dto_1.SubjectDto({
            id: subjectEntity.id,
            name: subjectEntity.name,
            code: subjectEntity.code,
            description: subjectEntity.description,
            createdAt: subjectEntity.createdAt,
            updatedAt: subjectEntity.updatedAt,
            schoolId: subjectEntity.schoolId
        });
        if (subjectEntity.classes) {
            const classes = await subjectEntity.classes;
            subjectDto.classes = classes.map(cls => ({
                id: cls.id,
                name: cls.name,
                level: cls.level,
                homeroomTeacherId: cls.homeroomTeacherId,
                createdAt: cls.createdAt,
                updatedAt: cls.updatedAt,
                schoolId: cls.schoolId,
            }));
        }
        return subjectDto;
    }
    mapClassToBasicDto(classEntity) {
        return {
            id: classEntity.id,
            name: classEntity.name,
            level: classEntity.level,
            homeroomTeacherId: classEntity.homeroomTeacherId,
            schoolId: classEntity.schoolId,
            createdAt: classEntity.createdAt,
            updatedAt: classEntity.updatedAt,
        };
    }
    async create(createSubjectDto, schoolId) {
        const { name, code } = createSubjectDto;
        const nameConflict = await this.subjectsRepository.findOne({ where: { name, schoolId } });
        if (nameConflict) {
            throw new common_1.ConflictException(`Subject with name "${name}" already exists in this school.`);
        }
        if (code) {
            const codeConflict = await this.subjectsRepository.findOne({ where: { code, schoolId } });
            if (codeConflict) {
                throw new common_1.ConflictException(`Subject with code "${code}" already exists in this school.`);
            }
        }
        try {
            const subjectToCreate = this.subjectsRepository.create({
                ...createSubjectDto,
                schoolId,
            });
            const savedSubject = await this.subjectsRepository.save(subjectToCreate);
            return this.mapSubjectToSubjectDto(savedSubject);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError && error.code === '23505') {
                if (error.message.includes('subjects_name_school_id_idx') || error.message.includes('UQ_subjects_name_schoolId')) {
                    throw new common_1.ConflictException(`Subject with name "${name}" already exists in this school.`);
                }
                if (code && (error.message.includes('subjects_code_school_id_idx') || error.message.includes('UQ_subjects_code_schoolId'))) {
                    throw new common_1.ConflictException(`Subject with code "${code}" already exists in this school.`);
                }
            }
            throw new common_1.InternalServerErrorException('Error creating subject.');
        }
    }
    async findAll(schoolId) {
        const subjects = await this.subjectsRepository.find({
            where: { schoolId },
        });
        return Promise.all(subjects.map(subjectEntity => this.mapSubjectToSubjectDto(subjectEntity)));
    }
    async findOne(id, schoolId) {
        const subjectEntity = await this.subjectsRepository.findOne({
            where: { id, schoolId },
            relations: ['classes']
        });
        if (!subjectEntity) {
            throw new common_1.NotFoundException(`Subject with ID "${id}" not found in this school.`);
        }
        return await this.mapSubjectToSubjectDto(subjectEntity);
    }
    async update(id, updateSubjectDto, schoolId) {
        const { name, code, description } = updateSubjectDto;
        const subjectToUpdate = await this.subjectsRepository.findOneBy({ id, schoolId });
        if (!subjectToUpdate) {
            throw new common_1.NotFoundException(`Subject with ID "${id}" not found in this school.`);
        }
        if (name && name !== subjectToUpdate.name) {
            const nameConflict = await this.subjectsRepository.findOne({ where: { name, schoolId } });
            if (nameConflict && nameConflict.id !== id) {
                throw new common_1.ConflictException(`Subject with name "${name}" already exists in this school.`);
            }
            subjectToUpdate.name = name;
        }
        if (updateSubjectDto.hasOwnProperty('code')) {
            if (code && code !== subjectToUpdate.code) {
                const codeConflict = await this.subjectsRepository.findOne({ where: { code, schoolId } });
                if (codeConflict && codeConflict.id !== id) {
                    throw new common_1.ConflictException(`Subject with code "${code}" already exists in this school.`);
                }
            }
            subjectToUpdate.code = code;
        }
        if (updateSubjectDto.hasOwnProperty('description')) {
            subjectToUpdate.description = description;
        }
        try {
            const updatedSubject = await this.subjectsRepository.save(subjectToUpdate);
            return await this.findOne(updatedSubject.id, schoolId);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError && error.code === '23505') {
                if (name && (error.message.includes('subjects_name_school_id_idx') || error.message.includes('UQ_subjects_name_schoolId'))) {
                    throw new common_1.ConflictException(`Subject with name "${name}" already exists in this school.`);
                }
                if (code && (error.message.includes('subjects_code_school_id_idx') || error.message.includes('UQ_subjects_code_schoolId'))) {
                    throw new common_1.ConflictException(`Subject with code "${code}" already exists in this school.`);
                }
            }
            throw new common_1.InternalServerErrorException('Error updating subject.');
        }
    }
    async remove(id, schoolId) {
        const subjectEntity = await this.subjectsRepository.findOneBy({ id, schoolId });
        if (!subjectEntity) {
            throw new common_1.NotFoundException(`Subject with ID "${id}" not found in this school.`);
        }
        const result = await this.subjectsRepository.delete({ id, schoolId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Subject with ID "${id}" in this school not found or already deleted.`);
        }
    }
    async listClassesForSubject(subjectId, schoolId) {
        const subjectEntity = await this.subjectsRepository.findOne({
            where: { id: subjectId, schoolId },
            relations: ['classes', 'classes.school']
        });
        if (!subjectEntity) {
            throw new common_1.NotFoundException(`Subject with ID "${subjectId}" not found in this school.`);
        }
        const classes = await subjectEntity.classes;
        return classes.map(cls => this.mapClassToBasicDto(cls));
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subject_entity_1.SubjectEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map