import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { 
  fetchAllEmployees, 
  deleteEmployee, 
  clearSuccessMessage,
  resetDeleteStatus,
  createEmployee,
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
  DatePicker
} from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined,
  PhoneOutlined,
  CalendarOutlined,
  CarOutlined
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

  const formatBirthday = (birthday?: number) => {
    if (!birthday) return 'Не указана';
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
                {employee.locomotive?.locomotiveName || employee.locomotiveId}
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
  
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<{ number: number; name: string } | null>(null);
  const [form] = Form.useForm();
  const [filteredWorkTypes, setFilteredWorkTypes] = useState<WorkType[]>([]);
  const [loadingWorkTypes, setLoadingWorkTypes] = useState(false);
  const [localPositions, setLocalPositions] = useState<string[]>([
    'машинист',
    'пом.маш',
    'дублер'
  ]);

  useEffect(() => {
    dispatch(fetchAllEmployees());
    dispatch(fetchServiceTypes());
    dispatch(fetchBrigadas());
    dispatch(fetchLocomotives());
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
    message.info('Редактирование сотрудника - в разработке');
  }, []);

  const handleAddEmployee = () => {
    setAddModal(true);
  };

  const handleCancelAdd = () => {
    setAddModal(false);
    form.resetFields();
    setFilteredWorkTypes([]);
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
      
      // Исправлено: locomotiveId передается как строка
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
      
      await dispatch(createEmployee(formData)).unwrap();
      
      setAddModal(false);
      form.resetFields();
      setFilteredWorkTypes([]);
      
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