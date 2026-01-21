import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkType } from './work-types.entity';
import { CreateWorkTypeDto } from './dto/create-work-types.dto';
import { UpdateWorkTypeDto } from './dto/update-work-types.dto';

@Injectable()
export class WorkTypesService {
  constructor(
    @InjectRepository(WorkType)
    private workTypeRepository: Repository<WorkType>,
  ) {}

  // Создать вид работы
  async create(createWorkTypeDto: CreateWorkTypeDto): Promise<WorkType> {
    const workType = this.workTypeRepository.create(createWorkTypeDto);
    return await this.workTypeRepository.save(workType);
  }

  // Получить все виды работ
  async findAll(): Promise<WorkType[]> {
    return await this.workTypeRepository.find({
      order: { workTypeId: 'ASC' }
    });
  }

  // Получить вид работы по ID
  async findOne(id: number): Promise<WorkType> {
    const workType = await this.workTypeRepository.findOne({
      where: { workTypeId: id }
    });
    
    if (!workType) {
      throw new NotFoundException(`Work type with ID ${id} not found`);
    }
    
    return workType;
  }

  // Получить виды работ по службе (по аналогии с оригинальным кодом)
  async findByServiceType(serviceTypeId: number): Promise<WorkType[]> {
    let workTypeIds: number[];
    
    if (serviceTypeId === 1) {
      // Электровозная служба
      workTypeIds = [1, 2];
    } else if (serviceTypeId === 2) {
      // Тепловозная служба
      workTypeIds = [3, 4];
    } else {
      return [];
    }
    
    return await this.workTypeRepository
      .createQueryBuilder('workType')
      .where('workType.workTypeId IN (:...ids)', { ids: workTypeIds })
      .orderBy('workType.workTypeId', 'ASC')
      .getMany();
  }

  // Обновить вид работы
  async update(id: number, updateWorkTypeDto: UpdateWorkTypeDto): Promise<WorkType> {
    const workType = await this.findOne(id);
    
    if (updateWorkTypeDto.workTypeName) {
      workType.workTypeName = updateWorkTypeDto.workTypeName;
    }
    
    return await this.workTypeRepository.save(workType);
  }

  // Удалить вид работы
  async remove(id: number): Promise<void> {
    const workType = await this.findOne(id);
    await this.workTypeRepository.remove(workType);
  }
}