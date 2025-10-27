"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_schedule_entity_1 = require("./entities/class-schedule.entity");
const class_schedule_service_1 = require("./class-schedule.service");
const class_schedule_controller_1 = require("./class-schedule.controller");
const classes_module_1 = require("../classes/classes.module");
const teachers_module_1 = require("../teachers/teachers.module");
const subjects_module_1 = require("../subjects/subjects.module");
let ClassScheduleModule = class ClassScheduleModule {
};
exports.ClassScheduleModule = ClassScheduleModule;
exports.ClassScheduleModule = ClassScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([class_schedule_entity_1.ClassSchedule]),
            classes_module_1.ClassesModule,
            teachers_module_1.TeachersModule,
            subjects_module_1.SubjectsModule,
        ],
        controllers: [class_schedule_controller_1.ClassScheduleController],
        providers: [class_schedule_service_1.ClassScheduleService],
        exports: [class_schedule_service_1.ClassScheduleService],
    })
], ClassScheduleModule);
//# sourceMappingURL=class-schedule.module.js.map