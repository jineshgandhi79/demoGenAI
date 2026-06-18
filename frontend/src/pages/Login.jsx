import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { Mail, Lock, AlertTriangle, Headphones } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token, user } = response.data.data;
        login(token, user);
        if (user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/chat');
        }
      } else {
        setError(response.data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      position: 'relative'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '420px',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 32px',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'var(--primary-glow)',
            padding: '12px',
            borderRadius: '50%',
            color: 'var(--primary)'
          }}>
            <Headphones size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, tracking: '-0.025em' }}>
            Welcome to SupportSphere
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Enter your credentials to access the portal
          </p>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-glow)',
            border: '1px solid hsla(350, 89%, 60%, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            color: 'var(--danger)',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '24px'
          }}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)'
              }} />
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '44px' }}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '15px' }}
          >
            {loading ? <div className="spinner" /> : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
