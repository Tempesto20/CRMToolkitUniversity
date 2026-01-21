import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchBrigadas, createBrigada, deleteBrigada } from '../redux/slices/brigadaSlice';
import styles from './BrigadaComponent.module.scss';

const BrigadaComponent: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { brigadas, status } = useSelector((state: RootState) => state.brigada);
  const [newBrigadaName, setNewBrigadaName] = useState('');

  useEffect(() => {
    dispatch(fetchBrigadas());
  }, [dispatch]);

  const handleCreate = () => {
    if (newBrigadaName.trim()) {
      dispatch(createBrigada(newBrigadaName));
      setNewBrigadaName('');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить бригаду?')) {
      dispatch(deleteBrigada(id));
    }
  };

  if (status === 'loading') {
    return <div>Загрузка...</div>;
  }

  return (
    <div className={styles.brigadaManager}>
      <h1>Управление бригадами</h1>
      
      <div className={styles.createSection}>
        <h2>Создать новую бригаду</h2>
        <div className={styles.formGroup}>
          <input
            type="text"
            value={newBrigadaName}
            onChange={(e) => setNewBrigadaName(e.target.value)}
            placeholder="Введите название бригады"
          />
          <button onClick={handleCreate}>Создать</button>
        </div>
      </div>

      <div className={styles.brigadasList}>
        <h2>Список бригад ({brigadas.length})</h2>
        <ul>
          {brigadas.map((brigada) => (
            <li key={brigada.brigadaId}>
              <div className={styles.brigadaInfo}>
                <strong>{brigada.brigadaName}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>ID: {brigada.brigadaId}</div>
              </div>
              <div className={styles.brigadaActions}>
                <button 
                  onClick={() => handleDelete(brigada.brigadaId)}
                  className={styles.deleteBtn}
                >
                  Удалить
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BrigadaComponent;