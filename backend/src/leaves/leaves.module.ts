import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { Leave } from './leaves.entity';
import { Employee } from '../employees/employees.entity';
import { LeaveType } from '../leave-types/leave-types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Leave, Employee, LeaveType])
  ],
  controllers: [LeavesController],
  providers: [LeavesService],
  exports: [LeavesService],
})
export class LeavesModule {}