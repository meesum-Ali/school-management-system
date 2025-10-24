import { Strategy } from 'passport-jwt';
import { ZitadelConfigService } from './zitadel.config';
declare const ZitadelStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class ZitadelStrategy extends ZitadelStrategy_base {
    private readonly zitadelConfigService;
    constructor(zitadelConfigService: ZitadelConfigService);
    validate(payload: any): Promise<{
        userId: any;
        email: any;
        username: any;
        roles: any;
        organizationId: any;
        name: any;
    }>;
}
export {};
