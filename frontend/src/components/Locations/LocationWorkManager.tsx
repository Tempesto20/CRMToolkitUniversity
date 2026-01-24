import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchLocationWorks,
  createLocationWork,
  updateLocationWork,
  deleteLocationWork,
  searchLocationWorks,
  clearSearchResults,
  fetchLocationWorksWithStats
} from '../../redux/slices/locationWorkSlice';
import { RootState, AppDispatch } from '../../redux/store';
import LocationCard from './LocationCard';
import AddLocationModal from './modals/AddLocationModal';
import EditLocationModal from './modals/EditLocationModal';
import styles from './LocationWorkManager.module.scss';

interface FormData {
  locationName: string;
}

interface LocationWithStats {
  locationId: number;
  locationName: string;
  locomotivecount?: string | number;
  operationalcount?: string | number;
  indepotcount?: string | number;
  locomotives?: any[];
}

const LocationWorksManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    locationWorks,
    locationWorksWithStats,
    searchResults,
    status,
    error
  } = useSelector((state: RootState) => state.locationWork);

  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    locationName: ''
  });
  const [locationToDelete, setLocationToDelete] = useState<number | null>(null);

  // Используем данные со статистикой для отображения
  useEffect(() => {
    dispatch(fetchLocationWorksWithStats());
  }, [dispatch]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timer = setTimeout(() => {
        dispatch(searchLocationWorks(searchQuery));
      }, 300);
      return () => clearTimeout(timer);
    } else {
      dispatch(clearSearchResults());
    }
  }, [searchQuery, dispatch]);

  const handleOpenAddDialog = () => {
    setFormData({
      locationName: ''
    });
    setOpenAddDialog(true);
  };

  const handleOpenEditDialog = (location: any) => {
    setSelectedLocation(location);
    setFormData({
      locationName: location.locationName || ''
    });
    setOpenEditDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setSelectedLocation(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSubmit = () => {
    dispatch(createLocationWork(formData.locationName));
    handleCloseAddDialog();
  };

  const handleEditSubmit = () => {
    if (selectedLocation) {
      dispatch(updateLocationWork({
        id: selectedLocation.locationId,
        locationName: formData.locationName
      }));
    }
    handleCloseEditDialog();
  };

  const handleOpenDeleteDialog = (locationId: number, locationName: string) => {
    setLocationToDelete(locationId);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setLocationToDelete(null);
  };

  const handleDelete = () => {
    if (locationToDelete) {
      dispatch(deleteLocationWork(locationToDelete));
      handleCloseDeleteDialog();
    }
  };

  const handleRefresh = () => {
    dispatch(fetchLocationWorksWithStats());
    setSearchQuery('');
    dispatch(clearSearchResults());
  };

  // Преобразуем данные в единый формат с сортировкой по locationId
  const getDisplayData = (): LocationWithStats[] => {
    let data: LocationWithStats[] = [];
    
    if (locationWorksWithStats.length > 0) {
      data = locationWorksWithStats.map((item: any) => ({
        locationId: item.locationid || item.locationId,
        locationName: item.locationname || item.locationName,
        locomotivecount: item.locomotecount || item.locomotivecount || 0,
        operationalcount: item.operationalcount || 0,
        indepotcount: item.indepotcount || 0
      }));
    } else {
      // Если нет данных со статистикой, используем обычные
      data = locationWorks.map((item: any) => ({
        locationId: item.locationId,
        locationName: item.locationName,
        locomotives: item.locomotives || [],
        locomotivecount: item.locomotives ? item.locomotives.length : 0
      }));
    }
    
    // СОРТИРОВКА ПО locationId ОТ МЕНЬШЕГО К БОЛЬШЕМУ
    return data.sort((a, b) => a.locationId - b.locationId);
  };

  const displayData = getDisplayData();
  
  // Для поиска используем обычные данные (поиск работает с обычным эндпоинтом)
  const displayLocations = searchQuery.trim() && searchResults.length > 0 
    ? searchResults.map((item: any) => ({
        locationId: item.locationId,
        locationName: item.locationName,
        locomotives: item.locomotives || []
      }))
    : displayData;

  // Рассчитываем статистику
  const getStats = () => {
    const total = displayData.length;
    let withLocomotives = 0;
    let totalLocomotives = 0;
    
    displayData.forEach((location: LocationWithStats) => {
      let locomotiveCount = 0;
      
      if (location.locomotivecount !== undefined) {
        locomotiveCount = typeof location.locomotivecount === 'string'
          ? parseInt(location.locomotivecount) || 0
          : Number(location.locomotivecount) || 0;
      } else if (location.locomotives) {
        locomotiveCount = location.locomotives.length;
      }
      
      if (locomotiveCount > 0) {
        withLocomotives++;
      }
      totalLocomotives += locomotiveCount;
    });
    
    const withoutLocomotives = total - withLocomotives;
    
    return {
      total,
      withLocomotives,
      withoutLocomotives,
      totalLocomotives
    };
  };

  const stats = getStats();

  if (status === 'loading' && displayData.length === 0) {
    return (
      <div className={styles.locationWorksManager}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка данных...</p>
        </div>
      </div>
    );
  }

  if (error && displayData.length === 0) {
    return (
      <div className={styles.locationWorksManager}>
        <div className={styles.errorMessage}>
          <p>Ошибка при загрузке данных: {error}</p>
          <button onClick={handleRefresh} className={styles.btnPrimary}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.locationWorksManager}>
      <div className={styles.pageHeader}>
        <h1>Управление районами для работ</h1>
        <div className={styles.headerActions}>
          <button
            onClick={handleRefresh}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            <span className={styles.refreshIcon}>↻</span>
            Обновить
          </button>
          <button
            onClick={handleOpenAddDialog}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            <span className={styles.addIcon}>+</span>
            Добавить район
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <span>🏭</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Всего районов</p>
            <p className={styles.statValue}>{stats.total || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.success}`}>
            <span>🚂</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>С локомотивами</p>
            <p className={styles.statValue}>{stats.withLocomotives || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.warning}`}>
            <span>⏳</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Без локомотивов</p>
            <p className={styles.statValue}>{stats.withoutLocomotives || 0}</p>
          </div>
        </div>
        
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.info}`}>
            <span>🔢</span>
          </div>
          <div className={styles.statContent}>
            <p className={styles.statLabel}>Всего локомотивов</p>
            <p className={styles.statValue}>{stats.totalLocomotives || 0}</p>
          </div>
        </div>
      </div>

      {/* Поиск */}
      <div className={styles.searchSection}>
        <h2>Поиск района по названию</h2>
        <div className={styles.searchControl}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            placeholder="Введите название района (location_name)..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearchButton}
              title="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
        {searchQuery.trim() && (
          <div className={styles.searchInfo}>
            <p>Найдено районов по запросу "{searchQuery}": {searchResults.length}</p>
          </div>
        )}
      </div>

      {/* Карточки районов */}
      <div className={styles.cardsContainer}>
        {displayLocations.map((location: LocationWithStats) => (
          <LocationCard
            key={location.locationId}
            location={location}
            onEdit={handleOpenEditDialog}
            onDelete={handleOpenDeleteDialog}
          />
        ))}
      </div>

      {/* Сообщение если нет данных */}
      {displayLocations.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏭</div>
          <h3>Нет районов для отображения</h3>
          <p>{searchQuery ? 'Попробуйте изменить поисковый запрос' : 'Нажмите "Добавить район" чтобы создать новый'}</p>
        </div>
      )}

      {/* Модальные окна */}
      <AddLocationModal
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        onSubmit={handleAddSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        loading={status === 'loading'}
      />

      <EditLocationModal
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        onSubmit={handleEditSubmit}
        selectedLocation={selectedLocation}
        formData={formData}
        onInputChange={handleInputChange}
        loading={status === 'loading'}
      />

      {/* Модальное окно подтверждения удаления */}
      {openDeleteDialog && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modalContent} ${styles.modalSm}`}>
            <div className={styles.modalHeader}>
              <h2>Подтверждение удаления</h2>
              <button onClick={handleCloseDeleteDialog} className={styles.closeButton}>×</button>
            </div>
            
            <div className={styles.form}>
              <div className={styles.deleteConfirm}>
                <div className={styles.deleteIcon}>
                  <span>⚠️</span>
                </div>
                <div className={styles.deleteMessage}>
                  <h3>Вы уверены, что хотите удалить район?</h3>
                  <p>Это действие нельзя отменить. Если к району привязаны локомотивы, удаление будет невозможно.</p>
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleCloseDeleteDialog}
                  className={styles.cancelButton}
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.deleteConfirmButton}
                  disabled={status === 'loading'}
                >
                  {status === 'loading' ? 'Удаление...' : 'Удалить'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Уведомление об ошибке */}
      {error && (
        <div className={`${styles.notification} ${styles.error}`}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default LocationWorksManager;