import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchLeaveTypes, 
  fetchLeaveTypesStats,
  createLeaveType, 
  updateLeaveType, 
  deleteLeaveType,
  searchLeaveTypes,
  clearSearchResults
} from '../store/leaveTypesSlice';

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
    <div className="leave-types-manager">
      <h2>Управление типами отпусков</h2>
      
      {/* Форма создания */}
      <div className="create-form">
        <h3>Добавить новый тип отпуска</h3>
        <div className="form-grid">
          <div className="form-group">
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
          
          <div className="form-group">
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
          
          <div className="form-group full-width">
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
      <div className="search-section">
        <h3>Поиск типов отпусков</h3>
        <div className="form-group">
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
      <div className="view-toggle">
        <button
          className={viewMode === 'list' ? 'active' : ''}
          onClick={() => setViewMode('list')}
        >
          Список
        </button>
        <button
          className={viewMode === 'stats' ? 'active' : ''}
          onClick={() => setViewMode('stats')}
        >
          Статистика
        </button>
      </div>

      {/* Таблица статистики */}
      {showStats && (
        <div className="stats-section">
          <h3>Статистика по типам отпусков</h3>
          <table className="stats-table">
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
                  <td className={stat.totalleaves > 0 ? 'positive' : ''}>
                    {stat.totalleaves}
                  </td>
                  <td className={stat.activeleaves > 0 ? 'active' : ''}>
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
        <div className="leave-types-list">
          <h3>
            {searchTerm ? 'Результаты поиска' : 'Все типы отпусков'} 
            ({leaveTypesToShow.length})
          </h3>
          
          {leaveTypesToShow.length === 0 ? (
            <p>Типы отпусков не найдены</p>
          ) : (
            <table className="leave-types-table">
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
                    <td className="actions">
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
                            className="delete-btn"
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

      <style jsx>{`
        .leave-types-manager {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        h2, h3 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .create-form, .search-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .full-width {
          grid-column: 1 / -1;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        label {
          font-weight: 500;
          color: #555;
        }
        
        input, textarea {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }
        
        textarea {
          resize: vertical;
        }
        
        button {
          padding: 8px 16px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
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
        }
        
        .view-toggle button {
          background-color: #6c757d;
        }
        
        .view-toggle button.active {
          background-color: #007bff;
        }
        
        .stats-section, .leave-types-list {
          margin-top: 20px;
        }
        
        .stats-table, .leave-types-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .stats-table th,
        .stats-table td,
        .leave-types-table th,
        .leave-types-table td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        
        .stats-table th,
        .leave-types-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .stats-table tr:nth-child(even),
        .leave-types-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .stats-table tr:hover,
        .leave-types-table tr:hover {
          background-color: #f1f1f1;
        }
        
        .stats-table td.positive {
          color: #28a745;
          font-weight: bold;
        }
        
        .stats-table td.active {
          color: #17a2b8;
          font-weight: bold;
        }
        
        .actions {
          display: flex;
          gap: 5px;
          min-width: 180px;
        }
        
        @media (max-width: 768px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-group {
            flex-direction: column;
          }
          
          button {
            width: 100%;
            margin-top: 5px;
          }
          
          .actions {
            flex-direction: column;
            min-width: 120px;
          }
          
          .stats-table,
          .leave-types-table {
            display: block;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default LeaveTypesManager;