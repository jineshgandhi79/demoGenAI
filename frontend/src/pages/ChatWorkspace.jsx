import { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { 
  Plus, 
  MessageSquare, 
  Send, 
  ThumbsUp, 
  ThumbsDown, 
  AlertTriangle, 
  Trash2, 
  Check, 
  X,
  HelpCircle
} from 'lucide-react';

const ChatWorkspace = () => {
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackMsgId, setFeedbackMsgId] = useState(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [ratedMessages, setRatedMessages] = useState({});

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    setLoadingChats(true);
    try {
      const response = await api.get('/conversations');
      if (response.data.success) {
        setConversations(response.data.data);
        if (response.data.data.length > 0 && !activeChatId) {
          setActiveChatId(response.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/conversations/${chatId}/messages`);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleCreateChat = async () => {
    try {
      const title = prompt('Enter a title for the new conversation:', 'New Chat');
      if (!title) return;

      const response = await api.post('/conversations', { title });
      if (response.data.success) {
        const newChat = response.data.data;
        setConversations([newChat, ...conversations]);
        setActiveChatId(newChat._id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    try {
      const response = await api.delete(`/conversations/${chatId}`);
      if (response.data.success) {
        setConversations(conversations.filter(c => c._id !== chatId));
        if (activeChatId === chatId) {
          setActiveChatId(null);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sendingMessage || !activeChatId) return;

    const textToSend = inputText;
    setInputText('');
    setSendingMessage(true);

    const tempUserMsg = {
      _id: 'temp-' + Date.now(),
      senderType: 'USER',
      content: textToSend,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await api.post(`/conversations/${activeChatId}/messages`, { content: textToSend });
      if (response.data.success) {
        fetchMessages(activeChatId);
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handlePositiveRating = async (messageId) => {
    try {
      const response = await api.post('/feedback', {
        messageId,
        feedbackType: 'POSITIVE',
        comment: ''
      });
      if (response.data.success) {
        setRatedMessages(prev => ({ ...prev, [messageId]: 'POSITIVE' }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleNegativeRatingStart = (messageId) => {
    setFeedbackMsgId(messageId);
    setFeedbackComment('');
    setFeedbackModalOpen(true);
  };

  const handleNegativeRatingSubmit = async () => {
    if (!feedbackComment.trim() || submittingFeedback) return;
    setSubmittingFeedback(true);

    try {
      const response = await api.post('/feedback', {
        messageId: feedbackMsgId,
        feedbackType: 'NEGATIVE',
        comment: feedbackComment
      });
      if (response.data.success) {
        setRatedMessages(prev => ({ ...prev, [feedbackMsgId]: 'NEGATIVE' }));
        setFeedbackModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const activeChat = conversations.find(c => c._id === activeChatId);
  const isClosed = activeChat?.status === 'CLOSED';
  const lastAiMessage = [...messages].reverse().find(m => m.senderType === 'AI');
  const isEscalated = lastAiMessage?.content?.includes('TKT-') || activeChat?.status === 'CLOSED';
  
  const getConfidenceColor = (score) => {
    if (!score) return 'var(--text-muted)';
    if (score >= 0.8) return 'var(--success)';
    if (score >= 0.5) return 'var(--warning)';
    return 'var(--danger)';
  };

  return (
    <div className="layout-main" style={{ display: 'flex', flexDirection: 'row', height: 'calc(100vh - 73px)' }}>
      <aside className="glass-panel" style={{
        width: 'var(--sidebar-w)',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--glass-border)',
        flexShrink: 0
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <button className="btn btn-primary" onClick={handleCreateChat} style={{ width: '100%' }}>
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {loadingChats ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <div className="spinner" />
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px', fontSize: '14px' }}>
              No conversations yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {conversations.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => setActiveChatId(chat._id)}
                  className="glass-panel"
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    backgroundColor: activeChatId === chat._id ? 'var(--bg-card-hover)' : 'transparent',
                    border: activeChatId === chat._id ? '1px solid var(--border-focus)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden', flex: 1 }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                      {chat.title}
                    </span>
                    <span className={`badge ${chat.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}`} style={{ fontSize: '9px', width: 'fit-content', padding: '2px 6px' }}>
                      {chat.status}
                    </span>
                  </div>
                  <button 
                    className="btn btn-icon" 
                    onClick={(e) => handleDeleteChat(chat._id, e)}
                    style={{ color: 'var(--text-muted)', padding: '4px' }}
                    title="Delete Chat"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(4, 7, 20, 0.2)' }}>
        {activeChatId ? (
          <>
            <div className="glass-panel" style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 600 }}>{activeChat?.title}</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Session ID: {activeChat?._id}
                </p>
              </div>
              <span className={`badge ${activeChat?.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}`}>
                {activeChat?.status}
              </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {loadingMessages ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="spinner" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'var(--text-muted)',
                  gap: '12px'
                }}>
                  <MessageSquare size={36} />
                  <p>Send a message to start conversing with Gemini AI</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg._id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: msg.senderType === 'USER' ? 'flex-end' : 'flex-start',
                      maxWidth: '75%',
                      alignSelf: msg.senderType === 'USER' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div className="glass-panel" style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: msg.senderType === 'USER' ? 'var(--primary)' : 'var(--bg-card)',
                      border: msg.senderType === 'USER' ? '1px solid var(--primary-hover)' : '1px solid var(--border-color)',
                      color: msg.senderType === 'USER' ? 'white' : 'var(--text-primary)',
                      lineHeight: '1.5',
                      fontSize: '14px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {msg.content}
                    </div>

                    {msg.senderType === 'AI' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '6px 8px 0',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                        gap: '16px'
                      }}>
                        {msg.confidenceScore !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <div style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: getConfidenceColor(msg.confidenceScore)
                            }} />
                            <span>Confidence: {Math.round(msg.confidenceScore * 100)}%</span>
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
                          {ratedMessages[msg._id] ? (
                            <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                              <Check size={12} /> Rated {ratedMessages[msg._id]}
                            </span>
                          ) : (
                            <>
                              <button 
                                className="btn btn-secondary btn-icon" 
                                onClick={() => handlePositiveRating(msg._id)}
                                style={{ padding: '4px', borderRadius: '4px' }}
                                title="Thumbs Up"
                              >
                                <ThumbsUp size={12} />
                              </button>
                              <button 
                                className="btn btn-secondary btn-icon" 
                                onClick={() => handleNegativeRatingStart(msg._id)}
                                style={{ padding: '4px', borderRadius: '4px' }}
                                title="Thumbs Down"
                              >
                                <ThumbsDown size={12} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {isEscalated && (
              <div style={{ padding: '0 24px' }}>
                <div style={{
                  background: 'var(--warning-glow)',
                  border: '1px solid hsla(38, 92%, 50%, 0.3)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px 20px',
                  color: 'var(--warning)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                      Auto-Escalation Warning
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      A human ticket is generated and a human will follow up on this. 
                      {lastAiMessage?.content?.match(/TKT-\d+/) ? ` Ticket ID: ${lastAiMessage.content.match(/TKT-\d+/)[0]}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div style={{ padding: '24px' }}>
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  required
                  disabled={isClosed || sendingMessage}
                  className="input-field"
                  placeholder={isClosed ? "This conversation is closed." : "Type your message..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={isClosed || sendingMessage || !inputText.trim()}
                  className="btn btn-primary"
                  style={{ flexShrink: 0, width: '48px', height: '48px', padding: 0 }}
                >
                  {sendingMessage ? <div className="spinner" /> : <Send size={18} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            gap: '16px'
          }}>
            <HelpCircle size={48} style={{ color: 'var(--text-muted)' }} />
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                No Active Chat
              </h3>
              <p style={{ fontSize: '14px' }}>
                Select an existing conversation from the sidebar or start a new one.
              </p>
            </div>
          </div>
        )}
      </main>

      {feedbackModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content glass-panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Provide Feedback</h3>
              <button className="btn btn-icon" onClick={() => setFeedbackModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px', background: 'var(--danger-glow)', border: '1px solid hsla(350, 89%, 60%, 0.2)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
                <AlertTriangle size={18} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '13px' }}>
                  Please let us know how we can improve this answer. Your feedback helps fine-tune the AI.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Comments / Reasons
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  required
                  placeholder="Explain why the AI response was incorrect or unhelpful..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{ resize: 'none', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={() => setFeedbackModalOpen(false)}>
                  Cancel
                </button>
                <button 
                  className="btn btn-danger" 
                  onClick={handleNegativeRatingSubmit}
                  disabled={submittingFeedback || !feedbackComment.trim()}
                >
                  {submittingFeedback ? <div className="spinner" /> : 'Submit Feedback'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWorkspace;
