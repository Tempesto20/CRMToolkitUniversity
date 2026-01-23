import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import {
  fetchLeaves,
  deleteLeave,
  clearSuccessMessage,
  resetDeleteStatus,
  createLeave,
  updateLeave
} from '../../redux/slices/leavesSlice';
import { fetchAllEmployees } from '../../redux/slices/employeesSlice';
import {
  Modal,
  Button,
  message,
  Input,
  Spin,
  Tag,
  Row,
  Col,
  Select,
  DatePicker
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  HomeOutlined,
  PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './LeavesManager.module.scss';
import LeaveCard from './LeaveCard';
import AddLeaveModal from './modals/AddLeaveModal';
import EditLeaveModal from './modals/EditLeaveModal';

const { Search } = Input;
const { Option } = Select;

// Интерфейсы
interface Leave {
  leave_id: number;
  employee_personal_number: number;
  leave_type_id: number;
  start_date: string;
  end_date: string;
  leave_type_name?: string;
  employee_full_name?: string;
  leave_type_description?: string;
}

interface LeaveType {
  leave_type_id: number;
  leave_type_name: string;
  description: string;
}

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

const LeavesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    leaves,
    activeLeaves,
    todayLeaves,
    stats,
    status,
    error,
  } = useSelector((state: RootState) => state.leaves);

  const { employees } = useSelector((state: RootState) => state.employees);

  const [searchInput, setSearchInput] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<{ id: number; employeeName: string; leaveType: string } | null>(null);
  const [editingLeave, setEditingLeave] = useState<Leave | null>(null);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(false);
  const [displayedLeaves, setDisplayedLeaves] = useState<Leave[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'today'>('all');
  const [employeeFilter, setEmployeeFilter] = useState<number | null>(null);
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка данных
  useEffect(() => {
    dispatch(fetchLeaves());
    dispatch(fetchAllEmployees());
    fetchLeaveTypes();
  }, [dispatch]);

  // Эффект для постепенной загрузки отпусков
  useEffect(() => {
    if (leaves.length > 0 && !initialLoadComplete) {
      setDisplayedLeaves(leaves);
      setInitialLoadComplete(true);
    }
  }, [leaves, initialLoadComplete]);

  // Функция для загрузки типов отпусков
  const fetchLeaveTypes = async () => {
    try {
      setLoadingLeaveTypes(true);
      const response = await fetch('http://localhost:3000/leave-types');
      const data = await response.json();
      setLeaveTypes(data);
    } catch (err) {
      console.error('Ошибка при загрузке типов отпусков:', err);
      message.error('Не удалось загрузить типы отпусков');
    } finally {
      setLoadingLeaveTypes(false);
    }
  };

  // Улучшенная функция для поиска отпусков
  const searchLeaves = useCallback((query: string, leavesList: Leave[], employeesList: Employee[]) => {
    if (!query.trim()) {
      return {
        exactMatches: [],
        allMatches: leavesList,
        topMatches: leavesList
      };
    }

    const searchQuery = query.toLowerCase().trim();
    const results = [];

    for (const leave of leavesList) {
      let isExactMatch = false;
      let isMatch = false;

      // Поиск по имени сотрудника
      const employee = employeesList.find(emp => emp.personalNumber === leave.employee_personal_number);
      const employeeName = employee?.fullName?.toLowerCase() || '';

      if (employeeName === searchQuery) {
        isExactMatch = true;
        isMatch = true;
      }

      // Поиск по личному номеру
      if (leave.employee_personal_number?.toString() === searchQuery) {
        isExactMatch = true;
        isMatch = true;
      }

      // Частичный поиск по имени
      if (!isMatch && employeeName.includes(searchQuery)) {
        isMatch = true;
      }

      // Поиск по типу отпуска
      const leaveTypeName = leave.leave_type_name?.toLowerCase() || '';
      if (!isMatch && leaveTypeName.includes(searchQuery)) {
        isMatch = true;
      }

      if (isMatch) {
        results.push({
          ...leave,
          isExactMatch,
          priority: isExactMatch ? 2 : (employeeName.includes(searchQuery) ? 1 : 0)
        });
      }
    }

    // Сортировка
    results.sort((a, b) => {
      if (a.isExactMatch && !b.isExactMatch) return -1;
      if (!a.isExactMatch && b.isExactMatch) return 1;
      return b.priority - a.priority;
    });

    const exactMatches = results.filter(leave => leave.isExactMatch);
    const allMatches = results;
    const topMatches = results.slice(0, 5);

    return {
      exactMatches,
      allMatches,
      topMatches
    };
  }, []);

  // Мемоизированные результаты поиска
  const searchResults = useMemo(() => {
    return searchLeaves(searchInput, displayedLeaves, employees);
  }, [searchInput, displayedLeaves, employees, searchLeaves]);

  // Обработка сообщений об ошибках
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  // Обновление поискового инпута
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  // Быстрый поиск при нажатии Enter
  const handleSearch = (value: string) => {
    setSearchInput(value.trim());
  };

  const handleDeleteClick = useCallback((leaveId: number, employeeName: string, leaveType: string) => {
    setLeaveToDelete({ id: leaveId, employeeName, leaveType });
    setDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (leaveToDelete) {
      dispatch(deleteLeave(leaveToDelete.id));
      setDeleteModal(false);
      setLeaveToDelete(null);
    }
  }, [dispatch, leaveToDelete]);

  const handleEditClick = useCallback((leave: Leave) => {
    setEditingLeave(leave);
    setEditModal(true);
  }, []);

  const handleAddLeave = () => {
    setAddModal(true);
  };

  const handleCancelAdd = () => {
    setAddModal(false);
  };

  const handleCancelEdit = () => {
    setEditModal(false);
    setEditingLeave(null);
  };

  // Функция для обновления списка отпусков
  const refreshLeaves = () => {
    dispatch(fetchLeaves());
  };

  // Функция для подсчета статистики
  const getStats = () => {
    const totalLeaves = leaves.length;
    const activeLeavesCount = activeLeaves.length;
    const todayLeavesCount = todayLeaves.length;
    
    return {
      total: totalLeaves,
      active: activeLeavesCount,
      today: todayLeavesCount
    };
  };

  const leaveStats = getStats();

  // Функция для фильтрации отпусков
  const filterLeaves = useCallback((leavesList: Leave[]) => {
    let filtered = leavesList;

    // Фильтр по статусу
    switch (filter) {
      case 'active':
        filtered = activeLeaves;
        break;
      case 'today':
        filtered = todayLeaves;
        break;
      default:
        filtered = leavesList;
    }

    // Фильтр по сотруднику
    if (employeeFilter) {
      filtered = filtered.filter(leave => leave.employee_personal_number === employeeFilter);
    }

    // Фильтр по типу отпуска
    if (leaveTypeFilter) {
      filtered = filtered.filter(leave => leave.leave_type_id === leaveTypeFilter);
    }

    return filtered;
  }, [filter, employeeFilter, leaveTypeFilter, activeLeaves, todayLeaves]);

  // Список отпусков для отображения (с поиском и фильтрами)
  const leavesToDisplay = useMemo(() => {
    const filteredLeaves = filterLeaves(displayedLeaves);
    return searchInput ? searchResults.topMatches : filteredLeaves;
  }, [displayedLeaves, searchInput, searchResults.topMatches, filterLeaves]);

  if (status === 'loading' && leaves.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <Spin size="large" />
        <p>Загрузка отпусков...</p>
      </div>
    );
  }

  return (
    <div className={styles.leavesManager}>
      <div className={styles.pageHeader}>
        <h1>Управление отпусками</h1>
        <div className={styles.headerActions}>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleAddLeave}
          >
            Создать отпуск
          </Button>
        </div>
      </div>

      <div className={styles.searchSection}>
        <div className={styles.searchInputContainer}>
          <Search
            placeholder="Поиск по сотруднику, личному номеру или типу отпуска..."
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
                  : `Найдено отпусков: ${searchResults.allMatches.length}`}
              </span>
            </div>
          )}
        </div>

        <div className={styles.filterSection}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div className={styles.filterGroup}>
                <label>Статус:</label>
                <Select
                  value={filter}
                  onChange={setFilter}
                  style={{ width: '100%' }}
                  size="large"
                >
                  <Option value="all">Все отпуска</Option>
                  <Option value="active">Текущие отпуска</Option>
                  <Option value="today">Сегодня в отпуске</Option>
                </Select>
              </div>
            </Col>
            
            <Col span={8}>
              <div className={styles.filterGroup}>
                <label>Сотрудник:</label>
                <Select
                  value={employeeFilter}
                  onChange={setEmployeeFilter}
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                  placeholder="Выберите сотрудника"
                  showSearch
                  optionFilterProp="children"
                >
                  {employees.map(employee => (
                    <Option key={employee.personalNumber} value={employee.personalNumber}>
                      {employee.fullName} ({employee.personalNumber})
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            <Col span={8}>
              <div className={styles.filterGroup}>
                <label>Тип отпуска:</label>
                <Select
                  value={leaveTypeFilter}
                  onChange={setLeaveTypeFilter}
                  style={{ width: '100%' }}
                  size="large"
                  allowClear
                  placeholder="Выберите тип отпуска"
                  loading={loadingLeaveTypes}
                >
                  {leaveTypes.map(type => (
                    <Option key={type.leave_type_id} value={type.leave_type_id}>
                      {type.leave_type_name}
                    </Option>
                  ))}
                </Select>
              </div>
            </Col>
          </Row>
        </div>

        <div className={styles.searchStats}>
          <span className={styles.statLabel}>Всего отпусков:</span>
          <span className={styles.statValue}>{leaveStats.total}</span>
          <span className={styles.statLabel}>Показано:</span>
          <span className={styles.statValue}>{displayedLeaves.length}</span>
          {searchInput ? (
            <>
              <span className={styles.statLabel}>Результатов:</span>
              <span className={styles.statValue}>{searchResults.allMatches.length}</span>
            </>
          ) : null}
          <span className={styles.statLabel}>Текущие:</span>
          <span className={`${styles.statValue} ${styles.active}`}>
            {leaveStats.active}
          </span>
          <span className={styles.statLabel}>Сегодня:</span>
          <span className={`${styles.statValue} ${styles.today}`}>
            {leaveStats.today}
          </span>
        </div>
      </div>

      {error && status === 'error' ? (
        <div className={styles.errorMessage}>
          <p>Ошибка при загрузке отпусков: {error}</p>
          <Button onClick={() => dispatch(fetchLeaves())}>
            Повторить попытку
          </Button>
        </div>
      ) : searchInput && searchResults.allMatches.length === 0 ? (
        <div className={styles.noResults}>
          <p>Отпуски не найдены по запросу "{searchInput}"</p>
          <Button onClick={() => setSearchInput('')}>
            Очистить поиск
          </Button>
        </div>
      ) : (
        <>
          <div className={styles.leavesGrid}>
            {leavesToDisplay.map((leave: any) => (
              <LeaveCard
                key={leave.leave_id}
                leave={leave}
                employee={employees.find(emp => emp.personalNumber === leave.employee_personal_number)}
                leaveType={leaveTypes.find(type => type.leave_type_id === leave.leave_type_id)}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isExactMatch={leave.isExactMatch}
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
                  Уточните запрос для поиска остальных отпусков
                </Button>
              )}
            </div>
          )}

          {!searchInput && displayedLeaves.length < leaves.length && (
            <div className={styles.loadMoreContainer}>
              <div className={styles.loadMoreInfo}>
                Показано {displayedLeaves.length} из {leaves.length} отпусков
              </div>
              <Button
                type="primary"
                onClick={() => setDisplayedLeaves(leaves)}
                className={styles.loadMoreButton}
              >
                Показать все отпуски
              </Button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно создания отпуска */}
      <AddLeaveModal
        visible={addModal}
        onCancel={handleCancelAdd}
        employees={employees}
        leaveTypes={leaveTypes}
        refreshLeaves={refreshLeaves}
      />

      {/* Модальное окно редактирования отпуска */}
      <EditLeaveModal
        visible={editModal}
        onCancel={handleCancelEdit}
        editingLeave={editingLeave}
        employees={employees}
        leaveTypes={leaveTypes}
        refreshLeaves={refreshLeaves}
      />

      {/* Модальное окно подтверждения удаления */}
      <Modal
        title="Подтверждение удаления отпуска"
        open={deleteModal}
        onOk={handleDeleteConfirm}
        onCancel={() => setDeleteModal(false)}
        okText="Удалить"
        cancelText="Отмена"
        okType="danger"
      >
        {leaveToDelete && (
          <div className={styles.deleteConfirmation}>
            <p>Вы уверены, что хотите удалить отпуск?</p>
            <p><strong>Сотрудник:</strong> {leaveToDelete.employeeName}</p>
            <p><strong>Тип отпуска:</strong> {leaveToDelete.leaveType}</p>
            <p className={styles.warningText}>Это действие нельзя отменить!</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeavesManager;