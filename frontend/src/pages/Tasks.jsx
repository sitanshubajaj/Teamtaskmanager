import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../features/auth/authSlice';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskStatusMutation } from '../features/tasks/tasksApiSlice';
import { useGetUsersQuery } from '../features/users/usersApiSlice';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import toast from 'react-hot-toast';
import './Tasks.css';

const COLUMNS = ['To Do', 'In Progress', 'Completed'];

const Tasks = () => {
  const { projectId } = useParams();
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'Admin';
  
  const { data: tasksRes, isLoading } = useGetTasksQuery(projectId);
  const { data: usersRes } = useGetUsersQuery(undefined, { skip: !isAdmin });
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateStatus] = useUpdateTaskStatusMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'Medium', assignedTo: '', deadline: '' });

  // Local state for optimistic drag and drop
  const [localTasks, setLocalTasks] = useState([]);

  useEffect(() => {
    if (tasksRes?.data?.tasks) {
      setLocalTasks(tasksRes.data.tasks);
    }
  }, [tasksRes]);

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const newStatus = destination.droppableId;
    const taskIndex = localTasks.findIndex(t => t._id === draggableId);
    
    // Optimistic UI update
    const newTasks = [...localTasks];
    newTasks[taskIndex] = { ...newTasks[taskIndex], status: newStatus };
    setLocalTasks(newTasks);

    try {
      await updateStatus({ taskId: draggableId, status: newStatus }).unwrap();
      toast.success('Task status updated');
    } catch (err) {
      toast.error('Failed to update status');
      // Revert on failure
      setLocalTasks(tasksRes?.data?.tasks || []);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (projectId) payload.project = projectId;
      
      await createTask(payload).unwrap();
      toast.success('Task created successfully!');
      setIsModalOpen(false);
      setFormData({ title: '', description: '', priority: 'Medium', assignedTo: '', deadline: '' });
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to create task');
    }
  };

  if (isLoading) {
    return <div className="board-container"><Skeleton height="400px" /><Skeleton height="400px" /><Skeleton height="400px" /></div>;
  }

  const getTasksByStatus = (status) => localTasks.filter(task => task.status === status);

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
      <div className="projects-header clean-card">
        <div>
          <h1>Tasks</h1>
          <p style={{ color: 'var(--text-muted)' }}>Drag and drop to update status</p>
        </div>
        {isAdmin && projectId && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Add Task
          </button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="board-container">
          {COLUMNS.map(columnId => {
            const columnTasks = getTasksByStatus(columnId);
            return (
              <div key={columnId} className="kanban-column">
                <div className="column-header">
                  {columnId}
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{columnTasks.length}</span>
                </div>
                
                <Droppable droppableId={columnId}>
                  {(provided, snapshot) => (
                    <div 
                      className="task-list"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      style={{ backgroundColor: snapshot.isDraggingOver ? 'var(--bg-color)' : 'transparent' }}
                    >
                      {columnTasks.map((task, index) => (
                        <Draggable key={task._id} draggableId={task._id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="task-card"
                              style={{ 
                                ...provided.draggableProps.style, 
                                opacity: snapshot.isDragging ? 0.8 : 1,
                                border: snapshot.isDragging ? '1px solid var(--primary)' : '1px solid var(--border)',
                                transform: snapshot.isDragging ? 'scale(1.05)' : 'scale(1)',
                                boxShadow: snapshot.isDragging ? 'var(--shadow-lg)' : 'var(--shadow-sm)'
                              }}
                            >
                              <h4>{task.title}</h4>
                              <p>{task.description}</p>
                              <div className="task-meta">
                                <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                                <span>{task.assignedTo?.username || 'Unassigned'}</span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
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
              className="modal-content clean-card" 
              onClick={e => e.stopPropagation()}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
            <h2>Create New Task</h2>
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label>Task Title</label>
                <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  rows="2"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})}>
                  <option value="">-- Select Member --</option>
                  {usersRes?.data?.users?.map(u => (
                    <option key={u._id} value={u._id}>{u.username}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Task'}
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

export default Tasks;
