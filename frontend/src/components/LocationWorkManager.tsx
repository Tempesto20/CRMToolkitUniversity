import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchLocationWorks, 
  fetchLocationWorksWithStats,
  createLocationWork, 
  updateLocationWork, 
  deleteLocationWork,
  searchLocationWorks,
  clearSearchResults
} from '../redux/slices/locationWorkSlice';
import styles from './LocationWorkManager.module.scss';

const LocationWorkManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    locationWorks, 
    locationWorksWithStats, 
    searchResults,
    status 
  } = useSelector((state: RootState) => state.locationWork);
  
  const [newLocationName, setNewLocationName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  useEffect(() => {
    dispatch(fetchLocationWorks());
    dispatch(fetchLocationWorksWithStats());
  }, [dispatch]);

  const handleCreate = () => {
    if (newLocationName.trim()) {
      dispatch(createLocationWork(newLocationName));
      setNewLocationName('');
    }
  };

  const handleUpdate = (id: number) => {
    if (editName.trim()) {
      dispatch(updateLocationWork({ id, locationName: editName }));
      setEditingId(null);
      setEditName('');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Удалить место работы?')) {
      dispatch(deleteLocationWork(id));
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      dispatch(searchLocationWorks(searchTerm));
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    dispatch(clearSearchResults());
  };

  if (status === 'loading') {
    return <div>Загрузка мест работы...</div>;
  }

  const locationsToShow = searchTerm ? searchResults : locationWorks;
  const showStats = viewMode === 'stats' && locationWorksWithStats.length > 0;

  return (
    <div className={styles.locationWorkManager}>
      <h2>Управление местами работы</h2>
      
      {/* Форма создания */}
      <div className={styles.createForm}>
        <h3>Добавить новое место работы</h3>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Название места работы"
            value={newLocationName}
            onChange={(e) => setNewLocationName(e.target.value)}
          />
          <button onClick={handleCreate}>Создать</button>
        </div>
      </div>

      {/* Поиск */}
      <div className={styles.searchSection}>
        <h3>Поиск мест работы</h3>
        <div className={styles.formGroup}>
          <input
            type="text"
            placeholder="Введите название места работы"
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
          <h3>Статистика по местам работы</h3>
          <table className={styles.statsTable}>
            <thead>
              <tr>
                <th>Место работы</th>
                <th>Всего локомотивов</th>
                <th>Рабочих</th>
                <th>В депо</th>
              </tr>
            </thead>
            <tbody>
              {locationWorksWithStats.map((location) => (
                <tr key={location.locationId}>
                  <td>{location.locationname}</td>
                  <td>{location.locomotivecount}</td>
                  <td className={location.operationalcount > 0 ? styles.positive : ''}>
                    {location.operationalcount}
                  </td>
                  <td className={location.indepotcount > 0 ? styles.warning : ''}>
                    {location.indepotcount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Список мест работы */}
      {!showStats && (
        <div className={styles.locationsList}>
          <h3>
            {searchTerm ? 'Результаты поиска' : 'Все места работы'} 
            ({locationsToShow.length})
          </h3>
          
          {locationsToShow.length === 0 ? (
            <p>Места работы не найдены</p>
          ) : (
            <table className={styles.locationsTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Название</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {locationsToShow.map((location) => (
                  <tr key={location.locationId}>
                    <td>{location.locationId}</td>
                    <td>
                      {editingId === location.locationId ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleUpdate(location.locationId)}
                        />
                      ) : (
                        location.locationName
                      )}
                    </td>
                    <td className={styles.actions}>
                      {editingId === location.locationId ? (
                        <>
                          <button onClick={() => handleUpdate(location.locationId)}>
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
                            setEditingId(location.locationId);
                            setEditName(location.locationName);
                          }}>
                            Редактировать
                          </button>
                          <button 
                            onClick={() => handleDelete(location.locationId)}
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

export default LocationWorkManager;