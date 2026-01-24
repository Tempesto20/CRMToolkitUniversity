import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { 
  fetchServiceTypes, 
  createServiceType, 
  updateServiceType, 
  deleteServiceType 
} from '../../redux/slices/serviceTypesSlice';
import styles from './ServiceTypesManager.module.scss';

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
    <div className={styles.serviceTypesManager}>
      <h2>Управление типами служб</h2>
      
      {/* Форма создания */}
      <div className={styles.createForm}>
        <h3>Создать новый тип службы</h3>
        <div className={styles.formGroup}>
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
      <div className={styles.serviceTypesList}>
        <h3>Существующие типы служб</h3>
        <table className={styles.serviceTypesTable}>
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
                <td className={styles.actions}>
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
      </div>
    </div>
  );
};

export default ServiceTypesManager;