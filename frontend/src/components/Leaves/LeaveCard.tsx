import React from 'react';
import {
  Button,
  Tag,
  Row,
  Col
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  HomeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './LeaveCard.module.scss';

interface Employee {
  personalNumber: number;
  fullName: string;
  position?: string;
  serviceType?: {
    serviceTypeName: string;
  };
  brigada?: {
    brigadaName: string;
  };
}

interface LeaveType {
  leave_type_id: number;
  leave_type_name: string;
  description: string;
}

interface Leave {
  leave_id: number;
  employee_personal_number: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  leave_type_name?: string;
}

interface LeaveCardProps {
  leave: Leave;
  employee?: Employee;
  leaveType?: LeaveType;
  onEdit: (leave: Leave) => void;
  onDelete: (leaveId: number, employeeName: string, leaveType: string) => void;
  isExactMatch?: boolean;
}

const LeaveCard: React.FC<LeaveCardProps> = ({
  leave,
  employee,
  leaveType,
  onEdit,
  onDelete,
  isExactMatch
}) => {
  // Проверка, активен ли отпуск
  const isLeaveActive = () => {
    const today = dayjs();
    const startDate = dayjs(leave.start_date);
    const endDate = dayjs(leave.end_date);
    
    return today.isAfter(startDate.subtract(1, 'day')) && today.isBefore(endDate.add(1, 'day'));
  };

  // Проверка, начинается ли отпуск сегодня
  const isStartingToday = () => {
    const today = dayjs().format('YYYY-MM-DD');
    return leave.start_date === today;
  };

  // Проверка, заканчивается ли отпуск сегодня
  const isEndingToday = () => {
    const today = dayjs().format('YYYY-MM-DD');
    return leave.end_date === today;
  };

  // Проверка, будущий ли отпуск
  const isFutureLeave = () => {
    const today = dayjs();
    const startDate = dayjs(leave.start_date);
    return startDate.isAfter(today);
  };

  // Форматирование дат
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD.MM.YYYY');
  };

  // Расчет количества дней
  const getDaysCount = () => {
    const startDate = dayjs(leave.start_date);
    const endDate = dayjs(leave.end_date);
    return endDate.diff(startDate, 'day') + 1;
  };

  // Оставшиеся дни
  const getDaysRemaining = () => {
    if (isFutureLeave()) {
      const startDate = dayjs(leave.start_date);
      const today = dayjs();
      return startDate.diff(today, 'day');
    }
    
    if (isLeaveActive()) {
      const endDate = dayjs(leave.end_date);
      const today = dayjs();
      return endDate.diff(today, 'day');
    }
    
    return null;
  };

  const active = isLeaveActive();
  const startingToday = isStartingToday();
  const endingToday = isEndingToday();
  const futureLeave = isFutureLeave();

  return (
    <div className={`${styles.leaveCard} ${active ? styles.activeCard : ''} ${futureLeave ? styles.futureCard : ''} ${isExactMatch ? styles.exactMatchCard : ''}`}>
      {/* Бейдж для полного совпадения при поиске */}
      {isExactMatch && (
        <div className={styles.exactMatchBadge}>
          <Tag color="blue" icon={<InfoCircleOutlined />}>
            Полное совпадение
          </Tag>
        </div>
      )}
      
      {/* Бейджи статуса */}
      <div className={styles.statusBadges}>
        {active && (
          <Tag color="green" icon={<HomeOutlined />}>
            В отпуске
          </Tag>
        )}
        
        {futureLeave && (
          <Tag color="orange">
            Запланирован
          </Tag>
        )}
        
        {startingToday && (
          <Tag color="cyan">
            Начинается сегодня
          </Tag>
        )}
        
        {endingToday && (
          <Tag color="purple">
            Заканчивается сегодня
          </Tag>
        )}
      </div>
      
      {/* Информация о сотруднике */}
      <div className={styles.employeeSection}>
        <div className={styles.employeePhoto}>
          <UserOutlined />
        </div>
        
        <div className={styles.employeeInfo}>
          <h3 className={styles.employeeName}>
            {employee?.fullName || `Сотрудник #${leave.employee_personal_number}`}
          </h3>
          
          <div className={styles.employeeDetails}>
            <Row gutter={[8, 8]} className={styles.detailsGrid}>
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Личный номер:</span>
                  <span className={styles.detailValue}>
                    {leave.employee_personal_number}
                  </span>
                </div>
              </Col>
              
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Должность:</span>
                  <span className={styles.detailValue}>
                    {employee?.position || 'Не указана'}
                  </span>
                </div>
              </Col>
              
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Служба:</span>
                  <span className={styles.detailValue}>
                    {employee?.serviceType?.serviceTypeName || 'Не указана'}
                  </span>
                </div>
              </Col>
              
              <Col span={12}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Бригада:</span>
                  <span className={styles.detailValue}>
                    {employee?.brigada?.brigadaName || 'Не указана'}
                  </span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </div>
      
      {/* Информация об отпуске */}
      <div className={styles.leaveInfo}>
        <h4 className={styles.leaveTitle}>
          Информация об отпуске
        </h4>
        
        <div className={styles.leaveDetails}>
          <Row gutter={[8, 8]} className={styles.detailsGrid}>
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Тип отпуска:</span>
                <span className={styles.detailValue}>
                  {leaveType?.leave_type_name || leave.leave_type_name || 'Не указан'}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Длительность:</span>
                <span className={styles.detailValue}>
                  {getDaysCount()} дней
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Начало:</span>
                <span className={`${styles.detailValue} ${styles.dateValue}`}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {formatDate(leave.start_date)}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Окончание:</span>
                <span className={`${styles.detailValue} ${styles.dateValue}`}>
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  {formatDate(leave.end_date)}
                </span>
              </div>
            </Col>
          </Row>
          
          {/* Описание типа отпуска */}
          {leaveType?.description && (
            <div className={styles.leaveDescription}>
              <span className={styles.descriptionLabel}>Описание:</span>
              <p className={styles.descriptionText}>
                {leaveType.description}
              </p>
            </div>
          )}
          
          {/* Информация о статусе */}
          <div className={styles.statusInfo}>
            {active && (
              <div className={styles.statusItem}>
                <Tag color="green">Осталось дней: {getDaysRemaining()}</Tag>
              </div>
            )}
            
            {futureLeave && (
              <div className={styles.statusItem}>
                <Tag color="orange">Начнётся через: {getDaysRemaining()} дней</Tag>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Кнопки действий */}
      <div className={styles.leaveActions}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => onEdit(leave)}
          className={`${styles.actionBtn} ${styles.editBtn}`}
        >
          Редактировать
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => onDelete(leave.leave_id, employee?.fullName || '', leaveType?.leave_type_name || '')}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default LeaveCard;