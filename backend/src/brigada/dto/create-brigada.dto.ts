import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateBrigadaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  brigadaName: string;
}