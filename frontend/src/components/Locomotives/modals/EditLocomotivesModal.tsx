import React from 'react';
import styles from './EditLocomotivesModal.module.scss';

interface EditLocomotivesModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  serviceTypes: any[];
  workTypes: any[];
  locations: any[];
  selectedLocomotive: any;
}

const EditLocomotivesModal: React.FC<EditLocomotivesModalProps> = ({
  open,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  serviceTypes,
  workTypes,
  locations,
  selectedLocomotive
}) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Редактирование локомотива</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>
        
        <div className={styles.form}>
          <div className={styles.formGrid}>
            {/* ID локомотива */}
            <div className={styles.formGroup}>
              <label>ID локомотива: *</label>
              <input
                type="text"
                name="locomotiveId"
                value={formData.locomotiveId}
                onChange={onInputChange}
                required
                disabled={!!selectedLocomotive}
                className={selectedLocomotive ? styles.disabledInput : styles.input}
                placeholder="Введите ID локомотива"
              />
              {selectedLocomotive && (
                <small className={styles.helperText}>ID локомотива нельзя изменить</small>
              )}
            </div>
            
            {/* Тип локомотива */}
            <div className={styles.formGroup}>
              <label>Тип локомотива:</label>
              <input
                type="text"
                name="locomotiveType"
                value={formData.locomotiveType}
                onChange={onInputChange}
                className={styles.input}
                placeholder="электровоз, тепловоз и т.д."
              />
            </div>
            
            {/* Название */}
            <div className={styles.formGroup}>
              <label>Название:</label>
              <input
                type="text"
                name="locomotiveName"
                value={formData.locomotiveName}
                onChange={onInputChange}
                className={styles.input}
                placeholder="Название локомотива"
              />
            </div>
            
            {/* Вид службы */}
            <div className={styles.formGroup}>
              <label>Вид службы:</label>
              <select
                name="serviceTypeId"
                value={formData.serviceTypeId}
                onChange={onInputChange}
                className={styles.select}
              >
                <option value="">-- Выберите вид службы --</option>
                {serviceTypes.map((serviceType: any) => (
                  <option key={serviceType.serviceTypeId} value={serviceType.serviceTypeId}>
                    {serviceType.serviceTypeName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Вид работ */}
            <div className={styles.formGroup}>
              <label>Вид работ:</label>
              <select
                name="workTypeId"
                value={formData.workTypeId}
                onChange={onInputChange}
                className={styles.select}
              >
                <option value="">-- Выберите вид работ --</option>
                {workTypes.map((workType: any) => (
                  <option key={workType.workTypeId} value={workType.workTypeId}>
                    {workType.workTypeName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Место работы */}
            <div className={styles.formGroup}>
              <label>Место работы:</label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={onInputChange}
                className={styles.select}
              >
                <option value="">-- Выберите место работы --</option>
                {locations.map((location: any) => (
                  <option key={location.locationId} value={location.locationId}>
                    {location.locationName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Чекбоксы */}
          <div className={styles.checkboxSection}>
            <h3>Статусы:</h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="locomotiveDepo"
                  checked={formData.locomotiveDepo}
                  onChange={onInputChange}
                  className={styles.checkbox}
                />
                В депо
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="operationalStatus"
                  checked={formData.operationalStatus}
                  onChange={onInputChange}
                  className={styles.checkbox}
                />
                На линии
              </label>
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
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLocomotivesModal;