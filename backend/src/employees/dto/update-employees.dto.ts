import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  readonly fullName?: string;

  @IsOptional()
  @IsString()
  readonly position?: string;

  @IsOptional()
  @IsNumber()
  readonly serviceTypeId?: number;

  @IsOptional()
  @IsNumber()
  readonly workTypeId?: number;

  @IsOptional()
  @IsNumber()
  readonly brigadaId?: number;

  @IsOptional()
  @IsString()
  readonly locomotiveId?: string;

  @IsOptional()
  @IsNumber()
  readonly birthday?: number;

  @IsOptional()
  @IsString()
  readonly phone?: string;

  @IsOptional()
  @IsBoolean()
  readonly hasTrip?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly hasCraneman?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly dieselAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  readonly electricAccess?: boolean;
}

export class UpdateEmployeeWithPhotoDto extends UpdateEmployeeDto {
  @IsOptional()
  readonly photo?: any;
}