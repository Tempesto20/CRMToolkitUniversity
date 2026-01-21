import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Employee } from '../employees/employees.entity';

@Entity('work_types')
export class WorkType {
  @PrimaryColumn({ 
    type: 'integer',
    name: 'work_type_id'
  })
  workTypeId: number;

  @Column({ 
    type: 'varchar', 
    length: 100,
    name: 'work_type_name'
  })
  workTypeName: string;

  @OneToMany(() => Employee, employee => employee.workType)
  employees: Employee[];
}