import { Module } from '@nestjs/common';
import { databaseProvider } from './database.provider';
import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [TenantModule],
  providers: [databaseProvider],
  exports: [databaseProvider],
})
export class DatabaseModule {}
