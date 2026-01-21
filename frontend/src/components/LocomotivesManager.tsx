import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchLocomotives, 
  createLocomotive, 
  updateLocomotive, 
  deleteLocomotive,
  fetchAvailableLocomotives,
  fetchLocomotivesByService 
} from '../store/locomotivesSlice';

const LocomotivesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { locomotives, availableLocomotives, status } = useSelector((state: RootState) => state.locomotives);
  
  const [newLocomotive, setNewLocomotive] = useState({
    locomotiveId: '',
    locomotiveName: '',
    locomotiveType: '',
    locomotiveDepo: false,
    operationalStatus: true,
    locationId: '',
    serviceTypeId: '',
    workTypeId: ''
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [showAvailable, setShowAvailable] = useState(false);
  const [serviceTypeId, setServiceTypeId] = useState('');

  useEffect(() => {
    dispatch(fetchLocomotives());
  }, [dispatch]);

  const handleCreate = () => {
    if (newLocomotive.locomotiveId && newLocomotive.locomotiveName) {
      const dataToSend = {
        ...newLocomotive,
        locationId: newLocomotive.locationId ? parseInt(newLocomotive.locationId) : undefined,
        serviceTypeId: newLocomotive.serviceTypeId ? parseInt(newLocomotive.serviceTypeId) : undefined,
        workTypeId: newLocomotive.workTypeId ? parseInt(newLocomotive.workTypeId) : undefined,
      };
      
      dispatch(createLocomotive(dataToSend));
      setNewLocomotive({
        locomotiveId: '',
        locomotiveName: '',
        locomotiveType: '',
        locomotiveDepo: false,
        operationalStatus: true,
        locationId: '',
        serviceTypeId: '',
        workTypeId: ''
      });
    }
  };

  const handleUpdate = (id: string) => {
    if (Object.keys(editData).length > 0) {
      const dataToSend = {
        ...editData,
        locationId: editData.locationId ? parseInt(editData.locationId) : undefined,
        serviceTypeId: editData.serviceTypeId ? parseInt(editData.serviceTypeId) : undefined,
        workTypeId: editData.workTypeId ? parseInt(editData.workTypeId) : undefined,
      };
      
      dispatch(updateLocomotive({ id, ...dataToSend }));
      setEditingId(null);
      setEditData({});
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Удалить локомотив?')) {
      dispatch(deleteLocomotive(id));
    }
  };

  const handleFetchAvailable = () => {
    dispatch(fetchAvailableLocomotives());
    setShowAvailable(true);
  };

  const handleFetchByService = () => {
    if (serviceTypeId) {
      dispatch(fetchLocomotivesByService(parseInt(serviceTypeId)));
    }
  };

  const startEdit = (locomotive: any) => {
    setEditingId(locomotive.locomotiveId);
    setEditData({
      locomotiveName: locomotive.locomotiveName,
      locomotiveType: locomotive.locomotiveType,
      locomotiveDepo: locomotive.locomotiveDepo,
      operationalStatus: locomotive.operationalStatus,
      locationId: locomotive.location?.locationId || '',
      serviceTypeId: locomotive.serviceType?.serviceTypeId || '',
      workTypeId: locomotive.workType?.workTypeId || '',
    });
  };

  if (status === 'loading') {
    return <div>Загрузка локомотивов...</div>;
  }

  return (
    <div className="locomotives-manager">
      <h2>Управление локомотивами</h2>
      
      {/* Форма создания */}
      <div className="create-form">
        <h3>Добавить новый локомотив</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>ID локомотива:</label>
            <input
              type="text"
              placeholder="ID (до 12 символов)"
              value={newLocomotive.locomotiveId}
              onChange={(e) => setNewLocomotive({
                ...newLocomotive,
                locomotiveId: e.target.value
              })}
              maxLength={12}
            />
          </div>
          
          <div className="form-group">
            <label>Название:</label>
            <input
              type="text"
              placeholder="Название локомотива"
              value={newLocomotive.locomotiveName}
              onChange={(e) => setNewLocomotive({
                ...newLocomotive,
                locomotiveName: e.target.value
              })}
            />
          </div>
          
          <div className="form-group">
            <label>Тип:</label>
            <input
              type="text"
              placeholder="Тип локомотива"
              value={newLocomotive.locomotiveType}
              onChange={(e) => setNewLocomotive({
                ...newLocomotive,
                locomotiveType: e.target.value
              })}
            />
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={newLocomotive.locomotiveDepo}
                onChange={(e) => setNewLocomotive({
                  ...newLocomotive,
                  locomotiveDepo: e.target.checked
                })}
              />
              В депо
            </label>
            <label>
              <input
                type="checkbox"
                checked={newLocomotive.operationalStatus}
                onChange={(e) => setNewLocomotive({
                  ...newLocomotive,
                  operationalStatus: e.target.checked
                })}
              />
              Рабочий
            </label>
          </div>
          
          <div className="form-group">
            <label>ID местоположения:</label>
            <input
              type="number"
              placeholder="ID местоположения"
              value={newLocomotive.locationId}
              onChange={(e) => setNewLocomotive({
                ...newLocomotive,
                locationId: e.target.value
              })}
            />
          </div>
          
          <div className="form-group">
            <label>ID службы:</label>
            <input
              type="number"
              placeholder="ID службы"
              value={newLocomotive.serviceTypeId}
              onChange={(e) => setNewLocomotive({
                ...newLocomotive,
                serviceTypeId: e.target.value
              })}
            />
          </div>
          
          <div className="form-group">
            <label>ID вида работ:</label>
            <input
              type="number"
              placeholder="ID вида работ"
              value={newLocomotive.workTypeId}
              onChange={(e) => setNewLocomotive({
                ...newLocomotive,
                workTypeId: e.target.value
              })}
            />
          </div>
        </div>
        <button onClick={handleCreate}>Создать локомотив</button>
      </div>

      {/* Фильтры */}
      <div className="filters-section">
        <h3>Фильтры</h3>
        <div className="filter-buttons">
          <button onClick={handleFetchAvailable}>
            Показать доступные локомотивы
          </button>
          
          <div className="service-filter">
            <select 
              value={serviceTypeId} 
              onChange={(e) => setServiceTypeId(e.target.value)}
            >
              <option value="">Выберите службу</option>
              <option value="1">Электровозная</option>
              <option value="2">Тепловозная</option>
            </select>
            <button onClick={handleFetchByService}>По службе</button>
          </div>
          
          <button onClick={() => {
            dispatch(fetchLocomotives());
            setShowAvailable(false);
          }}>
            Показать все
          </button>
        </div>
      </div>

      {/* Список локомотивов */}
      <div className="locomotives-list">
        <h3>
          {showAvailable ? 'Доступные локомотивы' : 'Все локомотивы'} 
          ({showAvailable ? availableLocomotives.length : locomotives.length})
        </h3>
        
        <table className="locomotives-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Место</th>
              <th>Депо</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {(showAvailable ? availableLocomotives : locomotives).map((loc) => (
              <tr 
                key={loc.locomotiveId}
                className={!loc.operationalStatus ? 'inactive' : ''}
              >
                <td>{loc.locomotiveId}</td>
                <td>
                  {editingId === loc.locomotiveId ? (
                    <input
                      type="text"
                      value={editData.locomotiveName}
                      onChange={(e) => setEditData({
                        ...editData,
                        locomotiveName: e.target.value
                      })}
                    />
                  ) : (
                    loc.locomotiveName
                  )}
                </td>
                <td>{loc.locomotiveType || '-'}</td>
                <td>
                  {editingId === loc.locomotiveId ? (
                    <label>
                      <input
                        type="checkbox"
                        checked={editData.operationalStatus}
                        onChange={(e) => setEditData({
                          ...editData,
                          operationalStatus: e.target.checked
                        })}
                      />
                      Рабочий
                    </label>
                  ) : (
                    loc.operationalStatus ? '✅ Рабочий' : '❌ Не рабочий'
                  )}
                </td>
                <td>{loc.location?.locationName || '-'}</td>
                <td>
                  {editingId === loc.locomotiveId ? (
                    <label>
                      <input
                        type="checkbox"
                        checked={editData.locomotiveDepo}
                        onChange={(e) => setEditData({
                          ...editData,
                          locomotiveDepo: e.target.checked
                        })}
                      />
                      В депо
                    </label>
                  ) : (
                    loc.locomotiveDepo ? 'Да' : 'Нет'
                  )}
                </td>
                <td className="actions">
                  {editingId === loc.locomotiveId ? (
                    <>
                      <button onClick={() => handleUpdate(loc.locomotiveId)}>
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
                      <button onClick={() => startEdit(loc)}>
                        Редактировать
                      </button>
                      <button 
                        onClick={() => handleDelete(loc.locomotiveId)}
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
        .locomotives-manager {
          padding: 20px;
          max-width: 1200px;
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
        
        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .checkbox-group {
          flex-direction: row;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }
        
        label {
          font-weight: 500;
          color: #555;
        }
        
        input, select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        input[type="checkbox"] {
          margin-right: 5px;
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
        
        .filters-section {
          margin-bottom: 20px;
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 5px;
        }
        
        .filter-buttons {
          display: flex;
          gap: 10px;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .service-filter {
          display: flex;
          gap: 10px;
        }
        
        .locomotives-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .locomotives-table th,
        .locomotives-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        
        .locomotives-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .locomotives-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .locomotives-table tr:hover {
          background-color: #f1f1f1;
        }
        
        .locomotives-table tr.inactive {
          background-color: #ffe6e6;
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

export default LocomotivesManager;