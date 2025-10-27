"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZitadelModule = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const config_1 = require("@nestjs/config");
const zitadel_config_1 = require("./zitadel.config");
const zitadel_strategy_1 = require("./zitadel.strategy");
const zitadel_roles_guard_1 = require("./zitadel-roles.guard");
let ZitadelModule = class ZitadelModule {
};
exports.ZitadelModule = ZitadelModule;
exports.ZitadelModule = ZitadelModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'zitadel' }),
            config_1.ConfigModule,
        ],
        providers: [zitadel_config_1.ZitadelConfigService, zitadel_strategy_1.ZitadelStrategy, zitadel_roles_guard_1.ZitadelRolesGuard],
        exports: [zitadel_config_1.ZitadelConfigService, zitadel_roles_guard_1.ZitadelRolesGuard],
    })
], ZitadelModule);
//# sourceMappingURL=zitadel.module.js.map