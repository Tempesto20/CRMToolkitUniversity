// src/pages/LeavesManager/LeavesManager.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchLeaves,
  fetchLeaveTypes,
  fetchEmployees,
  fetchLeaveStats,
  createLeave,
  updateLeave,
  deleteLeave,
  clearSuccessMessage,
  resetDeleteStatus,
  setSearchQuery,
  LeaveFormData,
  Leave
} from '../../redux/slices/leavesSlice';
import { RootState, AppDispatch } from '../../redux/store';
import styles from './LeavesManager.module.scss';

interface FormData {
  leaveId?: number;
  employeePersonalNumber: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
}

const LeavesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    leaves,
    leaveTypes,
    employees,
    stats,
    status,
    deleteStatus,
    error,
    successMessage,
    searchQuery
  } = useSelector((state: RootState) => state.leaves);

  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employeePersonalNumber: '',
    leaveTypeId: '',
    startDate: '',
    endDate: ''
  });
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);
  const [deleteEmployeeName, setDeleteEmployeeName] = useState<string>('');

  useEffect(() => {
    dispatch(fetchLeaves(searchQuery));
    dispatch(fetchLeaveTypes());
    dispatch(fetchEmployees(searchQuery));
    dispatch(fetchLeaveStats());
  }, [dispatch, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleOpenDialog = (leave?: Leave) => {
    if (leave) {
      setSelectedLeave(leave);
      setFormData({
        leaveId: leave.leaveId,
        employeePersonalNumber: leave.employee.personalNumber.toString(),
        leaveTypeId: leave.leaveType.leaveTypeId.toString(),
        startDate: leave.startDate.split('T')[0],
        endDate: leave.endDate.split('T')[0]
      });
    } else {
      setSelectedLeave(null);
      setFormData({
        employeePersonalNumber: '',
        leaveTypeId: '',
        startDate: '',
        endDate: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedLeave(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

const handleSubmit = () => {
  console.log('Submitting form data:', formData);
  
  if (selectedLeave) {
    console.log('Updating leave with ID:', selectedLeave.leaveId);
    
    const updateData: any = {};
    if (formData.leaveTypeId) updateData.leaveTypeId = formData.leaveTypeId;
    if (formData.startDate) updateData.startDate = formData.startDate;
    if (formData.endDate) updateData.endDate = formData.endDate;
    
    dispatch(updateLeave({
      id: selectedLeave.leaveId,
      ...updateData
    })).then((result) => {
      console.log('Update result:', result);
      // После успешного обновления
      dispatch(fetchLeaves(searchQuery));
      dispatch(fetchLeaveStats());
    }).catch(error => {
      console.error('Update failed:', error);
    });
  } else {
    const processedData: LeaveFormData = {
      employeePersonalNumber: formData.employeePersonalNumber,
      leaveTypeId: formData.leaveTypeId,
      startDate: formData.startDate,
      endDate: formData.endDate
    };
    
    dispatch(createLeave(processedData)).then(() => {
      // После успешного создания
      dispatch(fetchLeaves(searchQuery));
      dispatch(fetchLeaveStats());
    });
  }
  handleCloseDialog();
};

  const handleOpenDeleteDialog = (leaveId: number, employeeName: string) => {
    setLeaveToDelete(leaveId);
    setDeleteEmployeeName(employeeName);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setLeaveToDelete(null);
    setDeleteEmployeeName('');
  };

  const handleDelete = () => {
    if (leaveToDelete !== null) {
      dispatch(deleteLeave(leaveToDelete));
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
    dispatch(fetchLeaves(searchQuery));
    dispatch(fetchLeaveStats());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const isCurrentLeave = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(endDate) >= today;
  };

  if (status === 'loading' && leaves.length === 0) {
    return (
      <div className={styles.leavesManager}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error && leaves.length === 0) {
    return (
      <div className={styles.leavesManager}>
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
    <div className={styles.leavesManager}>
      <div className={styles.pageHeader}>
        <h1>Управление отпусками</h1>
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
            Добавить отпуск
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>🏖️</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Всего отпусков</p>
            <p className={styles.statValue}>{stats?.total || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.success}`}>
            <span>✓</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Текущие</p>
            <p className={styles.statValue}>{stats?.active || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.warning}`}>
            <span>📅</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Завершенные</p>
            <p className={styles.statValue}>{stats?.completed || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.info}`}>
            <span>📊</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Типы отпусков</p>
            <p className={styles.statValue}>{leaveTypes.length}</p>
          </div>
        </div>
      </div>

      {/* Поиск */}
      <div className={styles.searchSection}>
        <h2>Поиск сотрудников</h2>
        <div className={styles.searchControl}>
          <input
            type="text"
            placeholder="Поиск по ФИО или табельному номеру..."
            value={searchQuery}
            onChange={handleSearchChange}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => dispatch(setSearchQuery(''))}
              className={styles.clearSearchButton}
              title="Очистить поиск"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Таблица отпусков */}
      <div className={styles.tableContainer}>
        <div className={styles.tableResponsive}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Сотрудник</th>
                <th>Табельный номер</th>
                <th>Тип отпуска</th>
                <th>Начало</th>
                <th>Окончание</th>
                <th>Дней</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>

<tbody>
  {leaves.map((leave) => {
    // Проверяем, есть ли необходимые данные
    if (!leave.employee || !leave.leaveType) {
      return null; // Пропускаем некорректные записи
    }
    
    const days = calculateDays(leave.startDate, leave.endDate);
    const isActive = isCurrentLeave(leave.endDate);
    
    return (
      <tr key={leave.leaveId}>
        <td>{leave.leaveId}</td>
        <td>
          <div className={styles.employeeInfo}>
            <strong>{leave.employee.fullName}</strong>
            {leave.employee.position && (
              <small>{leave.employee.position}</small>
            )}
          </div>
        </td>
        <td>{leave.employee.personalNumber}</td>
        <td>{leave.leaveType.leaveTypeName}</td>
        <td>{formatDate(leave.startDate)}</td>
        <td>{formatDate(leave.endDate)}</td>
        <td>{days}</td>
        <td>
          <span className={`${styles.statusBadge} ${
            isActive ? styles.success : styles.warning
          }`}>
            {isActive ? 'Текущий' : 'Завершен'}
          </span>
        </td>
        <td className={styles.actionsCell}>
          <button
            onClick={() => handleOpenDialog(leave)}
            className={`${styles.btnIcon} ${styles.btnEdit}`}
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={() => handleOpenDeleteDialog(leave.leaveId, leave.employee.fullName)}
            className={`${styles.btnIcon} ${styles.btnDelete}`}
            title="Удалить"
          >
            🗑️
          </button>
        </td>
      </tr>
    );
  })}
</tbody>
          </table>
        </div>
        {status === 'loading' && (
          <div className={styles.loadingOverlay}>
            <div className={styles.spinner}></div>
            <p>Загрузка...</p>
          </div>
        )}
        {leaves.length === 0 && (
          <div className={styles.emptyState}>
            <p>Нет данных об отпусках</p>
          </div>
        )}
      </div>

      {/* Модальное окно добавления/редактирования */}
      {openDialog && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{selectedLeave ? 'Редактирование отпуска' : 'Добавление отпуска'}</h2>
              <button onClick={handleCloseDialog} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.form}>
              <div className={styles.formGrid}>
                {/* Сотрудник */}
                <div className={styles.formGroup}>
                  <label>Сотрудник: *</label>
                  <select
                    name="employeePersonalNumber"
                    value={formData.employeePersonalNumber}
                    onChange={handleInputChange}
                    required
                    disabled={!!selectedLeave}
                    className={selectedLeave ? styles.disabledInput : styles.select}
                  >
                    <option value="">-- Выберите сотрудника --</option>
                    {employees.map((employee) => (
                      <option key={employee.personalNumber} value={employee.personalNumber}>
                        {employee.fullName} ({employee.personalNumber})
                      </option>
                    ))}
                  </select>
                  {selectedLeave && (
                    <small className={styles.helperText}>Сотрудника нельзя изменить</small>
                  )}
                </div>
                
                {/* Тип отпуска */}
                <div className={styles.formGroup}>
                  <label>Тип отпуска: *</label>
                  <select
                    name="leaveTypeId"
                    value={formData.leaveTypeId}
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                  onClick={handleCloseDialog}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className={styles.submitButton}
                  disabled={!formData.employeePersonalNumber || !formData.leaveTypeId || !formData.startDate || !formData.endDate}
                >
                  {selectedLeave ? 'Сохранить изменения' : 'Добавить отпуск'}
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
                  <h3>Вы уверены, что хотите удалить отпуск?</h3>
                  <p>
                    Отпуск сотрудника <strong>{deleteEmployeeName}</strong> будет удален.
                  </p>
                  <p>Это действие нельзя отменить. Все данные об отпуске будут удалены.</p>
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
          <p>{error || 'Ошибка при удалении отпуска'}</p>
          <button onClick={handleCloseSnackbar} className={styles.notificationClose}>×</button>
        </div>
      )}
    </div>
  );
};

export default LeavesManager;