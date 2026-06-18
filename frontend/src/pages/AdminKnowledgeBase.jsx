import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { 
  UploadCloud, 
  Link2, 
  Trash2, 
  FileText, 
  Globe, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Trash
} from 'lucide-react';

const AdminKnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlIngesting, setUrlIngesting] = useState(false);
  const [fileUploading, setFileUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some(doc => doc.status === 'PROCESSING');
    let pollInterval = null;

    if (hasProcessing) {
      pollInterval = setInterval(() => {
        fetchDocuments(true);
      }, 5000);
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [documents]);

  const fetchDocuments = async (isPoll = false) => {
    if (!isPoll) setLoadingList(true);
    try {
      const response = await api.get('/documents');
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch ingested documents list.');
    } finally {
      if (!isPoll) setLoadingList(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    
    const validTypes = ['.pdf', '.md', '.markdown'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(fileExtension)) {
      alert('Only PDF and Markdown files are supported.');
      return;
    }

    setFileUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'File upload and ingestion failed.');
    } finally {
      setFileUploading(false);
    }
  };

  const handleUrlIngestion = async (e) => {
    e.preventDefault();
    if (!urlInput.trim() || urlIngesting) return;

    setUrlIngesting(true);
    setError('');
    try {
      const response = await api.post('/documents/url', { url: urlInput });
      if (response.data.success) {
        setUrlInput('');
        fetchDocuments();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'URL Ingestion failed.');
    } finally {
      setUrlIngesting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document? All associated vector embeddings will be removed.')) return;

    setError('');
    try {
      const response = await api.delete(`/documents/${docId}`);
      if (response.data.success) {
        setDocuments(documents.filter(doc => doc._id !== docId));
      }
    } catch (err) {
      console.error(err);
      setError('Failed to delete document from database.');
    }
  };

  const getSourceIcon = (type) => {
    return type === 'URL' ? <Globe size={16} /> : <FileText size={16} />;
  };

  const getStatusBadge = (status) => {
    if (status === 'PROCESSING') return <span className="badge badge-processing">Processing</span>;
    if (status === 'COMPLETED') return <span className="badge badge-completed">Completed</span>;
    return <span className="badge badge-failed">Failed</span>;
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', marginBottom: '8px' }}>
          Knowledge Base Management
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Ingest new knowledge sources into the vector store or manage existing index files.
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        <div 
          className="glass-panel"
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          style={{
            padding: '32px',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            border: dragOver ? '2px dashed var(--border-focus)' : '1px dashed var(--border-color)',
            backgroundColor: dragOver ? 'var(--bg-card-hover)' : 'var(--glass-bg)',
            cursor: 'pointer',
            transition: 'all var(--transition-normal)'
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".pdf,.md,.markdown"
            onChange={(e) => {
              if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          {fileUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <RefreshCw size={40} className="spinner" style={{ color: 'var(--primary)' }} />
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Uploading and Parsing File</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Extracting content and generating vector embeddings...</p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ background: 'var(--primary-glow)', padding: '16px', borderRadius: '50%', color: 'var(--primary)' }}>
                <UploadCloud size={32} />
              </div>
              <div>
                <h3 style={{ fontWeight: 600, fontSize: '16px', marginBottom: '4px' }}>Drag & Drop Knowledge File</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Supports PDF, MD, or MARKDOWN format files</p>
              </div>
              <button className="btn btn-secondary" style={{ pointerEvents: 'none' }}>Select File</button>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ background: 'var(--primary-glow)', padding: '10px', borderRadius: '50%', color: 'var(--primary)' }}>
              <Link2 size={20} />
            </div>
            <div>
              <h3 style={{ fontWeight: 600, fontSize: '16px' }}>Ingest Site URL</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Scrape and index public web pages</p>
            </div>
          </div>

          <form onSubmit={handleUrlIngestion} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="url"
              required
              className="input-field"
              placeholder="https://example.com/support-docs"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={urlIngesting || !urlInput.trim()}
              style={{ width: '100%' }}
            >
              {urlIngesting ? <div className="spinner" /> : 'Index URL'}
            </button>
          </form>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '28px', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Ingested Knowledge Documents</h2>
          <button className="btn btn-secondary btn-icon" onClick={() => fetchDocuments()} title="Refresh list">
            <RefreshCw size={14} />
          </button>
        </div>

        <div className="table-container">
          {loadingList ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="spinner" />
            </div>
          ) : documents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No knowledge source documents ingested yet.
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Document Source</th>
                  <th style={{ width: '120px' }}>Type</th>
                  <th style={{ width: '140px' }}>Status</th>
                  <th style={{ width: '120px', textAlign: 'center' }}>Chunks</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 500 }}>
                        <span style={{ color: 'var(--text-secondary)' }}>{getSourceIcon(doc.sourceType)}</span>
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '350px' }} title={doc.title}>
                          {doc.title}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-role-user" style={{ fontSize: '10px' }}>
                        {doc.sourceType}
                      </span>
                    </td>
                    <td>{getStatusBadge(doc.status)}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600 }}>{doc.chunksCount}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-danger btn-icon" 
                        onClick={() => handleDeleteDocument(doc._id)}
                        style={{ padding: '6px' }}
                        title="Delete Document"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKnowledgeBase;
