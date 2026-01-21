import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param
} from '@nestjs/common';
import { LocomotivesService } from './locomotives.service';
import { Locomotive } from './locomotives.entity';
import { CreateLocomotiveDto } from './dto/create-locomotives.dto';
import { UpdateLocomotiveDto } from './dto/update-locomotives.dto';

@Controller('locomotives')
export class LocomotivesController {
  constructor(private readonly locomotivesService: LocomotivesService) {}

  @Post()
  async create(@Body() createLocomotiveDto: CreateLocomotiveDto): Promise<Locomotive> {
    return this.locomotivesService.create(createLocomotiveDto);
  }

  @Get()
  async findAll(): Promise<Locomotive[]> {
    return this.locomotivesService.findAll();
  }

  @Get('available')
  async findAvailable(): Promise<Locomotive[]> {
    return this.locomotivesService.findAvailable();
  }

  @Get('by-service/:serviceTypeId')
  async findByServiceType(@Param('serviceTypeId') serviceTypeId: string): Promise<Locomotive[]> {
    return this.locomotivesService.findByServiceType(parseInt(serviceTypeId));
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return this.locomotivesService.getStats();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Locomotive> {
    return this.locomotivesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLocomotiveDto: UpdateLocomotiveDto
  ): Promise<Locomotive> {
    return this.locomotivesService.update(id, updateLocomotiveDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.locomotivesService.remove(id);
  }
}