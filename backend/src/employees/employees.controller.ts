import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, CreateEmployeeWithPhotoDto } from './dto/create-employees.dto';

@Controller('api/employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @UploadedFile() photo?: any,
  ) {
    const employeeData: CreateEmployeeWithPhotoDto = {
      ...createEmployeeDto,
      photo,
      personalNumber: Number(createEmployeeDto.personalNumber),
      serviceTypeId: Number(createEmployeeDto.serviceTypeId),
      workTypeId: Number(createEmployeeDto.workTypeId),
      brigadaId: createEmployeeDto.brigadaId ? Number(createEmployeeDto.brigadaId) : undefined,
    };

    return this.employeesService.create(employeeData);
  }

  @Get('work-types/:serviceTypeId')
  async getWorkTypesByService(@Param('serviceTypeId', ParseIntPipe) serviceTypeId: number) {
    return this.employeesService.getWorkTypesByService(serviceTypeId);
  }

  @Get()
  async findAll() {
    return this.employeesService.findAll();
  }

  @Get(':personalNumber')
  async findOne(@Param('personalNumber', ParseIntPipe) personalNumber: number) {
    return this.employeesService.findOne(personalNumber);
  }
}