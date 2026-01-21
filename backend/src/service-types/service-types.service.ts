import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceType } from './service-types.entity';
import { CreateServiceTypeDto } from './dto/create-service-types.dto';
import { UpdateServiceTypeDto } from './dto/update-service-types.dto';

@Injectable()
export class ServiceTypesService {
  constructor(
    @InjectRepository(ServiceType)
    private serviceTypeRepository: Repository<ServiceType>,
  ) {}

  // Создать тип службы
  async create(createServiceTypeDto: CreateServiceTypeDto): Promise<ServiceType> {
    const serviceType = this.serviceTypeRepository.create(createServiceTypeDto);
    return await this.serviceTypeRepository.save(serviceType);
  }

  // Получить все типы служб
  async findAll(): Promise<ServiceType[]> {
    return await this.serviceTypeRepository.find({
      order: { serviceTypeId: 'ASC' }
    });
  }

  // Получить тип службы по ID
  async findOne(id: number): Promise<ServiceType> {
    const serviceType = await this.serviceTypeRepository.findOne({
      where: { serviceTypeId: id }
    });
    
    if (!serviceType) {
      throw new NotFoundException(`Service type with ID ${id} not found`);
    }
    
    return serviceType;
  }

  // Обновить тип службы
  async update(id: number, updateServiceTypeDto: UpdateServiceTypeDto): Promise<ServiceType> {
    const serviceType = await this.findOne(id);
    
    if (updateServiceTypeDto.serviceTypeName) {
      serviceType.serviceTypeName = updateServiceTypeDto.serviceTypeName;
    }
    
    return await this.serviceTypeRepository.save(serviceType);
  }

  // Удалить тип службы
  async remove(id: number): Promise<void> {
    const serviceType = await this.findOne(id);
    await this.serviceTypeRepository.remove(serviceType);
  }
}