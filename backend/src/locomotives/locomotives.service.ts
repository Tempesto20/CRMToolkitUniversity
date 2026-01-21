import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locomotive } from './locomotives.entity';
import { CreateLocomotiveDto } from './dto/create-locomotives.dto';
import { UpdateLocomotiveDto } from './dto/update-locomotives.dto';
import { LocationWork } from '../location-work/location-work.entity';
import { ServiceType } from '../service-types/service-types.entity';
import { WorkType } from '../work-types//work-types.entity';

@Injectable()
export class LocomotivesService {
  constructor(
    @InjectRepository(Locomotive)
    private locomotiveRepository: Repository<Locomotive>,
    @InjectRepository(LocationWork)
    private locationWorkRepository: Repository<LocationWork>,
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
    @InjectRepository(WorkType)
    private workTypeRepository: Repository<WorkType>,
  ) {}

  // Создать локомотив
  async create(createLocomotiveDto: CreateLocomotiveDto): Promise<Locomotive> {
    // Проверка на существование локомотива с таким ID
    const existing = await this.locomotiveRepository.findOne({
      where: { locomotiveId: createLocomotiveDto.locomotiveId }
    });

    if (existing) {
      throw new ConflictException(`Локомотив с ID ${createLocomotiveDto.locomotiveId} уже существует`);
    }

    const locomotive = this.locomotiveRepository.create({
      locomotiveId: createLocomotiveDto.locomotiveId,
      locomotiveType: createLocomotiveDto.locomotiveType,
      locomotiveDepo: createLocomotiveDto.locomotiveDepo || false,
      operationalStatus: createLocomotiveDto.operationalStatus !== undefined 
        ? createLocomotiveDto.operationalStatus 
        : true,
      locomotiveName: createLocomotiveDto.locomotiveName || 'не указано',
    });

    // Установка связей
    if (createLocomotiveDto.locationId) {
      const location = await this.locationWorkRepository.findOne({
        where: { locationId: createLocomotiveDto.locationId }
      });
      if (location) locomotive.location = location;
    }

    if (createLocomotiveDto.serviceTypeId) {
      const serviceType = await this.serviceTypeRepository.findOne({
        where: { serviceTypeId: createLocomotiveDto.serviceTypeId }
      });
      if (serviceType) locomotive.serviceType = serviceType;
    }

    if (createLocomotiveDto.workTypeId) {
      const workType = await this.workTypeRepository.findOne({
        where: { workTypeId: createLocomotiveDto.workTypeId }
      });
      if (workType) locomotive.workType = workType;
    }

    return await this.locomotiveRepository.save(locomotive);
  }

  // Получить все локомотивы
  async findAll(): Promise<Locomotive[]> {
    return await this.locomotiveRepository.find({
      relations: ['location', 'serviceType', 'workType'],
      order: { locomotiveId: 'ASC' }
    });
  }

  // Получить локомотив по ID
  async findOne(id: string): Promise<Locomotive> {
    const locomotive = await this.locomotiveRepository.findOne({
      where: { locomotiveId: id },
      relations: ['location', 'serviceType', 'workType', 'employees']
    });
    
    if (!locomotive) {
      throw new NotFoundException(`Локомотив с ID ${id} не найден`);
    }
    
    return locomotive;
  }

  // Получить доступные локомотивы (рабочие)
  async findAvailable(): Promise<Locomotive[]> {
    return await this.locomotiveRepository.find({
      where: { operationalStatus: true },
      relations: ['location', 'serviceType', 'workType'],
      order: { locomotiveId: 'ASC' }
    });
  }

  // Получить локомотивы по службе
  async findByServiceType(serviceTypeId: number): Promise<Locomotive[]> {
    return await this.locomotiveRepository.find({
      where: { 
        serviceType: { serviceTypeId: serviceTypeId },
        operationalStatus: true 
      },
      relations: ['location', 'serviceType', 'workType'],
      order: { locomotiveId: 'ASC' }
    });
  }

  // Обновить локомотив
  async update(id: string, updateLocomotiveDto: UpdateLocomotiveDto): Promise<Locomotive> {
    const locomotive = await this.findOne(id);
    
    // Обновление полей
    if (updateLocomotiveDto.locomotiveType !== undefined) {
      locomotive.locomotiveType = updateLocomotiveDto.locomotiveType;
    }
    
    if (updateLocomotiveDto.locomotiveDepo !== undefined) {
      locomotive.locomotiveDepo = updateLocomotiveDto.locomotiveDepo;
    }
    
    if (updateLocomotiveDto.operationalStatus !== undefined) {
      locomotive.operationalStatus = updateLocomotiveDto.operationalStatus;
    }
    
    if (updateLocomotiveDto.locomotiveName !== undefined) {
      locomotive.locomotiveName = updateLocomotiveDto.locomotiveName;
    }

    // Обновление связей - ЗАМЕНИТЕ ЭТОТ БЛОК КОДА:
    if (updateLocomotiveDto.locationId !== undefined) {
      if (updateLocomotiveDto.locationId) {
        const location = await this.locationWorkRepository.findOne({
          where: { locationId: updateLocomotiveDto.locationId }
        });
        if (location) {
          locomotive.location = location;
        }
      } else {
        locomotive.location = undefined;
      }
    }

    if (updateLocomotiveDto.serviceTypeId !== undefined) {
      if (updateLocomotiveDto.serviceTypeId) {
        const serviceType = await this.serviceTypeRepository.findOne({
          where: { serviceTypeId: updateLocomotiveDto.serviceTypeId }
        });
        if (serviceType) {
          locomotive.serviceType = serviceType;
        }
      } else {
        locomotive.serviceType = undefined;
      }
    }

    if (updateLocomotiveDto.workTypeId !== undefined) {
      if (updateLocomotiveDto.workTypeId) {
        const workType = await this.workTypeRepository.findOne({
          where: { workTypeId: updateLocomotiveDto.workTypeId }
        });
        if (workType) {
          locomotive.workType = workType;
        }
      } else {
        locomotive.workType = undefined;
      }
    }

    return await this.locomotiveRepository.save(locomotive);
  }

  // Удалить локомотив
  async remove(id: string): Promise<void> {
    const locomotive = await this.findOne(id);
    
    // Проверка на наличие привязанных сотрудников
    if (locomotive.employees && locomotive.employees.length > 0) {
      throw new ConflictException({
        message: 'Нельзя удалить локомотив, к которому привязаны сотрудники',
        employeesCount: locomotive.employees.length,
      });
    }
    
    await this.locomotiveRepository.remove(locomotive);
  }

  // Получить статистику по локомотивам
  async getStats(): Promise<any> {
    const total = await this.locomotiveRepository.count();
    const operational = await this.locomotiveRepository.count({
      where: { operationalStatus: true }
    });
    const inDepot = await this.locomotiveRepository.count({
      where: { locomotiveDepo: true }
    });

    return {
      total,
      operational,
      inDepot,
      nonOperational: total - operational,
      inService: total - inDepot,
    };
  }
}