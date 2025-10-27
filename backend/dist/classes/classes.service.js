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
var ClassesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("./entities/class.entity");
const class_dto_1 = require("./dto/class.dto");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/entities/user.entity");
const subjects_service_1 = require("../subjects/subjects.service");
let ClassesService = ClassesService_1 = class ClassesService {
    constructor(classesRepository, usersService, subjectsService) {
        this.classesRepository = classesRepository;
        this.usersService = usersService;
        this.subjectsService = subjectsService;
        this.logger = new common_1.Logger(ClassesService_1.name);
    }
    async mapClassToClassDto(classEntity) {
        const mapStudentToDto = async (st) => {
            const currentClass = st.currentClass ? await st.currentClass : null;
            return {
                id: st.id,
                firstName: st.firstName,
                lastName: st.lastName,
                email: st.email,
                studentId: st.studentId,
                dateOfBirth: st.dateOfBirth,
                createdAt: st.createdAt,
                updatedAt: st.updatedAt,
                classId: st.classId,
                schoolId: st.schoolId,
                currentClassName: currentClass ? currentClass.name : null,
            };
        };
        let subjects = [];
        if (classEntity.subjects) {
            const loadedSubjects = await classEntity.subjects;
            subjects = loadedSubjects.map((subject) => ({
                id: subject.id,
                name: subject.name,
                code: subject.code,
                description: subject.description,
                createdAt: subject.createdAt,
                updatedAt: subject.updatedAt,
                schoolId: subject.schoolId,
            }));
        }
        const classDto = new class_dto_1.ClassDto({
            id: classEntity.id,
            name: classEntity.name,
            level: classEntity.level,
            homeroomTeacherId: classEntity.homeroomTeacherId,
            subjects,
            createdAt: classEntity.createdAt,
            updatedAt: classEntity.updatedAt,
            schoolId: classEntity.schoolId,
        });
        if (classEntity.subjects) {
            const subjects = await classEntity.subjects;
            classDto.subjects = subjects.map((subject) => this.mapSubjectToBasicDto(subject));
        }
        if (classEntity.students) {
            const students = await classEntity.students;
            const studentDtos = await Promise.all(students.map(mapStudentToDto));
            classDto.students = studentDtos;
        }
        return classDto;
    }
    mapSubjectToBasicDto(subjectEntity) {
        return {
            id: subjectEntity.id,
            name: subjectEntity.name,
            code: subjectEntity.code,
            description: subjectEntity.description,
            createdAt: subjectEntity.createdAt,
            updatedAt: subjectEntity.updatedAt,
            schoolId: subjectEntity.schoolId,
        };
    }
    async create(createClassDto, schoolId) {
        const { name, homeroomTeacherId } = createClassDto;
        const existingClass = await this.classesRepository.findOne({
            where: { name, schoolId },
        });
        if (existingClass) {
            throw new common_1.ConflictException(`Class with name "${name}" already exists in this school.`);
        }
        if (homeroomTeacherId) {
            const teacher = await this.usersService.findOneEntity(homeroomTeacherId, schoolId);
            if (!teacher) {
                throw new common_1.NotFoundException(`Homeroom teacher with ID "${homeroomTeacherId}" not found in this school.`);
            }
            if (!teacher.roles.includes(user_entity_1.UserRole.TEACHER)) {
                throw new common_1.ConflictException(`User with ID "${homeroomTeacherId}" is not a teacher.`);
            }
        }
        try {
            const classToCreate = this.classesRepository.create({
                ...createClassDto,
                schoolId,
            });
            const savedClass = await this.classesRepository.save(classToCreate);
            return this.mapClassToClassDto(savedClass);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError &&
                error.code === '23505') {
                if (error.message.includes('classes_name_school_id_idx') ||
                    error.message.includes('UQ_classes_name_schoolId')) {
                    throw new common_1.ConflictException(`Class with name "${name}" already exists in this school.`);
                }
            }
            throw new common_1.InternalServerErrorException('Error creating class.');
        }
    }
    async listClasses(schoolId) {
        const classes = await this.classesRepository.find({
            where: { schoolId },
            relations: ['subjects', 'students'],
        });
        const classDtos = await Promise.all(classes.map((cls) => this.mapClassToClassDto(cls)));
        return classDtos;
    }
    async findAll(schoolId) {
        const classes = await this.classesRepository.find({
            where: { schoolId },
            relations: ['subjects', 'students'],
        });
        const classDtos = await Promise.all(classes.map((classEntity) => this.mapClassToClassDto(classEntity)));
        return classDtos;
    }
    async findOne(id, schoolId) {
        const classEntity = await this.classesRepository.findOne({
            where: { id, schoolId },
            relations: ['subjects', 'students'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID "${id}" not found in this school.`);
        }
        return await this.mapClassToClassDto(classEntity);
    }
    async update(id, updateClassDto, schoolId) {
        const { name, homeroomTeacherId, ...restOfDto } = updateClassDto;
        const classToUpdate = await this.classesRepository.findOne({
            where: { id, schoolId },
            relations: ['subjects', 'students'],
        });
        if (!classToUpdate) {
            throw new common_1.NotFoundException(`Class with ID "${id}" not found in this school.`);
        }
        if (name && name !== classToUpdate.name) {
            const existingClass = await this.classesRepository.findOne({
                where: { name, schoolId },
                withDeleted: true,
            });
            if (existingClass && existingClass.id !== id) {
                throw new common_1.ConflictException(`Class with name "${name}" already exists in this school.`);
            }
            classToUpdate.name = name;
        }
        if (updateClassDto.hasOwnProperty('homeroomTeacherId')) {
            if (homeroomTeacherId) {
                const teacher = await this.usersService.findOneEntity(homeroomTeacherId, schoolId);
                if (!teacher) {
                    throw new common_1.NotFoundException(`Homeroom teacher with ID "${homeroomTeacherId}" not found in this school.`);
                }
                if (!teacher.roles.includes(user_entity_1.UserRole.TEACHER)) {
                    throw new common_1.ConflictException(`User with ID "${homeroomTeacherId}" is not a teacher.`);
                }
                classToUpdate.homeroomTeacherId = homeroomTeacherId;
            }
            else {
                classToUpdate.homeroomTeacherId = null;
            }
        }
        Object.assign(classToUpdate, restOfDto);
        try {
            const updatedClass = await this.classesRepository.save(classToUpdate);
            return await this.findOne(updatedClass.id, schoolId);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError) {
                if (error.message.includes('duplicate key value') ||
                    error.code === '23505') {
                    throw new common_1.ConflictException(`Class with name "${classToUpdate.name || name}" already exists in this school.`);
                }
            }
            throw new common_1.InternalServerErrorException('Error updating class.');
        }
    }
    async remove(id, schoolId) {
        const classEntity = await this.classesRepository.findOne({
            where: { id, schoolId },
            relations: ['students', 'subjects'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID "${id}" not found in this school.`);
        }
        const students = await classEntity.students;
        if (students && students.length > 0) {
            throw new common_1.ConflictException(`Cannot delete class "${classEntity.name}" because it still has ${students.length} student(s) assigned. ` +
                'Please reassign or remove all students before deleting this class.');
        }
        const subjects = await classEntity.subjects;
        if (subjects && subjects.length > 0) {
            classEntity.subjects = Promise.resolve([]);
            await this.classesRepository.save(classEntity);
        }
        const result = await this.classesRepository.delete({ id, schoolId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Class with ID "${id}" could not be deleted or was already deleted.`);
        }
    }
    async assignSubject(classId, subjectId, schoolId) {
        const classEntity = await this.classesRepository.findOne({
            where: { id: classId, schoolId },
            relations: ['subjects'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID "${classId}" not found in this school.`);
        }
        const subjectDto = await this.subjectsService.findOne(subjectId, schoolId);
        const subjects = await classEntity.subjects;
        const subjectAlreadyAssigned = subjects.some((subject) => subject.id === subjectId);
        if (subjectAlreadyAssigned) {
            throw new common_1.ConflictException(`Subject "${subjectDto.name}" (ID: ${subjectId}) is already assigned to class "${classEntity.name}"`);
        }
        try {
            await this.classesRepository
                .createQueryBuilder()
                .relation(class_entity_1.ClassEntity, 'subjects')
                .of(classId)
                .add(subjectId);
            return {
                id: subjectDto.id,
                name: subjectDto.name,
                code: subjectDto.code,
                description: subjectDto.description,
                createdAt: subjectDto.createdAt,
                updatedAt: subjectDto.updatedAt,
                schoolId: subjectDto.schoolId,
            };
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError) {
                this.logger.error(`Failed to assign subject ${subjectId} to class ${classId}: ${error.message}`, error.stack);
                throw new common_1.InternalServerErrorException('Failed to assign subject to class. Please try again later.');
            }
            throw error;
        }
    }
    async removeSubjectFromClass(classId, subjectId, schoolId) {
        const classEntity = await this.classesRepository.findOne({
            where: { id: classId, schoolId },
            relations: ['subjects'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID "${classId}" not found in this school.`);
        }
        const subjectDto = await this.subjectsService.findOne(subjectId, schoolId);
        const currentSubjects = await classEntity.subjects;
        const subjectIndex = currentSubjects.findIndex((s) => s.id === subjectId);
        if (subjectIndex === -1) {
            throw new common_1.NotFoundException(`Subject "${subjectDto.name}" (ID: ${subjectId}) is not assigned to class "${classEntity.name}"`);
        }
        try {
            await this.classesRepository
                .createQueryBuilder()
                .relation(class_entity_1.ClassEntity, 'subjects')
                .of(classId)
                .remove(subjectId);
            this.logger.log(`Successfully removed subject "${subjectDto.name}" from class "${classEntity.name}"`);
            return await this.findOne(classId, schoolId);
        }
        catch (error) {
            this.logger.error(`Failed to remove subject ${subjectId} from class ${classId}: ${error.message}`, error.stack);
            if (error instanceof typeorm_2.QueryFailedError) {
                throw new common_1.InternalServerErrorException('Failed to remove subject from class. Please try again later.');
            }
            throw error;
        }
    }
    async listSubjectsForClass(classId, schoolId) {
        const classEntity = await this.classesRepository.findOne({
            where: { id: classId, schoolId },
            relations: ['subjects'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID "${classId}" not found in this school.`);
        }
        const subjects = await classEntity.subjects;
        return subjects.map((subject) => this.mapSubjectToBasicDto(subject));
    }
    async listStudentsInClass(classId, schoolId) {
        const classEntity = await this.classesRepository.findOne({
            where: { id: classId, schoolId },
            relations: ['students'],
        });
        if (!classEntity) {
            throw new common_1.NotFoundException(`Class with ID "${classId}" not found in this school.`);
        }
        try {
            const students = await classEntity.students;
            const studentDtos = await Promise.all(students.map(async (student) => {
                try {
                    const currentClass = student.currentClass
                        ? await student.currentClass
                        : null;
                    return {
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        studentId: student.studentId,
                        dateOfBirth: student.dateOfBirth,
                        createdAt: student.createdAt,
                        updatedAt: student.updatedAt,
                        classId: student.classId,
                        schoolId: student.schoolId,
                        currentClassName: currentClass ? currentClass.name : null,
                    };
                }
                catch (error) {
                    this.logger.error(`Error processing student ${student.id} in class ${classId}: ${error.message}`, error.stack);
                    return {
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        email: student.email,
                        studentId: student.studentId,
                        dateOfBirth: student.dateOfBirth,
                        error: 'Error loading student details',
                    };
                }
            }));
            return studentDtos;
        }
        catch (error) {
            this.logger.error(`Failed to list students for class ${classId}: ${error.message}`, error.stack);
            throw new common_1.InternalServerErrorException('Failed to retrieve students for the class.');
        }
    }
};
exports.ClassesService = ClassesService;
exports.ClassesService = ClassesService = ClassesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.ClassEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        users_service_1.UsersService,
        subjects_service_1.SubjectsService])
], ClassesService);
//# sourceMappingURL=classes.service.js.map