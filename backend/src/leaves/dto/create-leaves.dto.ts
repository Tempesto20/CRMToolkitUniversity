import { 
  IsNumber, 
  IsNotEmpty, 
  IsDateString, 
  IsOptional, 
  Validate,
  ValidationArguments, 
  ValidatorConstraint, 
  ValidatorConstraintInterface 
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateAfter', async: false })
export class IsDateAfterConstraint implements ValidatorConstraintInterface {
  validate(propertyValue: string, args: ValidationArguments) {
    const startDate = new Date(propertyValue);
    const endDate = new Date(args.object[args.constraints[0]]);
    return startDate > endDate;
  }

  defaultMessage(args: ValidationArguments) {
    return `End date must be after start date`;
  }
}

export class CreateLeaveDto {
  @IsNumber()
  @IsNotEmpty()
  employeePersonalNumber: number;

  @IsNumber()
  @IsNotEmpty()
  leaveTypeId: number;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  @Validate(IsDateAfterConstraint, ['startDate'])
  endDate: string;
}