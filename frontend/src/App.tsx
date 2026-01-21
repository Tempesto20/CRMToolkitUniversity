import React from 'react';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import AddEmployeeForm from './components/AddEmployeeForm';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <AddEmployeeForm />
      </div>
    </Provider>
  );
}

export default App;