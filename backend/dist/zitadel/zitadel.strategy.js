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
exports.ZitadelStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const zitadel_config_1 = require("./zitadel.config");
let ZitadelStrategy = class ZitadelStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'zitadel') {
    constructor(zitadelConfigService) {
        const config = zitadelConfigService.getConfig();
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: zitadelConfigService.getJwksUri(),
            }),
            issuer: config.issuer,
            audience: config.clientId,
            algorithms: ['RS256'],
        });
        this.zitadelConfigService = zitadelConfigService;
    }
    async validate(payload) {
        if (!payload.sub) {
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        return {
            userId: payload.sub,
            email: payload.email,
            username: payload.preferred_username || payload.email,
            roles: payload['urn:zitadel:iam:org:project:roles'] || {},
            organizationId: payload['urn:zitadel:iam:org:id'],
            name: payload.name,
        };
    }
};
exports.ZitadelStrategy = ZitadelStrategy;
exports.ZitadelStrategy = ZitadelStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zitadel_config_1.ZitadelConfigService])
], ZitadelStrategy);
//# sourceMappingURL=zitadel.strategy.js.map