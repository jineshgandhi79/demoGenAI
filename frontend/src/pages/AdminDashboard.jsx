import { useState, useEffect } from 'react';
import api from '../api';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown,
  HelpCircle,
  ShieldAlert,
  Loader
} from 'lucide-react';

const AdminDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [topUnanswered, setTopUnanswered] = useState([]);
  const [escalationTopics, setEscalationTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewRes, unansweredRes, topicsRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/top-unanswered'),
        api.get('/analytics/escalation-topics')
      ]);

      if (overviewRes.data.success) {
        setOverview(overviewRes.data.data);
      }
      if (unansweredRes.data.success) {
        setTopUnanswered(unansweredRes.data.data);
      }
      if (topicsRes.data.success) {
        setEscalationTopics(topicsRes.data.data);
      }
    } catch (err) {
      setError('Failed to retrieve dashboard analytics data. Ensure backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Loader size={36} className="spinner" />
          <span style={{ color: 'var(--text-secondary)' }}>Loading analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '8px' }}>
          Analytics Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Monitor AI performance, resolution metrics, customer escalations, and system feedbacks.
        </p>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-glow)',
          border: '1px solid hsla(350, 89%, 60%, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '32px'
        }}>
          <ShieldAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {overview && (
        <div className="grid-metrics">
          <div className="metric-card glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary)' }}>
              <span className="metric-label">Total Queries</span>
              <BarChart3 size={20} />
            </div>
            <span className="metric-value">{overview.queryVolume}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Accumulated customer conversations</span>
          </div>

          <div className="metric-card glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--success)' }}>
              <span className="metric-label">AI Resolution Rate</span>
              <TrendingUp size={20} />
            </div>
            <span className="metric-value">{overview.resolutionRate}%</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Queries resolved without escalation</span>
          </div>

          <div className="metric-card glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--warning)' }}>
              <span className="metric-label">Escalation Tickets</span>
              <AlertTriangle size={20} />
            </div>
            <span className="metric-value">{overview.escalationCount}</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned for human review</span>
          </div>

          <div className="metric-card glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--primary)' }}>
              <span className="metric-label">Feedback Ratings</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <ThumbsUp size={14} style={{ color: 'var(--success)' }} />
                <ThumbsDown size={14} style={{ color: 'var(--danger)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
              <span className="metric-value" style={{ fontSize: '24px', color: 'var(--success)' }}>
                {overview.positiveFeedback}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="metric-value" style={{ fontSize: '24px', color: 'var(--danger)' }}>
                {overview.negativeFeedback}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Positive vs Negative logs</span>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '32px' }}>
        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <HelpCircle size={20} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Top Unanswered Queries</h3>
          </div>

          <div className="table-container">
            {topUnanswered.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No unanswered queries logged.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Unanswered Question</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {topUnanswered.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 500 }}>{item.question}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-closed" style={{ fontWeight: 700 }}>
                          {item.count} times
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <AlertTriangle size={20} style={{ color: 'var(--warning)' }} />
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Escalation Drivers</h3>
          </div>

          <div className="table-container">
            {escalationTopics.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No escalation metrics logged.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Escalation Topic / Reason</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {escalationTopics.map((item, index) => (
                    <tr key={index}>
                      <td style={{ fontWeight: 500 }}>{item.topic}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className="badge badge-processing" style={{ fontWeight: 700, color: 'var(--warning)' }}>
                          {item.count} tickets
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
