// frontend/src/components/EmployeesManager.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchAllEmployees, 
  deleteEmployee, 
  clearSuccessMessage,
  resetDeleteStatus,
  createEmployee,
  Employee as EmployeeType
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
  DatePicker
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CarOutlined // Используем CarOutlined вместо TrainOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './EmployeesManager.module.scss';

const { Search } = Input;
const { Option } = Select;

interface EmployeeCardProps {
  employee: EmployeeType;
  onEdit: (employee: EmployeeType) => void;
  onDelete: (personalNumber: number, fullName: string) => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, onEdit, onDelete }) => {
  const getPhotoUrl = () => {
    if (employee.photoFilename && employee.photoMimetype) {
      return `http://localhost:3000/api/employees/photo/${employee.personalNumber}`;
    }
    return null;
  };

  const photoUrl = getPhotoUrl();

  // Форматирование даты рождения для отображения
  const formatBirthday = (birthday?: number) => {
    if (!birthday) return 'Не указана';
    // Преобразуем Unix timestamp в дату
    const date = new Date(birthday * 1000);
    return date.toLocaleDateString('ru-RU');
  };

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
          {employee.locomotiveId && (
            <p>
              <strong>Локомотив:</strong> 
              <span className={styles.employeeValue}>
                {employee.locomotive?.locomotiveName || `№${employee.locomotiveId}`}
              </span>
            </p>
          )}
          {employee.phone && (
            <p>
              <strong>Телефон:</strong> 
              <span className={styles.employeeValue}>{employee.phone}</span>
            </p>
          )}
          {employee.birthday && (
            <p>
              <strong>Дата рождения:</strong> 
              <span className={styles.employeeValue}>{formatBirthday(employee.birthday)}</span>
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

interface ServiceType {
  serviceTypeId: number;
  serviceTypeName: string;
}

interface WorkType {
  workTypeId: number;
  workTypeName: string;
}

interface Brigada {
  brigadaId: number;
  brigadaName: string;
}

interface Locomotive {
  locomotiveId: string;
  locomotiveName: string;
}

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
  const [addModal, setAddModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ number: number; name: string } | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeType | null>(null);
  const [form] = Form.useForm();
  
  // Состояния для данных из БД
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([
    { serviceTypeId: 1, serviceTypeName: 'Электровозная служба' },
    { serviceTypeId: 2, serviceTypeName: 'Тепловозная служба' }
  ]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [brigadas, setBrigadas] = useState<Brigada[]>([
    { brigadaId: 1, brigadaName: 'Бригада 1' },
    { brigadaId: 2, brigadaName: 'Бригада 2' },
    { brigadaId: 3, brigadaName: 'Бригада 3' },
    { brigadaId: 4, brigadaName: 'Бригада 4' }
  ]);
  const [locomotives, setLocomotives] = useState<Locomotive[]>([
    { locomotiveId: 'ЭП-001', locomotiveName: 'Электровоз ЭП-001' },
    { locomotiveId: 'ЭП-002', locomotiveName: 'Электровоз ЭП-002' },
    { locomotiveId: 'ТЭМ-101', locomotiveName: 'Тепловоз ТЭМ-101' },
    { locomotiveId: 'ТЭМ-102', locomotiveName: 'Тепловоз ТЭМ-102' },
    { locomotiveId: 'ВЛ-80', locomotiveName: 'ВЛ-80' },
    { locomotiveId: '2М62', locomotiveName: '2М62' },
    { locomotiveId: 'ЧМЭ3', locomotiveName: 'ЧМЭ3' },
    { locomotiveId: 'ТЭМ2', locomotiveName: 'ТЭМ2' },
  ]);
  const [positions, setPositions] = useState<string[]>([
    'Машинист',
    'Помощник машиниста',
    'Руководитель',
    'Инструктор'
  ]);

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

  // Обработчик изменения службы
  const handleServiceTypeChange = (value: number) => {
    form.setFieldsValue({ workTypeId: undefined });
    
    // Загружаем виды работ для выбранной службы
    let workTypesData: WorkType[] = [];
    if (value === 1) {
      // Электровозная служба
      workTypesData = [
        { workTypeId: 1, workTypeName: 'поездная колонна' },
        { workTypeId: 2, workTypeName: 'маневровая колонна' }
      ];
    } else if (value === 2) {
      // Тепловозная служба
      workTypesData = [
        { workTypeId: 3, workTypeName: '5 проходная / разливка - маневровая колонна' },
        { workTypeId: 4, workTypeName: '7 проходная / депо - маневровая колонна' }
      ];
    }
    setWorkTypes(workTypesData);
  };

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
    message.info('Редактирование сотрудника - в разработке');
  }, []);

  const handleAddEmployee = () => {
    setAddModal(true);
  };

  const handleCancelAdd = () => {
    setAddModal(false);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    try {
      // Преобразуем значения формы в нужный формат
      const formData = new FormData();
      
      // Добавляем обязательные поля
      formData.append('fullName', values.fullName);
      formData.append('personalNumber', values.personalNumber.toString());
      formData.append('serviceTypeId', values.serviceTypeId.toString());
      formData.append('workTypeId', values.workTypeId.toString());
      formData.append('position', values.position);
      
      // Добавляем опциональные поля
      if (values.brigadaId) {
        formData.append('brigadaId', values.brigadaId.toString());
      }
      if (values.locomotiveId) {
        formData.append('locomotiveId', values.locomotiveId);
      }
      if (values.phone) {
        formData.append('phone', values.phone);
      }
      if (values.birthday) {
        // Преобразуем дату в Unix timestamp (секунды)
        const birthdayTimestamp = Math.floor(values.birthday.valueOf() / 1000);
        formData.append('birthday', birthdayTimestamp.toString());
      }
      
      // Добавляем допуски (по умолчанию false)
      formData.append('hasTrip', values.hasTrip ? 'true' : 'false');
      formData.append('hasCraneman', values.hasCraneman ? 'true' : 'false');
      formData.append('dieselAccess', values.dieselAccess ? 'true' : 'false');
      formData.append('electricAccess', values.electricAccess ? 'true' : 'false');
      
      // Отправляем запрос на создание сотрудника
      await dispatch(createEmployee(formData)).unwrap();
      
      // Закрываем модальное окно и обновляем данные
      setAddModal(false);
      form.resetFields();
      
      // Обновляем список сотрудников
      dispatch(fetchAllEmployees());
      
      message.success('Сотрудник успешно добавлен!');
    } catch (err: any) {
      if (err.error === 'Сотрудник с таким личным номером уже существует') {
        message.error(`Ошибка: ${err.error}. Существующий сотрудник: ${err.existing.fullName}, должность: ${err.existing.position}`);
      } else {
        message.error('Ошибка при добавлении сотрудника');
      }
    }
  };

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

      {/* Модальное окно добавления сотрудника */}
      <Modal
        title="Добавить нового сотрудника"
        open={addModal}
        onCancel={handleCancelAdd}
        footer={null}
        width={650}
        className={styles.addEmployeeModal}
        maskStyle={{ backgroundColor: 'rgba(0, 21, 41, 0.8)' }} // Темно-синий фон
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className={styles.addEmployeeForm}
        >
          {/* Обязательные поля */}
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
                  placeholder={workTypes.length > 0 ? "-- Выберите вид работ --" : "-- Сначала выберите службу --"}
                  disabled={workTypes.length === 0}
                >
                  {workTypes.map(work => (
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
                <Select placeholder="-- Выберите должность --">
                  {positions.map((position, index) => (
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
                <Select placeholder="-- Выберите бригаду --">
                  <Option value={undefined}>Не выбрано</Option>
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
          
          {/* Новые необязательные поля */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Локомотив:"
                name="locomotiveId"
              >
                <Select 
                  placeholder="-- Выберите локомотив --"
                  showSearch
                  optionFilterProp="children"
                  suffixIcon={<CarOutlined />} 
                >
                  <Option value={undefined}>Не выбрано</Option>
                  {locomotives.map(locomotive => (
                    <Option key={locomotive.locomotiveId} value={locomotive.locomotiveId}>
                      {locomotive.locomotiveName}
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
          
          {/* Опциональные поля */}
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
          
          {/* Допуски */}
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
          
          {/* Кнопки внизу формы */}
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

      {/* Модальное окно удаления сотрудника */}
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