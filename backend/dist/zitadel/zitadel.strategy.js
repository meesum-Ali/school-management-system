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
var ZitadelStrategy_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZitadelStrategy = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const passport_jwt_1 = require("passport-jwt");
const jwks_rsa_1 = require("jwks-rsa");
const zitadel_config_1 = require("./zitadel.config");
let ZitadelStrategy = ZitadelStrategy_1 = class ZitadelStrategy extends (0, passport_1.PassportStrategy)(passport_jwt_1.Strategy, 'zitadel') {
    constructor(zitadelConfigService) {
        const config = zitadelConfigService.getConfig();
        const jwksUri = zitadelConfigService.getJwksUri();
        super({
            jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKeyProvider: (0, jwks_rsa_1.passportJwtSecret)({
                cache: true,
                rateLimit: true,
                jwksRequestsPerMinute: 5,
                jwksUri: jwksUri,
            }),
            issuer: config.issuer,
            audience: config.clientId,
            algorithms: ['RS256'],
        });
        this.zitadelConfigService = zitadelConfigService;
        this.logger = new common_1.Logger(ZitadelStrategy_1.name);
        this.logger.log(`Initialized with issuer: ${config.issuer}, JWKS URI: ${jwksUri}`);
    }
    async validate(payload) {
        this.logger.debug(`=== JWT Validation Start ===`);
        this.logger.debug(`Payload: ${JSON.stringify(payload, null, 2)}`);
        if (!payload.sub) {
            this.logger.error('Token validation failed: missing sub claim');
            throw new common_1.UnauthorizedException('Invalid token payload');
        }
        const rolesObj = payload['urn:zitadel:iam:org:project:roles'] || {};
        const rolesArray = Object.keys(rolesObj);
        const schoolId = payload['urn:zitadel:iam:org:id'] || null;
        this.logger.log(`✅ Token validated - User: ${payload.sub}, Roles: [${rolesArray.join(',')}], SchoolId: ${schoolId}`);
        return {
            userId: payload.sub,
            email: payload.email,
            username: payload.preferred_username || payload.email,
            roles: rolesArray,
            rolesObj: rolesObj,
            organizationId: schoolId,
            schoolId: schoolId,
            name: payload.name,
        };
    }
};
exports.ZitadelStrategy = ZitadelStrategy;
exports.ZitadelStrategy = ZitadelStrategy = ZitadelStrategy_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [zitadel_config_1.ZitadelConfigService])
], ZitadelStrategy);
//# sourceMappingURL=zitadel.strategy.js.map