import { 
  IsNumber, 
  IsOptional, 
  IsDateString, 
  Validate,
  ValidateIf 
} from 'class-validator';
import { IsDateAfterConstraint } from './create-leaves.dto';

export class UpdateLeaveDto {
  @IsNumber()
  @IsOptional()
  leaveTypeId?: number;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  @ValidateIf((o) => o.startDate || o.endDate)
  @Validate(IsDateAfterConstraint, ['startDate'])
  endDate?: string;
}