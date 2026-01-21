import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchWorkTypes, 
  createWorkType, 
  updateWorkType, 
  deleteWorkType,
  fetchWorkTypesByService 
} from '../redux/slices/workTypesSlice';
import styles from './WorkTypesManager.module.scss';

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
    <div className={styles.workTypesManager}>
      <h2>Управление видами работ</h2>
      
      {/* Форма создания */}
      <div className={styles.createForm}>
        <h3>Создать новый вид работ</h3>
        <div className={styles.formGroup}>
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
      <div className={styles.filterSection}>
        <h3>Поиск видов работ по службе</h3>
        <div className={styles.formGroup}>
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
          <div className={styles.serviceWorkTypes}>
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
      <div className={styles.workTypesList}>
        <h3>Все виды работ</h3>
        <table className={styles.workTypesTable}>
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
                <td className={styles.actions}>
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

export default WorkTypesManager;