import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Leave } from '../leaves/leaves.entity';

@Entity('leave_types')
export class LeaveType {
  @PrimaryColumn({ 
    type: 'integer',
    name: 'leave_type_id'
  })
  leaveTypeId: number;

  @Column({ 
    type: 'varchar', 
    length: 100,
    name: 'leave_type_name'
  })
  leaveTypeName: string;

  @Column({ 
    type: 'text',
    nullable: true
  })
  description: string;

  @OneToMany(() => Leave, leave => leave.leaveType)
  leaves: Leave[];
}