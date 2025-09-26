import { Module } from '@nestjs/common';
import { SuperAdminModule } from './super-admin/super-admin.module';
import { TenantModule } from './tenant/tenant.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [SuperAdminModule, TenantModule, DatabaseModule],
  exports: [TenantModule, DatabaseModule],
})
export class CoreModule {}