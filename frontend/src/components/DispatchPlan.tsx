import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchDispatchPlanData, 
  fetchFilterData, 
  setFilters,
  resetFilters 
} from '../redux/slices/dispatchPlanSlice';
import { RootState, AppDispatch } from '../redux/store';
import styles from './DispatchPlan.module.scss';

const DispatchPlan: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    filteredBrigades: brigades,
    filters,
    filterData,
    status,
    error
  } = useSelector((state: RootState) => state.dispatchPlan);

  useEffect(() => {
    dispatch(fetchDispatchPlanData());
    dispatch(fetchFilterData());
  }, [dispatch]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const newFilters = {
      ...filters,
      [name]: value === '' ? '' : parseInt(value)
    };
    
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  // Получаем названия активных фильтров
  const getActiveFilterLabel = () => {
    const activeFilters: string[] = [];
    
    if (filters.serviceTypeId) {
      const serviceType = filterData.serviceTypes.find(
        (s: any) => s.serviceTypeId === filters.serviceTypeId
      );
      if (serviceType) {
        activeFilters.push(serviceType.serviceTypeName);
      }
    }
    
    if (filters.workTypeId) {
      const workType = filterData.workTypes.find(
        (w: any) => w.workTypeId === filters.workTypeId
      );
      if (workType) {
        activeFilters.push(workType.workTypeName);
      }
    }
    
    if (filters.brigadeId) {
      const brigade = filterData.brigades.find(
        (b: any) => b.brigadaId === filters.brigadeId
      );
      if (brigade) {
        activeFilters.push(brigade.brigadaName);
      }
    }
    
    return activeFilters.length > 0 
      ? `Фильтры: ${activeFilters.join(', ')}`
      : null;
  };

  if (status === 'loading') {
    return (
      <div className={styles.dispatchPlan}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Загрузка демонстрационного плана...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dispatchPlan}>
        <div className={styles.errorMessage}>
          <p>Ошибка при загрузке данных: {error}</p>
          <button 
            onClick={() => dispatch(fetchDispatchPlanData())}
            className={styles.btnPrimary}
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Считаем общее количество локомотивов после фильтрации
  const totalFilteredLocomotives = brigades.reduce(
    (total, brigade) => total + (brigade.totalLocomotives || 0), 0
  );
  
  const totalFilteredEmployees = brigades.reduce(
    (total, brigade) => total + (brigade.totalEmployees || 0), 0
  );

  return (
    <div className={styles.dispatchPlan}>
      <div className={styles.pageHeader}>
        <div className={styles.headerTitle}>
          <h1>Демонстрационный план раскрепления</h1>
          <p className={styles.pageDescription}>
            Просмотр текущего раскрепления локомотивов по бригадам. Страница только для просмотра.
          </p>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={handleResetFilters}
            className={styles.btnSecondary}
            disabled={!Object.values(filters).some(f => f !== '')}
          >
            Сбросить фильтры
          </button>
          <button
            onClick={() => dispatch(fetchDispatchPlanData())}
            className={styles.btnPrimary}
          >
            Обновить данные
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className={styles.filtersSection}>
        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label htmlFor="serviceTypeId">Вид службы</label>
            <select
              id="serviceTypeId"
              name="serviceTypeId"
              value={filters.serviceTypeId}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">Все службы</option>
              {filterData.serviceTypes.map((service: any) => (
                <option key={service.serviceTypeId} value={service.serviceTypeId}>
                  {service.serviceTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="workTypeId">Тип работы</label>
            <select
              id="workTypeId"
              name="workTypeId"
              value={filters.workTypeId}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">Все типы работ</option>
              {filterData.workTypes.map((work: any) => (
                <option key={work.workTypeId} value={work.workTypeId}>
                  {work.workTypeName}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="brigadeId">Бригада</label>
            <select
              id="brigadeId"
              name="brigadeId"
              value={filters.brigadeId}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">Все бригады</option>
              {filterData.brigades.map((brigade: any) => (
                <option key={brigade.brigadaId} value={brigade.brigadaId}>
                  {brigade.brigadaName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterInfo}>
          <div className={styles.filterStats}>
            <p>
              Найдено бригад: <strong>{brigades.length}</strong>
              {', '}
              {/* локомотивов: <strong>{totalFilteredLocomotives}</strong>
              {', '} */}
              сотрудников: <strong>{totalFilteredEmployees}</strong>
            </p>
            {getActiveFilterLabel() && (
              <div className={styles.activeFilters}>
                <span className={styles.filteredBadge}>
                  {getActiveFilterLabel()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Секции бригад */}
      {brigades.map((brigade: any) => (
        <div key={brigade.brigadaId} className={styles.brigadeSection}>
          <div className={styles.brigadeHeader}>
            <h2 className={styles.brigadeTitle}>
              {brigade.brigadaName}
              <span className={styles.brigadeStats}>
                {brigade.totalLocomotives} локомотивов • {brigade.totalEmployees} сотрудников
              </span>
            </h2>
          </div>
          
          {/* Карточки локомотивов в бригаде */}
          <div className={styles.locomotivesGrid}>
            {brigade.locomotives && brigade.locomotives.length > 0 ? (
              brigade.locomotives.map((locomotive: any) => (
                <div key={locomotive.locomotiveId} className={styles.locomotiveCard}>
                  {/* Заголовок карточки */}
                  <div className={styles.cardHeader}>
                    <div className={styles.locoId}>
                      <span className={styles.idLabel}>№</span>
                      <span className={styles.idValue}>{locomotive.locomotiveId}</span>
                    </div>
                    <div className={styles.statusBadge}>
                      <span className={`${styles.statusIndicator} ${
                        locomotive.locomotiveDepo ? styles.inDepo : styles.onLine
                      }`}></span>
                      <span>{locomotive.locomotiveDepo ? 'Депо' : 'На линии'}</span>
                    </div>
                  </div>

                  {/* Информация о локомотиве */}
                  <div className={styles.cardBody}>
                    <div className={styles.locoInfo}>
                      <h3 className={styles.locoName}>{locomotive.locomotiveName || 'Не указано'}</h3>
                      {locomotive.locomotiveType && (
                        <p className={styles.locoType}>
                          <span className={styles.label}>Тип:</span>
                          <span className={styles.value}>{locomotive.locomotiveType}</span>
                        </p>
                      )}
                      {locomotive.location && (
                        <p className={styles.locoLocation}>
                          <span className={styles.label}>Район:</span>
                          <span className={styles.value}>{locomotive.location.locationName}</span>
                        </p>
                      )}
                    </div>

                    {/* Все сотрудники */}
                    <div className={styles.employeesSection}>
                      <div className={styles.sectionHeader}>
                        <span className={styles.sectionIcon}>👷</span>
                        <h4>Закрепленные сотрудники ({locomotive.employees?.length || 0})</h4>
                      </div>
                      
                      {locomotive.employees && locomotive.employees.length > 0 ? (
                        <div className={styles.employeesList}>
                          {locomotive.employees.map((employee: any, index: number) => (
                            <div key={`${employee.personalNumber}-${index}`} className={styles.employeeItem}>
                              <div className={styles.employeeInfo}>
                                <span className={styles.employeeName}>{employee.fullName}</span>
                                <span className={styles.employeePosition}>{employee.position}</span>
                              </div>
                              <div className={styles.employeeDetails}>
                                <span className={styles.employeeBadge}>
                                  №{employee.personalNumber}
                                </span>
                                {employee.serviceType && (
                                  <span className={styles.serviceBadge}>
                                    {employee.serviceType.serviceTypeName}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className={styles.noEmployees}>
                          <p>На этом локомотиве нет закрепленных сотрудников</p>
                        </div>
                      )}
                    </div>

                    {/* Служба и тип работы (если есть сотрудники) */}
                    {locomotive.employees && locomotive.employees.length > 0 && (
                      <div className={styles.serviceSection}>
                        <div className={styles.sectionRow}>
                          <span className={styles.label}>Основная служба:</span>
                          <span className={styles.value}>
                            {locomotive.employees[0].serviceType?.serviceTypeName || 'Не указана'}
                          </span>
                        </div>
                        <div className={styles.sectionRow}>
                          <span className={styles.label}>Тип работы:</span>
                          <span className={styles.value}>
                            {locomotive.employees[0].workType?.workTypeName || 'Не указан'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Футер карточки */}
                  <div className={styles.cardFooter}>
                    <span className={styles.footerText}>
                      Бригада: {brigade.brigadaName} • Демонстрационный план
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noLocomotives}>
                <p>В этой бригаде нет локомотивов</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {brigades.length === 0 && (
        <div className={styles.noResults}>
          <div className={styles.noResultsIcon}>
            <span>🚂</span>
          </div>
          <h3>Бригады не найдены</h3>
          <p>Попробуйте изменить параметры фильтров</p>
        </div>
      )}
    </div>
  );
};

export default DispatchPlan;