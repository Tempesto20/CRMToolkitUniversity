import React from 'react';
import styles from './EditLeavesModal.module.scss';

// Определяем интерфейсы локально
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

interface Leave {
  leaveId: number;
  employee: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
}

interface EditLeavesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  leave: Leave | null;
  leaveTypes: LeaveType[];
  formData: {
    leaveId?: number;
    employeePersonalNumber: string;
    leaveTypeId: string;
    startDate: string;
    endDate: string;
  };
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  calculateDays: (startDate: string, endDate: string) => number;
}

const EditLeavesModal: React.FC<EditLeavesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  leave,
  leaveTypes,
  formData,
  onFormChange,
  calculateDays
}) => {
  if (!isOpen || !leave) return null;

  const isFormValid = formData.leaveTypeId && 
                     formData.startDate && 
                     formData.endDate;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Редактирование отпуска</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.form}>
          <div className={styles.formGrid}>
            {/* Информация о сотруднике (только для чтения) */}
            <div className={styles.formGroup}>
              <label>Сотрудник:</label>
              <div className={styles.disabledInput}>
                {leave.employee.fullName} ({leave.employee.personalNumber})
              </div>
              <small className={styles.helperText}>Сотрудника нельзя изменить</small>
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
          
          {/* Дополнительная информация */}
          <div className={styles.additionalInfo}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Текущий тип отпуска:</span>
              <span className={styles.infoValue}>{leave.leaveType.leaveTypeName}</span>
            </div>
            {leave.employee.position && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Должность:</span>
                <span className={styles.infoValue}>{leave.employee.position}</span>
              </div>
            )}
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
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLeavesModal;