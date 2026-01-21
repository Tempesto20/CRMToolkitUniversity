import { 
  Controller, 
  Get, 
  Post, 
  Put, 
  Delete, 
  Body, 
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { LocationWorkService } from './location-work.service';
import { LocationWork } from './location-work.entity';
import { CreateLocationWorkDto } from './dto/create-location-work.dto';
import { UpdateLocationWorkDto } from './dto/update-location-work.dto';

@Controller('location-work')
export class LocationWorkController {
  constructor(private readonly locationWorkService: LocationWorkService) {}

  @Post()
  async create(@Body() createLocationWorkDto: CreateLocationWorkDto): Promise<LocationWork> {
    return this.locationWorkService.create(createLocationWorkDto);
  }

  @Get()
  async findAll(): Promise<LocationWork[]> {
    return this.locationWorkService.findAll();
  }

  @Get('stats')
  async getLocationsWithStats(): Promise<any[]> {
    return this.locationWorkService.getLocationsWithStats();
  }

  @Get('popular')
  async getPopularLocations(@Query('limit') limit: string): Promise<any[]> {
    const limitNum = limit ? parseInt(limit) : 10;
    return this.locationWorkService.getPopularLocations(limitNum);
  }

  @Get('search/:name')
  async findByName(@Param('name') name: string): Promise<LocationWork[]> {
    return this.locationWorkService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LocationWork> {
    return this.locationWorkService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLocationWorkDto: UpdateLocationWorkDto
  ): Promise<LocationWork> {
    return this.locationWorkService.update(id, updateLocationWorkDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.locationWorkService.remove(id);
  }
}