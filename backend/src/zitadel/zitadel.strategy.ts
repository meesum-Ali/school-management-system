import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { ZitadelConfigService } from './zitadel.config';

@Injectable()
export class ZitadelStrategy extends PassportStrategy(Strategy, 'zitadel') {
  constructor(private readonly zitadelConfigService: ZitadelConfigService) {
    const config = zitadelConfigService.getConfig();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: zitadelConfigService.getJwksUri(),
      }),
      issuer: config.issuer,
      audience: config.clientId,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
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
}
