import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from './employees/employees.module';
import { BrigadaModule } from './brigada/brigada.module';
import { ServiceTypesModule } from './service-types/service-types.module';
import { WorkTypesModule } from './work-types/work-types.module';
import { LocomotivesModule } from './locomotives/locomotives.module';
import { LocationWorkModule } from './location-work/location-work.module';
import { LeaveTypesModule } from './leave-types/leave-types.module';

import { LeavesModule } from './leaves/leaves.module';




@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1',
      database: 'CRMToolkitUniversity',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      // synchronize: true,
      synchronize: false,
    }),
      EmployeesModule,
      BrigadaModule,
      ServiceTypesModule,
      WorkTypesModule,
      LocomotivesModule,
      LocationWorkModule,
      LeaveTypesModule,
      LeavesModule,
  ],
})
export class AppModule {}


