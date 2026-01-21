import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Locomotive } from '../locomotives/locomotives.entity';

@Entity('location_work')
export class LocationWork {
  @PrimaryGeneratedColumn({ 
    name: 'location_id'
  })
  locationId: number;

  @Column({ 
    type: 'varchar', 
    length: 100,
    name: 'location_name',
    default: 'не указан'
  })
  locationName: string;

  @OneToMany(() => Locomotive, locomotive => locomotive.location)
  locomotives: Locomotive[];
}