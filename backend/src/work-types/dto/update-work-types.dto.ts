import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateWorkTypeDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  workTypeName?: string;
}