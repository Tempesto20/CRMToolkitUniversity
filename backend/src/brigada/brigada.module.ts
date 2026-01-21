import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrigadaService } from './brigada.service';
import { BrigadaController } from './brigada.controller';
import { Brigada } from './brigada.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Brigada])],
  controllers: [BrigadaController],
  providers: [BrigadaService],
  exports: [BrigadaService],
})
export class BrigadaModule {}