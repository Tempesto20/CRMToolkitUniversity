import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from './employees.entity';
import { CreateEmployeeWithPhotoDto } from './dto/create-employees.dto';
import { UpdateEmployeeWithPhotoDto } from './dto/update-employees.dto';
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
      const loc = await this.locomotivesRepository.findOne({
        where: { locomotiveId: createEmployeeDto.locomotiveId },
      });
      if (loc) {
        locomotive = loc;
      } else {
        throw new NotFoundException(`Locomotive with ID ${createEmployeeDto.locomotiveId} not found`);
      }
    }

    let brigada: Brigada | undefined;
    if (createEmployeeDto.brigadaId) {
      const brig = await this.brigadaRepository.findOne({
        where: { brigadaId: createEmployeeDto.brigadaId },
      });
      if (brig) {
        brigada = brig;
      } else {
        throw new NotFoundException(`Brigada with ID ${createEmployeeDto.brigadaId} not found`);
      }
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

  async update(personalNumber: number, updateEmployeeDto: UpdateEmployeeWithPhotoDto): Promise<Employee> {
    // Находим сотрудника
    const employee = await this.findOne(personalNumber);
    
    // Обновляем связанные сущности
    if (updateEmployeeDto.serviceTypeId !== undefined) {
      const serviceType = await this.serviceTypesRepository.findOne({
        where: { serviceTypeId: updateEmployeeDto.serviceTypeId },
      });
      if (!serviceType) {
        throw new NotFoundException(`Service type with ID ${updateEmployeeDto.serviceTypeId} not found`);
      }
      employee.serviceType = serviceType;
    }
    
    if (updateEmployeeDto.workTypeId !== undefined) {
      const workType = await this.workTypesRepository.findOne({
        where: { workTypeId: updateEmployeeDto.workTypeId },
      });
      if (!workType) {
        throw new NotFoundException(`Work type with ID ${updateEmployeeDto.workTypeId} not found`);
      }
      employee.workType = workType;
    }
    
    if (updateEmployeeDto.locomotiveId !== undefined) {
      if (updateEmployeeDto.locomotiveId) {
        const locomotive = await this.locomotivesRepository.findOne({
          where: { locomotiveId: updateEmployeeDto.locomotiveId },
        });
        if (!locomotive) {
          throw new NotFoundException(`Locomotive with ID ${updateEmployeeDto.locomotiveId} not found`);
        }
        employee.locomotive = locomotive;
      } else {
        // Используем undefined вместо null
        employee.locomotive = undefined;
      }
    }
    
    if (updateEmployeeDto.brigadaId !== undefined) {
      if (updateEmployeeDto.brigadaId) {
        const brigada = await this.brigadaRepository.findOne({
          where: { brigadaId: updateEmployeeDto.brigadaId },
        });
        if (!brigada) {
          throw new NotFoundException(`Brigada with ID ${updateEmployeeDto.brigadaId} not found`);
        }
        employee.brigada = brigada;
      } else {
        // Используем undefined вместо null
        employee.brigada = undefined;
      }
    }
    
    // Обновляем простые поля
    if (updateEmployeeDto.fullName !== undefined) employee.fullName = updateEmployeeDto.fullName;
    if (updateEmployeeDto.position !== undefined) employee.position = updateEmployeeDto.position;
    if (updateEmployeeDto.birthday !== undefined) employee.birthday = updateEmployeeDto.birthday;
    if (updateEmployeeDto.phone !== undefined) employee.phone = updateEmployeeDto.phone;
    
    // Преобразуем строки в boolean если они приходят как строки
    if (updateEmployeeDto.hasTrip !== undefined) {
      employee.hasTrip = typeof updateEmployeeDto.hasTrip === 'string' 
        ? updateEmployeeDto.hasTrip === 'true'
        : updateEmployeeDto.hasTrip;
    }
    if (updateEmployeeDto.hasCraneman !== undefined) {
      employee.hasCraneman = typeof updateEmployeeDto.hasCraneman === 'string'
        ? updateEmployeeDto.hasCraneman === 'true'
        : updateEmployeeDto.hasCraneman;
    }
    if (updateEmployeeDto.dieselAccess !== undefined) {
      employee.dieselAccess = typeof updateEmployeeDto.dieselAccess === 'string'
        ? updateEmployeeDto.dieselAccess === 'true'
        : updateEmployeeDto.dieselAccess;
    }
    if (updateEmployeeDto.electricAccess !== undefined) {
      employee.electricAccess = typeof updateEmployeeDto.electricAccess === 'string'
        ? updateEmployeeDto.electricAccess === 'true'
        : updateEmployeeDto.electricAccess;
    }
    
    // Обработка фото
    if (updateEmployeeDto.photo) {
      const photo = updateEmployeeDto.photo;
      employee.photoFilename = photo.originalname;
      employee.photoMimetype = photo.mimetype;
      // Здесь должна быть логика сохранения файла на диск или в облако
      employee.photoPath = `/uploads/employees/${Date.now()}_${photo.originalname}`;
    }
    
    return await this.employeesRepository.save(employee);
  }

  async getWorkTypesByService(serviceTypeId: number): Promise<WorkType[]> {
    let workTypeIds: number[];
    
    if (serviceTypeId === 1) {
      workTypeIds = [1, 2];
    } else if (serviceTypeId === 2) {
      workTypeIds = [3, 4];
    } else {
      return [];
    }
    
    return this.workTypesRepository
      .createQueryBuilder('workType')
      .where('workType.workTypeId IN (:...ids)', { ids: workTypeIds })
      .orderBy('workType.workTypeId', 'ASC')
      .getMany();
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

  async remove(personalNumber: number): Promise<void> {
    const result = await this.employeesRepository.delete(personalNumber);
    if (result.affected === 0) {
      throw new NotFoundException(`Employee with personal number ${personalNumber} not found`);
    }
  }
}