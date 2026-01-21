import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { Employee } from './entities/employee.entity';
import { ServiceType } from '../service-types/entities/service-type.entity';
import { WorkType } from '../work-types/entities/work-type.entity';
import { Locomotive } from '../locomotives/entities/locomotive.entity';
import { Brigada } from '../brigada/entities/brigada.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Employee, ServiceType, WorkType, Locomotive, Brigada]),
  ],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}