import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login attempt with:', { email, password });
    // Add authentication logic here
  };

  return (
    <div className="login-container" style={{
      maxWidth: '400px',
      padding: '30px',
      backgroundColor: '#6E45A2',
      borderRadius: '10px',
      boxShadow: '0 0 30px rgba(255, 255, 255, 0.3)',
    }}>
      <h1 className="text-center mb-4" style={{
        color: 'white',
        fontSize: '2.5rem',
        fontWeight: '400',
        letterSpacing: '1px',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.5)',
      }}>
        SoundStagram
      </h1>

      <div className="mb-4">
        <ul className="nav nav-pills nav-fill">
          <li className="nav-item">
            <button className="nav-link active" style={{ backgroundColor: 'transparent', color: 'white', border: 'none' }}>
              Iniciar Sesión
            </button>
          </li>
          <li className="nav-item">
            <button className="nav-link" style={{ backgroundColor: 'transparent', color: 'white', border: 'none', opacity: '0.7' }}>
              Registrarse
            </button>
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 position-relative">
          <input
            type={showPassword ? "text" : "password"}
            className="form-control"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="btn position-absolute end-0 top-50 translate-middle-y bg-transparent border-0 text-dark"
            onClick={() => setShowPassword(!showPassword)}
            style={{ zIndex: 10 }}
          >
            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
          </button>
        </div>

        <div className="d-grid gap-2">
          <button
            type="submit"
            className="btn"
            style={{
              backgroundColor: '#D8C8F5',
              color: '#6E45A2',
              padding: '10px',
              borderRadius: '5px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500'
            }}
          >
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;