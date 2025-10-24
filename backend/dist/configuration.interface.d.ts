export interface DatabaseConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
}
export interface JwtConfig {
    secret: string;
    expiration: string;
}
export interface AppConfig {
    port: number;
    database: DatabaseConfig;
    jwt: JwtConfig;
    logLevel: string;
    apiPrefix: string;
    appVersion: string;
    apiDocsPath: string;
}
