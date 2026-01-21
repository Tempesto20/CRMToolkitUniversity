import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocomotivesService } from './locomotives.service';
import { LocomotivesController } from './locomotives.controller';
import { Locomotive } from './locomotives.entity';
import { LocationWork } from '../location-work/location-work.entity';
import { ServiceType } from '../service-types/service-types.entity';
import { WorkType } from '../work-types/work-types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Locomotive,
      LocationWork,
      ServiceType,
      WorkType
    ])
  ],
  controllers: [LocomotivesController],
  providers: [LocomotivesService],
  exports: [LocomotivesService],
})
export class LocomotivesModule {}