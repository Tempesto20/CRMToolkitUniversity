import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { createEmployee, fetchWorkTypes, clearError, clearSuccessMessage } from '../redux/slices/employeesSlice';
import styles from './AddEmployeeForm.module.scss';

const AddEmployeeForm: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { workTypes, status, error, successMessage } = useSelector((state: RootState) => state.employees);

  const [formData, setFormData] = useState({
    service_type_id: '',
    work_type_id: '',
    position: '',
    locomotive_id: '',
    full_name: '',
    birthday: '',
    personal_number: '',
    brigada_id: '',
    phone: '',
    has_trip: false,
    has_craneman: false,
    diesel_access: false,
    electric_access: false,
  });

  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('/images/default-avatar.jpg');

  // Загружаем виды работ при изменении службы
  useEffect(() => {
    if (formData.service_type_id) {
      dispatch(fetchWorkTypes(parseInt(formData.service_type_id)));
    }
  }, [formData.service_type_id, dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({
        ...formData,
        [name]: checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверка обязательных полей
    if (!formData.full_name || !formData.personal_number || !formData.position || 
        !formData.service_type_id || !formData.work_type_id) {
      alert('Пожалуйста, заполните все обязательные поля');
      return;
    }

    const formDataToSend = new FormData();
    
    // Добавляем все поля формы
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        formDataToSend.append(key, value.toString());
      }
    });

    // Добавляем фото, если есть
    if (photo) {
      formDataToSend.append('photo', photo);
    }

    try {
      await dispatch(createEmployee(formDataToSend)).unwrap();
      
      // Сбрасываем форму после успешного добавления
      setFormData({
        service_type_id: '',
        work_type_id: '',
        position: '',
        locomotive_id: '',
        full_name: '',
        birthday: '',
        personal_number: '',
        brigada_id: '',
        phone: '',
        has_trip: false,
        has_craneman: false,
        diesel_access: false,
        electric_access: false,
      });
      
      setPhoto(null);
      setPhotoPreview('/images/default-avatar.jpg');
      
      // Очищаем сообщения через 5 секунд
      setTimeout(() => {
        dispatch(clearError());
        dispatch(clearSuccessMessage());
      }, 5000);
      
    } catch (error) {
      console.error('Ошибка при добавлении:', error);
    }
  };

  return (
    <div className={styles.addEmployeeForm}>
      <h1>Добавить сотрудника</h1>
      
      {error && (
        <div className={styles.errorMessage}>
          {error.includes('Сотрудник с таким личным номером уже существует') ? (
            <div>
              <strong>Ошибка:</strong> Сотрудник с таким личным номером уже существует!
            </div>
          ) : (
            error
          )}
        </div>
      )}
      
      {successMessage && (
        <div className={styles.successMessage}>
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Служба */}
        <div className={styles.formGroup}>
          <label>Служба:</label>
          <select
            name="service_type_id"
            value={formData.service_type_id}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Выберите службу --</option>
            <option value="1">Электровозная служба</option>
            <option value="2">Тепловозная служба</option>
          </select>
        </div>

        {/* Вид службы */}
        <div className={styles.formGroup}>
          <label>Вид службы:</label>
          <select
            name="work_type_id"
            value={formData.work_type_id}
            onChange={handleInputChange}
            disabled={!formData.service_type_id}
            required
          >
            <option value="">{formData.service_type_id ? '-- Выберите вид службы --' : '-- Сначала выберите службу --'}</option>
            {workTypes.map((workType) => (
              <option key={workType.work_type_id} value={workType.work_type_id}>
                {workType.work_type_name}
              </option>
            ))}
          </select>
        </div>

        {/* Должность */}
        <div className={styles.formGroup}>
          <label>Должность:</label>
          <select
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            required
          >
            <option value="">-- Выберите должность --</option>
            <option value="дублер">дублер</option>
            <option value="пом.маш">пом.маш</option>
            <option value="машинист">машинист</option>
            <option value="маш.инструктор">маш.инструктор</option>
          </select>
        </div>

        {/* ФИО */}
        <div className={styles.formGroup}>
          <label>ФИО:</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Личный номер */}
        <div className={styles.formGroup}>
          <label>Личный номер:</label>
          <input
            type="number"
            name="personal_number"
            value={formData.personal_number}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Бригада */}
        <div className={styles.formGroup}>
          <label>Бригада:</label>
          <select
            name="brigada_id"
            value={formData.brigada_id}
            onChange={handleInputChange}
          >
            <option value="">-- Выберите бригаду --</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>

        {/* Фото */}
        <div className={styles.formGroup}>
          <label>Фото:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
          />
          <img src={photoPreview} alt="Preview" className={styles.photoPreview} />
        </div>

        {/* Кнопка отправки */}
        <button type="submit" disabled={status === 'loading'}>
          {status === 'loading' ? 'Добавление...' : 'Добавить сотрудника'}
        </button>
      </form>
    </div>
  );
};

export default AddEmployeeForm;