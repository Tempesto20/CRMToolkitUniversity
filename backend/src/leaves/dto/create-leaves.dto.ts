
// backend/src/leaves/dto/create-leaves.dto.ts
import { 
  IsNotEmpty, 
  IsDateString,
  Min,
  IsNumber,
  IsInt
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLeaveDto {
  @IsNotEmpty({ message: 'Личный номер сотрудника обязателен' })
  @IsInt({ message: 'Личный номер сотрудника должен быть целым числом' })
  @Min(1, { message: 'Личный номер сотрудника должен быть положительным числом' })
  @Type(() => Number)
  employeePersonalNumber: number;

  @IsNotEmpty({ message: 'ID типа отпуска обязателен' })
  @IsInt({ message: 'ID типа отпуска должен быть целым числом' })
  @Min(1, { message: 'ID типа отпуска должен быть положительным числом' })
  @Type(() => Number)
  leaveTypeId: number;

  @IsNotEmpty({ message: 'Дата начала обязательна' })
  @IsDateString({}, { message: 'Неверный формат даты начала' })
  startDate: string;

  @IsNotEmpty({ message: 'Дата окончания обязательна' })
  @IsDateString({}, { message: 'Неверный формат даты окончания' })
  endDate: string;
}