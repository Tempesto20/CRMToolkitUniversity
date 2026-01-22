// frontend/src/components/EmployeesManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchAllEmployees, 
  deleteEmployee, 
  clearSuccessMessage,
  resetDeleteStatus,
  Employee as EmployeeType
} from '../redux/slices/employeesSlice';
import { Modal, Button, message, Input, Spin } from 'antd';
import { SearchOutlined, UserOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './EmployeesManager.module.scss';

const { Search } = Input;

interface EmployeeCardProps {
  employee: EmployeeType;
  onEdit: (employee: EmployeeType) => void;
  onDelete: (personalNumber: number, fullName: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
  const getPhotoUrl = () => {
    if (employee.photoFilename && employee.photoMimetype) {
      // Если есть фото в БД
      return `http://localhost:3000/api/employees/photo/${employee.personalNumber}`;
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className={styles.employeeCard}>
      <div className={styles.employeePhoto}>
        {photoUrl ? (
          <img src={photoUrl} alt={employee.fullName} />
        ) : (
          <div className={styles.defaultPhoto}>
            <UserOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
          </div>
        )}
      </div>
      
      <div className={styles.employeeInfo}>
        <h3>{employee.fullName}</h3>
        
        <div className={styles.employeeDetails}>
          <p>
            <strong>Личный номер:</strong> 
            <span className={styles.employeeValue}>{employee.personalNumber}</span>
          </p>
          <p>
            <strong>Должность:</strong> 
            <span className={styles.employeeValue}>{employee.position || 'Не указана'}</span>
          </p>
          <p>
            <strong>Служба:</strong> 
            <span className={styles.employeeValue}>
              {employee.serviceType?.serviceTypeName || employee.serviceTypeId || 'Не указана'}
            </span>
          </p>
          <p>
            <strong>Вид работ:</strong> 
            <span className={styles.employeeValue}>
              {employee.workType?.workTypeName || employee.workTypeId || 'Не указан'}
            </span>
          </p>
          {employee.brigadaId && (
            <p>
              <strong>Бригада:</strong> 
              <span className={styles.employeeValue}>
                {employee.brigada?.brigadaName || `№${employee.brigadaId}`}
              </span>
            </p>
          )}
          {employee.phone && (
            <p>
              <strong>Телефон:</strong> 
              <span className={styles.employeeValue}>{employee.phone}</span>
            </p>
          )}
          <div className={styles.employeeAccess}>
            {employee.hasTrip && <span className={styles.accessBadge}>допуск к выезду магнитогорск-грузовой</span>}
            {employee.hasCraneman && <span className={styles.accessBadge}>допуск кантовщика</span>}
            {employee.dieselAccess && <span className={styles.accessBadge}>допуск к тепловозу</span>}
            {employee.electricAccess && <span className={styles.accessBadge}>допуск к электровозу</span>}
          </div>
        </div>
      </div>
      
      <div className={styles.employeeActions}>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => onEdit(employee)}
          className={`${styles.actionBtn} ${styles.editBtn}`}
        >
          Редактировать
        </Button>
        <Button 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete(employee.personalNumber, employee.fullName)}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
        >
          Удалить
        </Button>
      </div>
    </div>
  );
};

const EmployeesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    employees, 
    status, 
    deleteStatus,
    error,
    successMessage 
  } = useSelector((state: RootState) => state.employees);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ number: number; name: string } | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(null);

  useEffect(() => {
    dispatch(fetchAllEmployees());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearSuccessMessage());
    }
    if (error) {
      message.error(error);
    }
  }, [successMessage, error, dispatch]);

  useEffect(() => {
    if (deleteStatus === 'success') {
      message.success('Сотрудник успешно удален');
      dispatch(resetDeleteStatus());
      setDeleteModal(false);
      setEmployeeToDelete(null);
    }
  }, [deleteStatus, dispatch]);

  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return (
      employee.fullName?.toLowerCase().includes(searchLower) ||
      employee.personalNumber?.toString().includes(searchTerm)
    );
  });

  const handleDeleteClick = useCallback((personalNumber: number, fullName: string) => {
    setEmployeeToDelete({ number: personalNumber, name: fullName });
    setDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (employeeToDelete) {
      dispatch(deleteEmployee(employeeToDelete.number));
    }
  }, [dispatch, employeeToDelete]);

  const handleEditClick = useCallback((employee: EmployeeType) => {
    setEditingEmployee(employee);
    // Здесь можно открыть модалку редактирования
    message.info('Редактирование сотрудника - в разработке');
  }, []);

  if (status === 'loading' && employees.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Загрузка сотрудников...</p>
      </div>
    );
  }

  return (
    <div className={styles.employeesManager}>
      <div className={styles.pageHeader}>
        <h1>Управление сотрудниками</h1>
        <div className={styles.headerActions}>
          <Button type="primary" size="large">
            + Добавить сотрудника
          </Button>
        </div>
      </div>
      
      <div className={styles.searchSection}>
        <Search
          placeholder="Поиск по ФИО или личному номеру..."
          allowClear
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={(value) => setSearchTerm(value)}
          prefix={<SearchOutlined />}
          className={styles.searchInput}
        />
        
        <div className={styles.searchStats}>
          <span className={styles.statLabel}>Всего сотрудников:</span>
          <span className={styles.statValue}>{employees.length}</span>
          <span className={styles.statLabel}>Найдено:</span>
          <span className={styles.statValue}>{filteredEmployees.length}</span>
        </div>
      </div>

      {error && status === 'error' ? (
        <div className={styles.errorMessage}>
          <p>Ошибка при загрузке сотрудников: {error}</p>
          <Button onClick={() => dispatch(fetchAllEmployees())}>
            Повторить попытку
          </Button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className={styles.noResults}>
          <p>Сотрудники не найдены</p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm('')}>
              Очистить поиск
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.employeesGrid}>
          {filteredEmployees.map((employee) => (
            <EmployeeCard
              key={employee.personalNumber}
              employee={employee}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <Modal
        title="Подтверждение удаления"
        open={deleteModal}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModal(false)}
        confirmLoading={deleteStatus === 'loading'}
        okText="Удалить"
        cancelText="Отмена"
        okType="danger"
      >
        {employeeToDelete && (
          <div className={styles.deleteConfirmation}>
            <p>Вы уверены, что хотите удалить сотрудника?</p>
            <p><strong>ФИО:</strong> {employeeToDelete.name}</p>
            <p><strong>Личный номер:</strong> {employeeToDelete.number}</p>
            <p className={styles.warningText}>Это действие нельзя отменить!</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeesManager;