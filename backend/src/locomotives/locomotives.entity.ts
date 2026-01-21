import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { LocationWork } from '../location-work/location-work.entity';
import { ServiceType } from '../service-types/service-types.entity';
import { WorkType } from '../work-types/work-types.entity';
import { Employee } from '../employees/employees.entity';

@Entity('locomotives')
export class Locomotive {
  @PrimaryColumn({ 
    type: 'varchar',
    length: 12,
    name: 'locomotive_id'
  })
  locomotiveId: string;

  @Column({ 
    type: 'varchar', 
    length: 50,
    name: 'locomotive_type',
    nullable: true
  })
  locomotiveType?: string;

  @Column({ 
    type: 'boolean',
    name: 'locomotive_depo',
    default: false
  })
  locomotiveDepo: boolean;

  @Column({ 
    type: 'boolean',
    name: 'operational_status',
    default: true
  })
  operationalStatus: boolean;

  @Column({ 
    type: 'varchar', 
    length: 50,
    name: 'locomotive_name',
    default: 'не указано'
  })
  locomotiveName: string;

  @ManyToOne(() => LocationWork, { nullable: true })
  @JoinColumn({ name: 'location_id' })
  location?: LocationWork;

  @ManyToOne(() => ServiceType, { nullable: true })
  @JoinColumn({ name: 'service_type_id' })
  serviceType?: ServiceType;

  @ManyToOne(() => WorkType, { nullable: true })
  @JoinColumn({ name: 'work_type_id' })
  workType?: WorkType;

  @OneToMany(() => Employee, employee => employee.locomotive)
  employees: Employee[];
}