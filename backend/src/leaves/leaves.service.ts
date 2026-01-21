import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  BadRequestException 
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
    // Проверяем существование сотрудника
    const employee = await this.employeeRepository.findOne({
      where: { personalNumber: createLeaveDto.employeePersonalNumber }
    });

    if (!employee) {
      throw new NotFoundException(
        `Сотрудник с личным номером ${createLeaveDto.employeePersonalNumber} не найден`
      );
    }

    // Проверяем существование типа отпуска
    const leaveType = await this.leaveTypeRepository.findOne({
      where: { leaveTypeId: createLeaveDto.leaveTypeId }
    });

    if (!leaveType) {
      throw new NotFoundException(
        `Тип отпуска с ID ${createLeaveDto.leaveTypeId} не найден`
      );
    }

    // Проверяем пересечение дат
    const conflictingLeaves = await this.leaveRepository.find({
      where: {
        employee: { personalNumber: createLeaveDto.employeePersonalNumber },
        startDate: LessThanOrEqual(new Date(createLeaveDto.endDate)),
        endDate: MoreThanOrEqual(new Date(createLeaveDto.startDate)),
      }
    });

    if (conflictingLeaves.length > 0) {
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

    return await this.leaveRepository.save(leave);
  }

  // Получить все отпуска
  async findAll(): Promise<Leave[]> {
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
      relations: ['leaveType'],
      order: { startDate: 'DESC' }
    });
  }

  // Получить активные отпуска (текущие и будущие)
  async findActive(): Promise<Leave[]> {
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

      const conflictingLeaves = await this.leaveRepository.find({
        where: {
          employee: { personalNumber: leave.employee.personalNumber },
          leaveId: () => `leave_id != ${id}`,
          startDate: LessThanOrEqual(endDate),
          endDate: MoreThanOrEqual(startDate),
        }
      });

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

    leave.updatedAt = new Date();
    return await this.leaveRepository.save(leave);
  }

  // Удалить отпуск
  async remove(id: number): Promise<void> {
    const leave = await this.findOne(id);
    await this.leaveRepository.remove(leave);
  }

  // Получить отпуска за сегодня
  async findToday(): Promise<Leave[]> {
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
}