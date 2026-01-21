import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateLocationWorkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  locationName: string;
}