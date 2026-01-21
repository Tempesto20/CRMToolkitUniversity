import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employees.entity';
import { CreateEmployeeWithPhotoDto } from './dto/create-employee.dto';
import { ServiceType } from '../service-types/service-types.entity';
import { WorkType } from '../work-types/work-types.entity';
import { Locomotive } from '../locomotives/locomotives.entity';
import { Brigada } from '../brigada/brigada.entity';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(ServiceType)
    private serviceTypesRepository: Repository<ServiceType>,
    @InjectRepository(WorkType)
    private workTypesRepository: Repository<WorkType>,
    @InjectRepository(Locomotive)
    private locomotivesRepository: Repository<Locomotive>,
    @InjectRepository(Brigada)
    private brigadaRepository: Repository<Brigada>,
  ) {}

  async create(createEmployeeDto: CreateEmployeeWithPhotoDto): Promise<Employee> {
    // Проверка на существование сотрудника с таким личным номером
    const existingEmployee = await this.employeesRepository.findOne({
      where: { personalNumber: createEmployeeDto.personalNumber },
    });

    if (existingEmployee) {
      throw new ConflictException({
        error: 'Сотрудник с таким личным номером уже существует',
        existing: {
          fullName: existingEmployee.fullName,
          position: existingEmployee.position,
        },
      });
    }

    // Получаем связанные сущности
    const serviceType = await this.serviceTypesRepository.findOne({
      where: { serviceTypeId: createEmployeeDto.serviceTypeId },
    });

    if (!serviceType) {
      throw new NotFoundException(`Service type with ID ${createEmployeeDto.serviceTypeId} not found`);
    }

    const workType = await this.workTypesRepository.findOne({
      where: { workTypeId: createEmployeeDto.workTypeId },
    });

    if (!workType) {
      throw new NotFoundException(`Work type with ID ${createEmployeeDto.workTypeId} not found`);
    }

    let locomotive: Locomotive | undefined;
    if (createEmployeeDto.locomotiveId) {
      locomotive = await this.locomotivesRepository.findOne({
        where: { locomotiveId: createEmployeeDto.locomotiveId },
      });
    }

    let brigada: Brigada | undefined;
    if (createEmployeeDto.brigadaId) {
      brigada = await this.brigadaRepository.findOne({
        where: { brigadaId: createEmployeeDto.brigadaId },
      });
    }

    // Создаем сотрудника
    const employee = this.employeesRepository.create({
      personalNumber: createEmployeeDto.personalNumber,
      fullName: createEmployeeDto.fullName,
      position: createEmployeeDto.position,
      birthday: createEmployeeDto.birthday,
      phone: createEmployeeDto.phone,
      hasTrip: createEmployeeDto.hasTrip || false,
      hasCraneman: createEmployeeDto.hasCraneman || false,
      dieselAccess: createEmployeeDto.dieselAccess || false,
      electricAccess: createEmployeeDto.electricAccess || false,
      serviceType,
      workType,
      locomotive,
      brigada,
    });

    // Обработка фото
    if (createEmployeeDto.photo) {
      const photo = createEmployeeDto.photo;
      employee.photoFilename = photo.originalname;
      employee.photoMimetype = photo.mimetype;
      // Здесь должна быть логика сохранения файла на диск или в облако
      employee.photoPath = `/uploads/employees/${Date.now()}_${photo.originalname}`;
    }

    return await this.employeesRepository.save(employee);
  }

  async getWorkTypesByService(serviceTypeId: number): Promise<WorkType[]> {
    return this.workTypesRepository.find({
      where: { 
        workTypeId: serviceTypeId === 1 ? [1, 2] : [3, 4]
      }
    });
  }

  async findAll(): Promise<Employee[]> {
    return this.employeesRepository.find({
      relations: ['serviceType', 'workType', 'locomotive', 'brigada'],
    });
  }

  async findOne(personalNumber: number): Promise<Employee> {
    const employee = await this.employeesRepository.findOne({
      where: { personalNumber },
      relations: ['serviceType', 'workType', 'locomotive', 'brigada'],
    });

    if (!employee) {
      throw new NotFoundException(`Employee with personal number ${personalNumber} not found`);
    }

    return employee;
  }
}