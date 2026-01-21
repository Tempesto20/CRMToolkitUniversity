// EmployeesManager.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchAllEmployees } from '../redux/slices/employeesSlice';
import styles from './EmployeesManager.module.scss';

interface Employee {
  personal_number: number;
  full_name: string;
  position: string;
  service_type_id?: number;
  service_type?: {
    serviceTypeId: number;
    serviceTypeName: string;
  };
  brigada_id?: number;
  photo?: string;
}

const EmployeesManager: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { employees, status } = useSelector((state: RootState) => state.employees);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAllEmployees());
  }, [dispatch]);

  const filteredEmployees = employees.filter(employee =>
    employee.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.personal_number?.toString().includes(searchTerm)
  );

  if (status === 'loading') {
    return <div className={styles.loading}>Загрузка сотрудников...</div>;
  }

  return (
    <div className={styles.employeesManager}>
      <h1>Управление сотрудниками</h1>
      
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Поиск по ФИО или личному номеру..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.stats}>
          Найдено: {filteredEmployees.length} из {employees.length}
        </div>
      </div>

      <div className={styles.employeesGrid}>
        {filteredEmployees.map((employee: Employee) => (
          <div key={employee.personal_number} className={styles.employeeCard}>
            <div className={styles.employeePhoto}>
              {employee.photo ? (
                <img src={employee.photo} alt={employee.full_name} />
              ) : (
                <div className={styles.defaultPhoto}>👤</div>
              )}
            </div>
            <div className={styles.employeeInfo}>
              <h3>{employee.full_name}</h3>
              <p><strong>Личный номер:</strong> {employee.personal_number}</p>
              <p><strong>Должность:</strong> {employee.position}</p>
              <p><strong>Служба:</strong> {employee.service_type?.serviceTypeName || `ID: ${employee.service_type_id}`}</p>
              <p><strong>Бригада:</strong> {employee.brigada_id || '-'}</p>
            </div>
            <div className={styles.employeeActions}>
              <button className={styles.editBtn}>Редактировать</button>
              <button className={styles.deleteBtn}>Удалить</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeesManager;