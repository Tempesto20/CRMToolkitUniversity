import { 
  IsNumber, 
  IsOptional, 
  IsDateString,
  IsInt,
  Min
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateLeaveDto {
  @IsOptional()
  @IsInt({ message: 'ID типа отпуска должен быть целым числом' })
  @Min(1, { message: 'ID типа отпуска должен быть положительным числом' })
  @Type(() => Number)
  leaveTypeId?: number;

  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты начала' })
  startDate?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Неверный формат даты окончания' })
  endDate?: string;
}