import React from 'react';
import styles from './EditLocationModal.module.scss';

interface EditLocationModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  selectedLocation: any | null;
  formData: {
    locationName: string;
  };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  loading?: boolean;
}

const EditLocationModal: React.FC<EditLocationModalProps> = ({
  open,
  onClose,
  onSubmit,
  selectedLocation,
  formData,
  onInputChange,
  loading = false
}) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Редактирование района</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.form}>
          {selectedLocation && (
            <div className={styles.formGroup}>
              <label>ID района:</label>
              <div className={styles.idDisplay}>
                <span className={styles.idValue}>{selectedLocation.locationId}</span>
                <small className={styles.helperText}>ID присваивается автоматически и не может быть изменен</small>
              </div>
            </div>
          )}
          
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
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLocationModal;