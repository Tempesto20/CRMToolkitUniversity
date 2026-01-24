import React from 'react';
import styles from './AddLocationModal.module.scss';

interface AddLocationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: {
    locationName: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
}

const AddLocationModal: React.FC<AddLocationModalProps> = ({
  open,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  loading = false
}) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Добавление района</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.form}>
          <div className={styles.formGroup}>
            <label>Название района (location_name): *</label>
            <input
              type="text"
              name="locationName"
              value={formData.locationName}
              onChange={onInputChange}
              required
              className={styles.input}
              placeholder="Введите название района"
            />
          </div>
          
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
              disabled={!formData.locationName.trim() || loading}
            >
              {loading ? 'Добавление...' : 'Добавить район'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocationModal;