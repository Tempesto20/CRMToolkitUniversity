// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Body,
//   Param,
//   UseInterceptors,
//   UploadedFile,
//   ParseIntPipe,
//   BadRequestException,
// } from '@nestjs/common';
// import { FileInterceptor } from '@nestjs/platform-express';
// import { EmployeesService } from './employees.service';
// import { CreateEmployeeDto, CreateEmployeeWithPhotoDto } from './dto/create-employees.dto';
// import { UpdateEmployeeDto, UpdateEmployeeWithPhotoDto } from './dto/update-employees.dto';

// @Controller('api/employees')
// export class EmployeesController {
//   constructor(private readonly employeesService: EmployeesService) {}

//   @Post()
//   @UseInterceptors(FileInterceptor('photo'))
//   async create(
//     @Body() createEmployeeDto: CreateEmployeeDto,
//     @UploadedFile() photo?: any,
//   ) {
//     const employeeData: CreateEmployeeWithPhotoDto = {
//       ...createEmployeeDto,
//       photo,
//       personalNumber: Number(createEmployeeDto.personalNumber),
//       serviceTypeId: Number(createEmployeeDto.serviceTypeId),
//       workTypeId: Number(createEmployeeDto.workTypeId),
//       brigadaId: createEmployeeDto.brigadaId ? Number(createEmployeeDto.brigadaId) : undefined,
//     };

//     return this.employeesService.create(employeeData);
//   }

//   @Put(':personalNumber')
//   @UseInterceptors(FileInterceptor('photo'))
//   async update(
//     @Param('personalNumber', ParseIntPipe) personalNumber: number,
//     @Body() updateEmployeeDto: UpdateEmployeeDto,
//     @UploadedFile() photo?: any,
//   ) {
//     const employeeData: UpdateEmployeeWithPhotoDto = {
//       ...updateEmployeeDto,
//       photo,
//       serviceTypeId: updateEmployeeDto.serviceTypeId ? Number(updateEmployeeDto.serviceTypeId) : undefined,
//       workTypeId: updateEmployeeDto.workTypeId ? Number(updateEmployeeDto.workTypeId) : undefined,
//       brigadaId: updateEmployeeDto.brigadaId ? Number(updateEmployeeDto.brigadaId) : undefined,
//     };

//     return this.employeesService.update(personalNumber, employeeData);
//   }

//   @Get('work-types/:serviceTypeId')
//   async getWorkTypesByService(@Param('serviceTypeId', ParseIntPipe) serviceTypeId: number) {
//     return this.employeesService.getWorkTypesByService(serviceTypeId);
//   }

//   @Get()
//   async findAll() {
//     return this.employeesService.findAll();
//   }

//   @Get(':personalNumber')
//   async findOne(@Param('personalNumber', ParseIntPipe) personalNumber: number) {
//     return this.employeesService.findOne(personalNumber);
//   }

//   @Delete(':personalNumber')
//   async remove(@Param('personalNumber', ParseIntPipe) personalNumber: number) {
//     return this.employeesService.remove(personalNumber);
//   }
// }



import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto, CreateEmployeeWithPhotoDto } from './dto/create-employees.dto';
import { UpdateEmployeeDto, UpdateEmployeeWithPhotoDto } from './dto/update-employees.dto';

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

  @Put(':personalNumber')
  @UseInterceptors(FileInterceptor('photo'))
  async update(
    @Param('personalNumber', ParseIntPipe) personalNumber: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @UploadedFile() photo?: any,
  ) {
    const employeeData: UpdateEmployeeWithPhotoDto = {
      ...updateEmployeeDto,
      photo,
      serviceTypeId: updateEmployeeDto.serviceTypeId ? Number(updateEmployeeDto.serviceTypeId) : undefined,
      workTypeId: updateEmployeeDto.workTypeId ? Number(updateEmployeeDto.workTypeId) : undefined,
      brigadaId: updateEmployeeDto.brigadaId ? Number(updateEmployeeDto.brigadaId) : undefined,
    };

    return this.employeesService.update(personalNumber, employeeData);
  }

  @Get('work-types/:serviceTypeId')
  async getWorkTypesByService(@Param('serviceTypeId', ParseIntPipe) serviceTypeId: number) {
    return this.employeesService.getWorkTypesByService(serviceTypeId);
  }

  @Get()
  async findAll(@Query('search') search?: string) {
    if (search) {
      // Здесь нужно добавить метод поиска в сервисе
      return this.employeesService.searchEmployees(search);
    }
    return this.employeesService.findAll();
  }

  @Get(':personalNumber')
  async findOne(@Param('personalNumber', ParseIntPipe) personalNumber: number) {
    return this.employeesService.findOne(personalNumber);
  }

  @Delete(':personalNumber')
  async remove(@Param('personalNumber', ParseIntPipe) personalNumber: number) {
    return this.employeesService.remove(personalNumber);
  }
}