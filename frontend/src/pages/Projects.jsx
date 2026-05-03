import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetProjectsQuery, useCreateProjectMutation } from '../features/projects/projectsApiSlice';
import { useGetUsersQuery } from '../features/users/usersApiSlice';
import Skeleton from '../components/Skeleton';
import toast from 'react-hot-toast';
import './Projects.css';

const Projects = () => {
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'Admin';
  
  const { data: projectsRes, isLoading } = useGetProjectsQuery();
  const { data: usersRes } = useGetUsersQuery(undefined, { skip: !isAdmin });
  const [createProject, { isLoading: isCreating }] = useCreateProjectMutation();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', members: [] });

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const isSelected = prev.members.includes(userId);
      return {
        ...prev,
        members: isSelected ? prev.members.filter(id => id !== userId) : [...prev.members, userId]
      };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createProject(formData).unwrap();
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', deadline: '', members: [] });
    } catch (err) {
      toast.error('Failed to create project');
    }
  };

  if (isLoading) {
    return (
      <div className="projects-grid">
        {[1, 2, 3].map(i => <Skeleton key={i} height="150px" />)}
      </div>
    );
  }

  const projects = projectsRes?.data?.projects || [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your team's projects</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card">No projects found.</div>
      ) : (
        <motion.div 
          className="projects-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {projects.map(project => (
            <motion.div variants={itemVariants} key={project._id} style={{ display: 'flex' }}>
              <Link to={`/projects/${project._id}/tasks`} className="card project-card" style={{ width: '100%' }}>
                <div className="project-title">{project.title}</div>
                <div className="project-desc">{project.description}</div>
                <div className="project-footer">
                  <span>{project.members?.length || 0} Members</span>
                  {project.deadline && <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            className="modal-overlay" 
            onClick={() => setIsModalOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="modal-content" 
              onClick={e => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
            <h2>Create New Project</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label>Project Title</label>
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows="3"
                  style={{ padding: '0.75rem', borderRadius: '0.375rem', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-main)', resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input 
                  type="date" 
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                />
              </div>
              
              <div className="form-group">
                <label>Assign Members</label>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border)', padding: '0.5rem', borderRadius: '0.375rem' }}>
                  {usersRes?.data?.users?.map(u => (
                    <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.25rem 0' }}>
                      <input 
                        type="checkbox" 
                        id={`user-${u._id}`}
                        checked={formData.members.includes(u._id)}
                        onChange={() => handleMemberToggle(u._id)}
                      />
                      <label htmlFor={`user-${u._id}`}>{u.username} ({u.email})</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Projects;
