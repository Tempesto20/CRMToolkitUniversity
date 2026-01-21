import { IsString, IsBoolean, IsOptional, MaxLength, IsNumber } from 'class-validator';

export class UpdateLocomotiveDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  locomotiveType?: string;

  @IsBoolean()
  @IsOptional()
  locomotiveDepo?: boolean;

  @IsBoolean()
  @IsOptional()
  operationalStatus?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  locomotiveName?: string;

  @IsNumber()
  @IsOptional()
  locationId?: number;

  @IsNumber()
  @IsOptional()
  serviceTypeId?: number;

  @IsNumber()
  @IsOptional()
  workTypeId?: number;
}