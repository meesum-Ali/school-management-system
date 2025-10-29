"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const config_1 = require("@nestjs/config");
const configuration_1 = require("./configuration");
const Joi = require("joi");
const typeorm_1 = require("@nestjs/typeorm");
const students_module_1 = require("./students/students.module");
const users_module_1 = require("./users/users.module");
const classes_module_1 = require("./classes/classes.module");
const subjects_module_1 = require("./subjects/subjects.module");
const schools_module_1 = require("./schools/schools.module");
const teachers_module_1 = require("./teachers/teachers.module");
const class_schedule_module_1 = require("./class-schedule/class-schedule.module");
const health_module_1 = require("./health/health.module");
const super_admin_module_1 = require("./core/super-admin/super-admin.module");
const zitadel_module_1 = require("./zitadel/zitadel.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            zitadel_module_1.ZitadelModule,
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validationSchema: Joi.object({
                    NODE_ENV: Joi.string()
                        .valid('development', 'production', 'test')
                        .default('development'),
                    PORT: Joi.number().default(5000),
                    DATABASE_HOST: Joi.string().required(),
                    DATABASE_PORT: Joi.number().required(),
                    DATABASE_USER: Joi.string().required(),
                    DATABASE_PASSWORD: Joi.string().required(),
                    DATABASE_NAME: Joi.string().required(),
                    JWT_SECRET: Joi.string().required(),
                    JWT_EXPIRATION: Joi.string().default('3600s'),
                    LOG_LEVEL: Joi.string().default('debug'),
                    API_PREFIX: Joi.string().default('/api'),
                }),
            }),
            students_module_1.StudentsModule,
            users_module_1.UsersModule,
            classes_module_1.ClassesModule,
            subjects_module_1.SubjectsModule,
            schools_module_1.SchoolsModule,
            teachers_module_1.TeachersModule,
            class_schedule_module_1.ClassScheduleModule,
            health_module_1.HealthModule,
            super_admin_module_1.SuperAdminModule,
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
                    const dbConfig = configService.get('database');
                    return {
                        ...dbConfig,
                        autoLoadEntities: true,
                        synchronize: false,
                    };
                },
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map