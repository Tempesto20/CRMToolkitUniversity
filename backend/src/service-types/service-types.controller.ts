import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param,
  ParseIntPipe 
} from '@nestjs/common';
import { ServiceTypesService } from './service-types.service';
import { ServiceType } from './service-types.entity';
import { CreateServiceTypeDto } from './dto/create-service-types.dto';
import { UpdateServiceTypeDto } from './dto/update-service-types.dto';

@Controller('service-types')
export class ServiceTypesController {
  constructor(private readonly serviceTypesService: ServiceTypesService) {}

  @Post()
  async create(@Body() createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType> {
    return this.serviceTypesService.create(createServiceTypeDto);
  }

  @Get()
  async findAll(): Promise<ServiceType[]> {
    return this.serviceTypesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<ServiceType> {
    return this.serviceTypesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateServiceTypeDto: UpdateServiceTypeDto
  ): Promise<ServiceType> {
    return this.serviceTypesService.update(id, updateServiceTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.serviceTypesService.remove(id);
  }
}