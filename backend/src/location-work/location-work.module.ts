import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocationWorkService } from './location-work.service';
import { LocationWorkController } from './location-work.controller';
import { LocationWork } from './location-work.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocationWork])],
  controllers: [LocationWorkController],
  providers: [LocationWorkService],
  exports: [LocationWorkService],
})
export class LocationWorkModule {}