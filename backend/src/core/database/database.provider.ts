import { Provider, Scope } from '@nestjs/common';
import { createConnection, Connection } from 'typeorm';
import { TenantProvider } from '../tenant/tenant.provider';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';

export const databaseProvider: Provider = {
  provide: 'DATABASE_CONNECTION',
  scope: Scope.REQUEST,
  useFactory: async (request: any, configService: ConfigService) => {
    const tenantProvider = new TenantProvider(request);
    const tenant = tenantProvider.getTenant();
    const dbConfig = configService.get('database');
    return await createConnection({
      ...dbConfig,
      schema: tenant,
    });
  },
  inject: [REQUEST, ConfigService],
};
