import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../../users/entities/user.entity';
import { SuperAdminService } from './super-admin.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
  ],
  providers: [SuperAdminService],
  exports: [SuperAdminService],
})
export class SuperAdminModule {}
