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
import { WorkTypesService } from './work-types.service';
import { WorkType } from './work-types.entity';
import { CreateWorkTypeDto } from './dto/create-work-types.dto';
import { UpdateWorkTypeDto } from './dto/update-work-types.dto';

@Controller('work-types')
export class WorkTypesController {
  constructor(private readonly workTypesService: WorkTypesService) {}

  @Post()
  async create(@Body() createWorkTypeDto: CreateWorkTypeDto): Promise<WorkType> {
    return this.workTypesService.create(createWorkTypeDto);
  }

  @Get()
  async findAll(): Promise<WorkType[]> {
    return this.workTypesService.findAll();
  }

  @Get('by-service/:serviceTypeId')
  async findByServiceType(
    @Param('serviceTypeId', ParseIntPipe) serviceTypeId: number
  ): Promise<WorkType[]> {
    return this.workTypesService.findByServiceType(serviceTypeId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<WorkType> {
    return this.workTypesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWorkTypeDto: UpdateWorkTypeDto
  ): Promise<WorkType> {
    return this.workTypesService.update(id, updateWorkTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.workTypesService.remove(id);
  }
}