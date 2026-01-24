

// backend/src/leaves/leaves.service.ts
import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException,
  Logger 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Leave } from './leaves.entity';
import { CreateLeaveDto } from './dto/create-leaves.dto';
import { UpdateLeaveDto } from './dto/update-leaves.dto';
import { Employee } from '../employees/employees.entity';
import { LeaveType } from '../leave-types/leave-types.entity';

@Injectable()
export class LeavesService {
  private readonly logger = new Logger(LeavesService.name);

  constructor(
    @InjectRepository(Leave)
    private leaveRepository: Repository<Leave>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    @InjectRepository(LeaveType)
    private leaveTypeRepository: Repository<LeaveType>,
  ) {}

  // Создать отпуск
async create(createLeaveDto: CreateLeaveDto): Promise<Leave> {
  this.logger.log(`Creating leave for employee: ${createLeaveDto.employeePersonalNumber}`);

  try {
    // Проверяем существование сотрудника
    const employee = await this.employeeRepository.findOne({
      where: { personalNumber: createLeaveDto.employeePersonalNumber }
    });

    if (!employee) {
      this.logger.error(`Employee not found: ${createLeaveDto.employeePersonalNumber}`);
      throw new NotFoundException(
        `Сотрудник с личным номером ${createLeaveDto.employeePersonalNumber} не найден`
      );
    }

    // Проверяем существование типа отпуска
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { leaveTypeId: createLeaveDto.leaveTypeId }
    });

    if (!leaveType) {
      this.logger.error(`Leave type not found: ${createLeaveDto.leaveTypeId}`);
      throw new NotFoundException(
        `Тип отпуска с ID ${createLeaveDto.leaveTypeId} не найден`
      );
    }

    // Проверяем пересечение дат
    const conflictingLeaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .where('leave.employee_personal_number = :personalNumber', { 
        personalNumber: createLeaveDto.employeePersonalNumber 
      })
      .andWhere('leave.start_date <= :endDate', { 
        endDate: new Date(createLeaveDto.endDate) 
      })
      .andWhere('leave.end_date >= :startDate', { 
        startDate: new Date(createLeaveDto.startDate) 
      })
      .getMany();

    if (conflictingLeaves.length > 0) {
      this.logger.warn(`Conflicting leaves found for employee ${createLeaveDto.employeePersonalNumber}`);
      throw new ConflictException({
        message: 'У сотрудника уже есть отпуск в указанный период',
        conflictingLeaves: conflictingLeaves.map(leave => ({
          leaveId: leave.leaveId,
          startDate: leave.startDate,
          endDate: leave.endDate,
          leaveType: leave.leaveType.leaveTypeName,
        })),
      });
    }

    const leave = this.leaveRepository.create({
      employee,
      leaveType,
      startDate: new Date(createLeaveDto.startDate),
      endDate: new Date(createLeaveDto.endDate),
    });

    const savedLeave = await this.leaveRepository.save(leave);
    this.logger.log(`Leave created successfully: ${savedLeave.leaveId}`);
    return savedLeave;
  } catch (error) {
    this.logger.error(`Error creating leave: ${error.message}`, error.stack);
    throw error;
  }
}







  // Получить все отпуска
  async findAll(): Promise<Leave[]> {
    this.logger.log('Fetching all leaves');
    return await this.leaveRepository.find({
      relations: ['employee', 'leaveType'],
      order: { startDate: 'DESC' }
    });
  }

  // Получить отпуск по ID
  async findOne(id: number): Promise<Leave> {
    const leave = await this.leaveRepository.findOne({
      where: { leaveId: id },
      relations: ['employee', 'leaveType']
    });
    
    if (!leave) {
      throw new NotFoundException(`Отпуск с ID ${id} не найден`);
    }
    
    return leave;
  }

  // Получить отпуска сотрудника
  async findByEmployee(personalNumber: number): Promise<Leave[]> {
    const employee = await this.employeeRepository.findOne({
      where: { personalNumber }
    });

    if (!employee) {
      throw new NotFoundException(
        `Сотрудник с личным номером ${personalNumber} не найден`
      );
    }

    return await this.leaveRepository.find({
      where: { employee: { personalNumber } },
      relations: ['employee', 'leaveType'],
      order: { startDate: 'DESC' }
    });
  }

  // Получить активные отпуска (текущие и будущие)
  async findActive(): Promise<Leave[]> {
    this.logger.log('Fetching active leaves');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return await this.leaveRepository.find({
      where: {
        endDate: MoreThanOrEqual(today)
      },
      relations: ['employee', 'leaveType'],
      order: { startDate: 'ASC' }
    });
  }

  // Получить отпуска на сегодня
  async findToday(): Promise<Leave[]> {
    this.logger.log('Fetching today leaves');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.leaveRepository.find({
      where: [
        { startDate: Between(today, tomorrow) },
        { endDate: Between(today, tomorrow) },
        {
          startDate: LessThanOrEqual(today),
          endDate: MoreThanOrEqual(today)
        }
      ],
      relations: ['employee', 'leaveType'],
      order: { startDate: 'ASC' }
    });
  }

  // Получить отпуска за период
  async findByPeriod(startDate: Date, endDate: Date): Promise<Leave[]> {
    if (startDate > endDate) {
      throw new BadRequestException('Дата начала не может быть позже даты окончания');
    }

    return await this.leaveRepository.find({
      where: {
        startDate: Between(startDate, endDate)
      },
      relations: ['employee', 'leaveType'],
      order: { startDate: 'ASC' }
    });
  }

  // Получить статистику по отпускам
  async getStats(): Promise<any> {
    const totalLeaves = await this.leaveRepository.count();
    const activeLeaves = await this.leaveRepository.count({
      where: {
        endDate: MoreThanOrEqual(new Date())
      }
    });

    // Статистика по месяцам текущего года
    const currentYear = new Date().getFullYear();
    const monthlyStats = await this.leaveRepository
      .createQueryBuilder('leave')
      .select('EXTRACT(MONTH FROM leave.start_date)', 'month')
      .addSelect('COUNT(*)', 'count')
      .where('EXTRACT(YEAR FROM leave.start_date) = :year', { year: currentYear })
      .groupBy('EXTRACT(MONTH FROM leave.start_date)')
      .orderBy('month', 'ASC')
      .getRawMany();

    // Статистика по типам отпусков
    const typeStats = await this.leaveRepository
      .createQueryBuilder('leave')
      .innerJoin('leave.leaveType', 'leaveType')
      .select('leaveType.leave_type_name', 'typeName')
      .addSelect('COUNT(*)', 'count')
      .groupBy('leaveType.leave_type_name')
      .orderBy('count', 'DESC')
      .getRawMany();

    return {
      total: totalLeaves,
      active: activeLeaves,
      completed: totalLeaves - activeLeaves,
      monthlyStats,
      typeStats,
    };
  }

// Обновить отпуск
async update(id: number, updateLeaveDto: UpdateLeaveDto): Promise<Leave> {
  this.logger.log(`Updating leave with ID: ${id}`);
  
  const leave = await this.findOne(id);
  
  if (updateLeaveDto.leaveTypeId !== undefined) {
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { leaveTypeId: updateLeaveDto.leaveTypeId }
    });
    
    if (!leaveType) {
      throw new NotFoundException(
        `Тип отпуска с ID ${updateLeaveDto.leaveTypeId} не найден`
      );
    }
    
    leave.leaveType = leaveType;
  }
  
  if (updateLeaveDto.startDate !== undefined) {
    leave.startDate = new Date(updateLeaveDto.startDate);
  }
  
  if (updateLeaveDto.endDate !== undefined) {
    leave.endDate = new Date(updateLeaveDto.endDate);
  }

  // Проверяем пересечение дат (исключая текущий отпуск)
  if (updateLeaveDto.startDate || updateLeaveDto.endDate) {
    const startDate = updateLeaveDto.startDate ? new Date(updateLeaveDto.startDate) : leave.startDate;
    const endDate = updateLeaveDto.endDate ? new Date(updateLeaveDto.endDate) : leave.endDate;

    const conflictingLeaves = await this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .where('leave.employee_personal_number = :personalNumber', { 
        personalNumber: leave.employee.personalNumber 
      })
      .andWhere('leave.leave_id != :leaveId', { leaveId: id })
      .andWhere('leave.start_date <= :endDate', { endDate })
      .andWhere('leave.end_date >= :startDate', { startDate })
      .getMany();

    if (conflictingLeaves.length > 0) {
      throw new ConflictException({
        message: 'У сотрудника уже есть отпуск в указанный период',
        conflictingLeaves: conflictingLeaves.map(conflictLeave => ({
          leaveId: conflictLeave.leaveId,
          startDate: conflictLeave.startDate,
          endDate: conflictLeave.endDate,
          leaveType: conflictLeave.leaveType.leaveTypeName,
        })),
      });
    }
  }

  // Сохраняем изменения
  const updatedLeave = await this.leaveRepository.save(leave);
  
  // Возвращаем обновленную запись с заполненными отношениями
  const result = await this.leaveRepository.findOne({
    where: { leaveId: id },
    relations: ['employee', 'leaveType']
  });
  
  if (!result) {
    throw new NotFoundException(`Отпуск с ID ${id} не найден после обновления`);
  }
  
  return result;
}




  // Удалить отпуск
  async remove(id: number): Promise<void> {
    this.logger.log(`Deleting leave with ID: ${id}`);
    const leave = await this.findOne(id);
    await this.leaveRepository.remove(leave);
  }

  // Добавить метод поиска отпусков
  async searchLeaves(searchTerm: string): Promise<Leave[]> {
    return this.leaveRepository
      .createQueryBuilder('leave')
      .leftJoinAndSelect('leave.employee', 'employee')
      .leftJoinAndSelect('leave.leaveType', 'leaveType')
      .where('employee.fullName ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('CAST(employee.personalNumber AS TEXT) LIKE :search', { search: `%${searchTerm}%` })
      .orWhere('leaveType.leaveTypeName ILIKE :search', { search: `%${searchTerm}%` })
      .orderBy('leave.startDate', 'DESC')
      .getMany();
  }
}