import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchWorkTypes, 
  createWorkType, 
  updateWorkType, 
  deleteWorkType,
  fetchWorkTypesByService 
} from '../store/workTypesSlice';

const WorkTypesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workTypes, workTypesByService, status } = useSelector((state: RootState) => state.workTypes);
  
  const [newWorkType, setNewWorkType] = useState({
    workTypeId: '',
    workTypeName: ''
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [serviceTypeId, setServiceTypeId] = useState('');

  useEffect(() => {
    dispatch(fetchWorkTypes());
  }, [dispatch]);

  const handleCreate = () => {
    if (newWorkType.workTypeId && newWorkType.workTypeName) {
      dispatch(createWorkType({
        workTypeId: parseInt(newWorkType.workTypeId),
        workTypeName: newWorkType.workTypeName
      }));
      setNewWorkType({ workTypeId: '', workTypeName: '' });
    }
  };

  const handleUpdate = (id: number) => {
    if (editName.trim()) {
      dispatch(updateWorkType({ id, workTypeName: editName }));
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить вид работ?')) {
      dispatch(deleteWorkType(id));
    }
  };

  const handleFetchByService = () => {
    if (serviceTypeId) {
      dispatch(fetchWorkTypesByService(parseInt(serviceTypeId)));
    }
  };

  if (status === 'loading') {
    return <div>Загрузка видов работ...</div>;
  }

  return (
    <div className="work-types-manager">
      <h2>Управление видами работ</h2>
      
      {/* Форма создания */}
      <div className="create-form">
        <h3>Создать новый вид работ</h3>
        <div className="form-group">
          <input
            type="number"
            placeholder="ID вида работ"
            value={newWorkType.workTypeId}
            onChange={(e) => setNewWorkType({
              ...newWorkType,
              workTypeId: e.target.value
            })}
          />
          <input
            type="text"
            placeholder="Название вида работ"
            value={newWorkType.workTypeName}
            onChange={(e) => setNewWorkType({
              ...newWorkType,
              workTypeName: e.target.value
            })}
          />
          <button onClick={handleCreate}>Создать</button>
        </div>
      </div>

      {/* Фильтр по службе */}
      <div className="filter-section">
        <h3>Поиск видов работ по службе</h3>
        <div className="form-group">
          <select 
            value={serviceTypeId} 
            onChange={(e) => setServiceTypeId(e.target.value)}
          >
            <option value="">Выберите службу</option>
            <option value="1">Электровозная служба</option>
            <option value="2">Тепловозная служба</option>
          </select>
          <button onClick={handleFetchByService}>Найти</button>
        </div>
        
        {workTypesByService.length > 0 && (
          <div className="service-work-types">
            <h4>Виды работ для выбранной службы:</h4>
            <ul>
              {workTypesByService.map((workType) => (
                <li key={workType.workTypeId}>
                  {workType.workTypeName} (ID: {workType.workTypeId})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Список всех видов работ */}
      <div className="work-types-list">
        <h3>Все виды работ</h3>
        <table className="work-types-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {workTypes.map((workType) => (
              <tr key={workType.workTypeId}>
                <td>{workType.workTypeId}</td>
                <td>
                  {editingId === workType.workTypeId ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    workType.workTypeName
                  )}
                </td>
                <td className="actions">
                  {editingId === workType.workTypeId ? (
                    <>
                      <button onClick={() => handleUpdate(workType.workTypeId)}>
                        Сохранить
                      </button>
                      <button onClick={() => {
                        setEditingId(null);
                        setEditName('');
                      }}>
                        Отмена
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingId(workType.workTypeId);
                        setEditName(workType.workTypeName);
                      }}>
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleDelete(workType.workTypeId)}
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
      </div>

      <style jsx>{`
        .work-types-manager {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }
        
        h2, h3, h4 {
          color: #333;
          margin-bottom: 15px;
        }
        
        .create-form, .filter-section {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .form-group {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 15px;
        }
        
        input, select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        input[type="number"] {
          width: 100px;
        }
        
        input[type="text"] {
          flex-grow: 1;
          min-width: 200px;
        }
        
        select {
          width: 250px;
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
        
        .service-work-types {
          margin-top: 15px;
          padding: 15px;
          background-color: #e9f7ef;
          border-radius: 4px;
        }
        
        .service-work-types ul {
          list-style: none;
          padding: 0;
          margin: 10px 0 0 0;
        }
        
        .service-work-types li {
          padding: 8px 12px;
          background-color: white;
          border: 1px solid #ddd;
          margin-bottom: 5px;
          border-radius: 4px;
        }
        
        .work-types-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .work-types-table th,
        .work-types-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        
        .work-types-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .work-types-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .work-types-table tr:hover {
          background-color: #f1f1f1;
        }
        
        .actions {
          display: flex;
          gap: 5px;
          min-width: 180px;
        }
      `}</style>
    </div>
  );
};

export default WorkTypesManager;