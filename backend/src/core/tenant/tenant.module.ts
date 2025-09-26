import { Module } from '@nestjs/common';
import { TenantProvider } from './tenant.provider';

@Module({
  providers: [TenantProvider],
  exports: [TenantProvider],
})
export class TenantModule {}