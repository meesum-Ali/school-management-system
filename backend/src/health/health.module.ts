import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TerminusModule,
    TypeOrmModule.forFeature([]), // Add any entities if needed
  ],
  controllers: [HealthController],
  providers: [],
})
export class HealthModule {}
