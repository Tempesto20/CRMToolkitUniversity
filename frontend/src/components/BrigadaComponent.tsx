import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchBrigadas, createBrigada, deleteBrigada } from '../redux/slices/brigadaSlice';

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
    <div>
      <h1>Бригады</h1>
      
      <div>
        <input
          type="text"
          value={newBrigadaName}
          onChange={(e) => setNewBrigadaName(e.target.value)}
          placeholder="Название бригады"
        />
        <button onClick={handleCreate}>Создать</button>
      </div>

      <ul>
        {brigadas.map((brigada) => (
          <li key={brigada.brigadaId}>
            {brigada.brigadaName} (ID: {brigada.brigadaId})
            <button onClick={() => handleDelete(brigada.brigadaId)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BrigadaComponent;