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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZitadelConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let ZitadelConfigService = class ZitadelConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    getConfig() {
        return {
            issuer: this.configService.get('ZITADEL_ISSUER', 'http://localhost:8888'),
            clientId: this.configService.get('ZITADEL_CLIENT_ID', 'your-client-id'),
            clientSecret: this.configService.get('ZITADEL_CLIENT_SECRET', 'your-client-secret'),
            redirectUri: this.configService.get('ZITADEL_REDIRECT_URI', 'http://localhost:3000/auth/callback'),
            postLogoutRedirectUri: this.configService.get('ZITADEL_POST_LOGOUT_REDIRECT_URI', 'http://localhost:3000'),
            scope: this.configService.get('ZITADEL_SCOPE', 'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud'),
            organizationId: this.configService.get('ZITADEL_ORGANIZATION_ID'),
        };
    }
    getJwksUri() {
        const jwksBaseUrl = this.configService.get('ZITADEL_JWKS_URI', 'http://nginx');
        return `${jwksBaseUrl}/oauth/v2/keys`;
    }
};
exports.ZitadelConfigService = ZitadelConfigService;
exports.ZitadelConfigService = ZitadelConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], ZitadelConfigService);
//# sourceMappingURL=zitadel.config.js.map