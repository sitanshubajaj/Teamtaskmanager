import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AuthLayout.css';

const AuthLayout = () => {
  return (
    <div className="auth-layout">
      {/* Soft light gradient background shapes */}
      <div className="soft-shape shape-1"></div>
      <div className="soft-shape shape-2"></div>
      
      <motion.div 
        className="auth-container clean-card"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.2 }}
      >
        <div className="auth-header">
          <h2 className="text-gradient">Team Task Manager</h2>
          <p>Sign in to manage your team's productivity</p>
        </div>
        <Outlet />
      </motion.div>
    </div>
  );
};

export default AuthLayout;
