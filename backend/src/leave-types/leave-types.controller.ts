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
import { LeaveTypesService } from './leave-types.service';
import { LeaveType } from './leave-types.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-types.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-types.dto';

@Controller('leave-types')
export class LeaveTypesController {
  constructor(private readonly leaveTypesService: LeaveTypesService) {}

  @Post()
  async create(@Body() createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    return this.leaveTypesService.create(createLeaveTypeDto);
  }

  @Get()
  async findAll(): Promise<LeaveType[]> {
    return this.leaveTypesService.findAll();
  }

  @Get('stats')
  async getStats(): Promise<any[]> {
    return this.leaveTypesService.getStats();
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<LeaveType[]> {
    return this.leaveTypesService.search(query);
  }

  @Get('name/:name')
  async findByName(@Param('name') name: string): Promise<LeaveType[]> {
    return this.leaveTypesService.findByName(name);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<LeaveType> {
    return this.leaveTypesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLeaveTypeDto: UpdateLeaveTypeDto
  ): Promise<LeaveType> {
    return this.leaveTypesService.update(id, updateLeaveTypeDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leaveTypesService.remove(id);
  }
}