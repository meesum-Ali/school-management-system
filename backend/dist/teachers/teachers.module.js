"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachersModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const teacher_entity_1 = require("./entities/teacher.entity");
const teachers_service_1 = require("./teachers.service");
const teachers_controller_1 = require("./teachers.controller");
const user_entity_1 = require("../users/entities/user.entity");
let TeachersModule = class TeachersModule {
};
exports.TeachersModule = TeachersModule;
exports.TeachersModule = TeachersModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([teacher_entity_1.Teacher, user_entity_1.User])],
        controllers: [teachers_controller_1.TeachersController],
        providers: [teachers_service_1.TeachersService],
        exports: [teachers_service_1.TeachersService],
    })
], TeachersModule);
//# sourceMappingURL=teachers.module.js.map