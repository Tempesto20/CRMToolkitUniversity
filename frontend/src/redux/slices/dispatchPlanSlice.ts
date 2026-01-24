import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface DispatchPlanState {
  brigadesWithData: any[];
  filteredBrigades: any[];
  filters: {
    serviceTypeId: number | '';
    workTypeId: number | '';
    brigadeId: number | '';
  };
  filterData: {
    serviceTypes: any[];
    workTypes: any[];
    brigades: any[];
  };
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: DispatchPlanState = {
  brigadesWithData: [],
  filteredBrigades: [],
  filters: {
    serviceTypeId: '',
    workTypeId: '',
    brigadeId: ''
  },
  filterData: {
    serviceTypes: [],
    workTypes: [],
    brigades: []
  },
  status: 'idle',
  error: null
};

export const fetchDispatchPlanData = createAsyncThunk(
  'dispatchPlan/fetchData',
  async () => {
    try {
      const [locomotives, employees, serviceTypes, workTypes, brigades] = await Promise.all([
        axios.get('http://localhost:3000/locomotives'),
        axios.get('http://localhost:3000/api/employees'),
        axios.get('http://localhost:3000/service-types'),
        axios.get('http://localhost:3000/work-types'),
        axios.get('http://localhost:3000/brigada')
      ]);

      return {
        locomotives: locomotives.data,
        employees: employees.data,
        serviceTypes: serviceTypes.data,
        workTypes: workTypes.data,
        brigades: brigades.data
      };
    } catch (error) {
      console.error('Error fetching dispatch plan data:', error);
      throw error;
    }
  }
);

export const fetchFilterData = createAsyncThunk(
  'dispatchPlan/fetchFilterData',
  async () => {
    try {
      const [serviceTypes, workTypes, brigades] = await Promise.all([
        axios.get('http://localhost:3000/service-types'),
        axios.get('http://localhost:3000/work-types'),
        axios.get('http://localhost:3000/brigada')
      ]);

      return {
        serviceTypes: serviceTypes.data,
        workTypes: workTypes.data,
        brigades: brigades.data
      };
    } catch (error) {
      console.error('Error fetching filter data:', error);
      throw error;
    }
  }
);

const dispatchPlanSlice = createSlice({
  name: 'dispatchPlan',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      
      // Применяем все фильтры к данным
      let filteredBrigades = [...state.brigadesWithData];
      
      // Фильтр по бригаде
      if (action.payload.brigadeId) {
        filteredBrigades = filteredBrigades.filter(brigade => 
          brigade.brigadaId === action.payload.brigadeId
        );
      }
      
      // Применяем фильтры к каждой бригаде и ее локомотивам
      filteredBrigades = filteredBrigades.map(brigade => {
        // Создаем копию бригады
        const filteredBrigade = { ...brigade };
        
        // Фильтруем локомотивы внутри бригады
        if (action.payload.serviceTypeId || action.payload.workTypeId) {
          filteredBrigade.locomotives = brigade.locomotives?.filter((locomotive: any) => {
            let passesServiceTypeFilter = true;
            let passesWorkTypeFilter = true;
            
            // Фильтр по виду службы
            if (action.payload.serviceTypeId) {
              passesServiceTypeFilter = locomotive.employees?.some((employee: any) => 
                employee.serviceType?.serviceTypeId === action.payload.serviceTypeId
              ) || false;
            }
            
            // Фильтр по типу работы
            if (action.payload.workTypeId) {
              passesWorkTypeFilter = locomotive.employees?.some((employee: any) => 
                employee.workType?.workTypeId === action.payload.workTypeId
              ) || false;
            }
            
            return passesServiceTypeFilter && passesWorkTypeFilter;
          }) || [];
          
          // Пересчитываем статистику для отфильтрованной бригады
          filteredBrigade.totalLocomotives = filteredBrigade.locomotives.length;
          filteredBrigade.totalEmployees = filteredBrigade.locomotives.reduce(
            (total: number, locomotive: any) => total + (locomotive.employees?.length || 0), 0
          );
        }
        
        return filteredBrigade;
      }).filter(brigade => 
        // Убираем бригады без локомотивов после фильтрации
        brigade.totalLocomotives > 0 || 
        (brigade.brigadaId === -1 && brigade.locomotives?.length > 0)
      );
      
      state.filteredBrigades = filteredBrigades;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredBrigades = state.brigadesWithData.map(brigade => ({
        ...brigade,
        locomotives: brigade.locomotives || [],
        totalLocomotives: brigade.locomotives?.length || 0,
        totalEmployees: brigade.locomotives?.reduce(
          (total: number, locomotive: any) => total + (locomotive.employees?.length || 0), 0
        ) || 0
      }));
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDispatchPlanData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDispatchPlanData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        const payload: any = action.payload;
        
        state.filterData.serviceTypes = payload.serviceTypes || [];
        state.filterData.workTypes = payload.workTypes || [];
        state.filterData.brigades = payload.brigades || [];
        
        // Создаем словарь локомотивов
        const locomotivesDict: { [key: string]: any } = {};
        payload.locomotives?.forEach((locomotive: any) => {
          locomotivesDict[locomotive.locomotiveId] = {
            ...locomotive,
            employees: [] // Инициализируем пустой массив сотрудников
          };
        });
        
        // Добавляем сотрудников к их локомотивам
        payload.employees?.forEach((employee: any) => {
          const locomotiveId = employee.locomotive?.locomotiveId;
          if (locomotiveId && locomotivesDict[locomotiveId]) {
            locomotivesDict[locomotiveId].employees.push({
              ...employee,
              position: employee.position || 'Не указана',
              personalNumber: employee.personalNumber || 0,
              fullName: employee.fullName || 'Не указан'
            });
          }
        });
        
        // Группируем локомотивы по бригадам через сотрудников
        const brigadesDict: { [key: number]: any } = {};
        
        // Сначала создаем записи для всех бригад
        payload.brigades?.forEach((brigade: any) => {
          brigadesDict[brigade.brigadaId] = {
            ...brigade,
            locomotives: [],
            totalEmployees: 0
          };
        });
        
        // Добавляем "Без бригады"
        brigadesDict[0] = {
          brigadaId: 0,
          brigadaName: 'Без бригады',
          locomotives: [],
          totalEmployees: 0
        };
        
        // Добавляем "Локомотивы без сотрудников"
        brigadesDict[-1] = {
          brigadaId: -1,
          brigadaName: 'Локомотивы без сотрудников',
          locomotives: [],
          totalEmployees: 0
        };
        
        // Распределяем локомотивы по бригадам через сотрудников
        Object.values(locomotivesDict).forEach((locomotive: any) => {
          // Находим бригаду через сотрудников этого локомотива
          const employeesBrigades = new Set<number>();
          
          locomotive.employees.forEach((employee: any) => {
            if (employee.brigada?.brigadaId) {
              employeesBrigades.add(employee.brigada.brigadaId);
            } else {
              employeesBrigades.add(0); // Без бригады
            }
          });
          
          // Если у локомотива есть сотрудники
          if (locomotive.employees.length > 0) {
            employeesBrigades.forEach(brigadeId => {
              if (!brigadesDict[brigadeId]) {
                brigadesDict[brigadeId] = {
                  brigadaId: brigadeId,
                  brigadaName: `Бригада ${brigadeId}`,
                  locomotives: [],
                  totalEmployees: 0
                };
              }
              
              // Добавляем локомотив в бригаду
              brigadesDict[brigadeId].locomotives.push({
                ...locomotive,
                // Фильтруем сотрудников только этой бригады
                employees: locomotive.employees.filter((emp: any) => 
                  (emp.brigada?.brigadaId || 0) === brigadeId
                )
              });
              
              // Обновляем счетчик сотрудников
              brigadesDict[brigadeId].totalEmployees += locomotive.employees
                .filter((emp: any) => (emp.brigada?.brigadaId || 0) === brigadeId)
                .length;
            });
          } else {
            // Локомотив без сотрудников
            brigadesDict[-1].locomotives.push(locomotive);
          }
        });
        
        // Преобразуем словарь в массив и добавляем статистику
        const brigadesWithData = Object.values(brigadesDict).map((brigade: any) => ({
          ...brigade,
          totalLocomotives: brigade.locomotives?.length || 0,
          locomotives: brigade.locomotives || []
        })).filter((brigade: any) => 
          // Убираем пустые бригады (кроме "Локомотивы без сотрудников")
          brigade.totalLocomotives > 0 || brigade.brigadaId === -1
        );
        
        state.brigadesWithData = brigadesWithData;
        state.filteredBrigades = brigadesWithData.map(brigade => ({
          ...brigade,
          // Инициализируем отфильтрованные данные как полные данные
          totalLocomotives: brigade.locomotives?.length || 0,
          totalEmployees: brigade.locomotives?.reduce(
            (total: number, locomotive: any) => total + (locomotive.employees?.length || 0), 0
          ) || 0
        }));
      })
      .addCase(fetchDispatchPlanData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error?.message || 'Не удалось загрузить данные';
      })
      
      .addCase(fetchFilterData.fulfilled, (state, action) => {
        const payload: any = action.payload;
        state.filterData.serviceTypes = payload.serviceTypes || [];
        state.filterData.workTypes = payload.workTypes || [];
        state.filterData.brigades = payload.brigades || [];
      });
  }
});

export const { setFilters, resetFilters, clearError } = dispatchPlanSlice.actions;
export default dispatchPlanSlice.reducer;