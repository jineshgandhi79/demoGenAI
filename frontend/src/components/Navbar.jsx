import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Database, 
  AlertCircle, 
  MessageSquare, 
  LogOut, 
  MessageCircle, 
  Headphones 
} from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '16px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid var(--glass-border)'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Headphones size={24} style={{ color: 'var(--primary)' }} />
        <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '-0.025em' }}>
          SupportSphere
        </span>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {user.role === 'ADMIN' ? (
          <>
            <Link to="/admin/dashboard" className={`btn ${isActive('/admin/dashboard') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <LayoutDashboard size={16} />
              <span>Dashboard</span>
            </Link>
            <Link to="/admin/knowledge-base" className={`btn ${isActive('/admin/knowledge-base') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <Database size={16} />
              <span>Knowledge Base</span>
            </Link>
            <Link to="/admin/escalations" className={`btn ${isActive('/admin/escalations') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <AlertCircle size={16} />
              <span>Escalations</span>
            </Link>
            <Link to="/admin/feedback" className={`btn ${isActive('/admin/feedback') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <MessageSquare size={16} />
              <span>Feedback</span>
            </Link>
          </>
        ) : (
          <Link to="/chat" className={`btn ${isActive('/chat') ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '8px 16px', fontSize: '14px' }}>
            <MessageCircle size={16} />
            <span>Chat Hub</span>
          </Link>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{user.name}</span>
          <span className={`badge ${user.role === 'ADMIN' ? 'badge-role-admin' : 'badge-role-user'}`} style={{ fontSize: '10px', padding: '2px 6px', marginTop: '2px' }}>
            {user.role}
          </span>
        </div>
        <button className="btn btn-secondary btn-icon" onClick={handleLogout} title="Log Out">
          <LogOut size={16} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
