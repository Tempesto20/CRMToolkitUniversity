import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './redux/store';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
// import AddEmployeeForm from './components/AddEmployeeForm';
import EmployeesManager from './components/EmployeesManager';
import LocomotivesManager from './components/LocomotivesManager';
import LeavesManager from './components/LeavesManager';
import WorkTypesManager from './components/WorkTypesManager';
import ServiceTypesManager from './components/ServiceTypesManager';
import LocationWorkManager from './components/LocationWorkManager';
import LeaveTypesManager from './components/LeaveTypesManager';
// import BrigadaComponent from './components/BrigadaComponent';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* <Route path="/add-employee" element={<AddEmployeeForm />} /> */}
            <Route path="/employees" element={<EmployeesManager />} />
            <Route path="/locomotives" element={<LocomotivesManager />} />
            <Route path="/leaves" element={<LeavesManager />} />
            <Route path="/work-types" element={<WorkTypesManager />} />
            <Route path="/service-types" element={<ServiceTypesManager />} />
            <Route path="/location-works" element={<LocationWorkManager />} />
            <Route path="/leave-types" element={<LeaveTypesManager />} />
            {/* <Route path="/brigadas" element={<BrigadaComponent />} /> */}
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;