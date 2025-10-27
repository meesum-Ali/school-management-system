"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_entity_1 = require("./entities/student.entity");
const students_controller_1 = require("./students.controller");
const students_v2_controller_1 = require("./students-v2.controller");
const students_service_1 = require("./students.service");
const classes_module_1 = require("../classes/classes.module");
const use_cases_1 = require("./application/use-cases");
const adapters_1 = require("./infrastructure/adapters");
let StudentsModule = class StudentsModule {
};
exports.StudentsModule = StudentsModule;
exports.StudentsModule = StudentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([student_entity_1.Student]),
            classes_module_1.ClassesModule,
        ],
        controllers: [students_controller_1.StudentsController, students_v2_controller_1.StudentsV2Controller],
        providers: [
            students_service_1.StudentsService,
            {
                provide: 'IStudentRepository',
                useClass: adapters_1.StudentRepositoryAdapter,
            },
            {
                provide: use_cases_1.CreateStudentUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.CreateStudentUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.EnrollStudentUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.EnrollStudentUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.UnenrollStudentUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.UnenrollStudentUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.UpdateStudentUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.UpdateStudentUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.GetStudentByIdUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.GetStudentByIdUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.GetStudentByEmailUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.GetStudentByEmailUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.ListStudentsUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.ListStudentsUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
            {
                provide: use_cases_1.GetStudentsByClassUseCase,
                useFactory: (repository) => {
                    return new use_cases_1.GetStudentsByClassUseCase(repository);
                },
                inject: ['IStudentRepository'],
            },
        ],
        exports: [
            students_service_1.StudentsService,
            'IStudentRepository',
        ],
    })
], StudentsModule);
//# sourceMappingURL=students.module.js.map