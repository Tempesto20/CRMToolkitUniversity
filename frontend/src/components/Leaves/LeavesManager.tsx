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
import LeavesCard from './LeavesCard';
import AddLeavesModal from './modals/AddLeavesModal';
import EditLeavesModal from './modals/EditLeavesModal';
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

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false); // <-- ДОБАВЛЕНО
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [formData, setFormData] = useState<FormData>({
    employeePersonalNumber: '',
    leaveTypeId: '',
    startDate: '',
    endDate: ''
  });
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null); // <-- ДОБАВЛЕНО
  const [deleteEmployeeName, setDeleteEmployeeName] = useState<string>(''); // <-- ДОБАВЛЕНО

  useEffect(() => {
    dispatch(fetchLeaves(searchQuery));
    dispatch(fetchLeaveTypes());
    dispatch(fetchEmployees(searchQuery));
    dispatch(fetchLeaveStats());
  }, [dispatch, searchQuery]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setSearchQuery(e.target.value));
  };

  const handleOpenAddDialog = () => {
    setFormData({
      employeePersonalNumber: '',
      leaveTypeId: '',
      startDate: '',
      endDate: ''
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (leave: Leave) => {
    setSelectedLeave(leave);
    setFormData({
      leaveId: leave.leaveId,
      employeePersonalNumber: leave.employee.personalNumber.toString(),
      leaveTypeId: leave.leaveType.leaveTypeId.toString(),
      startDate: leave.startDate.split('T')[0],
      endDate: leave.endDate.split('T')[0]
    });
    setOpenEditDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedLeave(null);
  };

  // ДОБАВЛЕНО: Функция открытия модального окна удаления
  const handleOpenDeleteDialog = (leaveId: number, employeeName: string) => {
    setLeaveToDelete(leaveId);
    setDeleteEmployeeName(employeeName);
    setOpenDeleteDialog(true); // <-- ВАЖНО: Устанавливаем true
  };

  // ДОБАВЛЕНО: Функция закрытия модального окна удаления
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setLeaveToDelete(null);
    setDeleteEmployeeName('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitAdd = () => {
    const processedData: LeaveFormData = {
      employeePersonalNumber: formData.employeePersonalNumber,
      leaveTypeId: formData.leaveTypeId,
      startDate: formData.startDate,
      endDate: formData.endDate
    };
    
    dispatch(createLeave(processedData)).then(() => {
      dispatch(fetchLeaves(searchQuery));
      dispatch(fetchLeaveStats());
      handleCloseAddDialog();
    });
  };

  const handleSubmitEdit = () => {
    if (!selectedLeave) return;
    
    const updateData: any = {};
    if (formData.leaveTypeId) updateData.leaveTypeId = formData.leaveTypeId;
    if (formData.startDate) updateData.startDate = formData.startDate;
    if (formData.endDate) updateData.endDate = formData.endDate;
    
    dispatch(updateLeave({
      id: selectedLeave.leaveId,
      ...updateData
    })).then(() => {
      dispatch(fetchLeaves(searchQuery));
      dispatch(fetchLeaveStats());
      handleCloseEditDialog();
    });
  };

  // ДОБАВЛЕНО: Функция удаления
  const handleDelete = () => {
    if (leaveToDelete !== null) {
      dispatch(deleteLeave(leaveToDelete)).then(() => {
        // После успешного удаления обновляем данные
        dispatch(fetchLeaves(searchQuery));
        dispatch(fetchLeaveStats());
        handleCloseDeleteDialog();
      }).catch(error => {
        console.error('Error deleting leave:', error);
      });
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

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
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
            onClick={handleOpenAddDialog}
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

      {/* Карточки отпусков */}
      <LeavesCard
        leaves={leaves.filter(leave => leave.employee && leave.leaveType)}
        onEdit={handleOpenEditDialog}
        onDelete={handleOpenDeleteDialog} 
      />

      {/* Сообщение если нет данных */}
      {leaves.length === 0 && (
        <div className={styles.emptyState}>
          <p>Нет данных об отпусках</p>
          <button onClick={handleOpenAddDialog} className={styles.btnPrimary}>
            Добавить первый отпуск
          </button>
        </div>
      )}

      {/* Модальное окно добавления отпуска */}
      <AddLeavesModal
        isOpen={openAddDialog}
        onClose={handleCloseAddDialog}
        onSubmit={handleSubmitAdd}
        employees={employees}
        leaveTypes={leaveTypes}
        formData={formData}
        onFormChange={handleInputChange}
        calculateDays={calculateDays}
      />

      {/* Модальное окно редактирования отпуска */}
      <EditLeavesModal
        isOpen={openEditDialog}
        onClose={handleCloseEditDialog}
        onSubmit={handleSubmitEdit}
        leave={selectedLeave}
        leaveTypes={leaveTypes}
        formData={formData}
        onFormChange={handleInputChange}
        calculateDays={calculateDays}
      />

      {/* Модальное окно подтверждения удаления - ДОБАВЛЕНО */}
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