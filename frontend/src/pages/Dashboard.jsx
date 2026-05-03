import React from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetDashboardStatsQuery } from '../features/dashboard/dashboardApiSlice';
import Skeleton from '../components/Skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import './Dashboard.css';

const COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b']; // Light theme compatible colors

const Dashboard = () => {
  const user = useSelector(selectCurrentUser);
  const { data: response, isLoading, isError } = useGetDashboardStatsQuery();

  const isAdmin = user?.role === 'Admin';

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Skeleton height="100px" />
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} height="130px" />)}
        </div>
        <div className="charts-grid">
          <Skeleton height="400px" />
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="clean-card text-center" style={{ padding: '2rem' }}>Error loading dashboard statistics. Please try again.</div>;
  }

  const stats = response?.data;
  
  // Format Data for Charts
  const statusData = stats?.statusStats?.map(item => ({ name: item._id, value: item.count })) || [];
  const trendData = stats?.trendStats?.map(item => ({
    date: item._id,
    Created: item.created,
    Completed: item.completed
  })) || [];

  const totalTasks = statusData.reduce((acc, curr) => acc + curr.value, 0);
  const completedTasks = statusData.find(s => s.name === 'Completed')?.value || 0;
  const pendingTasks = totalTasks - completedTasks;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.98 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', stiffness: 100, damping: 20 }
    }
  };

  return (
    <motion.div 
      className="dashboard-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="dashboard-header clean-card" variants={itemVariants}>
        <h1>{isAdmin ? 'Team Overview' : 'My Progress'}</h1>
        <p>
          {isAdmin 
            ? 'Monitor global project progress, task trends, and team productivity.' 
            : 'Track your assigned tasks, deadlines, and personal productivity.'}
        </p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div className="stats-grid" variants={itemVariants}>
        <motion.div className="clean-card stat-card" variants={itemVariants}>
          <span className="stat-title">Total Tasks</span>
          <span className="stat-value">{totalTasks}</span>
        </motion.div>
        <motion.div className="clean-card stat-card" variants={itemVariants}>
          <span className="stat-title">Completed Tasks</span>
          <span className="stat-value" style={{ color: 'var(--success)' }}>{completedTasks}</span>
        </motion.div>
        <motion.div className="clean-card stat-card" variants={itemVariants}>
          <span className="stat-title">Pending Tasks</span>
          <span className="stat-value" style={{ color: 'var(--warning)' }}>{pendingTasks}</span>
        </motion.div>
        <motion.div className="clean-card stat-card" variants={itemVariants}>
          <span className="stat-title">Overdue Tasks</span>
          <span className="stat-value" style={{ color: 'var(--danger)' }}>{stats?.overdueTasks || 0}</span>
        </motion.div>
      </motion.div>

      {/* Charts */}
      <motion.div className="charts-grid" variants={itemVariants}>
        <motion.div className="clean-card chart-card" variants={itemVariants}>
          <h3>Task Completion Trend</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: 'var(--surface-hover)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                <Bar dataKey="Created" fill="var(--primary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Completed" fill="var(--secondary)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div className="clean-card chart-card" variants={itemVariants}>
          <h3>Task Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
