import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateLeaveTypeDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  leaveTypeName?: string;

  @IsString()
  @IsOptional()
  description?: string;
}