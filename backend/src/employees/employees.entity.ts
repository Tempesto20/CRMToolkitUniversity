import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ServiceType } from '../service-types/service-types.entity';
import { WorkType } from '../work-types/work-types.entity';
import { Locomotive } from '../locomotives/locomotives.entity';
import { Brigada } from '../brigada/brigada.entity';

@Entity('employees')
export class Employee {
  @PrimaryColumn({ type: 'integer', name: 'personal_number' })
  personalNumber: number;

  @Column({ type: 'varchar', length: 120, name: 'full_name' })
  fullName: string;

  @Column({ type: 'varchar', length: 20 })
  position: string;

  @Column({ type: 'integer', nullable: true })
  birthday?: number;

  @Column({ type: 'varchar', length: 60, nullable: true })
  phone?: string;

  @Column({ type: 'boolean', name: 'has_trip', default: false })
  hasTrip: boolean;

  @Column({ type: 'boolean', name: 'has_craneman', default: false })
  hasCraneman: boolean;

  @Column({ type: 'boolean', name: 'diesel_access', default: false })
  dieselAccess: boolean;

  @Column({ type: 'boolean', name: 'electric_access', default: false })
  electricAccess: boolean;

  @Column({ type: 'varchar', length: 255, name: 'photo_path', nullable: true })
  photoPath?: string;

  @Column({ type: 'varchar', length: 255, name: 'photo_filename', nullable: true })
  photoFilename?: string;

  @Column({ type: 'varchar', length: 100, name: 'photo_mimetype', nullable: true })
  photoMimetype?: string;

  @ManyToOne(() => ServiceType, { nullable: false })
  @JoinColumn({ name: 'service_type_id' })
  serviceType: ServiceType;

  @ManyToOne(() => WorkType, { nullable: false })
  @JoinColumn({ name: 'work_type_id' })
  workType: WorkType;

  @ManyToOne(() => Locomotive, { nullable: true })
  @JoinColumn({ name: 'locomotive_id' })
  locomotive?: Locomotive;

  @ManyToOne(() => Brigada, { nullable: true })
  @JoinColumn({ name: 'brigada_id' })
  brigada?: Brigada;
}