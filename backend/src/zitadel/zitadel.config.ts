import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ZitadelConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  postLogoutRedirectUri: string;
  scope: string;
  organizationId?: string;
}

@Injectable()
export class ZitadelConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): ZitadelConfig {
    return {
      issuer: this.configService.get<string>(
        'ZITADEL_ISSUER',
        'http://localhost:8888',
      ),
      clientId: this.configService.get<string>(
        'ZITADEL_CLIENT_ID',
        'your-client-id',
      ),
      clientSecret: this.configService.get<string>(
        'ZITADEL_CLIENT_SECRET',
        'your-client-secret',
      ),
      redirectUri: this.configService.get<string>(
        'ZITADEL_REDIRECT_URI',
        'http://localhost:3000/auth/callback',
      ),
      postLogoutRedirectUri: this.configService.get<string>(
        'ZITADEL_POST_LOGOUT_REDIRECT_URI',
        'http://localhost:3000',
      ),
      scope: this.configService.get<string>(
        'ZITADEL_SCOPE',
        'openid profile email urn:zitadel:iam:org:project:id:zitadel:aud',
      ),
      organizationId: this.configService.get<string>('ZITADEL_ORGANIZATION_ID'),
    };
  }

  getJwksUri(): string {
    const issuer = this.configService.get<string>(
      'ZITADEL_ISSUER',
      'http://localhost:8888',
    );
    return `${issuer}/oauth/v2/keys`;
  }
}
