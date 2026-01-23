import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import styles from './AddEmployeeModal.module.scss';
import { AppDispatch } from '../../../redux/store';
import { 
  createEmployee, 
  fetchWorkTypesByService 
} from '../../../redux/slices/employeesSlice';

interface AddEmployeeModalProps {
  visible: boolean;
  onCancel: () => void;
  serviceTypes: any[];
  brigadas: any[];
  locomotives: any[];
  positions: string[];
  refreshEmployees: () => void;
}

interface FormData {
  fullName: string;
  personalNumber: string;
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

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  visible,
  onCancel,
  serviceTypes,
  brigadas,
  locomotives,
  positions,
  refreshEmployees
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    personalNumber: '',
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Функция сортировки локомотивов от меньшего к большему (0-100)
  const sortLocomotives = (locos: any[]): any[] => {
    return [...locos].sort((a, b) => {
      const getNumericPart = (id: string): number => {
        if (!id) return 0;
        const matches = id.match(/\d+/);
        if (matches && matches[0]) {
          return parseInt(matches[0], 10);
        }
        return 0;
      };
      
      const numA = getNumericPart(a.locomotiveId);
      const numB = getNumericPart(b.locomotiveId);
      
      if (numA !== numB) {
        return numA - numB;
      }
      
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

  // Сброс формы при закрытии
  useEffect(() => {
    if (!visible) {
      resetForm();
    }
  }, [visible]);

  const resetForm = () => {
    setFormData({
      fullName: '',
      personalNumber: '',
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
    setErrors({});
  };

  const loadWorkTypes = async (serviceTypeId: number) => {
    try {
      setLoading(true);
      const resultAction = await dispatch(fetchWorkTypesByService(serviceTypeId));
      if (fetchWorkTypesByService.fulfilled.match(resultAction)) {
        setWorkTypes(resultAction.payload);
      }
    } catch (err) {
      console.error('Error loading work types:', err);
      setErrors(prev => ({ ...prev, workTypeId: 'Ошибка загрузки видов работ' }));
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
    setErrors(prev => ({ ...prev, serviceTypeId: '' }));
    
    if (value) {
      loadWorkTypes(parseInt(value));
    } else {
      setWorkTypes([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Очищаем ошибку при изменении поля
    setErrors(prev => ({ ...prev, [name]: '' }));
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else {
      // Валидация для личного номера
      if (name === 'personalNumber') {
        if (!/^\d*$/.test(value)) {
          setErrors(prev => ({ ...prev, personalNumber: 'Только цифры' }));
          return;
        }
      }
      
      // Валидация для ID локомотива
      if (name === 'locomotiveId' && value && !/^[a-zA-Z0-9\-_]*$/.test(value)) {
        setErrors(prev => ({ ...prev, locomotiveId: 'Только буквы, цифры, дефисы и подчеркивания' }));
        return;
      }
      
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
        setErrors(prev => ({ ...prev, photo: 'Можно загружать только изображения!' }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'Изображение должно быть меньше 5MB!' }));
        return;
      }
      
      setEmployeePhoto(file);
      setErrors(prev => ({ ...prev, photo: '' }));
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Введите ФИО сотрудника';
    }
    
    if (!formData.personalNumber.trim()) {
      newErrors.personalNumber = 'Введите личный номер';
    } else if (!/^\d+$/.test(formData.personalNumber)) {
      newErrors.personalNumber = 'Только цифры';
    }
    
    if (!formData.position) {
      newErrors.position = 'Выберите должность';
    }
    
    if (!formData.serviceTypeId) {
      newErrors.serviceTypeId = 'Выберите службу';
    }
    
    if (!formData.workTypeId) {
      newErrors.workTypeId = 'Выберите вид работ';
    }
    
    if (formData.locomotiveId && formData.locomotiveId.length > 12) {
      newErrors.locomotiveId = 'ID не должен превышать 12 символов';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
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
      
      await dispatch(createEmployee(formDataToSend)).unwrap();
      
      onCancel();
      resetForm();
      refreshEmployees();
      
      // Показываем сообщение об успехе
      const successMessage = document.createElement('div');
      successMessage.className = styles.successMessage;
      successMessage.textContent = 'Сотрудник успешно добавлен!';
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        if (document.body.contains(successMessage)) {
          document.body.removeChild(successMessage);
        }
      }, 3000);
      
    } catch (err: any) {
      console.error('Error creating employee:', err);
      
      let errorMessage = 'Ошибка при добавлении сотрудника';
      
      if (err.response?.data?.error === 'Сотрудник с таким личным номером уже существует') {
        const existing = err.response?.data?.existing;
        errorMessage = `Ошибка: ${err.response.data.error}. Существующий сотрудник: ${existing?.fullName}, должность: ${existing?.position}`;
        setErrors(prev => ({ ...prev, personalNumber: 'Личный номер уже используется' }));
      }
      
      // Показываем сообщение об ошибке
      const errorDiv = document.createElement('div');
      errorDiv.className = styles.errorMessage;
      errorDiv.textContent = errorMessage;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        if (document.body.contains(errorDiv)) {
          document.body.removeChild(errorDiv);
        }
      }, 5000);
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
          <h2>Добавить нового сотрудника</h2>
          <button onClick={onCancel} className={styles.closeButton}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {loading && (
            <div className={styles.loadingOverlay}>
              <div className={styles.spinContainer}>
                <div className={styles.spinner}></div>
                <div className={styles.spinText}>Сохранение...</div>
              </div>
            </div>
          )}
          
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
                className={`${styles.input} ${errors.fullName ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.fullName && (
                <div className={styles.errorText}>{errors.fullName}</div>
              )}
            </div>
            
            {/* Личный номер */}
            <div className={styles.formGroup}>
              <label>Личный номер: *</label>
              <input
                type="text"
                name="personalNumber"
                value={formData.personalNumber || ''}
                onChange={handleChange}
                required
                placeholder="Введите личный номер"
                className={`${styles.input} ${errors.personalNumber ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.personalNumber && (
                <div className={styles.errorText}>{errors.personalNumber}</div>
              )}
              <small className={styles.helperText}>Только цифры</small>
            </div>
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
                className={`${styles.select} ${errors.serviceTypeId ? styles.selectError : ''}`}
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
              {errors.serviceTypeId && (
                <div className={styles.errorText}>{errors.serviceTypeId}</div>
              )}
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
                className={`${styles.select} ${errors.workTypeId ? styles.selectError : ''}`}
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
              {errors.workTypeId && (
                <div className={styles.errorText}>{errors.workTypeId}</div>
              )}
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
                className={`${styles.select} ${errors.position ? styles.selectError : ''}`}
                disabled={loading}
              >
                <option value="">-- Выберите должность --</option>
                {positions.map((position, index) => (
                  <option key={index} value={position}>
                    {position}
                  </option>
                ))}
              </select>
              {errors.position && (
                <div className={styles.errorText}>{errors.position}</div>
              )}
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
            {/* Локомотив с сортировкой */}
            <div className={styles.formGroup}>
              <label>Локомотив:</label>
              <select
                name="locomotiveId"
                value={formData.locomotiveId || ''}
                onChange={handleChange}
                className={`${styles.select} ${errors.locomotiveId ? styles.selectError : ''}`}
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
              {errors.locomotiveId && (
                <div className={styles.errorText}>{errors.locomotiveId}</div>
              )}
              {formData.locomotiveId && (
                <small className={styles.helperText}>
                  Максимум 12 символов: буквы, цифры, дефисы, подчеркивания
                </small>
              )}
            </div>
            
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
          </div>
          
          <div className={styles.formRow}>
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
            
            {/* Пустой блок для выравнивания */}
            <div className={styles.formGroup}></div>
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
              {errors.photo && (
                <div className={styles.errorText}>{errors.photo}</div>
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
              onClick={() => {
                resetForm();
                onCancel();
              }}
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
              {loading ? 'Добавление...' : 'Добавить сотрудника'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;