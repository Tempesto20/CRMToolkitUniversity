
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
import { LeavesService } from './leaves.service';
import { Leave } from './leaves.entity';
import { CreateLeaveDto } from './dto/create-leaves.dto';
import { UpdateLeaveDto } from './dto/update-leaves.dto';

@Controller('leaves')
export class LeavesController {
  constructor(private readonly leavesService: LeavesService) {}

  @Post()
  async create(@Body() createLeaveDto: CreateLeaveDto): Promise<Leave> {
    return this.leavesService.create(createLeaveDto);
  }

  @Get()
  async findAll(@Query('search') search?: string): Promise<Leave[]> {
    if (search) {
      return this.leavesService.searchLeaves(search);
    }
    return this.leavesService.findAll();
  }

  @Get('stats')
  async getStats(): Promise<any> {
    return this.leavesService.getStats();
  }

  @Get('active')
  async findActive(): Promise<Leave[]> {
    return this.leavesService.findActive();
  }

  @Get('today')
  async findToday(): Promise<Leave[]> {
    return this.leavesService.findToday();
  }

  @Get('employee/:personalNumber')
  async findByEmployee(
    @Param('personalNumber', ParseIntPipe) personalNumber: number
  ): Promise<Leave[]> {
    return this.leavesService.findByEmployee(personalNumber);
  }

  @Get('period')
  async findByPeriod(
    @Query('start') startDate: string,
    @Query('end') endDate: string
  ): Promise<Leave[]> {
    return this.leavesService.findByPeriod(
      new Date(startDate),
      new Date(endDate)
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Leave> {
    return this.leavesService.findOne(id);
  }

@Put(':id')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateLeaveDto: UpdateLeaveDto
): Promise<Leave> {
  console.log(`Updating leave ${id} with data:`, updateLeaveDto);
  const result = await this.leavesService.update(id, updateLeaveDto);
  console.log('Updated leave:', result);
  return result;
}

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.leavesService.remove(id);
  }
}