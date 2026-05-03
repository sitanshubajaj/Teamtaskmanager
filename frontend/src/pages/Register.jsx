import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useRegisterMutation } from '../features/auth/authApiSlice';
import { setCredentials } from '../features/auth/authSlice';
import toast from 'react-hot-toast';
import './AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Member' });
  
  const [register, { isLoading }] = useRegisterMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await register(formData).unwrap();
      dispatch(setCredentials({ user: result.data.user, token: result.data.accessToken }));
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err?.data?.message || err?.data?.error || 'Registration failed');
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input type="text" id="username" value={formData.username} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" value={formData.email} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input type="password" id="password" value={formData.password} onChange={handleChange} required minLength={8} />
      </div>
      <div className="form-group">
        <label htmlFor="role">Role</label>
        <select id="role" value={formData.role} onChange={handleChange}>
          <option value="Member">Member</option>
          <option value="Admin">Admin</option>
        </select>
      </div>
      <button type="submit" className="btn btn-primary full-width" disabled={isLoading}>
        {isLoading ? 'Creating Account...' : 'Sign Up'}
      </button>
      <div className="auth-links">
        <span>Already have an account? <Link to="/login">Sign In</Link></span>
      </div>
    </form>
  );
};

export default Register;
