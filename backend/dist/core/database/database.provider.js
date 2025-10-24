"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseProvider = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const tenant_provider_1 = require("../tenant/tenant.provider");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
exports.databaseProvider = {
    provide: 'DATABASE_CONNECTION',
    scope: common_1.Scope.REQUEST,
    useFactory: async (request, configService) => {
        const tenantProvider = new tenant_provider_1.TenantProvider(request);
        const tenant = tenantProvider.getTenant();
        const dbConfig = configService.get('database');
        return await (0, typeorm_1.createConnection)({
            ...dbConfig,
            schema: tenant,
        });
    },
    inject: [core_1.REQUEST, config_1.ConfigService],
};
//# sourceMappingURL=database.provider.js.map