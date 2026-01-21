import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { BrigadaService } from './brigada.service';
import { CreateBrigadaDto } from './dto/create-brigada.dto';
import { Brigada } from './brigada.entity';

@Controller('brigada')
export class BrigadaController {
  constructor(private readonly brigadaService: BrigadaService) {}

  @Get()
  async findAll(): Promise<Brigada[]> {
    return this.brigadaService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Brigada> {
    return this.brigadaService.findOne(+id);
  }

  @Post()
  async create(@Body() createBrigadaDto: CreateBrigadaDto): Promise<Brigada> {
    return this.brigadaService.create(createBrigadaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.brigadaService.remove(+id);
  }
}