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
import './EmployeesManager.module.scss';

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
    <div className="employee-card">
      <div className="employee-photo">
        {photoUrl ? (
          <img src={photoUrl} alt={employee.fullName} />
        ) : (
          <div className="default-photo">
            <UserOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
          </div>
        )}
      </div>
      
      <div className="employee-info">
        <h3>{employee.fullName}</h3>
        
        <div className="employee-details">
          <p>
            <strong>Личный номер:</strong> 
            <span className="employee-value">{employee.personalNumber}</span>
          </p>
          <p>
            <strong>Должность:</strong> 
            <span className="employee-value">{employee.position || 'Не указана'}</span>
          </p>
          <p>
            <strong>Служба:</strong> 
            <span className="employee-value">
              {employee.serviceType?.serviceTypeName || employee.serviceTypeId || 'Не указана'}
            </span>
          </p>
          <p>
            <strong>Вид работ:</strong> 
            <span className="employee-value">
              {employee.workType?.workTypeName || employee.workTypeId || 'Не указан'}
            </span>
          </p>
          {employee.brigadaId && (
            <p>
              <strong>Бригада:</strong> 
              <span className="employee-value">
                {employee.brigada?.brigadaName || `№${employee.brigadaId}`}
              </span>
            </p>
          )}
          {employee.phone && (
            <p>
              <strong>Телефон:</strong> 
              <span className="employee-value">{employee.phone}</span>
            </p>
          )}
          <div className="employee-access">
            {employee.hasTrip && <span className="access-badge">Поездка</span>}
            {employee.hasCraneman && <span className="access-badge">Крановщик</span>}
            {employee.dieselAccess && <span className="access-badge">Дизель</span>}
            {employee.electricAccess && <span className="access-badge">Электровоз</span>}
          </div>
        </div>
      </div>
      
      <div className="employee-actions">
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => onEdit(employee)}
          className="action-btn edit-btn"
        >
          Редактировать
        </Button>
        <Button 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete(employee.personalNumber, employee.fullName)}
          className="action-btn delete-btn"
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
      <div className="loading-container">
        <Spin size="large" />
        <p>Загрузка сотрудников...</p>
      </div>
    );
  }

  return (
    <div className="employees-manager">
      <div className="page-header">
        <h1>Управление сотрудниками</h1>
        <div className="header-actions">
          <Button type="primary" size="large">
            + Добавить сотрудника
          </Button>
        </div>
      </div>
      
      <div className="search-section">
        <Search
          placeholder="Поиск по ФИО или личному номеру..."
          allowClear
          size="large"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={(value) => setSearchTerm(value)}
          prefix={<SearchOutlined />}
          className="search-input"
        />
        
        <div className="search-stats">
          <span className="stat-label">Всего сотрудников:</span>
          <span className="stat-value">{employees.length}</span>
          <span className="stat-label">Найдено:</span>
          <span className="stat-value">{filteredEmployees.length}</span>
        </div>
      </div>

      {error && status === 'error' ? (
        <div className="error-message">
          <p>Ошибка при загрузке сотрудников: {error}</p>
          <Button onClick={() => dispatch(fetchAllEmployees())}>
            Повторить попытку
          </Button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="no-results">
          <p>Сотрудники не найдены</p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm('')}>
              Очистить поиск
            </Button>
          )}
        </div>
      ) : (
        <div className="employees-grid">
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
          <div className="delete-confirmation">
            <p>Вы уверены, что хотите удалить сотрудника?</p>
            <p><strong>ФИО:</strong> {employeeToDelete.name}</p>
            <p><strong>Личный номер:</strong> {employeeToDelete.number}</p>
            <p className="warning-text">Это действие нельзя отменить!</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EmployeesManager;