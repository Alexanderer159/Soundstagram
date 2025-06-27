import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginForm from './components/LoginForm';

function App() {
  return (
    <div className="App" style={{
      backgroundColor: '#363640',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white'
    }}>
      <div className="container">
        <div className="row">
          <div className="col-md-6 d-flex align-items-center">
            <div className="slogan-container ps-4">
              <h3 className="text-light opacity-75">ESLOGAN PENDIENTE</h3>
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-center">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;