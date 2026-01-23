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
  InfoCircleOutlined
} from '@ant-design/icons';
import { Employee as EmployeeType } from '../../redux/slices/employeesSlice';
import styles from './EmployeeCard.module.scss';

// Интерфейс для отпусков
interface Leave {
  leave_id: number;
  employee_personal_number: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  leave_type_name?: string;
}

interface LeaveType {
  leave_type_id: number;
  leave_type_name: string;
  description: string;
}

interface EmployeeCardProps {
  employee: EmployeeType;
  leaves: Leave[];
  leaveTypes: LeaveType[];
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

  // Функция для проверки, находится ли сотрудник в отпуске
  const isOnLeave = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const employeeLeaves = leaves.filter(leave => 
      leave.employee_personal_number === employee.personalNumber
    );
    
    for (const leave of employeeLeaves) {
      const startDate = new Date(leave.start_date);
      const endDate = new Date(leave.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      
      if (today >= startDate && today <= endDate) {
        return {
          isOnLeave: true,
          leaveType: leave.leave_type_name || 'Отпуск',
          endDate: leave.end_date
        };
      }
    }
    
    return { 
      isOnLeave: false,
      leaveType: undefined,
      endDate: undefined
    };
  };

  const leaveInfo = isOnLeave();

  // Получить текущий тип отпуска
  const getCurrentLeaveType = () => {
    if (leaveInfo.isOnLeave && leaveInfo.leaveType) {
      return leaveTypes.find(type => type.leave_type_name === leaveInfo.leaveType);
    }
    return null;
  };

  const currentLeaveType = getCurrentLeaveType();

  // Форматирование даты окончания отпуска
  const formatEndDate = (dateString?: string) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch (e) {
      return 'Неверный формат даты';
    }
  };

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
          {leaveInfo.isOnLeave ? (
            <Tag color="orange" icon={<HomeOutlined />} className={styles.statusTag}>
              {currentLeaveType?.leave_type_name || 'В отпуске'}
            </Tag>
          ) : (
            <Tag color="green" icon={<CheckCircleOutlined />} className={styles.statusTag}>
              Работает
            </Tag>
          )}
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
          
          {/* Информация об отпуске (если сотрудник в отпуске) */}
          {leaveInfo.isOnLeave && (
            <div className={styles.leaveInfo}>
              <h4 className={styles.leaveTitle}>Информация об отпуске:</h4>
              <div className={styles.leaveDetails}>
                <p className={styles.leaveDetail}>
                  <strong>Тип отпуска:</strong> {currentLeaveType?.leave_type_name || 'Не указан'}
                </p>
                <p className={styles.leaveDetail}>
                  <strong>Дата окончания:</strong> {formatEndDate(leaveInfo.endDate)}
                </p>
                {currentLeaveType?.description && (
                  <p className={styles.leaveDetail}>
                    <strong>Описание:</strong> {currentLeaveType.description}
                  </p>
                )}
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