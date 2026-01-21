import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('brigada')
export class Brigada {
  @PrimaryColumn({ 
    type: 'integer',
    name: 'brigada_id'
  })
  brigadaId: number;

  @Column({ 
    type: 'varchar', 
    length: 50,
    name: 'brigada_name'
  })
  brigadaName: string;
}