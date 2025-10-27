import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule } from '@nestjs/config';
import { ZitadelConfigService } from './zitadel.config';
import { ZitadelStrategy } from './zitadel.strategy';
import { ZitadelRolesGuard } from './zitadel-roles.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'zitadel' }),
    ConfigModule,
  ],
  providers: [ZitadelConfigService, ZitadelStrategy, ZitadelRolesGuard],
  exports: [ZitadelConfigService, ZitadelRolesGuard],
})
export class ZitadelModule {}
