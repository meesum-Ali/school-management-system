"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchoolsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const schools_service_1 = require("./schools.service");
const schools_controller_1 = require("./schools.controller");
const school_entity_1 = require("./entities/school.entity");
const users_module_1 = require("../users/users.module");
let SchoolsModule = class SchoolsModule {
};
exports.SchoolsModule = SchoolsModule;
exports.SchoolsModule = SchoolsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([school_entity_1.School]),
            users_module_1.UsersModule,
        ],
        controllers: [schools_controller_1.SchoolsController],
        providers: [schools_service_1.SchoolsService],
        exports: [schools_service_1.SchoolsService],
    })
], SchoolsModule);
//# sourceMappingURL=schools.module.js.map