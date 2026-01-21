import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateServiceTypeDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  serviceTypeName?: string;
}