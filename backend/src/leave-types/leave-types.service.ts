import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveType } from './leave-types.entity';
import { CreateLeaveTypeDto } from './dto/create-leave-types.dto';
import { UpdateLeaveTypeDto } from './dto/update-leave-types.dto';

@Injectable()
export class LeaveTypesService {
  constructor(
    @InjectRepository(LeaveType)
    private leaveTypeRepository: Repository<LeaveType>,
  ) {}

  // Создать тип отпуска
  async create(createLeaveTypeDto: CreateLeaveTypeDto): Promise<LeaveType> {
    // Проверка на существование типа отпуска с таким ID
    const existing = await this.leaveTypeRepository.findOne({
      where: { leaveTypeId: createLeaveTypeDto.leaveTypeId }
    });

    if (existing) {
      throw new ConflictException(`Тип отпуска с ID ${createLeaveTypeDto.leaveTypeId} уже существует`);
    }

    const leaveType = this.leaveTypeRepository.create(createLeaveTypeDto);
    return await this.leaveTypeRepository.save(leaveType);
  }

  // Получить все типы отпусков
  async findAll(): Promise<LeaveType[]> {
    return await this.leaveTypeRepository.find({
      order: { leaveTypeId: 'ASC' }
    });
  }

  // Получить тип отпуска по ID
  async findOne(id: number): Promise<LeaveType> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { leaveTypeId: id },
      relations: ['leaves']
    });
    
    if (!leaveType) {
      throw new NotFoundException(`Тип отпуска с ID ${id} не найден`);
    }
    
    return leaveType;
  }

  // Получить типы отпусков по названию
  async findByName(name: string): Promise<LeaveType[]> {
    return await this.leaveTypeRepository.find({
      where: { leaveTypeName: name },
      order: { leaveTypeId: 'ASC' }
    });
  }

  // Поиск типов отпусков
  async search(query: string): Promise<LeaveType[]> {
    return await this.leaveTypeRepository
      .createQueryBuilder('leaveType')
      .where('leaveType.leaveTypeName ILIKE :query', { query: `%${query}%` })
      .orWhere('leaveType.description ILIKE :query', { query: `%${query}%` })
      .orderBy('leaveType.leaveTypeId', 'ASC')
      .getMany();
  }

  // Обновить тип отпуска
  async update(id: number, updateLeaveTypeDto: UpdateLeaveTypeDto): Promise<LeaveType> {
    const leaveType = await this.findOne(id);
    
    if (updateLeaveTypeDto.leaveTypeName !== undefined) {
      leaveType.leaveTypeName = updateLeaveTypeDto.leaveTypeName;
    }
    
    if (updateLeaveTypeDto.description !== undefined) {
      leaveType.description = updateLeaveTypeDto.description;
    }
    
    return await this.leaveTypeRepository.save(leaveType);
  }

  // Удалить тип отпуска
  async remove(id: number): Promise<void> {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { leaveTypeId: id },
      relations: ['leaves']
    });
    
    if (!leaveType) {
      throw new NotFoundException(`Тип отпуска с ID ${id} не найден`);
    }
    
    // Проверка на наличие привязанных отпусков
    if (leaveType.leaves && leaveType.leaves.length > 0) {
      throw new ConflictException({
        message: 'Нельзя удалить тип отпуска, к которому привязаны отпуска сотрудников',
        leavesCount: leaveType.leaves.length,
      });
    }
    
    await this.leaveTypeRepository.remove(leaveType);
  }

  // Получить статистику по типам отпусков
  async getStats(): Promise<any[]> {
    return await this.leaveTypeRepository
      .createQueryBuilder('leaveType')
      .leftJoin('leaveType.leaves', 'leave')
      .select([
        'leaveType.leaveTypeId as leaveTypeId',
        'leaveType.leaveTypeName as leaveTypeName',
        'leaveType.description as description',
        'COUNT(leave.leave_id) as totalLeaves',
        'SUM(CASE WHEN leave.end_date >= CURRENT_DATE THEN 1 ELSE 0 END) as activeLeaves'
      ])
      .groupBy('leaveType.leaveTypeId, leaveType.leaveTypeName, leaveType.description')
      .orderBy('totalLeaves', 'DESC')
      .getRawMany();
  }
}