import { useState, useEffect } from 'react';
import api from '../api';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  User, 
  Clock, 
  Eye, 
  RefreshCw, 
  AlertCircle,
  X
} from 'lucide-react';

const AdminFeedback = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterNegativeOnly, setFilterNegativeOnly] = useState(false);
  const [error, setError] = useState('');

  const [activeConversationId, setActiveConversationId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessages, setModalMessages] = useState([]);
  const [loadingModalMessages, setLoadingModalMessages] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [filterNegativeOnly]);

  const fetchFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = filterNegativeOnly ? '/feedback/negative' : '/feedback';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setFeedbackList(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch customer feedback records.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    setModalOpen(true);
    setLoadingModalMessages(true);
    setModalMessages([]);

    try {
      const response = await api.get(`/conversations/${conversationId}/messages`);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '8px' }}>
            Customer Feedback Review
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Review ratings submitted by users to fine-tune knowledge base content and AI responses.
          </p>
        </div>

        <div className="glass-panel" style={{ display: 'flex', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <button 
            className={`btn ${!filterNegativeOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterNegativeOnly(false)}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px' }}
          >
            All Feedback
          </button>
          <button 
            className={`btn ${filterNegativeOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterNegativeOnly(true)}
            style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px' }}
          >
            Negative Only
          </button>
        </div>
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button className="btn btn-secondary btn-icon" onClick={() => fetchFeedback()} title="Refresh list">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="table-container">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" />
            </div>
          ) : feedbackList.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No feedback logs found.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Rating</th>
                  <th>AI Response</th>
                  <th>Comments</th>
                  <th style={{ width: '150px' }}>Date</th>
                  <th style={{ width: '100px', textAlign: 'center' }}>Context</th>
                </tr>
              </thead>
              <tbody>
                {feedbackList.map((item) => (
                  <tr key={item._id}>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 600 }}>{item.userId?.name || 'Standard User'}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.userId?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`badge ${item.feedbackType === 'POSITIVE' ? 'badge-completed' : 'badge-failed'}`}>
                        {item.feedbackType === 'POSITIVE' ? <ThumbsUp size={12} /> : <ThumbsDown size={12} />}
                        <span style={{ marginLeft: '4px' }}>{item.feedbackType}</span>
                      </span>
                    </td>
                    <td>
                      <div style={{
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        maxWidth: '250px'
                      }} title={item.messageId?.content}>
                        {item.messageId?.content || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <div style={{
                        wordBreak: 'break-word',
                        maxWidth: '250px',
                        fontStyle: 'italic',
                        color: item.feedbackType === 'NEGATIVE' ? 'hsl(350, 89%, 75%)' : 'var(--text-secondary)'
                      }}>
                        {item.comment || <span style={{ color: 'var(--text-muted)' }}>None</span>}
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {formatDate(item.createdAt)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-secondary btn-icon"
                        onClick={() => handleViewConversation(item.conversationId)}
                        title="View Conversation"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && activeConversationId && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel" style={{ maxWidth: '700px', height: '80vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexShrink: 0 }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Conversation History</h3>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>ID: {activeConversationId}</span>
              </div>
              <button className="btn btn-icon" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'rgba(4, 7, 20, 0.4)', marginBottom: '20px' }}>
              {loadingModalMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="spinner" />
                </div>
              ) : modalMessages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', gap: '10px' }}>
                  <MessageSquare size={32} />
                  <span>No message transcripts found.</span>
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
