import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import { logOut, selectCurrentUser } from '../features/auth/authSlice';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import './DashboardLayout.css';

const DashboardLayout = () => {
  const [logoutApi] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logOut());
      navigate('/login');
    } catch (err) {
      console.error('Failed to log out', err);
    }
  };

  const sidebarVariants = {
    hidden: { x: -280, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  return (
    <div className="layout-container">
      <motion.aside 
        className="sidebar"
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="sidebar-header">
          <h2 className="text-gradient">TeamTask</h2>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <FolderKanban size={20} />
            <span>Projects</span>
          </NavLink>
          <NavLink to="/tasks" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <CheckSquare size={20} />
            <span>My Tasks</span>
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="user-role">{user?.role || 'Member'}</span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleLogout} 
            className="logout-btn" 
            aria-label="Log out"
          >
            <LogOut size={20} />
          </motion.button>
        </div>
      </motion.aside>
      <main className="main-content">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{ height: '100%' }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default DashboardLayout;
