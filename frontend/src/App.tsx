import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { store } from './redux/store';
import Layout from './components/Layout/Layout';
import HomePage from './components/Home/HomePage';
import EmployeesManager from './components/Employees/EmployeesManager';
import LocomotivesManager from './components/Locomotives/LocomotivesManager';
import LeavesManager from './components/Leaves/LeavesManager';
import LocationWorkManager from './components/Locations/LocationWorkManager';
import LeaveTypesManager from './components/LeaveTypesManager';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/employees" element={<EmployeesManager />} />
            <Route path="/locomotives" element={<LocomotivesManager />} />
            <Route path="/leaves" element={<LeavesManager />} />
            <Route path="/location-works" element={<LocationWorkManager />} />
            <Route path="/leave-types" element={<LeaveTypesManager />} />
          </Routes>
        </Layout>
      </Router>
    </Provider>
  );
}

export default App;