import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchServiceTypes, 
  createServiceType, 
  updateServiceType, 
  deleteServiceType 
} from '../store/serviceTypesSlice';

const ServiceTypesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { serviceTypes, status } = useSelector((state: RootState) => state.serviceTypes);
  
  const [newServiceType, setNewServiceType] = useState({
    serviceTypeId: '',
    serviceTypeName: ''
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');

  useEffect(() => {
    dispatch(fetchServiceTypes());
  }, [dispatch]);

  const handleCreate = () => {
    if (newServiceType.serviceTypeId && newServiceType.serviceTypeName) {
      dispatch(createServiceType({
        serviceTypeId: parseInt(newServiceType.serviceTypeId),
        serviceTypeName: newServiceType.serviceTypeName
      }));
      setNewServiceType({ serviceTypeId: '', serviceTypeName: '' });
    }
  };

  const handleUpdate = (id: number) => {
    if (editName.trim()) {
      dispatch(updateServiceType({ id, serviceTypeName: editName }));
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить тип службы?')) {
      dispatch(deleteServiceType(id));
    }
  };

  if (status === 'loading') {
    return <div>Загрузка типов служб...</div>;
  }

  return (
    <div className="service-types-manager">
      <h2>Управление типами служб</h2>
      
      {/* Форма создания */}
      <div className="create-form">
        <h3>Создать новый тип службы</h3>
        <div className="form-group">
          <input
            type="number"
            placeholder="ID типа службы"
            value={newServiceType.serviceTypeId}
            onChange={(e) => setNewServiceType({
              ...newServiceType,
              serviceTypeId: e.target.value
            })}
          />
          <input
            type="text"
            placeholder="Название типа службы"
            value={newServiceType.serviceTypeName}
            onChange={(e) => setNewServiceType({
              ...newServiceType,
              serviceTypeName: e.target.value
            })}
          />
          <button onClick={handleCreate}>Создать</button>
        </div>
      </div>

      {/* Список типов служб */}
      <div className="service-types-list">
        <h3>Существующие типы служб</h3>
        <table className="service-types-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {serviceTypes.map((serviceType) => (
              <tr key={serviceType.serviceTypeId}>
                <td>{serviceType.serviceTypeId}</td>
                <td>
                  {editingId === serviceType.serviceTypeId ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  ) : (
                    serviceType.serviceTypeName
                  )}
                </td>
                <td className="actions">
                  {editingId === serviceType.serviceTypeId ? (
                    <>
                      <button onClick={() => handleUpdate(serviceType.serviceTypeId)}>
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
                        setEditingId(serviceType.serviceTypeId);
                        setEditName(serviceType.serviceTypeName);
                      }}>
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleDelete(serviceType.serviceTypeId)}
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
        .service-types-manager {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        h2, h3 {
          color: #333;
          margin-bottom: 20px;
        }
        
        .create-form {
          margin-bottom: 30px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        
        .form-group {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }
        
        input {
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
        
        .service-types-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .service-types-table th,
        .service-types-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        
        .service-types-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .service-types-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .service-types-table tr:hover {
          background-color: #f1f1f1;
        }
        
        .actions {
          display: flex;
          gap: 5px;
        }
      `}</style>
    </div>
  );
};

export default ServiceTypesManager;