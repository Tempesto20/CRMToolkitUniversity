import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
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
} from '../store/leavesSlice';

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
    <div className="leaves-manager">
      <h2>Управление отпусками сотрудников</h2>
      
      {/* Форма создания */}
      <div className="create-form">
        <h3>Оформить новый отпуск</h3>
        <div className="form-grid">
          <div className="form-group">
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
          
          <div className="form-group">
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
          
          <div className="form-group">
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
          
          <div className="form-group">
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
      <div className="filters-section">
        <h3>Фильтры и поиск</h3>
        <div className="filter-grid">
          <div className="filter-group">
            <h4>Поиск по сотруднику</h4>
            <div className="form-group">
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
              <div className="employee-leaves">
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
          
          <div className="filter-group">
            <h4>Поиск по периоду</h4>
            <div className="form-group">
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
      <div className="view-toggle">
        <button
          className={viewMode === 'all' ? 'active' : ''}
          onClick={() => setViewMode('all')}
        >
          Все отпуска
        </button>
        <button
          className={viewMode === 'active' ? 'active' : ''}
          onClick={() => setViewMode('active')}
        >
          Активные
        </button>
        <button
          className={viewMode === 'today' ? 'active' : ''}
          onClick={() => setViewMode('today')}
        >
          Сегодня
        </button>
        <button
          className={viewMode === 'stats' ? 'active' : ''}
          onClick={() => setViewMode('stats')}
        >
          Статистика
        </button>
      </div>

      {/* Статистика */}
      {viewMode === 'stats' && stats && (
        <div className="stats-section">
          <h3>Статистика отпусков</h3>
          <div className="stats-cards">
            <div className="stat-card">
              <h4>Всего отпусков</h4>
              <p className="stat-number">{stats.total}</p>
            </div>
            <div className="stat-card">
              <h4>Активных</h4>
              <p className="stat-number active">{stats.active}</p>
            </div>
            <div className="stat-card">
              <h4>Завершённых</h4>
              <p className="stat-number completed">{stats.completed}</p>
            </div>
          </div>
          
          {stats.typeStats && stats.typeStats.length > 0 && (
            <div className="type-stats">
              <h4>Распределение по типам</h4>
              <table className="type-stats-table">
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
        <div className="leaves-list">
          <h3>
            {viewMode === 'all' && 'Все отпуска'}
            {viewMode === 'active' && 'Активные отпуска'}
            {viewMode === 'today' && 'Отпуска на сегодня'}
            ({leavesToShow().length})
          </h3>
          
          {leavesToShow().length === 0 ? (
            <p>Отпуска не найдены</p>
          ) : (
            <table className="leaves-table">
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
                      className={isCurrent ? 'current-leave' : ''}
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
                          <div className="date-edit">
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
                          <span className="status-current">Текущий</span>
                        ) : isActive ? (
                          <span className="status-active">Предстоящий</span>
                        ) : (
                          <span className="status-completed">Завершён</span>
                        )}
                      </td>
                      <td className="actions">
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
                              className="delete-btn"
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

      <style jsx>{`
        .leaves-manager {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        h2, h3, h4, h5 {
          color: #333;
          margin-bottom: 15px;
        }
        
        .create-form, .filters-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .form-grid, .filter-grid {
          display: grid;
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-grid {
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .filter-grid {
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        }
        
        .form-group, .filter-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .form-group {
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
        }
        
        label {
          font-weight: 500;
          color: #555;
          margin-bottom: 5px;
        }
        
        input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        input[type="number"] {
          width: 120px;
        }
        
        input[type="date"] {
          width: 150px;
        }
        
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          white-space: nowrap;
        }
        
        button:hover {
          background-color: #0056b3;
        }
        
        .delete-btn {
          background-color: #dc3545;
        }
        
        .delete-btn:hover {
          background-color: #c82333;
        }
        
        .view-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }
        
        .view-toggle button {
          background-color: #6c757d;
        }
        
        .view-toggle button.active {
          background-color: #007bff;
        }
        
        .employee-leaves {
          margin-top: 10px;
          padding: 10px;
          background-color: #e7f3ff;
          border-radius: 4px;
        }
        
        .employee-leaves ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .employee-leaves li {
          padding: 5px 0;
          border-bottom: 1px solid #d1e7ff;
        }
        
        .employee-leaves li:last-child {
          border-bottom: none;
        }
        
        .stats-section {
          margin-top: 20px;
        }
        
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          text-align: center;
          border: 1px solid #dee2e6;
        }
        
        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin: 10px 0 0 0;
        }
        
        .stat-number.active {
          color: #28a745;
        }
        
        .stat-number.completed {
          color: #6c757d;
        }
        
        .type-stats {
          margin-top: 30px;
        }
        
        .type-stats-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .type-stats-table th,
        .type-stats-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        
        .type-stats-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .leaves-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .leaves-table th,
        .leaves-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        
        .leaves-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .leaves-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .leaves-table tr:hover {
          background-color: #f1f1f1;
        }
        
        .leaves-table tr.current-leave {
          background-color: #fff3cd;
        }
        
        .date-edit {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .status-current, .status-active, .status-completed {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        
        .status-current {
          background-color: #ffc107;
          color: #856404;
        }
        
        .status-active {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-completed {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .actions {
          display: flex;
          gap: 5px;
          min-width: 180px;
        }
        
        @media (max-width: 768px) {
          .form-group {
            flex-direction: column;
            align-items: stretch;
          }
          
          input {
            width: 100%;
          }
          
          button {
            width: 100%;
            margin-top: 5px;
          }
          
          .actions {
            flex-direction: column;
            min-width: 120px;
          }
          
          .leaves-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default LeavesManager;