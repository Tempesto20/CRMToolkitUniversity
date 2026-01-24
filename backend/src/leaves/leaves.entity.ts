

// backend/src/leaves/leaves.entity.ts
import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { Employee } from '../employees/employees.entity';
import { LeaveType } from '../leave-types/leave-types.entity';

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn({ 
    name: 'leave_id'
  })
  leaveId: number;

  @ManyToOne(() => Employee, { nullable: false, eager: true }) // Добавлен eager: true
  @JoinColumn({ name: 'employee_personal_number' })
  employee: Employee;

  @ManyToOne(() => LeaveType, { nullable: false, eager: true }) // Добавлен eager: true
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;

  @Column({ 
    type: 'date',
    name: 'start_date'
  })
  startDate: Date;

  @Column({ 
    type: 'date',
    name: 'end_date'
  })
  endDate: Date;
}