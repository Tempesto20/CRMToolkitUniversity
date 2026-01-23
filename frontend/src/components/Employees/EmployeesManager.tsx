import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { 
  fetchAllEmployees, 
  deleteEmployee, 
  clearSuccessMessage,
  resetDeleteStatus,
  fetchServiceTypes,
  fetchBrigadas,
  fetchLocomotives,
  Employee as EmployeeType
} from '../../redux/slices/employeesSlice';
import { 
  Modal, 
  Button, 
  message, 
  Input, 
  Spin,
  Tag,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined,
  UserOutlined,
  EditOutlined,
  DeleteOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  HomeOutlined,
  CheckOutlined,
  CloseOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './EmployeesManager.module.scss';
import EmployeeCard from './EmployeeCard';
import AddEmployeeModal from './modals/AddEmployeeModal';
import EditEmployeeModal from './modals/EditEmployeeModal';

const { Search } = Input;

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

const EmployeesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    employees, 
    serviceTypes,
    brigadas,
    locomotives,
    positions,
    status, 
    deleteStatus,
    error,
    successMessage 
  } = useSelector((state: RootState) => state.employees);
  
  const [searchInput, setSearchInput] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ number: number; name: string } | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [displayedEmployees, setDisplayedEmployees] = useState<EmployeeType[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [leavesLoaded, setLeavesLoaded] = useState(false);
  const [localPositions] = useState<string[]>([
    'машинист',
    'пом.маш',
    'дублер'
  ]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка данных
  useEffect(() => {
    dispatch(fetchAllEmployees());
    dispatch(fetchServiceTypes());
    dispatch(fetchBrigadas());
    dispatch(fetchLocomotives());
    fetchLeaveTypes();
  }, [dispatch]);

  // Эффект для постепенной загрузки сотрудников
  useEffect(() => {
    if (employees.length > 0 && !initialLoadComplete) {
      setDisplayedEmployees(employees);
      setInitialLoadComplete(true);
    }
  }, [employees, initialLoadComplete]);

  // Улучшенная функция для поиска сотрудников
  const searchEmployees = useCallback((query: string, employeesList: EmployeeType[]) => {
    if (!query.trim()) {
      return {
        exactMatches: [],
        allMatches: employeesList,
        topMatches: employeesList
      };
    }
    
    const searchQuery = query.toLowerCase().trim();
    const results = [];
    
    for (const employee of employeesList) {
      let isExactMatch = false;
      let isMatch = false;
      
      // Проверка полного совпадения по личному номеру
      if (employee.personalNumber?.toString() === searchQuery) {
        isExactMatch = true;
        isMatch = true;
      }
      
      // Проверка полного совпадения по ФИО
      if (employee.fullName?.toLowerCase() === searchQuery) {
        isExactMatch = true;
        isMatch = true;
      }
      
      // Проверка частичного совпадения по ФИО
      if (!isMatch && employee.fullName?.toLowerCase().includes(searchQuery)) {
        isMatch = true;
      }
      
      // Проверка по личному номеру (частичное совпадение)
      if (!isMatch && employee.personalNumber?.toString().includes(searchQuery)) {
        isMatch = true;
      }
      
      if (isMatch) {
        results.push({
          ...employee,
          isExactMatch,
          priority: isExactMatch ? 2 : (employee.fullName?.toLowerCase().includes(searchQuery) ? 1 : 0)
        });
      }
    }
    
    // Сортировка: сначала точные совпадения, потом по приоритету
    results.sort((a, b) => {
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;
      return b.priority - a.priority;
    });
    
    // Разделяем на точные совпадения и все остальные
    const exactMatches = results.filter(emp => emp.isExactMatch);
    const allMatches = results;
    
    // Берем топ 5 результатов для отображения
    const topMatches = results.slice(0, 5);
    
    return {
      exactMatches,
      allMatches,
      topMatches
    };
  }, []);

  // Мемоизированные результаты поиска
  const searchResults = useMemo(() => {
    return searchEmployees(searchInput, displayedEmployees);
  }, [searchInput, displayedEmployees, searchEmployees]);

  // Функция для загрузки типов отпусков
  const fetchLeaveTypes = async () => {
    try {
      const response = await fetch('http://localhost:3000/leave-types');
      const data = await response.json();
      setLeaveTypes(data);
    } catch (err) {
      console.error('Ошибка при загрузке типов отпусков:', err);
    }
  };

  // Функция для загрузки отпусков сотрудников
  const fetchEmployeeLeaves = async () => {
    if (leavesLoaded || loadingLeaves) return;
    
    setLoadingLeaves(true);
    try {
      const response = await fetch('http://localhost:3000/leaves');
      const data = await response.json();
      setLeaves(data);
      setLeavesLoaded(true);
    } catch (err) {
      console.error('Ошибка при загрузке отпусков:', err);
    } finally {
      setLoadingLeaves(false);
    }
  };

  // Загрузка отпусков после загрузки сотрудников
  useEffect(() => {
    if (employees.length > 0 && !leavesLoaded && !loadingLeaves) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      timerRef.current = setTimeout(() => {
        fetchEmployeeLeaves();
      }, 500);
    }
  }, [employees.length, leavesLoaded, loadingLeaves]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Обработка сообщений об успехе и ошибках
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

  // Обновление поискового инпута
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Быстрый поиск при нажатии Enter
  const handleSearch = (value: string) => {
    setSearchInput(value.trim());
  };

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
  console.log('=== EDIT EMPLOYEE CLICKED ===');
  console.log('Full employee object:', JSON.stringify(employee, null, 2));
  console.log('Employee has serviceTypeId?', employee.serviceTypeId);
  console.log('Employee has serviceType?', employee.serviceType);
  console.log('Employee keys:', Object.keys(employee));
    setEditingEmployee(employee);
    setEditModal(true);
  }, []);

  const handleAddEmployee = () => {
    setAddModal(true);
  };

  const handleCancelAdd = () => {
    setAddModal(false);
  };

  const handleCancelEdit = () => {
    setEditModal(false);
    setEditingEmployee(null);
  };

  // Функция для обновления списка сотрудников
  const refreshEmployees = () => {
    dispatch(fetchAllEmployees());
  };

  // Функция для подсчета сотрудников в отпуске и работающих
  const getLeaveStats = () => {
    if (!leavesLoaded || leaves.length === 0) {
      return { onLeaveCount: 0, workingCount: employees.length };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let onLeaveCount = 0;
    
    employees.forEach(employee => {
      const employeeLeaves = leaves.filter(leave => 
        leave.employee_personal_number === employee.personalNumber
      );
      
      for (const leave of employeeLeaves) {
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
        
        if (today >= startDate && today <= endDate) {
          onLeaveCount++;
          break;
        }
      }
    });
    
    return { 
      onLeaveCount, 
      workingCount: employees.length - onLeaveCount 
    };
  };

  const leaveStats = getLeaveStats();

  // Список сотрудников для отображения (с поиском или без)
  const employeesToDisplay = searchInput 
    ? searchResults.topMatches 
    : displayedEmployees;

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
          <Button 
            type="primary" 
            size="large"
            onClick={handleAddEmployee}
          >
            + Добавить сотрудника
          </Button>
        </div>
      </div>
      
      <div className={styles.searchSection}>
        <div className={styles.searchInputContainer}>
          <Search
            placeholder="Поиск по ФИО или личному номеру..."
            allowClear
            size="large"
            value={searchInput}
            onChange={handleSearchChange}
            onSearch={handleSearch}
            prefix={<SearchOutlined />}
            className={styles.searchInput}
          />
          {searchInput && (
            <div className={styles.searchInfo}>
              <span className={styles.searchInfoText}>
                {searchResults.exactMatches.length > 0 
                  ? `Найдено полных совпадений: ${searchResults.exactMatches.length}` 
                  : `Найдено сотрудников: ${searchResults.allMatches.length}`}
              </span>
            </div>
          )}
        </div>
        
        <div className={styles.searchStats}>
          <span className={styles.statLabel}>Всего сотрудников:</span>
          <span className={styles.statValue}>{employees.length}</span>
          <span className={styles.statLabel}>Показано:</span>
          <span className={styles.statValue}>{displayedEmployees.length}</span>
          {searchInput ? (
            <>
              <span className={styles.statLabel}>Результатов:</span>
              <span className={styles.statValue}>{searchResults.allMatches.length}</span>
            </>
          ) : null}
          <span className={styles.statLabel}>В отпуске:</span>
          <span className={`${styles.statValue} ${styles.onLeave}`}>
            {leaveStats.onLeaveCount}
          </span>
          <span className={styles.statLabel}>Работают:</span>
          <span className={`${styles.statValue} ${styles.working}`}>
            {leaveStats.workingCount}
          </span>
        </div>
      </div>

      {error && status === 'error' ? (
        <div className={styles.errorMessage}>
          <p>Ошибка при загрузке сотрудников: {error}</p>
          <Button onClick={() => dispatch(fetchAllEmployees())}>
            Повторить попытку
          </Button>
        </div>
      ) : searchInput && searchResults.allMatches.length === 0 ? (
        <div className={styles.noResults}>
          <p>Сотрудники не найдены по запросу "{searchInput}"</p>
          <Button onClick={() => setSearchInput('')}>
            Очистить поиск
          </Button>
        </div>
      ) : (
        <>
          {/* {loadingLeaves && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinContainer}>
                <Spin size="large" />
                <div className={styles.spinText}>Загрузка информации об отпусках...</div>
              </div>
            </div>
          )} */}
          
          <div className={styles.employeesGrid}>
            {employeesToDisplay.map((employee: any) => (
              <EmployeeCard
                key={employee.personalNumber}
                employee={employee}
                leaves={leaves}
                leaveTypes={leaveTypes}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isExactMatch={employee.isExactMatch}
              />
            ))}
          </div>
          
          {searchInput && searchResults.allMatches.length > searchResults.topMatches.length && (
            <div className={styles.searchMoreInfo}>
              <div className={styles.searchMoreText}>
                Показаны {searchResults.topMatches.length} наиболее релевантных результатов из {searchResults.allMatches.length}
              </div>
              {searchResults.exactMatches.length === 0 && (
                <Button 
                  type="link" 
                  onClick={() => {
                    message.info('Для просмотра всех результатов уточните поисковый запрос');
                  }}
                >
                  Уточните запрос для поиска остальных сотрудников
                </Button>
              )}
            </div>
          )}
          
          {!searchInput && displayedEmployees.length < employees.length && (
            <div className={styles.loadMoreContainer}>
              <div className={styles.loadMoreInfo}>
                Показано {displayedEmployees.length} из {employees.length} сотрудников
              </div>
              <Button 
                type="primary"
                onClick={() => setDisplayedEmployees(employees)}
                className={styles.loadMoreButton}
              >
                Показать всех сотрудников
              </Button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно добавления сотрудника */}
      <AddEmployeeModal
        visible={addModal}
        onCancel={handleCancelAdd}
        serviceTypes={serviceTypes}
        brigadas={brigadas}
        locomotives={locomotives}
        positions={localPositions}
        refreshEmployees={refreshEmployees}
      />

      {/* Модальное окно редактирования сотрудника */}
      <EditEmployeeModal
        visible={editModal}
        onCancel={handleCancelEdit}
        editingEmployee={editingEmployee}
        serviceTypes={serviceTypes}
        brigadas={brigadas}
        locomotives={locomotives}
        positions={localPositions}
        refreshEmployees={refreshEmployees}
      />

      {/* Модальное окно подтверждения удаления */}
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