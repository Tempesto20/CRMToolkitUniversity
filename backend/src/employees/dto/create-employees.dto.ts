export class CreateEmployeeDto {
  readonly fullName: string;
  readonly position: string;
  readonly personalNumber: number;
  readonly serviceTypeId: number;
  readonly workTypeId: number;
  readonly brigadaId?: number;
  readonly locomotiveId?: string;
  readonly birthday?: number;
  readonly phone?: string;
  readonly hasTrip?: boolean;
  readonly hasCraneman?: boolean;
  readonly dieselAccess?: boolean;
  readonly electricAccess?: boolean;
}

export class CreateEmployeeWithPhotoDto extends CreateEmployeeDto {
  readonly photo?: Express.Multer.File;
}