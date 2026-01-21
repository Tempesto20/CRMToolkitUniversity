import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkTypesService } from './work-types.service';
import { WorkTypesController } from './work-types.controller';
import { WorkType } from './work-types.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkType])],
  controllers: [WorkTypesController],
  providers: [WorkTypesService],
  exports: [WorkTypesService],
})
export class WorkTypesModule {}