import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Employee } from '../employees/employees.entity';

@Entity('service_types')
export class ServiceType {
  @PrimaryColumn({ 
    type: 'integer',
    name: 'service_type_id'
  })
  serviceTypeId: number;

  @Column({ 
    type: 'varchar', 
    length: 50,
    name: 'service_type_name'
  })
  serviceTypeName: string;

  @OneToMany(() => Employee, employee => employee.serviceType)
  employees: Employee[];
}