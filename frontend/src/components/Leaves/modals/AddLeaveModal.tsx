import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './AddLeaveModal.module.scss';
import { AppDispatch } from '../../../redux/store';
import { createLeave } from '../../../redux/slices/leavesSlice';

interface AddLeaveModalProps {
  visible: boolean;
  onCancel: () => void;
  employees: any[];
  leaveTypes: any[];
  refreshLeaves: () => void;
}

interface FormData {
  employee_personal_number: string;
  leave_type_id: string;
  start_date: string;
  end_date: string;
}

const AddLeaveModal: React.FC<AddLeaveModalProps> = ({
  visible,
  onCancel,
  employees,
  leaveTypes,
  refreshLeaves
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    employee_personal_number: '',
    leave_type_id: '',
    start_date: '',
    end_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.employee_personal_number) {
      newErrors.employee_personal_number = 'Выберите сотрудника';
    }

    if (!formData.leave_type_id) {
      newErrors.leave_type_id = 'Выберите тип отпуска';
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Введите дату начала';
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Введите дату окончания';
    }

    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);

      if (endDate < startDate) {
        newErrors.end_date = 'Дата окончания не может быть раньше даты начала';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const leaveData = {
        employee_personal_number: parseInt(formData.employee_personal_number),
        leave_type_id: parseInt(formData.leave_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date
      };

      await dispatch(createLeave(leaveData)).unwrap();

      onCancel();
      resetForm();
      refreshLeaves();

      // Показываем сообщение об успехе
      const successMessage = document.createElement('div');
      successMessage.className = styles.successMessage;
      successMessage.textContent = 'Отпуск успешно создан!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);

    } catch (err: any) {
      console.error('Error creating leave:', err);
      
      let errorMessage = 'Ошибка при создании отпуска';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      const errorDiv = document.createElement('div');
      errorDiv.className = styles.errorMessage;
      errorDiv.textContent = errorMessage;
      document.body.appendChild(errorDiv);

      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      employee_personal_number: '',
      leave_type_id: '',
      start_date: '',
      end_date: ''
    });
    setErrors({});
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Создание нового отпуска</h2>
          <button onClick={onCancel} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinContainer}>
                <div className={styles.spinner}></div>
                <div className={styles.spinText}>Создание...</div>
              </div>
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Сотрудник: *</label>
            <select
              name="employee_personal_number"
              value={formData.employee_personal_number}
              onChange={handleChange}
              required
              className={`${styles.select} ${errors.employee_personal_number ? styles.selectError : ''}`}
              disabled={loading}
            >
              <option value="">-- Выберите сотрудника --</option>
              {employees.map(employee => (
                <option
                  key={employee.personalNumber}
                  value={employee.personalNumber.toString()}
                >
                  {employee.fullName} ({employee.personalNumber})
                </option>
              ))}
            </select>
            {errors.employee_personal_number && (
              <div className={styles.errorText}>{errors.employee_personal_number}</div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Тип отпуска: *</label>
            <select
              name="leave_type_id"
              value={formData.leave_type_id}
              onChange={handleChange}
              required
              className={`${styles.select} ${errors.leave_type_id ? styles.selectError : ''}`}
              disabled={loading}
            >
              <option value="">-- Выберите тип отпуска --</option>
              {leaveTypes.map(type => (
                <option
                  key={type.leave_type_id}
                  value={type.leave_type_id.toString()}
                >
                  {type.leave_type_name}
                </option>
              ))}
            </select>
            {errors.leave_type_id && (
              <div className={styles.errorText}>{errors.leave_type_id}</div>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Дата начала: *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className={`${styles.input} ${errors.start_date ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.start_date && (
                <div className={styles.errorText}>{errors.start_date}</div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label>Дата окончания: *</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className={`${styles.input} ${errors.end_date ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.end_date && (
                <div className={styles.errorText}>{errors.end_date}</div>
              )}
            </div>
          </div>

          {/* Кнопки */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCancel();
              }}
              className={styles.cancelButton}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Создание...' : 'Создать отпуск'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLeaveModal;