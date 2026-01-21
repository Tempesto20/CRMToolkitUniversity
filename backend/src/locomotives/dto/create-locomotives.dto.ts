import { IsString, IsNotEmpty, MaxLength, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateLocomotiveDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  locomotiveId: string;

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