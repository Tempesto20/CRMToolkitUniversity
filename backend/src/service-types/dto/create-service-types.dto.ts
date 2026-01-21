import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateServiceTypeDto {
  @IsNumber()
  @IsNotEmpty()
  serviceTypeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  serviceTypeName: string;
}