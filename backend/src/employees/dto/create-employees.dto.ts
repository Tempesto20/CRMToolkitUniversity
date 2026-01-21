import { IsString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  readonly fullName: string;

  @IsString()
  readonly position: string;

  @IsNumber()
  readonly personalNumber: number;

  @IsNumber()
  readonly serviceTypeId: number;

  @IsNumber()
  readonly workTypeId: number;

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

export class CreateEmployeeWithPhotoDto extends CreateEmployeeDto {
  @IsOptional()
  readonly photo?: any;
}