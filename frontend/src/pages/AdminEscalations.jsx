import { useState, useEffect } from 'react';
import api from '../api';
import { 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Check, 
  Clock, 
  X,
  MessageSquare,
  User,
  Mail,
  Calendar
} from 'lucide-react';

const AdminEscalations = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [activeTicket, setActiveTicket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessages, setModalMessages] = useState([]);
  const [loadingModalMessages, setLoadingModalMessages] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/escalations');
      if (response.data.success) {
        setTickets(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch escalation tickets.');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    if (!confirm('Are you sure you want to mark this ticket as RESOLVED?')) return;

    try {
      const response = await api.patch(`/escalations/${ticketId}/resolve`);
      if (response.data.success) {
        setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: 'RESOLVED' } : t));
        if (activeTicket?._id === ticketId) {
          setActiveTicket(prev => ({ ...prev, status: 'RESOLVED' }));
        }
      }
    } catch (err) {
      console.error(err);
      alert('Failed to resolve escalation ticket.');
    }
  };

  const handleViewConversation = async (ticket) => {
    setActiveTicket(ticket);
    setModalOpen(true);
    setLoadingModalMessages(true);
    setModalMessages([]);

    try {
      const response = await api.get(`/conversations/${ticket.conversationId}/messages`);
      if (response.data.success) {
        setModalMessages(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setModalMessages([]);
    } finally {
      setLoadingModalMessages(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '8px' }}>
          Escalated Human Queue
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and resolve support requests that failed AI validation or required human representatives.
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
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" />
            </div>
          ) : tickets.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No escalated support tickets found in the queue.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Customer Info</th>
                  <th>Initial Query</th>
                  <th style={{ width: '150px' }}>Status</th>
                  <th style={{ width: '180px' }}>Created Date</th>
                  <th style={{ width: '150px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket._id}>
                    <td>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--primary)' }}>
                        {ticket.ticketId}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600 }}>{ticket.userId?.name || 'Standard User'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{ticket.userId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: '280px'
                      }} title={ticket.userQuestion}>
                        {ticket.userQuestion}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--warning)', marginTop: '4px' }}>
                        Reason: {ticket.reason}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${ticket.status === 'OPEN' ? 'badge-processing' : 'badge-completed'}`}>
                        {ticket.status === 'OPEN' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                        <span style={{ marginLeft: '4px' }}>{ticket.status}</span>
                      </span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {formatDate(ticket.createdAt)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          className="btn btn-secondary btn-icon"
                          onClick={() => handleViewConversation(ticket)}
                          title="View Conversation"
                        >
                          <Eye size={14} />
                        </button>
                        {ticket.status === 'OPEN' && (
                          <button 
                            className="btn btn-primary btn-icon"
                            onClick={() => handleResolveTicket(ticket._id)}
                            style={{ backgroundColor: 'var(--success)' }}
                            title="Resolve Ticket"
                          >
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && activeTicket && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '750px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Ticket Conversation: {activeTicket.ticketId}</h3>
                <span className={`badge ${activeTicket.status === 'OPEN' ? 'badge-processing' : 'badge-completed'}`} style={{ marginTop: '4px' }}>
                  {activeTicket.status}
                </span>
              </div>
              <button className="btn btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', flexShrink: 0, fontSize: '13px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> <span>Customer: {activeTicket.userId?.name}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> <span>Email: {activeTicket.userId?.email}</span></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> <span>Created: {formatDate(activeTicket.createdAt)}</span></div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--warning)' }}><AlertCircle size={14} style={{ marginTop: '2px' }} /> <span>Reason: {activeTicket.reason}</span></div>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'rgba(4, 7, 20, 0.4)', marginBottom: '20px' }}>
              {loadingModalMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="spinner" />
                </div>
              ) : modalMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '10px' }}>
                  <MessageSquare size={32} />
                  <span>No message transcripts recorded.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {modalMessages.map((msg) => (
                    <div 
                      key={msg._id}
                      style={{
                        alignSelf: msg.senderType === 'USER' ? 'flex-end' : 'flex-start',
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.senderType === 'USER' ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div className="glass-panel" style={{
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: msg.senderType === 'USER' ? 'var(--primary)' : 'var(--bg-card)',
                        border: msg.senderType === 'USER' ? '1px solid var(--primary-hover)' : '1px solid var(--border-color)',
                        color: msg.senderType === 'USER' ? 'white' : 'var(--text-primary)',
                        fontSize: '13px',
                        lineHeight: '1.4'
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', padding: '0 4px' }}>
                        {msg.senderType} • {formatDate(msg.createdAt)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexShrink: 0 }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
              {activeTicket.status === 'OPEN' && (
                <button 
                  className="btn btn-primary"
                  onClick={() => handleResolveTicket(activeTicket._id)}
                  style={{ backgroundColor: 'var(--success)' }}
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEscalations;
