import React from 'react';
import styles from './LocomotivesCard.module.scss';

interface LocomotivesCardProps {
  locomotive: any;
  onEdit: (locomotive: any) => void;
  onDelete: (locomotiveId: string, locomotiveNumber: string) => void;
  getServiceTypeName: (locomotive: any) => string;
  getWorkTypeName: (locomotive: any) => string;
  getLocationName: (locomotive: any) => string;
}

const LocomotivesCard: React.FC<LocomotivesCardProps> = ({
  locomotive,
  onEdit,
  onDelete,
  getServiceTypeName,
  getWorkTypeName,
  getLocationName
}) => {
  return (
    <tr key={locomotive.locomotiveId}>
      <td>{locomotive.locomotiveId}</td>
      <td>{locomotive.locomotiveType || 'Не указан'}</td>
      <td>{locomotive.locomotiveName}</td>
      <td>{getServiceTypeName(locomotive)}</td>
      <td>{getWorkTypeName(locomotive)}</td>
      <td>{getLocationName(locomotive)}</td>
      <td>
        <span className={`${styles.statusBadge} ${
          locomotive.operationalStatus ? styles.success : styles.warning
        }`}>
          {locomotive.operationalStatus ? 'На линии' : 'В депо'}
        </span>
      </td>
      <td className={styles.actionsCell}>
        <button
          onClick={() => onEdit(locomotive)}
          className={`${styles.btnIcon} ${styles.btnEdit}`}
          title="Редактировать"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete(locomotive.locomotiveId, locomotive.locomotiveName)}
          className={`${styles.btnIcon} ${styles.btnDelete}`}
          title="Удалить"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default LocomotivesCard;