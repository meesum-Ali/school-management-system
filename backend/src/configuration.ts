export interface DatabaseConfig {
  type: 'postgres';
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
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

export default (): AppConfig => ({
  port: parseInt(process.env.PORT, 10) || 5000,
  database: {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiration: process.env.JWT_EXPIRATION || '3600s',
  },
  logLevel: process.env.LOG_LEVEL || 'debug',
  apiPrefix: process.env.API_PREFIX || '/api',
  appVersion: process.env.APP_VERSION || '1.0.0',
  apiDocsPath: process.env.API_DOCS_PATH || '/api-docs',
});
