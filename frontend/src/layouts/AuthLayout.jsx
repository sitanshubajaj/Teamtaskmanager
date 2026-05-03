import { Outlet } from 'react-router-dom';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <div className="auth-header">
          <h2>Team Task Manager</h2>
          <p>Sign in to manage your team's productivity</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
