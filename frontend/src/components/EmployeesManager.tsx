import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchAllEmployees, 
  deleteEmployee, 
  clearSuccessMessage,
  resetDeleteStatus,
  createEmployee,
  updateEmployee,
  fetchServiceTypes,
  fetchWorkTypesByService,
  fetchBrigadas,
  fetchLocomotives,
  Employee as EmployeeType,
  ServiceType,
  WorkType,
  Brigada,
  Locomotive
} from '../redux/slices/employeesSlice';
import { 
  Modal, 
  Button, 
  message, 
  Input, 
  Spin, 
  Select, 
  Switch, 
  Form, 
  Row, 
  Col,
  DatePicker,
  Tag,
  Tooltip,
  Upload
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
  InfoCircleOutlined,
  UploadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './EmployeesManager.module.scss';

const { Search } = Input;
const { Option } = Select;

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
  const getPhotoUrl = () => {
    if (employee.photoFilename && employee.photoMimetype) {
      return `http://localhost:3000/api/employees/photo/${employee.personalNumber}`;
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

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
      {isExactMatch && (
        <div className={styles.exactMatchBadge}>
          <Tag color="blue" icon={<InfoCircleOutlined />}>
            Полное совпадение
          </Tag>
        </div>
      )}
      
      {leaveInfo.isOnLeave && (
        <div className={styles.leaveBadge}>
          <Tag color="orange" icon={<HomeOutlined />}>
            В отпуске
          </Tag>
        </div>
      )}
      
      <div className={styles.employeePhoto}>
        {photoUrl ? (
          <img src={photoUrl} alt={employee.fullName} />
        ) : (
          <div className={styles.defaultPhoto}>
            <UserOutlined style={{ fontSize: '48px', color: '#8c8c8c' }} />
          </div>
        )}
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
      
      <div className={styles.employeeInfo}>
        <div className={styles.employeeHeader}>
          <h3>{employee.fullName}</h3>
          {leaveInfo.isOnLeave ? (
            <Tag color="orange" icon={<HomeOutlined />}>
              {currentLeaveType?.leave_type_name || 'В отпуске'}
            </Tag>
          ) : (
            <Tag color="green" icon={<CheckCircleOutlined />}>
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
                    `${employee.locomotive.locomotiveName || employee.locomotive.locomotiveId}` 
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
          
          <div className={styles.accessSection}>
            <h4>Допуски:</h4>
            <div className={styles.accessBadges}>
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Выезд магнитогорск-грузовой:</span>
                {employee.hasTrip ? (
                  <Tag color="green" icon={<CheckOutlined />}>Имеется</Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />}>Не имеется</Tag>
                )}
              </div>
              
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Кантовщик:</span>
                {employee.hasCraneman ? (
                  <Tag color="green" icon={<CheckOutlined />}>Имеется</Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />}>Не имеется</Tag>
                )}
              </div>
              
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Тепловоз:</span>
                {employee.dieselAccess ? (
                  <Tag color="green" icon={<CheckOutlined />}>Имеется</Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />}>Не имеется</Tag>
                )}
              </div>
              
              <div className={styles.accessItem}>
                <span className={styles.accessLabel}>Электровоз:</span>
                {employee.electricAccess ? (
                  <Tag color="green" icon={<CheckOutlined />}>Имеется</Tag>
                ) : (
                  <Tag color="default" icon={<CloseOutlined />}>Не имеется</Tag>
                )}
              </div>
            </div>
          </div>
          
          {leaveInfo.isOnLeave && (
            <div className={styles.leaveInfo}>
              <h4>Информация об отпуске:</h4>
              <div className={styles.leaveDetails}>
                <p><strong>Тип отпуска:</strong> {currentLeaveType?.leave_type_name || 'Не указан'}</p>
                <p><strong>Дата окончания:</strong> {formatEndDate(leaveInfo.endDate)}</p>
                {currentLeaveType?.description && (
                  <p><strong>Описание:</strong> {currentLeaveType.description}</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className={styles.employeeActions}>
        <Button 
          type="primary" 
          icon={<EditOutlined />}
          onClick={() => onEdit(employee)}
          className={`${styles.actionBtn} ${styles.editBtn}`}
          disabled={leaveInfo.isOnLeave}
        >
          Редактировать
        </Button>
        <Button 
          danger 
          icon={<DeleteOutlined />}
          onClick={() => onDelete(employee.personalNumber, employee.fullName)}
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          disabled={leaveInfo.isOnLeave}
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
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [filteredWorkTypes, setFilteredWorkTypes] = useState<WorkType[]>([]);
  const [editFilteredWorkTypes, setEditFilteredWorkTypes] = useState<WorkType[]>([]);
  const [loadingWorkTypes, setLoadingWorkTypes] = useState(false);
  const [localPositions, setLocalPositions] = useState<string[]>([
    'машинист',
    'пом.маш',
    'дублер'
  ]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [displayedEmployees, setDisplayedEmployees] = useState<EmployeeType[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [leavesLoaded, setLeavesLoaded] = useState(false);
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Эффект для установки workTypeId при загрузке editFilteredWorkTypes
  useEffect(() => {
    if (editModal && editingEmployee && editFilteredWorkTypes.length > 0) {
      // Проверяем, есть ли текущий workTypeId в загруженных типах
      const workTypeExists = editFilteredWorkTypes.some(
        work => work.workTypeId === editingEmployee.workTypeId
      );
      
      if (workTypeExists) {
        editForm.setFieldsValue({ workTypeId: editingEmployee.workTypeId });
      }
    }
  }, [editFilteredWorkTypes, editModal, editingEmployee, editForm]);

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
          // Приоритет для отображения: точные совпадения первые
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

  // Функция для сортировки locomotiveId как чисел
  const sortLocomotives = (locos: Locomotive[]) => {
    return [...locos].sort((a, b) => {
      const extractNumber = (id: string) => {
        const match = id.match(/\d+/);
        return match ? parseInt(match[0], 10) : NaN;
      };
      
      const numA = extractNumber(a.locomotiveId);
      const numB = extractNumber(b.locomotiveId);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      if (!isNaN(numA) && isNaN(numB)) return -1;
      if (isNaN(numA) && !isNaN(numB)) return 1;
      
      return a.locomotiveId.localeCompare(b.locomotiveId);
    });
  };

  // Функция для форматирования отображения локомотива
  const formatLocomotiveDisplay = (locomotive: Locomotive) => {
    if (!locomotive) return '';
    if (locomotive.locomotiveName && 
        locomotive.locomotiveName !== 'не указано' && 
        locomotive.locomotiveName !== locomotive.locomotiveId) {
      return `${locomotive.locomotiveName} (${locomotive.locomotiveId})`;
    }
    return locomotive.locomotiveId;
  };

  const handleServiceTypeChange = async (value: number) => {
    form.setFieldsValue({ workTypeId: undefined });
    setFilteredWorkTypes([]);
    
    if (value) {
      setLoadingWorkTypes(true);
      try {
        const resultAction = await dispatch(fetchWorkTypesByService(value));
        if (fetchWorkTypesByService.fulfilled.match(resultAction)) {
          setFilteredWorkTypes(resultAction.payload);
        }
      } catch (err) {
        message.error('Ошибка загрузки видов работ');
      } finally {
        setLoadingWorkTypes(false);
      }
    }
  };

  const handleEditServiceTypeChange = async (value: number, employee: EmployeeType) => {
    editForm.setFieldsValue({ workTypeId: undefined });
    setEditFilteredWorkTypes([]);
    
    if (value) {
      setLoadingWorkTypes(true);
      try {
        const resultAction = await dispatch(fetchWorkTypesByService(value));
        if (fetchWorkTypesByService.fulfilled.match(resultAction)) {
          const workTypes = resultAction.payload;
          setEditFilteredWorkTypes(workTypes);
        }
      } catch (err) {
        console.error('Ошибка загрузки видов работ:', err);
        message.error('Ошибка загрузки видов работ');
      } finally {
        setLoadingWorkTypes(false);
      }
    }
  };

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
    setEditingEmployee(employee);
    
    // Преобразование данных для формы
    const formValues: any = {
      fullName: employee.fullName,
      serviceTypeId: employee.serviceTypeId,
      workTypeId: employee.workTypeId,
      position: employee.position,
      phone: employee.phone,
      birthday: employee.birthday ? dayjs(employee.birthday * 1000) : null,
      hasTrip: employee.hasTrip,
      hasCraneman: employee.hasCraneman,
      dieselAccess: employee.dieselAccess,
      electricAccess: employee.electricAccess,
    };
    
    // Обработка бригады - может быть undefined
    if (employee.brigadaId) {
      formValues.brigadaId = employee.brigadaId;
    } else {
      formValues.brigadaId = undefined; // Явно устанавливаем undefined
    }
    
    // Обработка локомотива - может быть undefined
    if (employee.locomotiveId) {
      formValues.locomotiveId = employee.locomotiveId;
    } else {
      formValues.locomotiveId = undefined; // Явно устанавливаем undefined
    }
    
    // Загружаем виды работ для выбранной службы
    handleEditServiceTypeChange(employee.serviceTypeId, employee);
    
    // Устанавливаем значения формы
    editForm.setFieldsValue(formValues);
    
    // Устанавливаем превью фото, если есть
    if (employee.photoFilename && employee.photoMimetype) {
      setPhotoPreview(`http://localhost:3000/api/employees/photo/${employee.personalNumber}`);
    } else {
      setPhotoPreview(null);
    }
    
    setEmployeePhoto(null);
    setEditModal(true);
  }, [editForm]);

  const handleAddEmployee = () => {
    setAddModal(true);
  };

  const handleCancelAdd = () => {
    setAddModal(false);
    form.resetFields();
    setFilteredWorkTypes([]);
    setEmployeePhoto(null);
    setPhotoPreview(null);
  };

  const handleCancelEdit = () => {
    setEditModal(false);
    setEditingEmployee(null);
    editForm.resetFields();
    setEditFilteredWorkTypes([]);
    setEmployeePhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (values: any) => {
    try {
      const formData = new FormData();
      
      formData.append('fullName', values.fullName);
      formData.append('personalNumber', values.personalNumber.toString());
      formData.append('serviceTypeId', values.serviceTypeId.toString());
      formData.append('workTypeId', values.workTypeId.toString());
      formData.append('position', values.position);
      
      if (values.brigadaId && values.brigadaId !== 'undefined') {
        formData.append('brigadaId', values.brigadaId.toString());
      }
      
      if (values.locomotiveId && values.locomotiveId !== 'undefined') {
        formData.append('locomotiveId', values.locomotiveId.toString());
      }
      
      if (values.phone) {
        formData.append('phone', values.phone);
      }
      if (values.birthday) {
        const birthdayTimestamp = Math.floor(values.birthday.valueOf() / 1000);
        formData.append('birthday', birthdayTimestamp.toString());
      }
      
      formData.append('hasTrip', values.hasTrip ? 'true' : 'false');
      formData.append('hasCraneman', values.hasCraneman ? 'true' : 'false');
      formData.append('dieselAccess', values.dieselAccess ? 'true' : 'false');
      formData.append('electricAccess', values.electricAccess ? 'true' : 'false');
      
      if (employeePhoto) {
        formData.append('photo', employeePhoto);
      }
      
      await dispatch(createEmployee(formData)).unwrap();
      
      setAddModal(false);
      form.resetFields();
      setFilteredWorkTypes([]);
      setEmployeePhoto(null);
      setPhotoPreview(null);
      
      dispatch(fetchAllEmployees());
      
      message.success('Сотрудник успешно добавлен!');
    } catch (err: any) {
      if (err.response?.data?.error === 'Сотрудник с таким личным номером уже существует') {
        const existing = err.response?.data?.existing;
        message.error(`Ошибка: ${err.response.data.error}. Существующий сотрудник: ${existing?.fullName}, должность: ${existing?.position}`);
      } else {
        message.error('Ошибка при добавлении сотрудника');
      }
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingEmployee) return;
    
    try {
      setUploading(true);
      const formData = new FormData();
      
      // Личный номер нельзя менять, но он нужен для идентификации
      formData.append('fullName', values.fullName);
      formData.append('serviceTypeId', values.serviceTypeId.toString());
      formData.append('workTypeId', values.workTypeId.toString());
      formData.append('position', values.position);
      
      // Обработка бригады
      if (values.brigadaId && values.brigadaId !== 'undefined') {
        formData.append('brigadaId', values.brigadaId.toString());
      } else {
        formData.append('brigadaId', ''); // Пустая строка для сброса
      }
      
      // Обработка локомотива
      if (values.locomotiveId && values.locomotiveId !== 'undefined') {
        formData.append('locomotiveId', values.locomotiveId.toString());
      } else {
        formData.append('locomotiveId', ''); // Пустая строка для сброса
      }
      
      // Обработка телефона
      if (values.phone) {
        formData.append('phone', values.phone);
      } else {
        formData.append('phone', '');
      }
      
      // Обработка даты рождения
      if (values.birthday) {
        const birthdayTimestamp = Math.floor(values.birthday.valueOf() / 1000);
        formData.append('birthday', birthdayTimestamp.toString());
      } else {
        formData.append('birthday', '');
      }
      
      // Обработка допусков
      formData.append('hasTrip', values.hasTrip ? 'true' : 'false');
      formData.append('hasCraneman', values.hasCraneman ? 'true' : 'false');
      formData.append('dieselAccess', values.dieselAccess ? 'true' : 'false');
      formData.append('electricAccess', values.electricAccess ? 'true' : 'false');
      
      // Если загружено новое фото
      if (employeePhoto) {
        formData.append('photo', employeePhoto);
      }
      
      // Вызываем action для обновления сотрудника
      await dispatch(updateEmployee({ 
        personalNumber: editingEmployee.personalNumber, 
        formData 
      })).unwrap();
      
      // Закрываем модальное окно и сбрасываем состояние
      setEditModal(false);
      setEditingEmployee(null);
      editForm.resetFields();
      setEditFilteredWorkTypes([]);
      setEmployeePhoto(null);
      setPhotoPreview(null);
      
      // Обновляем список сотрудников
      dispatch(fetchAllEmployees());
      
      message.success('Сотрудник успешно обновлен!');
    } catch (err: any) {
      console.error('Ошибка при обновлении сотрудника:', err);
      message.error(err.response?.data?.message || 'Ошибка при обновлении сотрудника');
    } finally {
      setUploading(false);
    }
  };

  // Обработчик загрузки фото
  const handlePhotoUpload = (file: File) => {
    // Проверяем тип файла
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('Можно загружать только изображения!');
      return false;
    }
    
    // Проверяем размер файла (макс. 5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Изображение должно быть меньше 5MB!');
      return false;
    }
    
    setEmployeePhoto(file);
    
    // Создаем превью для отображения
    const reader = new FileReader();
    reader.onload = (e) => {
      setPhotoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    
    return false; // Предотвращаем автоматическую загрузку
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
          {loadingLeaves && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinContainer}>
                <Spin size="large" />
                <div className={styles.spinText}>Загрузка информации об отпусках...</div>
              </div>
            </div>
          )}
          
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
      <Modal
        title="Добавить нового сотрудника"
        open={addModal}
        onCancel={handleCancelAdd}
        footer={null}
        width={650}
        className={styles.addEmployeeModal}
        styles={{
          mask: { backgroundColor: 'rgba(0, 21, 41, 0.8)' }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.addEmployeeForm}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Служба:"
                name="serviceTypeId"
                rules={[{ required: true, message: 'Выберите службу!' }]}
              >
                <Select
                  placeholder="-- Выберите службу --"
                  onChange={handleServiceTypeChange}
                  loading={status === 'loading'}
                >
                  {serviceTypes.map(service => (
                    <Option key={service.serviceTypeId} value={service.serviceTypeId}>
                      {service.serviceTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Вид работ:"
                name="workTypeId"
                rules={[{ required: true, message: 'Выберите вид работ!' }]}
              >
                <Select
                  placeholder={filteredWorkTypes.length > 0 ? "-- Выберите вид работ --" : "-- Сначала выберите службу --"}
                  disabled={filteredWorkTypes.length === 0}
                  loading={loadingWorkTypes}
                >
                  {filteredWorkTypes.map(work => (
                    <Option key={work.workTypeId} value={work.workTypeId}>
                      {work.workTypeName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Должность:"
                name="position"
                rules={[{ required: true, message: 'Выберите должность!' }]}
              >
                <Select 
                  placeholder="-- Выберите должность --"
                  showSearch
                >
                  {localPositions.map((position, index) => (
                    <Option key={index} value={position}>
                      {position}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Бригада:"
                name="brigadaId"
              >
                <Select 
                  placeholder="-- Выберите бригаду --"
                  loading={status === 'loading'}
                  allowClear
                >
                  {brigadas.map(brigada => (
                    <Option key={brigada.brigadaId} value={brigada.brigadaId}>
                      {brigada.brigadaName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="ФИО:"
                name="fullName"
                rules={[{ required: true, message: 'Введите ФИО сотрудника!' }]}
              >
                <Input placeholder="Введите полное имя" />
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Личный номер:"
                name="personalNumber"
                rules={[
                  { required: true, message: 'Введите личный номер!' },
                  { pattern: /^[0-9]+$/, message: 'Только цифры!' }
                ]}
              >
                <Input placeholder="Введите личный номер" />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Локомотив:"
                name="locomotiveId"
                rules={[
                  { max: 12, message: 'ID локомотива не должен превышать 12 символов' },
                  { pattern: /^[a-zA-Z0-9\-_]*$/, message: 'Только буквы, цифры, дефисы и подчеркивания' }
                ]}
              >
                <Select 
                  placeholder="-- Выберите локомотив --"
                  showSearch
                  optionFilterProp="children"
                  suffixIcon={<CarOutlined />}
                  loading={status === 'loading'}
                  allowClear
                >
                  {sortLocomotives(locomotives).map(locomotive => (
                    <Option 
                      key={locomotive.locomotiveId} 
                      value={locomotive.locomotiveId}
                    >
                      {formatLocomotiveDisplay(locomotive)}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            
            <Col span={12}>
              <Form.Item
                label="Дата рождения:"
                name="birthday"
              >
                <DatePicker 
                  placeholder="Выберите дату рождения"
                  format="DD.MM.YYYY"
                  style={{ width: '100%' }}
                  suffixIcon={<CalendarOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Номер телефона:"
                name="phone"
              >
                <Input 
                  placeholder="Введите номер телефона" 
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>
          
          {/* Загрузка фото при создании */}
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Фотография сотрудника:"
              >
                <div className={styles.photoUploadSection}>
                  {photoPreview && (
                    <div className={styles.photoPreview}>
                      <img src={photoPreview} alt="Предпросмотр" />
                      <div className={styles.photoPreviewOverlay}>
                        <EyeOutlined style={{ fontSize: '24px', color: 'white' }} />
                      </div>
                    </div>
                  )}
                  <Upload
                    beforeUpload={handlePhotoUpload}
                    showUploadList={false}
                    accept="image/*"
                  >
                    <Button icon={<UploadOutlined />}>
                      {employeePhoto ? 'Фото загружено' : 'Загрузить фото'}
                    </Button>
                  </Upload>
                  {employeePhoto && (
                    <p className={styles.photoInfo}>
                      Фото: {employeePhoto.name}
                    </p>
                  )}
                </div>
              </Form.Item>
            </Col>
          </Row>
          
          <div className={styles.accessSection}>
            <h4>Допуски:</h4>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Допуск к выезду магнитогорск-грузовой"
                  name="hasTrip"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Допуск кантовщика"
                  name="hasCraneman"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Допуск к тепловозу"
                  name="dieselAccess"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Допуск к электровозу"
                  name="electricAccess"
                  valuePropName="checked"
                  initialValue={false}
                >
                  <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                </Form.Item>
              </Col>
            </Row>
          </div>
          
          <div className={styles.formFooter}>
            <Button 
              onClick={handleCancelAdd}
              className={styles.cancelButton}
            >
              Отмена
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              className={styles.submitButton}
              loading={status === 'loading'}
            >
              Сохранить
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Модальное окно редактирования сотрудника */}
      <Modal
        title={`Редактирование сотрудника: ${editingEmployee?.fullName || ''}`}
        open={editModal}
        onCancel={handleCancelEdit}
        footer={null}
        width={650}
        className={styles.editEmployeeModal}
        destroyOnClose={true}
        key={editingEmployee?.personalNumber || 'edit-modal'}
        styles={{
          mask: { backgroundColor: 'rgba(0, 21, 41, 0.8)' }
        }}
      >
        {editingEmployee && (
          <Form
            form={editForm}
            layout="vertical"
            onFinish={handleEditSubmit}
            className={styles.editEmployeeForm}
            key={`form-${editingEmployee.personalNumber}`}
          >
            {/* Личный номер - только для отображения, нельзя изменить */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Личный номер:"
                >
                  <Input 
                    value={editingEmployee.personalNumber}
                    disabled
                    style={{ fontWeight: 'bold', color: '#1890ff' }}
                  />
                  <p className={styles.disabledFieldHint}>
                    Личный номер сотрудника нельзя изменить
                  </p>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Служба:"
                  name="serviceTypeId"
                  rules={[{ required: true, message: 'Выберите службу!' }]}
                >
                  <Select
                    placeholder="-- Выберите службу --"
                    onChange={(value) => handleEditServiceTypeChange(value, editingEmployee)}
                    loading={status === 'loading'}
                  >
                    {serviceTypes.map(service => (
                      <Option key={service.serviceTypeId} value={service.serviceTypeId}>
                        {service.serviceTypeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Вид работ:"
                  name="workTypeId"
                  rules={[{ required: true, message: 'Выберите вид работ!' }]}
                >
                  <Select
                    placeholder={editFilteredWorkTypes.length > 0 ? "-- Выберите вид работ --" : "-- Сначала выберите службу --"}
                    disabled={editFilteredWorkTypes.length === 0}
                    loading={loadingWorkTypes}
                  >
                    {editFilteredWorkTypes.map(work => (
                      <Option key={work.workTypeId} value={work.workTypeId}>
                        {work.workTypeName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Должность:"
                  name="position"
                  rules={[{ required: true, message: 'Выберите должность!' }]}
                >
                  <Select 
                    placeholder="-- Выберите должность --"
                    showSearch
                    allowClear={false}
                  >
                    {localPositions.map((position, index) => (
                      <Option key={index} value={position}>
                        {position}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Бригада:"
                  name="brigadaId"
                >
                  <Select 
                    placeholder="-- Выберите бригаду --"
                    loading={status === 'loading'}
                    allowClear
                  >
                    {brigadas.map(brigada => (
                      <Option key={brigada.brigadaId} value={brigada.brigadaId}>
                        {brigada.brigadaName}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="ФИО:"
                  name="fullName"
                  rules={[{ required: true, message: 'Введите ФИО сотрудника!' }]}
                >
                  <Input placeholder="Введите полное имя" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Локомотив:"
                  name="locomotiveId"
                  rules={[
                    { max: 12, message: 'ID локомотива не должен превышать 12 символов' },
                    { pattern: /^[a-zA-Z0-9\-_]*$/, message: 'Только буквы, цифры, дефисы и подчеркивания' }
                  ]}
                >
                  <Select 
                    placeholder="-- Выберите локомотив --"
                    showSearch
                    optionFilterProp="children"
                    suffixIcon={<CarOutlined />}
                    loading={status === 'loading'}
                    allowClear
                  >
                    {sortLocomotives(locomotives).map(locomotive => (
                      <Option 
                        key={locomotive.locomotiveId} 
                        value={locomotive.locomotiveId}
                      >
                        {formatLocomotiveDisplay(locomotive)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Дата рождения:"
                  name="birthday"
                >
                  <DatePicker 
                    placeholder="Выберите дату рождения"
                    format="DD.MM.YYYY"
                    style={{ width: '100%' }}
                    suffixIcon={<CalendarOutlined />}
                  />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Номер телефона:"
                  name="phone"
                >
                  <Input 
                    placeholder="Введите номер телефона" 
                    prefix={<PhoneOutlined />}
                  />
                </Form.Item>
              </Col>
            </Row>
            
            {/* Загрузка фото */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label="Фотография сотрудника:"
                >
                  <div className={styles.photoUploadSection}>
                    {photoPreview && (
                      <div className={styles.photoPreview}>
                        <img src={photoPreview} alt="Предпросмотр" />
                        <div className={styles.photoPreviewOverlay}>
                          <EyeOutlined style={{ fontSize: '24px', color: 'white' }} />
                        </div>
                      </div>
                    )}
                    <Upload
                      beforeUpload={handlePhotoUpload}
                      showUploadList={false}
                      accept="image/*"
                    >
                      <Button icon={<UploadOutlined />}>
                        {employeePhoto ? 'Фото загружено' : 'Загрузить новое фото'}
                      </Button>
                    </Upload>
                    {employeePhoto && (
                      <p className={styles.photoInfo}>
                        Новое фото: {employeePhoto.name}
                      </p>
                    )}
                  </div>
                </Form.Item>
              </Col>
            </Row>
            
            <div className={styles.accessSection}>
              <h4>Допуски:</h4>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Допуск к выезду магнитогорск-грузовой"
                    name="hasTrip"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label="Допуск кантовщика"
                    name="hasCraneman"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                  </Form.Item>
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Допуск к тепловозу"
                    name="dieselAccess"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    label="Допуск к электровозу"
                    name="electricAccess"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Имеется" unCheckedChildren="Не имеется" />
                  </Form.Item>
                </Col>
              </Row>
            </div>
            
            <div className={styles.formFooter}>
              <Button 
                onClick={handleCancelEdit}
                className={styles.cancelButton}
              >
                Отмена
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                className={styles.submitButton}
                loading={uploading}
              >
                Сохранить изменения
              </Button>
            </div>
          </Form>
        )}
      </Modal>

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