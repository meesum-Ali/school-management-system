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
exports.StudentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("./entities/student.entity");
const class_entity_1 = require("../classes/entities/class.entity");
let StudentsService = class StudentsService {
    constructor(studentsRepository, classesRepository) {
        this.studentsRepository = studentsRepository;
        this.classesRepository = classesRepository;
    }
    async mapStudentToStudentDto(student) {
        let currentClassName = null;
        if (student.currentClass) {
            try {
                const currentClass = await student.currentClass;
                currentClassName = currentClass?.name || null;
            }
            catch (error) {
                console.error(`Error loading currentClass for student ${student.id}:`, error);
            }
        }
        return {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth,
            email: student.email,
            studentId: student.studentId,
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
            classId: student.classId,
            currentClassName: currentClassName,
            schoolId: student.schoolId,
        };
    }
    async create(createStudentDto, schoolId) {
        const { studentId: studentIdFromDto, email, classId } = createStudentDto;
        const existingStudent = await this.studentsRepository.findOne({
            where: [
                { studentId: studentIdFromDto, schoolId },
                { email, schoolId },
            ],
        });
        if (existingStudent) {
            if (existingStudent.studentId === studentIdFromDto) {
                throw new common_1.ConflictException(`Student ID "${studentIdFromDto}" already exists in this school.`);
            }
            if (existingStudent.email === email) {
                throw new common_1.ConflictException(`Email "${email}" already exists in this school.`);
            }
        }
        try {
            const studentToCreate = this.studentsRepository.create({
                ...createStudentDto,
                schoolId,
            });
            if (classId) {
                const classExists = await this.classesRepository.findOneBy({ id: classId, schoolId });
                if (!classExists) {
                    throw new common_1.NotFoundException(`Class with ID "${classId}" not found in this school.`);
                }
                studentToCreate.classId = classId;
            }
            const savedStudent = await this.studentsRepository.save(studentToCreate);
            const studentWithRelations = await this.studentsRepository.findOne({
                where: { id: savedStudent.id },
                relations: ['currentClass']
            });
            if (!studentWithRelations) {
                throw new common_1.NotFoundException('Failed to create student');
            }
            return await this.mapStudentToStudentDto(studentWithRelations);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError && error.code === '23505') {
                if (error.message.includes('studentId')) {
                    throw new common_1.ConflictException(`Student ID "${createStudentDto.studentId}" already exists.`);
                }
                else if (error.message.includes('email')) {
                    throw new common_1.ConflictException(`Email "${createStudentDto.email}" already exists.`);
                }
            }
            throw new common_1.InternalServerErrorException('Error creating student.');
        }
    }
    async findAll(schoolId) {
        const students = await this.studentsRepository.find({
            where: { schoolId },
            relations: ['currentClass'],
        });
        const studentDtos = await Promise.all(students.map(student => this.mapStudentToStudentDto(student)));
        return studentDtos;
    }
    async findOne(id, schoolId) {
        const student = await this.studentsRepository.findOne({
            where: { id, schoolId },
            relations: ['currentClass'],
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID "${id}" not found in this school.`);
        }
        return await this.mapStudentToStudentDto(student);
    }
    async update(id, updateStudentDto, schoolId) {
        const { studentId: newStudentId, email: newEmail, classId: newClassId, ...restOfDto } = updateStudentDto;
        const studentToUpdate = await this.studentsRepository.findOne({
            where: { id, schoolId },
            relations: ['currentClass']
        });
        if (!studentToUpdate) {
            throw new common_1.NotFoundException(`Student with ID "${id}" not found in this school.`);
        }
        if (newClassId !== undefined) {
            if (newClassId === null) {
                studentToUpdate.classId = null;
                studentToUpdate.currentClass = null;
            }
            else {
                const classExists = await this.classesRepository.findOneBy({ id: newClassId, schoolId });
                if (!classExists) {
                    throw new common_1.NotFoundException(`Class with ID "${newClassId}" not found in this school.`);
                }
                studentToUpdate.classId = newClassId;
                studentToUpdate.currentClass = Promise.resolve(classExists);
            }
        }
        if (newStudentId && newStudentId !== studentToUpdate.studentId) {
            const existingStudentWithId = await this.studentsRepository.findOne({
                where: { studentId: newStudentId, schoolId },
            });
            if (existingStudentWithId && existingStudentWithId.id !== id) {
                throw new common_1.ConflictException(`Student ID "${newStudentId}" is already in use by another student in this school.`);
            }
            studentToUpdate.studentId = newStudentId;
        }
        if (newEmail && newEmail !== studentToUpdate.email) {
            const existingStudentWithEmail = await this.studentsRepository.findOne({
                where: { email: newEmail, schoolId },
            });
            if (existingStudentWithEmail && existingStudentWithEmail.id !== id) {
                throw new common_1.ConflictException(`Email "${newEmail}" is already in use by another student in this school.`);
            }
            studentToUpdate.email = newEmail;
        }
        Object.assign(studentToUpdate, restOfDto);
        try {
            const updatedStudent = await this.studentsRepository.save(studentToUpdate);
            return await this.mapStudentToStudentDto(updatedStudent);
        }
        catch (error) {
            if (error instanceof typeorm_2.QueryFailedError && error.code === '23505') {
                if (error.message.includes('studentId')) {
                    throw new common_1.ConflictException(`Student ID "${updateStudentDto.studentId}" already exists.`);
                }
                else if (error.message.includes('email')) {
                    throw new common_1.ConflictException(`Email "${updateStudentDto.email}" already exists.`);
                }
            }
            throw new common_1.InternalServerErrorException('Error updating student.');
        }
    }
    async remove(id, schoolId) {
        const student = await this.studentsRepository.findOneBy({ id, schoolId });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID "${id}" not found in this school.`);
        }
        const result = await this.studentsRepository.delete({ id, schoolId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Student with ID "${id}" in this school could not be deleted or was already deleted.`);
        }
    }
    async assignStudentToClass(studentId, classId, schoolId) {
        const student = await this.studentsRepository.findOneBy({ id: studentId, schoolId });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID "${studentId}" not found in this school.`);
        }
        if (classId) {
            const classExists = await this.classesRepository.findOneBy({ id: classId, schoolId });
            if (!classExists) {
                throw new common_1.NotFoundException(`Class with ID "${classId}" not found in this school.`);
            }
        }
        student.classId = classId;
        const updatedStudent = await this.studentsRepository.save(student);
        return this.findOne(updatedStudent.id, schoolId);
    }
};
exports.StudentsService = StudentsService;
exports.StudentsService = StudentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(class_entity_1.ClassEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], StudentsService);
//# sourceMappingURL=students.service.js.map