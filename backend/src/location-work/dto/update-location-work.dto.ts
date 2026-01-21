import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateLocationWorkDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  locationName?: string;
}