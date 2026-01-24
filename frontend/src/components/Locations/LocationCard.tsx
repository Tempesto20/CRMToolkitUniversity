import React from 'react';
import styles from './LocationCard.module.scss';

interface LocationCardProps {
  location: {
    locationId: number;
    locationName: string;
    locomotivecount?: string | number;
    locomotives?: any[];
  };
  onEdit: (location: any) => void;
  onDelete: (locationId: number, locationName: string) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ location, onEdit, onDelete }) => {
  // Получаем количество локомотивов
  let locomotiveCount = 0;
  
  if (location.locomotivecount !== undefined) {
    locomotiveCount = typeof location.locomotivecount === 'string'
      ? parseInt(location.locomotivecount) || 0
      : Number(location.locomotivecount) || 0;
  } else if (location.locomotives) {
    locomotiveCount = location.locomotives.length;
  }

  return (
    <div className={styles.locationCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.cardTitle}>{location.locationName}</h3>
        <span className={styles.cardId}>ID: {location.locationId}</span>
      </div>
      
      <div className={styles.cardContent}>
        <div className={styles.simpleStats}>
          <div className={styles.statItemSingle}>
            <span className={styles.statLabel}>Локомотивов в районе:</span>
            <span className={styles.statValue}>
              {locomotiveCount}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.cardActions}>
        <button
          onClick={() => onEdit(location)}
          className={`${styles.btn} ${styles.btnEdit}`}
        >
          <span className={styles.actionIcon}>✏️</span>
          Редактировать
        </button>
        <button
          onClick={() => onDelete(location.locationId, location.locationName)}
          className={`${styles.btn} ${styles.btnDelete}`}
        >
          <span className={styles.actionIcon}>🗑️</span>
          Удалить
        </button>
      </div>
    </div>
  );
};

export default LocationCard;