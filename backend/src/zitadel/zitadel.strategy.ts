import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ZitadelConfigService } from './zitadel.config';

@Injectable()
export class ZitadelStrategy extends PassportStrategy(Strategy, 'zitadel') {
  private readonly logger = new Logger(ZitadelStrategy.name);

  constructor(private readonly zitadelConfigService: ZitadelConfigService) {
    const config = zitadelConfigService.getConfig();
    const jwksUri = zitadelConfigService.getJwksUri();
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: jwksUri,
      }),
      issuer: config.issuer,
      audience: config.clientId,
      algorithms: ['RS256'],
    });
    
    this.logger.log(`Initialized with issuer: ${config.issuer}, JWKS URI: ${jwksUri}`);
  }

  async validate(payload: any) {
    this.logger.debug(`=== JWT Validation Start ===`);
    this.logger.debug(`Payload: ${JSON.stringify(payload, null, 2)}`);
    
    if (!payload.sub) {
      this.logger.error('Token validation failed: missing sub claim');
      throw new UnauthorizedException('Invalid token payload');
    }

    // Extract roles from Zitadel claim and convert to array format
    const rolesObj = payload['urn:zitadel:iam:org:project:roles'] || {};
    const rolesArray = Object.keys(rolesObj);
    
    // Map organizationId to schoolId for multi-tenancy
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
}
