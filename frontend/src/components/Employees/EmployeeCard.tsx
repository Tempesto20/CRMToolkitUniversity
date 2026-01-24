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
  HomeOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { Employee as EmployeeType } from '../../redux/slices/employeesSlice';
import styles from './EmployeeCard.module.scss';

// Интерфейсы для отпусков
interface Leave {
  leaveId: number;
  employee: {
    personalNumber: number;
    fullName: string;
    position?: string;
  } | null;
  leaveType: {
    leaveTypeId: number;
    leaveTypeName: string;
    description?: string;
  } | null;
  startDate: string;
  endDate: string;
}

interface LeaveTypeData {
  leaveTypeId: number;
  leaveTypeName: string;
  description?: string;
}

interface EmployeeCardProps {
  employee: EmployeeType;
  leaves: Leave[];
  leaveTypes: LeaveTypeData[];
  onEdit: (employee: EmployeeType) => void;
  onDelete: (personalNumber: number, fullName: string) => void;
  isExactMatch?: boolean;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ 
  employee, 
  leaves, 
  leaveTypes, 
  onEdit, 
  onDelete,
  isExactMatch
}) => {
  // Функция для получения URL фото сотрудника
  const getPhotoUrl = () => {
    if (employee.photoFilename && employee.photoMimetype) {
      return `http://localhost:3000/api/employees/photo/${employee.personalNumber}`;
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

  // Функция для форматирования даты рождения
  const formatBirthday = (birthday?: number) => {
    if (!birthday) return 'Не указана';
    const date = new Date(birthday * 1000);
    return date.toLocaleDateString('ru-RU');
  };

  // Улучшенная функция для проверки отпуска (по аналогии с LeavesManager)
  const getCurrentLeaveInfo = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Находим все отпуска сотрудника (с проверкой на null)
    const employeeLeaves = leaves.filter(leave => 
      leave.employee && leave.employee.personalNumber === employee.personalNumber
    );
    
    // Проверяем каждый отпуск на соответствие текущей дате
    for (const leave of employeeLeaves) {
      const startDate = new Date(leave.startDate);
      const endDate = new Date(leave.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (today >= startDate && today <= endDate) {
        return {
          isOnLeave: true,
          leaveId: leave.leaveId,
          leaveType: leave.leaveType,
          startDate: leave.startDate,
          endDate: leave.endDate
        };
      }
    }
    
    // Проверяем будущие отпуски
    const upcomingLeaves = employeeLeaves.filter(leave => {
      const startDate = new Date(leave.startDate);
      return startDate > today;
    });
    
    if (upcomingLeaves.length > 0) {
      // Сортируем по дате начала и берем ближайший
      upcomingLeaves.sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      const nextLeave = upcomingLeaves[0];
      
      return {
        isOnLeave: false,
        hasUpcomingLeave: true,
        nextLeave: {
          leaveId: nextLeave.leaveId,
          leaveType: nextLeave.leaveType,
          startDate: nextLeave.startDate,
          endDate: nextLeave.endDate
        }
      };
    }
    
    return { 
      isOnLeave: false,
      hasUpcomingLeave: false
    };
  };

  const leaveInfo = getCurrentLeaveInfo();

  // Рассчитать количество дней отпуска
  const calculateLeaveDays = (startDateStr: string, endDateStr: string) => {
    try {
      const startDate = new Date(startDateStr);
      const endDate = new Date(endDateStr);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } catch (e) {
      return 0;
    }
  };

  // Форматирование дат
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Неверный формат даты';
    }
  };

  // Форматирование даты в кратком формате
  const formatShortDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch (e) {
      return 'Неверная дата';
    }
  };

  // Получить статистику по отпускам сотрудника
  const getEmployeeLeaveStats = () => {
    const employeeLeaves = leaves.filter(leave => 
      leave.employee && leave.employee.personalNumber === employee.personalNumber
    );
    
    const totalLeaves = employeeLeaves.length;
    const currentYear = new Date().getFullYear();
    const currentYearLeaves = employeeLeaves.filter(leave => {
      try {
        const leaveDate = new Date(leave.startDate);
        return leaveDate.getFullYear() === currentYear;
      } catch (e) {
        return false;
      }
    });
    
    return {
      total: totalLeaves,
      currentYear: currentYearLeaves.length
    };
  };

  const leaveStats = getEmployeeLeaveStats();

  return (
    <div className={`${styles.employeeCard} ${leaveInfo.isOnLeave ? styles.onLeaveCard : ''} ${isExactMatch ? styles.exactMatchCard : ''}`}>
      {/* Бейдж для полного совпадения при поиске */}
      {isExactMatch && (
        <div className={styles.exactMatchBadge}>
          <Tag color="blue" icon={<InfoCircleOutlined />}>
            Полное совпадение
          </Tag>
        </div>
      )}
      
      {/* Бейдж для отпуска */}
      {leaveInfo.isOnLeave && (
        <div className={styles.leaveBadge}>
          <Tag color="orange" icon={<HomeOutlined />}>
            В отпуске
          </Tag>
        </div>
      )}
      
      {/* Бейдж для предстоящего отпуска */}
      {leaveInfo.hasUpcomingLeave && !leaveInfo.isOnLeave && (
        <div className={styles.upcomingLeaveBadge}>
          <Tag color="purple" icon={<CalendarOutlined />}>
            Ближайший отпуск: {formatShortDate(leaveInfo.nextLeave!.startDate)}
          </Tag>
        </div>
      )}
      
      {/* Фото сотрудника */}
      <div className={styles.employeePhoto}>
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={employee.fullName} 
            className={styles.employeePhotoImg}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove(styles.hidden);
            }}
          />
        ) : null}
        <div className={`${styles.defaultPhoto} ${photoUrl ? styles.hidden : ''}`}>
          <UserOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
        </div>
        {leaveInfo.isOnLeave && (
          <div className={styles.leaveOverlay}>
            <HomeOutlined style={{ fontSize: '24px', color: '#fa8c16' }} />
          </div>
        )}
        {isExactMatch && (
          <div className={styles.exactMatchOverlay}>
            <CheckCircleOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </div>
        )}
      </div>
      
      {/* Информация о сотруднике */}
      <div className={styles.employeeInfo}>
        <div className={styles.employeeHeader}>
          <h3 className={styles.employeeName}>{employee.fullName}</h3>
          <div className={styles.statusContainer}>
            {leaveInfo.isOnLeave ? (
              <Tag color="orange" icon={<HomeOutlined />} className={styles.statusTag}>
                {leaveInfo.leaveType?.leaveTypeName || 'В отпуске'}
              </Tag>
            ) : leaveInfo.hasUpcomingLeave ? (
              <Tag color="purple" icon={<CalendarOutlined />} className={styles.statusTag}>
                Отпуск с {formatShortDate(leaveInfo.nextLeave!.startDate)}
              </Tag>
            ) : (
              <Tag color="green" icon={<CheckCircleOutlined />} className={styles.statusTag}>
                Работает
              </Tag>
            )}
            
            {/* Статистика отпусков */}
            {leaveStats.total > 0 && (
              <Tag color="blue" className={styles.leaveStatsTag}>
                Отпусков: {leaveStats.total} ({leaveStats.currentYear} в этом году)
              </Tag>
            )}
          </div>
        </div>
        
        <div className={styles.employeeDetails}>
          <Row gutter={[16, 8]} className={styles.detailsGrid}>
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Служба:</span>
                <span className={styles.detailValue}>
                  {employee.serviceType?.serviceTypeName || 'Не указана'}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Вид работ:</span>
                <span className={styles.detailValue}>
                  {employee.workType?.workTypeName || 'Не указан'}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Должность:</span>
                <span className={styles.detailValue}>
                  {employee.position || 'Не указана'}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Бригада:</span>
                <span className={styles.detailValue}>
                  {employee.brigada ? employee.brigada.brigadaName : 'Не указана'}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Личный номер:</span>
                <span className={styles.detailValue}>
                  {employee.personalNumber}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Локомотив:</span>
                <span className={styles.detailValue}>
                  {employee.locomotive ? 
                    `${employee.locomotive.locomotiveId || employee.locomotive.locomotiveId}` 
                    : 'Не указан'}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Дата рождения:</span>
                <span className={styles.detailValue}>
                  {formatBirthday(employee.birthday)}
                </span>
              </div>
            </Col>
            
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Телефон:</span>
                <span className={styles.detailValue}>
                  {employee.phone || 'Не указан'}
                </span>
              </div>
            </Col>
          </Row>
          
          {/* Секция допусков */}
          <div className={styles.accessSection}>
            <h4 className={styles.accessTitle}>Допуски:</h4>
            <div className={styles.accessBadges}>
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Выезд магнитогорск-грузовой:</span>
                {employee.hasTrip ? (
                  <Tag color="green" icon={<CheckOutlined />} className={styles.accessTag}>
                    Имеется
                  </Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />} className={styles.accessTag}>
                    Не имеется
                  </Tag>
                )}
              </div>
              
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Кантовщик:</span>
                {employee.hasCraneman ? (
                  <Tag color="green" icon={<CheckOutlined />} className={styles.accessTag}>
                    Имеется
                  </Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />} className={styles.accessTag}>
                    Не имеется
                  </Tag>
                )}
              </div>
              
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Тепловоз:</span>
                {employee.dieselAccess ? (
                  <Tag color="green" icon={<CheckOutlined />} className={styles.accessTag}>
                    Имеется
                  </Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />} className={styles.accessTag}>
                    Не имеется
                  </Tag>
                )}
              </div>
              
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Электровоз:</span>
                {employee.electricAccess ? (
                  <Tag color="green" icon={<CheckOutlined />} className={styles.accessTag}>
                    Имеется
                  </Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />} className={styles.accessTag}>
                    Не имеется
                  </Tag>
                )}
              </div>
            </div>
          </div>
          
          {/* Информация об отпуске */}
          {leaveInfo.isOnLeave && (
            <div className={styles.leaveInfo}>
              <h4 className={styles.leaveTitle}>
                <HomeOutlined /> Текущий отпуск
              </h4>
              <div className={styles.leaveDetails}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Тип отпуска:</strong> {leaveInfo.leaveType?.leaveTypeName || 'Не указан'}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Продолжительность:</strong> 
                      {calculateLeaveDays(leaveInfo.startDate!, leaveInfo.endDate!)} дней
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Дата начала:</strong> {formatDate(leaveInfo.startDate!)}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Дата окончания:</strong> {formatDate(leaveInfo.endDate!)}
                    </p>
                  </Col>
                  {leaveInfo.leaveType?.description && (
                    <Col span={24}>
                      <p className={styles.leaveDetail}>
                        <strong>Описание:</strong> {leaveInfo.leaveType.description}
                      </p>
                    </Col>
                  )}
                </Row>
              </div>
            </div>
          )}
          
          {/* Информация о предстоящем отпуске */}
          {leaveInfo.hasUpcomingLeave && !leaveInfo.isOnLeave && (
            <div className={styles.upcomingLeaveInfo}>
              <h4 className={styles.leaveTitle}>
                <CalendarOutlined /> Ближайший отпуск
              </h4>
              <div className={styles.leaveDetails}>
                <Row gutter={[16, 8]}>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Тип отпуска:</strong> {leaveInfo.nextLeave?.leaveType?.leaveTypeName || 'Не указан'}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Продолжительность:</strong> 
                      {calculateLeaveDays(leaveInfo.nextLeave!.startDate, leaveInfo.nextLeave!.endDate)} дней
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Дата начала:</strong> {formatDate(leaveInfo.nextLeave!.startDate)}
                    </p>
                  </Col>
                  <Col span={12}>
                    <p className={styles.leaveDetail}>
                      <strong>Дата окончания:</strong> {formatDate(leaveInfo.nextLeave!.endDate)}
                    </p>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Кнопки действий */}
      <div className={styles.employeeActions}>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => onEdit(employee)}
          className={`${styles.actionBtn} ${styles.editBtn}`}
          disabled={leaveInfo.isOnLeave}
          title={leaveInfo.isOnLeave ? "Редактирование недоступно, сотрудник в отпуске" : "Редактировать сотрудника"}
        >
          Редактировать
        </Button>
        <Button 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete(employee.personalNumber, employee.fullName)}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          disabled={leaveInfo.isOnLeave}
          title={leaveInfo.isOnLeave ? "Удаление недоступно, сотрудник в отпуске" : "Удалить сотрудника"}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

export default EmployeeCard;