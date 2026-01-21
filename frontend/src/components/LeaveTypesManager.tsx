import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchLeaveTypes, 
  fetchLeaveTypesStats,
  createLeaveType, 
  updateLeaveType, 
  deleteLeaveType,
  searchLeaveTypes,
  clearSearchResults
} from '../redux/slices/leaveTypesSlice';
import styles from './LeaveTypesManager.module.scss';

const LeaveTypesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    leaveTypes, 
    leaveTypesStats, 
    searchResults,
    status 
  } = useSelector((state: RootState) => state.leaveTypes);
  
  const [newLeaveType, setNewLeaveType] = useState({
    leaveTypeId: '',
    leaveTypeName: '',
    description: ''
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  useEffect(() => {
    dispatch(fetchLeaveTypes());
    dispatch(fetchLeaveTypesStats());
  }, [dispatch]);

  const handleCreate = () => {
    if (newLeaveType.leaveTypeId && newLeaveType.leaveTypeName) {
      dispatch(createLeaveType({
        leaveTypeId: parseInt(newLeaveType.leaveTypeId),
        leaveTypeName: newLeaveType.leaveTypeName,
        description: newLeaveType.description || undefined
      }));
      setNewLeaveType({
        leaveTypeId: '',
        leaveTypeName: '',
        description: ''
      });
    }
  };

  const handleUpdate = (id: number) => {
    if (editData.leaveTypeName?.trim()) {
      dispatch(updateLeaveType({ id, ...editData }));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить тип отпуска?')) {
      dispatch(deleteLeaveType(id));
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchLeaveTypes(searchTerm));
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(clearSearchResults());
  };

  const startEdit = (leaveType: any) => {
    setEditingId(leaveType.leaveTypeId);
    setEditData({
      leaveTypeName: leaveType.leaveTypeName,
      description: leaveType.description || ''
    });
  };

  if (status === 'loading') {
    return <div>Загрузка типов отпусков...</div>;
  }

  const leaveTypesToShow = searchTerm ? searchResults : leaveTypes;
  const showStats = viewMode === 'stats' && leaveTypesStats.length > 0;

  return (
    <div className={styles.leaveTypesManager}>
      <h2>Управление типами отпусков</h2>
      
      {/* Форма создания */}
      <div className={styles.createForm}>
        <h3>Добавить новый тип отпуска</h3>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label>ID типа отпуска:</label>
            <input
              type="number"
              placeholder="ID"
              value={newLeaveType.leaveTypeId}
              onChange={(e) => setNewLeaveType({
                ...newLeaveType,
                leaveTypeId: e.target.value
              })}
            />
          </div>
          
          <div className={styles.formGroup}>
            <label>Название типа:</label>
            <input
              type="text"
              placeholder="Название типа отпуска"
              value={newLeaveType.leaveTypeName}
              onChange={(e) => setNewLeaveType({
                ...newLeaveType,
                leaveTypeName: e.target.value
              })}
            />
          </div>
          
          <div className={`${styles.formGroup} ${styles.fullWidth}`}>
            <label>Описание:</label>
            <textarea
              placeholder="Описание типа отпуска"
              value={newLeaveType.description}
              onChange={(e) => setNewLeaveType({
                ...newLeaveType,
                description: e.target.value
              })}
              rows={3}
            />
          </div>
        </div>
        <button onClick={handleCreate}>Создать тип отпуска</button>
      </div>

      {/* Поиск */}
      <div className={styles.searchSection}>
        <h3>Поиск типов отпусков</h3>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Поиск по названию или описанию"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Поиск</button>
          {searchTerm && (
            <button onClick={handleClearSearch}>Очистить</button>
          )}
        </div>
      </div>

      {/* Переключение режимов просмотра */}
      <div className={styles.viewToggle}>
        <button
          className={viewMode === 'list' ? styles.active : ''}
          onClick={() => setViewMode('list')}
        >
          Список
        </button>
        <button
          className={viewMode === 'stats' ? styles.active : ''}
          onClick={() => setViewMode('stats')}
        >
          Статистика
        </button>
      </div>

      {/* Таблица статистики */}
      {showStats && (
        <div className={styles.statsSection}>
          <h3>Статистика по типам отпусков</h3>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Тип отпуска</th>
                <th>Описание</th>
                <th>Всего отпусков</th>
                <th>Активные</th>
              </tr>
            </thead>
            <tbody>
              {leaveTypesStats.map((stat) => (
                <tr key={stat.leaveTypeId}>
                  <td><strong>{stat.leavetypename}</strong></td>
                  <td>{stat.description || '-'}</td>
                  <td className={stat.totalleaves > 0 ? styles.positive : ''}>
                    {stat.totalleaves}
                  </td>
                  <td className={stat.activeleaves > 0 ? styles.active : ''}>
                    {stat.activeleaves}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Список типов отпусков */}
      {!showStats && (
        <div className={styles.leaveTypesList}>
          <h3>
            {searchTerm ? 'Результаты поиска' : 'Все типы отпусков'} 
            ({leaveTypesToShow.length})
          </h3>
          
          {leaveTypesToShow.length === 0 ? (
            <p>Типы отпусков не найдены</p>
          ) : (
            <table className={styles.leaveTypesTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Описание</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {leaveTypesToShow.map((leaveType) => (
                  <tr key={leaveType.leaveTypeId}>
                    <td>{leaveType.leaveTypeId}</td>
                    <td>
                      {editingId === leaveType.leaveTypeId ? (
                        <input
                          type="text"
                          value={editData.leaveTypeName}
                          onChange={(e) => setEditData({
                            ...editData,
                            leaveTypeName: e.target.value
                          })}
                        />
                      ) : (
                        <strong>{leaveType.leaveTypeName}</strong>
                      )}
                    </td>
                    <td>
                      {editingId === leaveType.leaveTypeId ? (
                        <textarea
                          value={editData.description}
                          onChange={(e) => setEditData({
                            ...editData,
                            description: e.target.value
                          })}
                          rows={2}
                        />
                      ) : (
                        leaveType.description || <span style={{ color: '#999' }}>Нет описания</span>
                      )}
                    </td>
                    <td className={styles.actions}>
                      {editingId === leaveType.leaveTypeId ? (
                        <>
                          <button onClick={() => handleUpdate(leaveType.leaveTypeId)}>
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
                          <button onClick={() => startEdit(leaveType)}>
                            Редактировать
                          </button>
                          <button 
                            onClick={() => handleDelete(leaveType.leaveTypeId)}
                            className={styles.deleteBtn}
                          >
                            Удалить
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaveTypesManager;