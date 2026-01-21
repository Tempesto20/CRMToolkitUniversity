import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchLocationWorks, 
  fetchLocationWorksWithStats,
  createLocationWork, 
  updateLocationWork, 
  deleteLocationWork,
  searchLocationWorks,
  clearSearchResults
} from '../store/locationWorkSlice';

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
    <div className="location-work-manager">
      <h2>Управление местами работы</h2>
      
      {/* Форма создания */}
      <div className="create-form">
        <h3>Добавить новое место работы</h3>
        <div className="form-group">
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
      <div className="search-section">
        <h3>Поиск мест работы</h3>
        <div className="form-group">
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
          <h3>Статистика по местам работы</h3>
          <table className="stats-table">
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
                  <td className={location.operationalcount > 0 ? 'positive' : ''}>
                    {location.operationalcount}
                  </td>
                  <td className={location.indepotcount > 0 ? 'warning' : ''}>
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
        <div className="locations-list">
          <h3>
            {searchTerm ? 'Результаты поиска' : 'Все места работы'} 
            ({locationsToShow.length})
          </h3>
          
          {locationsToShow.length === 0 ? (
            <p>Места работы не найдены</p>
          ) : (
            <table className="locations-table">
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
                    <td className="actions">
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
        .location-work-manager {
          padding: 20px;
          max-width: 1000px;
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
        
        .form-group {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        
        input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
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
        
        .stats-section, .locations-list {
          margin-top: 20px;
        }
        
        .stats-table, .locations-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }
        
        .stats-table th,
        .stats-table td,
        .locations-table th,
        .locations-table td {
          border: 1px solid #ddd;
          padding: 10px;
          text-align: left;
        }
        
        .stats-table th,
        .locations-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .stats-table tr:nth-child(even),
        .locations-table tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        
        .stats-table tr:hover,
        .locations-table tr:hover {
          background-color: #f1f1f1;
        }
        
        .stats-table td.positive {
          color: #28a745;
          font-weight: bold;
        }
        
        .stats-table td.warning {
          color: #ffc107;
          font-weight: bold;
        }
        
        .actions {
          display: flex;
          gap: 5px;
          min-width: 180px;
        }
        
        @media (max-width: 768px) {
          .form-group {
            flex-direction: column;
            align-items: stretch;
          }
          
          button {
            width: 100%;
          }
          
          .actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default LocationWorkManager;