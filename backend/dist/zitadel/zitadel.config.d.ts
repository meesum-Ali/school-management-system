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
export declare class ZitadelConfigService {
    private configService;
    constructor(configService: ConfigService);
    getConfig(): ZitadelConfig;
    getJwksUri(): string;
}
