import React from 'react';
import styles from './LeavesCard.module.scss';

interface LeavesCardProps {
  leaves: Array<{
    leaveId: number;
    employee: {
      personalNumber: number;
      fullName: string;
      position?: string;
    };
    leaveType: {
      leaveTypeId: number;
      leaveTypeName: string;
    };
    startDate: string;
    endDate: string;
  }>;
  onEdit: (leave: any) => void;
  onDelete: (leaveId: number, employeeName: string) => void;
}

const LeavesCard: React.FC<LeavesCardProps> = ({ leaves, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const isCurrentLeave = (endDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(endDate) >= today;
  };

  return (
    <div className={styles.leavesGrid}>
      {leaves.map((leave) => {
        const days = calculateDays(leave.startDate, leave.endDate);
        const isActive = isCurrentLeave(leave.endDate);
        
        return (
          <div key={leave.leaveId} className={styles.leaveCard}>
            {/* Заголовок карточки */}
            <div className={styles.cardHeader}>
              <div className={styles.employeeInfo}>
                <h3 className={styles.employeeName}>{leave.employee.fullName}</h3>
                <span className={styles.employeeNumber}>
                  № {leave.employee.personalNumber}
                </span>
              </div>
              <span className={`${styles.statusBadge} ${isActive ? styles.active : styles.completed}`}>
                {isActive ? 'Текущий' : 'Завершен'}
              </span>
            </div>
            
            {/* Основная информация */}
            <div className={styles.cardBody}>
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Тип отпуска:</span>
                  <span className={styles.infoValue}>{leave.leaveType.leaveTypeName}</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Продолжительность:</span>
                  <span className={styles.infoValue}>{days} дней</span>
                </div>
              </div>
              
              <div className={styles.infoRow}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата начала:</span>
                  <span className={styles.infoValue}>{formatDate(leave.startDate)}</span>
                </div>
                
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Дата окончания:</span>
                  <span className={styles.infoValue}>{formatDate(leave.endDate)}</span>
                </div>
              </div>
              
              {leave.employee.position && (
                <div className={styles.infoRow}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Должность:</span>
                    <span className={styles.infoValue}>{leave.employee.position}</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Кнопки действий */}
            <div className={styles.cardActions}>
              <button
                onClick={() => onEdit(leave)}
                className={`${styles.actionButton} ${styles.editButton}`}
                title="Редактировать"
              >
                <span className={styles.buttonIcon}>✏️</span>
                <span className={styles.buttonText}>Редактировать</span>
              </button>
              
              <button
                onClick={() => onDelete(leave.leaveId, leave.employee.fullName)}
                className={`${styles.actionButton} ${styles.deleteButton}`}
                title="Удалить"
              >
                <span className={styles.buttonIcon}>🗑️</span>
                <span className={styles.buttonText}>Удалить</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LeavesCard;