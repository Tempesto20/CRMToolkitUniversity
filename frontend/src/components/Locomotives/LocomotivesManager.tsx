import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLocomotives,
  fetchServiceTypes,
  fetchWorkTypes,
  fetchLocationWork,
  fetchAvailableLocomotives,
  fetchLocomotivesByService,
  fetchLocomotiveStats,
  createLocomotive,
  updateLocomotive,
  deleteLocomotive,
  clearLocomotivesByService,
  clearSuccessMessage,
  resetDeleteStatus
} from '../../redux/slices/locomotivesSlice';
import { RootState, AppDispatch } from '../../redux/store';
import styles from './LocomotivesManager.module.scss';

interface FormData {
  locomotiveId: string;
  locomotiveType: string;
  locomotiveDepo: boolean;
  operationalStatus: boolean;
  locomotiveName: string;
  locationId: string;
  serviceTypeId: string;
  workTypeId: string;
}

const LocomotivesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    locomotives,
    serviceTypes,
    workTypes,
    locations,
    availableLocomotives,
    locomotivesByService,
    stats,
    status,
    deleteStatus,
    error,
    successMessage
  } = useSelector((state: RootState) => state.locomotives);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<number | ''>('');
  const [selectedLocomotive, setSelectedLocomotive] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    locomotiveId: '',
    locomotiveType: '',
    locomotiveDepo: false,
    operationalStatus: true,
    locomotiveName: '',
    locationId: '',
    serviceTypeId: '',
    workTypeId: ''
  });
  const [locomotiveToDelete, setLocomotiveToDelete] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchLocomotives());
    dispatch(fetchServiceTypes());
    dispatch(fetchWorkTypes());
    dispatch(fetchLocationWork());
    dispatch(fetchLocomotiveStats());
  }, [dispatch]);

  useEffect(() => {
    if (selectedServiceType) {
      dispatch(fetchLocomotivesByService(selectedServiceType));
    } else {
      dispatch(clearLocomotivesByService());
    }
  }, [selectedServiceType, dispatch]);

  useEffect(() => {
    dispatch(fetchAvailableLocomotives());
  }, [locomotives]);

  const handleOpenDialog = (locomotive?: any) => {
    if (locomotive) {
      setSelectedLocomotive(locomotive);
      setFormData({
        locomotiveId: locomotive.locomotiveId,
        locomotiveType: locomotive.locomotiveType || '',
        locomotiveDepo: locomotive.locomotiveDepo || false,
        operationalStatus: locomotive.operationalStatus !== false,
        locomotiveName: locomotive.locomotiveName || '',
        locationId: locomotive.location?.locationId?.toString() || '',
        serviceTypeId: locomotive.serviceType?.serviceTypeId?.toString() || '',
        workTypeId: locomotive.workType?.workTypeId?.toString() || ''
      });
    } else {
      setSelectedLocomotive(null);
      setFormData({
        locomotiveId: '',
        locomotiveType: '',
        locomotiveDepo: false,
        operationalStatus: true,
        locomotiveName: '',
        locationId: '',
        serviceTypeId: '',
        workTypeId: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLocomotive(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (type === 'select-one') {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = () => {
    const processedData = {
      locomotiveId: formData.locomotiveId,
      locomotiveType: formData.locomotiveType,
      locomotiveDepo: formData.locomotiveDepo,
      operationalStatus: formData.operationalStatus,
      locomotiveName: formData.locomotiveName || `Локомотив ${formData.locomotiveId}`,
      locationId: formData.locationId ? parseInt(formData.locationId) : undefined,
      serviceTypeId: formData.serviceTypeId ? parseInt(formData.serviceTypeId) : undefined,
      workTypeId: formData.workTypeId ? parseInt(formData.workTypeId) : undefined
    };

    if (selectedLocomotive) {
      dispatch(updateLocomotive({
        id: selectedLocomotive.locomotiveId,
        ...processedData
      }));
    } else {
      dispatch(createLocomotive(processedData));
    }
    handleCloseDialog();
  };

  const handleOpenDeleteDialog = (locomotiveId: string, locomotiveNumber: string) => {
    setLocomotiveToDelete(locomotiveId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setLocomotiveToDelete(null);
  };

  const handleDelete = () => {
    if (locomotiveToDelete) {
      dispatch(deleteLocomotive(locomotiveToDelete));
      handleCloseDeleteDialog();
    }
  };

  const handleCloseSnackbar = () => {
    dispatch(clearSuccessMessage());
    if (deleteStatus === 'succeeded') {
      dispatch(resetDeleteStatus());
    }
  };

  const handleRefresh = () => {
    dispatch(fetchLocomotives());
    dispatch(fetchAvailableLocomotives());
    dispatch(fetchLocomotiveStats());
  };

  const handleServiceTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedServiceType(value === '' ? '' : parseInt(value));
  };

  // Функции для получения имен связанных сущностей
  const getServiceTypeName = (locomotive: any) => {
    return locomotive.serviceType?.serviceTypeName || 'Не указано';
  };

  const getWorkTypeName = (locomotive: any) => {
    return locomotive.workType?.workTypeName || 'Не указано';
  };

  const getLocationName = (locomotive: any) => {
    return locomotive.location?.locationName || 'Не указано';
  };

  const displayLocomotives = selectedServiceType ? locomotivesByService : locomotives;

  if (status === 'loading' && locomotives.length === 0) {
    return (
      <div className={styles.locomotivesManager}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error && locomotives.length === 0) {
    return (
      <div className={styles.locomotivesManager}>
        <div className={styles.errorMessage}>
          <p>Ошибка при загрузке данных: {error}</p>
          <button onClick={handleRefresh} className={styles.btnPrimary}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.locomotivesManager}>
      <div className={styles.pageHeader}>
        <h1>Управление локомотивами</h1>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <span className={styles.refreshIcon}>↻</span>
            Обновить
          </button>
          <button
            onClick={() => handleOpenDialog()}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <span className={styles.addIcon}>+</span>
            Добавить локомотив
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>🚂</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Всего локомотивов</p>
            <p className={styles.statValue}>{stats?.total || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.success}`}>
            <span>✓</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>На линии</p>
            <p className={styles.statValue}>{stats?.operational || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.warning}`}>
            <span>🔧</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>В депо</p>
            <p className={styles.statValue}>{stats?.nonOperational || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.info}`}>
            <span>🏭</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Виды службы</p>
            <p className={styles.statValue}>{serviceTypes.length}</p>
          </div>
        </div>
      </div>

      {/* Фильтр по виду службы */}
      <div className={styles.searchSection}>
        <h2>Фильтр по виду службы</h2>
        <div className={styles.filterControl}>
          <select
            value={selectedServiceType.toString()}
            onChange={handleServiceTypeChange}
            className={styles.formSelect}
          >
            <option value="">Все локомотивы</option>
            {serviceTypes.map((serviceType: any) => (
              <option key={serviceType.serviceTypeId} value={serviceType.serviceTypeId}>
                {serviceType.serviceTypeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Таблица локомотивов */}
      <div className={styles.tableContainer}>
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Тип</th>
                <th>Название</th>
                <th>вид службы</th>
                <th>Вид работ</th>
                <th>Место работы</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {displayLocomotives.map((locomotive: any) => (
                <tr key={locomotive.locomotiveId}>
                  <td>{locomotive.locomotiveId}</td>
                  <td>{locomotive.locomotiveType || 'Не указан'}</td>
                  <td>{locomotive.locomotiveName}</td>
                  <td>{getServiceTypeName(locomotive)}</td>
                  <td>{getWorkTypeName(locomotive)}</td>
                  <td>{getLocationName(locomotive)}</td>
                  <td>
                    <span className={`${styles.statusBadge} ${
                      locomotive.operationalStatus ? styles.success : styles.warning
                    }`}>
                      {locomotive.operationalStatus ? 'На линии' : 'В депо'}
                      {/* {locomotive.locomotiveDepo && ' В депо'} */}
                    </span>
                  </td>
                  <td className={styles.actionsCell}>
                    <button
                      onClick={() => handleOpenDialog(locomotive)}
                      className={`${styles.btnIcon} ${styles.btnEdit}`}
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleOpenDeleteDialog(locomotive.locomotiveId, locomotive.locomotiveName)}
                      className={`${styles.btnIcon} ${styles.btnDelete}`}
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {status === 'loading' && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Загрузка...</p>
          </div>
        )}
      </div>

      {/* Модальное окно добавления/редактирования */}
      {openDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedLocomotive ? 'Редактирование локомотива' : 'Добавление локомотива'}</h2>
              <button onClick={handleCloseDialog} className={styles.closeButton}>×</button>
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                      onChange={handleInputChange}
                      className={styles.checkbox}
                    />
                    В депо
                  </label>
                  
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="operationalStatus"
                      checked={formData.operationalStatus}
                      onChange={handleInputChange}
                      className={styles.checkbox}
                    />
                    Рабочий статус
                  </label>
                </div>
              </div>
              
              {/* Кнопки */}
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.submitButton}
                >
                  {selectedLocomotive ? 'Сохранить изменения' : 'Добавить локомотив'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {openDeleteDialog && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h2>Подтверждение удаления</h2>
              <button onClick={handleCloseDeleteDialog} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.form}>
              <div className={styles.deleteConfirm}>
                <div className={styles.deleteIcon}>
                  <span>⚠️</span>
                </div>
                <div className={styles.deleteMessage}>
                  <h3>Вы уверены, что хотите удалить локомотив?</h3>
                  <p>Это действие нельзя отменить. Все связанные данные будут также удалены.</p>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCloseDeleteDialog}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.deleteConfirmButton}
                  disabled={deleteStatus === 'loading'}
                >
                  {deleteStatus === 'loading' ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Уведомления */}
      {successMessage && (
        <div className={`${styles.notification} ${styles.success}`}>
          <p>{successMessage}</p>
          <button onClick={handleCloseSnackbar} className={styles.notificationClose}>×</button>
        </div>
      )}

      {deleteStatus === 'failed' && (
        <div className={`${styles.notification} ${styles.error}`}>
          <p>{error || 'Ошибка при удалении локомотива'}</p>
          <button onClick={handleCloseSnackbar} className={styles.notificationClose}>×</button>
        </div>
      )}
    </div>
  );
};

export default LocomotivesManager;