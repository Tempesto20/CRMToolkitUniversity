import { IsString, IsNotEmpty, MaxLength, IsNumber, IsOptional } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsNumber()
  @IsNotEmpty()
  leaveTypeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  leaveTypeName: string;

  @IsString()
  @IsOptional()
  description?: string;
}