import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './employees.entity';
import { ServiceType } from '../service-types/service-types.entity';
import { WorkType } from '../work-types/work-types.entity';
import { Locomotive } from '../locomotives/locomotives.entity';
import { Brigada } from '../brigada/brigada.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, ServiceType, WorkType, Locomotive, Brigada]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}