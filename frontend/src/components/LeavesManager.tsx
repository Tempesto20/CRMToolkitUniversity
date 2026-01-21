import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchLeaves, 
  fetchActiveLeaves,
  fetchTodayLeaves,
  fetchLeavesStats,
  createLeave, 
  updateLeave, 
  deleteLeave,
  fetchEmployeeLeaves,
  clearEmployeeLeaves,
  fetchLeavesByPeriod,
  clearLeavesByPeriod
} from '../redux/slices/leavesSlice';
import styles from './LeavesManager.module.scss';

const LeavesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    leaves, 
    activeLeaves, 
    todayLeaves,
    employeeLeaves,
    leavesByPeriod,
    stats,
    status 
  } = useSelector((state: RootState) => state.leaves);
  
  const [newLeave, setNewLeave] = useState({
    employeePersonalNumber: '',
    leaveTypeId: '',
    startDate: '',
    endDate: ''
  });
  
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [viewMode, setViewMode] = useState<'all' | 'active' | 'today' | 'stats'>('all');

  useEffect(() => {
    dispatch(fetchLeaves());
    dispatch(fetchActiveLeaves());
    dispatch(fetchTodayLeaves());
    dispatch(fetchLeavesStats());
  }, [dispatch]);

  const handleCreate = () => {
    if (newLeave.employeePersonalNumber && newLeave.leaveTypeId && 
        newLeave.startDate && newLeave.endDate) {
      dispatch(createLeave({
        ...newLeave,
        employeePersonalNumber: parseInt(newLeave.employeePersonalNumber),
        leaveTypeId: parseInt(newLeave.leaveTypeId)
      }));
      setNewLeave({
        employeePersonalNumber: '',
        leaveTypeId: '',
        startDate: '',
        endDate: ''
      });
    }
  };

  const handleUpdate = (id: number) => {
    if (Object.keys(editData).length > 0) {
      const updateData: any = {};
      if (editData.leaveTypeId) updateData.leaveTypeId = parseInt(editData.leaveTypeId);
      if (editData.startDate) updateData.startDate = editData.startDate;
      if (editData.endDate) updateData.endDate = editData.endDate;
      
      dispatch(updateLeave({ id, ...updateData }));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить запись об отпуске?')) {
      dispatch(deleteLeave(id));
    }
  };

  const handleEmployeeSearch = () => {
    if (employeeSearch.trim()) {
      dispatch(fetchEmployeeLeaves(parseInt(employeeSearch)));
    }
  };

  const handlePeriodSearch = () => {
    if (periodStart && periodEnd) {
      dispatch(fetchLeavesByPeriod({ startDate: periodStart, endDate: periodEnd }));
    }
  };

  const startEdit = (leave: any) => {
    setEditingId(leave.leaveId);
    setEditData({
      leaveTypeId: leave.leaveType.leaveTypeId.toString(),
      startDate: leave.startDate.split('T')[0],
      endDate: leave.endDate.split('T')[0]
    });
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

  if (status === 'loading') {
    return <div>Загрузка отпусков...</div>;
  }

  const leavesToShow = () => {
    switch (viewMode) {
      case 'active': return activeLeaves;
      case 'today': return todayLeaves;
      case 'all': 
      default: return leaves;
    }
  };

  return (
    <div className={styles.leavesManager}>
      <h2>Управление отпусками сотрудников</h2>
      
      {/* Форма создания */}
      <div className={styles.createForm}>
        <h3>Оформить новый отпуск</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>Личный номер сотрудника:</label>
            <input
              type="number"
              placeholder="Личный номер"
              value={newLeave.employeePersonalNumber}
              onChange={(e) => setNewLeave({
                ...newLeave,
                employeePersonalNumber: e.target.value
              })}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Тип отпуска (ID):</label>
            <input
              type="number"
              placeholder="ID типа отпуска"
              value={newLeave.leaveTypeId}
              onChange={(e) => setNewLeave({
                ...newLeave,
                leaveTypeId: e.target.value
              })}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Дата начала:</label>
            <input
              type="date"
              value={newLeave.startDate}
              onChange={(e) => setNewLeave({
                ...newLeave,
                startDate: e.target.value
              })}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Дата окончания:</label>
            <input
              type="date"
              value={newLeave.endDate}
              onChange={(e) => setNewLeave({
                ...newLeave,
                endDate: e.target.value
              })}
            />
          </div>
        </div>
        <button onClick={handleCreate}>Оформить отпуск</button>
      </div>

      {/* Поисковые фильтры */}
      <div className={styles.filtersSection}>
        <h3>Фильтры и поиск</h3>
        <div className={styles.filterGrid}>
          <div className={styles.filterGroup}>
            <h4>Поиск по сотруднику</h4>
            <div className={styles.formGroup}>
              <input
                type="number"
                placeholder="Личный номер сотрудника"
                value={employeeSearch}
                onChange={(e) => setEmployeeSearch(e.target.value)}
              />
              <button onClick={handleEmployeeSearch}>Найти</button>
              {employeeSearch && (
                <button onClick={() => {
                  setEmployeeSearch('');
                  dispatch(clearEmployeeLeaves());
                }}>Очистить</button>
              )}
            </div>
            {employeeLeaves.length > 0 && (
              <div className={styles.employeeLeaves}>
                <h5>Отпуска сотрудника:</h5>
                <ul>
                  {employeeLeaves.map((leave) => (
                    <li key={leave.leaveId}>
                      {leave.leaveType.leaveTypeName}: {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className={styles.filterGroup}>
            <h4>Поиск по периоду</h4>
            <div className={styles.formGroup}>
              <input
                type="date"
                placeholder="Начало периода"
                value={periodStart}
                onChange={(e) => setPeriodStart(e.target.value)}
              />
              <input
                type="date"
                placeholder="Конец периода"
                value={periodEnd}
                onChange={(e) => setPeriodEnd(e.target.value)}
              />
              <button onClick={handlePeriodSearch}>Найти</button>
              {(periodStart || periodEnd) && (
                <button onClick={() => {
                  setPeriodStart('');
                  setPeriodEnd('');
                  dispatch(clearLeavesByPeriod());
                }}>Очистить</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Переключение режимов просмотра */}
      <div className={styles.viewToggle}>
        <button
          className={viewMode === 'all' ? styles.active : ''}
          onClick={() => setViewMode('all')}
        >
          Все отпуска
        </button>
        <button
          className={viewMode === 'active' ? styles.active : ''}
          onClick={() => setViewMode('active')}
        >
          Активные
        </button>
        <button
          className={viewMode === 'today' ? styles.active : ''}
          onClick={() => setViewMode('today')}
        >
          Сегодня
        </button>
        <button
          className={viewMode === 'stats' ? styles.active : ''}
          onClick={() => setViewMode('stats')}
        >
          Статистика
        </button>
      </div>

      {/* Статистика */}
      {viewMode === 'stats' && stats && (
        <div className={styles.statsSection}>
          <h3>Статистика отпусков</h3>
          <div className={styles.statsCards}>
            <div className={styles.statCard}>
              <h4>Всего отпусков</h4>
              <p className={styles.statNumber}>{stats.total}</p>
            </div>
            <div className={styles.statCard}>
              <h4>Активных</h4>
              <p className={`${styles.statNumber} ${styles.active}`}>{stats.active}</p>
            </div>
            <div className={styles.statCard}>
              <h4>Завершённых</h4>
              <p className={`${styles.statNumber} ${styles.completed}`}>{stats.completed}</p>
            </div>
          </div>
          
          {stats.typeStats && stats.typeStats.length > 0 && (
            <div className={styles.typeStats}>
              <h4>Распределение по типам</h4>
              <table className={styles.typeStatsTable}>
                <thead>
                  <tr>
                    <th>Тип отпуска</th>
                    <th>Количество</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.typeStats.map((stat: any) => (
                    <tr key={stat.typeName}>
                      <td>{stat.typeName}</td>
                      <td>{stat.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Список отпусков */}
      {viewMode !== 'stats' && (
        <div className={styles.leavesList}>
          <h3>
            {viewMode === 'all' && 'Все отпуска'}
            {viewMode === 'active' && 'Активные отпуска'}
            {viewMode === 'today' && 'Отпуска на сегодня'}
            ({leavesToShow().length})
          </h3>
          
          {leavesToShow().length === 0 ? (
            <p>Отпуска не найдены</p>
          ) : (
            <table className={styles.leavesTable}>
              <thead>
                <tr>
                  <th>Сотрудник</th>
                  <th>Тип отпуска</th>
                  <th>Период</th>
                  <th>Дней</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {leavesToShow().map((leave) => {
                  const today = new Date();
                  const startDate = new Date(leave.startDate);
                  const endDate = new Date(leave.endDate);
                  const isActive = endDate >= today;
                  const isCurrent = startDate <= today && endDate >= today;
                  
                  return (
                    <tr 
                      key={leave.leaveId}
                      className={isCurrent ? styles.currentLeave : ''}
                    >
                      <td>
                        {leave.employee?.fullName || `№${leave.employee?.personalNumber}`}
                      </td>
                      <td>
                        {editingId === leave.leaveId ? (
                          <input
                            type="number"
                            value={editData.leaveTypeId}
                            onChange={(e) => setEditData({
                              ...editData,
                              leaveTypeId: e.target.value
                            })}
                            style={{ width: '60px' }}
                          />
                        ) : (
                          leave.leaveType.leaveTypeName
                        )}
                      </td>
                      <td>
                        {editingId === leave.leaveId ? (
                          <div className={styles.dateEdit}>
                            <input
                              type="date"
                              value={editData.startDate}
                              onChange={(e) => setEditData({
                                ...editData,
                                startDate: e.target.value
                              })}
                            />
                            <span> - </span>
                            <input
                              type="date"
                              value={editData.endDate}
                              onChange={(e) => setEditData({
                                ...editData,
                                endDate: e.target.value
                              })}
                            />
                          </div>
                        ) : (
                          `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`
                        )}
                      </td>
                      <td>
                        {calculateDays(leave.startDate, leave.endDate)}
                      </td>
                      <td>
                        {isCurrent ? (
                          <span className={styles.statusCurrent}>Текущий</span>
                        ) : isActive ? (
                          <span className={styles.statusActive}>Предстоящий</span>
                        ) : (
                          <span className={styles.statusCompleted}>Завершён</span>
                        )}
                      </td>
                      <td className={styles.actions}>
                        {editingId === leave.leaveId ? (
                          <>
                            <button onClick={() => handleUpdate(leave.leaveId)}>
                              Сохранить
                            </button>
                            <button onClick={() => {
                              setEditingId(null);
                              setEditData({});
                            }}>
                              Отмена
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(leave)}>
                              Редактировать
                            </button>
                            <button 
                              onClick={() => handleDelete(leave.leaveId)}
                              className={styles.deleteBtn}
                            >
                              Удалить
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default LeavesManager;