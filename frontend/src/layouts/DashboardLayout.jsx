import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../features/auth/authApiSlice';
import { logOut, selectCurrentUser } from '../features/auth/authSlice';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare } from 'lucide-react';
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

  return (
    <div className="layout-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>TeamTask</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/" className="nav-item">
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/projects" className="nav-item">
            <FolderKanban size={20} />
            <span>Projects</span>
          </Link>
          <Link to="/tasks" className="nav-item">
            <CheckSquare size={20} />
            <span>My Tasks</span>
          </Link>
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button onClick={handleLogout} className="logout-btn" aria-label="Log out">
            <LogOut size={20} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
