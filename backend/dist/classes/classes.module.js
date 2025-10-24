"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const class_entity_1 = require("./entities/class.entity");
const classes_service_1 = require("./classes.service");
const classes_controller_1 = require("./classes.controller");
const subjects_module_1 = require("../subjects/subjects.module");
const users_module_1 = require("../users/users.module");
const class_schedule_module_1 = require("../class-schedule/class-schedule.module");
let ClassesModule = class ClassesModule {
};
exports.ClassesModule = ClassesModule;
exports.ClassesModule = ClassesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([class_entity_1.ClassEntity]),
            subjects_module_1.SubjectsModule,
            users_module_1.UsersModule,
            (0, common_1.forwardRef)(() => class_schedule_module_1.ClassScheduleModule),
        ],
        controllers: [classes_controller_1.ClassesController],
        providers: [classes_service_1.ClassesService],
        exports: [
            classes_service_1.ClassesService,
            typeorm_1.TypeOrmModule.forFeature([class_entity_1.ClassEntity])
        ]
    })
], ClassesModule);
//# sourceMappingURL=classes.module.js.map