
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './EditEmployeeModal.module.scss';
import { AppDispatch } from '../../../redux/store';
import { updateEmployee, fetchWorkTypesByService } from '../../../redux/slices/employeesSlice';

interface EditEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  editingEmployee: any;
  serviceTypes: any[];
  brigadas: any[];
  locomotives: any[];
  positions: string[];
  refreshEmployees: () => void;
}

interface FormData {
  fullName: string;
  position: string;
  phone: string;
  hasTrip: boolean;
  hasCraneman: boolean;
  dieselAccess: boolean;
  electricAccess: boolean;
  serviceTypeId: string;
  workTypeId: string;
  brigadaId: string;
  locomotiveId: string;
  birthday: string;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  visible,
  onCancel,
  editingEmployee,
  serviceTypes,
  brigadas,
  locomotives,
  positions,
  refreshEmployees
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    position: '',
    phone: '',
    hasTrip: false,
    hasCraneman: false,
    dieselAccess: false,
    electricAccess: false,
    serviceTypeId: '',
    workTypeId: '',
    brigadaId: '',
    locomotiveId: '',
    birthday: ''
  });
  const [workTypes, setWorkTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [employeePhoto, setEmployeePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Функция сортировки локомотивов от меньшего к большему (0-100)
  const sortLocomotives = (locos: any[]): any[] => {
    return [...locos].sort((a, b) => {
      // Извлекаем числовую часть из locomotiveId
      const getNumericPart = (id: string): number => {
        if (!id) return 0;
        
        // Пытаемся найти числовую часть в ID
        const matches = id.match(/\d+/);
        if (matches && matches[0]) {
          return parseInt(matches[0], 10);
        }
        
        // Если числовой части нет, возвращаем 0
        return 0;
      };
      
      const numA = getNumericPart(a.locomotiveId);
      const numB = getNumericPart(b.locomotiveId);
      
      // Сначала сортируем по числовой части
      if (numA !== numB) {
        return numA - numB;
      }
      
      // Если числовые части равны, сортируем по строковому ID
      return (a.locomotiveId || '').localeCompare(b.locomotiveId || '');
    });
  };

  // Функция форматирования отображения локомотива
  const formatLocomotiveDisplay = (locomotive: any): string => {
    if (!locomotive) return '';
    
    const id = locomotive.locomotiveId || '';
    const name = locomotive.locomotiveName || '';
    
    if (name && name !== 'не указано' && name !== id) {
      return `${name} (${id})`;
    }
    
    return id;
  };

  // Функция для получения значения из различных возможных путей данных
  const getEmployeeValue = (employee: any, path: string, altPaths: string[] = []): any => {
    // Основной путь
    if (employee && employee[path] !== undefined && employee[path] !== null) {
      return employee[path];
    }
    
    // Альтернативные пути
    for (const altPath of altPaths) {
      const parts = altPath.split('.');
      let value = employee;
      for (const part of parts) {
        if (value && value[part] !== undefined) {
          value = value[part];
        } else {
          value = null;
          break;
        }
      }
      if (value !== null && value !== undefined) {
        return value;
      }
    }
    
    return null;
  };

  // Инициализация формы
  useEffect(() => {
    if (visible && editingEmployee && !isInitialized) {
      // Получаем значения из разных возможных путей
      const serviceTypeId = getEmployeeValue(editingEmployee, 'serviceTypeId', [
        'serviceType.serviceTypeId',
        'serviceTypeId'
      ]);
      
      const workTypeId = getEmployeeValue(editingEmployee, 'workTypeId', [
        'workType.workTypeId',
        'workTypeId'
      ]);
      
      const brigadaId = getEmployeeValue(editingEmployee, 'brigadaId', [
        'brigada.brigadaId',
        'brigadaId'
      ]);
      
      const locomotiveId = getEmployeeValue(editingEmployee, 'locomotiveId', [
        'locomotive.locomotiveId',
        'locomotiveId'
      ]);
      
      // Преобразуем ID в строки для селектов
      const initialData: FormData = {
        fullName: editingEmployee.fullName || '',
        position: editingEmployee.position || '',
        phone: editingEmployee.phone || '',
        hasTrip: editingEmployee.hasTrip || false,
        hasCraneman: editingEmployee.hasCraneman || false,
        dieselAccess: editingEmployee.dieselAccess || false,
        electricAccess: editingEmployee.electricAccess || false,
        // КРИТИЧНО: преобразуем все ID в строки для селектов
        serviceTypeId: serviceTypeId ? serviceTypeId.toString() : '',
        workTypeId: workTypeId ? workTypeId.toString() : '',
        brigadaId: brigadaId ? brigadaId.toString() : '',
        locomotiveId: locomotiveId ? locomotiveId.toString() : '',
        birthday: editingEmployee.birthday 
          ? new Date(editingEmployee.birthday * 1000).toISOString().split('T')[0]
          : ''
      };
      
      setFormData(initialData);
      
      // Загружаем фото
      if (editingEmployee.photoFilename) {
        setPhotoPreview(`http://localhost:3000/api/employees/photo/${editingEmployee.personalNumber}`);
      }
      
      // Загружаем виды работ для текущей службы
      if (serviceTypeId) {
        loadWorkTypes(Number(serviceTypeId));
      } else {
        setWorkTypes([]);
      }
      
      setIsInitialized(true);
    }
    
    // Сброс при закрытии модалки
    if (!visible) {
      setIsInitialized(false);
      setFormData({
        fullName: '',
        position: '',
        phone: '',
        hasTrip: false,
        hasCraneman: false,
        dieselAccess: false,
        electricAccess: false,
        serviceTypeId: '',
        workTypeId: '',
        brigadaId: '',
        locomotiveId: '',
        birthday: ''
      });
      setWorkTypes([]);
      setEmployeePhoto(null);
      setPhotoPreview(null);
    }
  }, [visible, editingEmployee]);

  const loadWorkTypes = async (serviceTypeId: number) => {
    try {
      setLoading(true);
      const resultAction = await dispatch(fetchWorkTypesByService(serviceTypeId));
      if (fetchWorkTypesByService.fulfilled.match(resultAction)) {
        const workTypesData = resultAction.payload;
        setWorkTypes(workTypesData);
        
        // После загрузки видов работ, проверяем, совпадает ли текущий workTypeId
        if (editingEmployee?.workTypeId) {
          const currentWorkTypeId = getEmployeeValue(editingEmployee, 'workTypeId', [
            'workType.workTypeId',
            'workTypeId'
          ])?.toString();
          
          if (currentWorkTypeId) {
            const exists = workTypesData.some((w: any) => 
              w.workTypeId.toString() === currentWorkTypeId
            );
            if (exists) {
              setFormData((prev: FormData) => ({
                ...prev,
                workTypeId: currentWorkTypeId
              }));
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading work types:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      serviceTypeId: value,
      workTypeId: '' // Сбрасываем вид работ при смене службы
    });
    
    if (value) {
      loadWorkTypes(parseInt(value));
    } else {
      setWorkTypes([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Можно загружать только изображения!');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('Изображение должно быть меньше 5MB!');
        return;
      }
      
      setEmployeePhoto(file);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingEmployee) return;
    
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      
      // Добавляем все поля
      Object.keys(formData).forEach(key => {
        const value = (formData as any)[key];
        if (value !== undefined && value !== null && value !== '') {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Особые обработки
      if (formData.birthday) {
        const date = new Date(formData.birthday);
        const timestamp = Math.floor(date.getTime() / 1000);
        formDataToSend.set('birthday', timestamp.toString());
      }
      
      if (employeePhoto) {
        formDataToSend.append('photo', employeePhoto);
      }
      
      // Добавляем personalNumber
      formDataToSend.append('personalNumber', editingEmployee.personalNumber.toString());
      
      await dispatch(updateEmployee({ 
        personalNumber: editingEmployee.personalNumber, 
        formData: formDataToSend 
      })).unwrap();
      
      onCancel();
      refreshEmployees();
      alert('Сотрудник успешно обновлен!');
    } catch (err: any) {
      console.error('Error updating employee:', err);
      alert(err.response?.data?.message || 'Ошибка при обновлении сотрудника');
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  // Сортируем локомотивы
  const sortedLocomotives = sortLocomotives(locomotives);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Редактирование сотрудника: {editingEmployee?.fullName}</h2>
          <button onClick={onCancel} className={styles.closeButton}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinContainer}>
                <div className={styles.spinner}></div>
                <div className={styles.spinText}>Загрузка...</div>
              </div>
            </div>
          )}
          
          {/* Личный номер */}
          <div className={styles.formGroup}>
            <label>Личный номер:</label>
            <input 
              type="text" 
              value={editingEmployee?.personalNumber || ''}
              disabled
              className={styles.disabledInput}
            />
            <small className={styles.helperText}>Личный номер сотрудника нельзя изменить</small>
          </div>
          
          <div className={styles.formRow}>
            {/* Служба */}
            <div className={styles.formGroup}>
              <label>Служба: *</label>
              <select
                name="serviceTypeId"
                value={formData.serviceTypeId || ''}
                onChange={handleServiceChange}
                required
                className={styles.select}
                disabled={loading}
              >
                <option value="">-- Выберите службу --</option>
                {serviceTypes.map(service => (
                  <option 
                    key={service.serviceTypeId} 
                    value={service.serviceTypeId.toString()}
                  >
                    {service.serviceTypeName}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Вид работ */}
            <div className={styles.formGroup}>
              <label>Вид работ: *</label>
              <select
                name="workTypeId"
                value={formData.workTypeId || ''}
                onChange={handleChange}
                required
                disabled={!formData.serviceTypeId || workTypes.length === 0 || loading}
                className={styles.select}
              >
                <option value="">
                  {workTypes.length === 0 ? "-- Сначала выберите службу --" : "-- Выберите вид работ --"}
                </option>
                {workTypes.map(work => (
                  <option 
                    key={work.workTypeId} 
                    value={work.workTypeId.toString()}
                  >
                    {work.workTypeName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.formRow}>
            {/* Должность */}
            <div className={styles.formGroup}>
              <label>Должность: *</label>
              <select
                name="position"
                value={formData.position || ''}
                onChange={handleChange}
                required
                className={styles.select}
                disabled={loading}
              >
                <option value="">-- Выберите должность --</option>
                {positions.map((position, index) => (
                  <option key={index} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Бригада */}
            <div className={styles.formGroup}>
              <label>Бригада:</label>
              <select
                name="brigadaId"
                value={formData.brigadaId || ''}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="">-- Выберите бригаду --</option>
                {brigadas.map(brigada => (
                  <option 
                    key={brigada.brigadaId} 
                    value={brigada.brigadaId.toString()}
                  >
                    {brigada.brigadaName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.formRow}>
            {/* ФИО */}
            <div className={styles.formGroup}>
              <label>ФИО: *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange}
                required
                placeholder="Введите полное имя"
                className={styles.input}
                disabled={loading}
              />
            </div>
            
            {/* Локомотив с сортировкой */}
            <div className={styles.formGroup}>
              <label>Локомотив:</label>
              <select
                name="locomotiveId"
                value={formData.locomotiveId || ''}
                onChange={handleChange}
                className={styles.select}
                disabled={loading}
              >
                <option value="">-- Выберите локомотив --</option>
                {sortedLocomotives.map(locomotive => (
                  <option 
                    key={locomotive.locomotiveId} 
                    value={locomotive.locomotiveId.toString()}
                  >
                    {formatLocomotiveDisplay(locomotive)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className={styles.formRow}>
            {/* Дата рождения */}
            <div className={styles.formGroup}>
              <label>Дата рождения:</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday || ''}
                onChange={handleChange}
                className={styles.input}
                disabled={loading}
              />
            </div>
            
            {/* Телефон */}
            <div className={styles.formGroup}>
              <label>Номер телефона:</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="Введите номер телефона"
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Фото */}
          <div className={styles.formGroup}>
            <label>Фотография сотрудника:</label>
            <div className={styles.photoSection}>
              {photoPreview && (
                <div className={styles.photoPreview}>
                  <img src={photoPreview} alt="Предпросмотр" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className={styles.fileInput}
                disabled={loading}
              />
              {employeePhoto && (
                <p className={styles.fileInfo}>
                  Новое фото: {employeePhoto.name}
                </p>
              )}
            </div>
          </div>
          
          {/* Допуски */}
          <div className={styles.accessSection}>
            <h3>Допуски:</h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="hasTrip"
                  checked={formData.hasTrip || false}
                  onChange={handleChange}
                  className={styles.checkbox}
                  disabled={loading}
                />
                Допуск к выезду магнитогорск-грузовой
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="hasCraneman"
                  checked={formData.hasCraneman || false}
                  onChange={handleChange}
                  className={styles.checkbox}
                  disabled={loading}
                />
                Допуск кантовщика
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="dieselAccess"
                  checked={formData.dieselAccess || false}
                  onChange={handleChange}
                  className={styles.checkbox}
                  disabled={loading}
                />
                Допуск к тепловозу
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="electricAccess"
                  checked={formData.electricAccess || false}
                  onChange={handleChange}
                  className={styles.checkbox}
                  disabled={loading}
                />
                Допуск к электровозу
              </label>
            </div>
          </div>
          
          {/* Кнопки */}
          <div className={styles.formActions}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
              disabled={loading}
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className={styles.submitButton}
            >
              {loading ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;