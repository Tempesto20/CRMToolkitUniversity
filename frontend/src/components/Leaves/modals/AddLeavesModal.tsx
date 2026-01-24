import React from 'react';
import styles from './AddLeavesModal.module.scss';

// альтернатива импорта из leavesSlice.ts
interface Employee {
  personalNumber: number;
  fullName: string;
  position?: string;
}

interface LeaveType {
  leaveTypeId: number;
  leaveTypeName: string;
  description?: string;
}

interface AddLeavesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  employees: Employee[];
  leaveTypes: LeaveType[];
  formData: {
    employeePersonalNumber: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  calculateDays: (startDate: string, endDate: string) => number;
}

const AddLeavesModal: React.FC<AddLeavesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  leaveTypes,
  formData,
  onFormChange,
  calculateDays
}) => {
  if (!isOpen) return null;

  const isFormValid = formData.employeePersonalNumber && 
                     formData.leaveTypeId && 
                     formData.startDate && 
                     formData.endDate;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Добавление отпуска</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.form}>
          <div className={styles.formGrid}>
            {/* Сотрудник */}
            <div className={styles.formGroup}>
              <label>Сотрудник: *</label>
              <select
                name="employeePersonalNumber"
                value={formData.employeePersonalNumber}
                onChange={onFormChange}
                required
                className={styles.select}
              >
                <option value="">-- Выберите сотрудника --</option>
                {employees.map((employee) => (
                  <option key={employee.personalNumber} value={employee.personalNumber}>
                    {employee.fullName} ({employee.personalNumber})
                  </option>
                ))}
              </select>
            </div>
            
            {/* Тип отпуска */}
            <div className={styles.formGroup}>
              <label>Тип отпуска: *</label>
              <select
                name="leaveTypeId"
                value={formData.leaveTypeId}
                onChange={onFormChange}
                required
                className={styles.select}
              >
                <option value="">-- Выберите тип отпуска --</option>
                {leaveTypes.map((leaveType) => (
                  <option key={leaveType.leaveTypeId} value={leaveType.leaveTypeId}>
                    {leaveType.leaveTypeName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Дата начала */}
            <div className={styles.formGroup}>
              <label>Дата начала: *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={onFormChange}
                required
                className={styles.input}
              />
            </div>
            
            {/* Дата окончания */}
            <div className={styles.formGroup}>
              <label>Дата окончания: *</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={onFormChange}
                required
                className={styles.input}
                min={formData.startDate}
              />
              {formData.startDate && formData.endDate && (
                <small className={styles.helperText}>
                  Продолжительность: {calculateDays(formData.startDate, formData.endDate)} дней
                </small>
              )}
            </div>
          </div>
          
          {/* Кнопки */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className={styles.submitButton}
              disabled={!isFormValid}
            >
              Добавить отпуск
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLeavesModal;