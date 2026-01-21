import { IsString, IsNotEmpty, MaxLength, IsNumber } from 'class-validator';

export class CreateWorkTypeDto {
  @IsNumber()
  @IsNotEmpty()
  workTypeId: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  workTypeName: string;
}