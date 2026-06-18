import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import { PublicRoute, PrivateRoute, AdminRoute } from './components/RouteGuards';
import Login from './pages/Login';
import ChatWorkspace from './pages/ChatWorkspace';
import AdminDashboard from './pages/AdminDashboard';
import AdminKnowledgeBase from './pages/AdminKnowledgeBase';
import AdminEscalations from './pages/AdminEscalations';
import AdminFeedback from './pages/AdminFeedback';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="glow-bg" />
        <Navbar />
        <div className="layout-main">
          <Routes>
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            <Route 
              path="/chat" 
              element={
                <PrivateRoute>
                  <ChatWorkspace />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/knowledge-base" 
              element={
                <AdminRoute>
                  <AdminKnowledgeBase />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/escalations" 
              element={
                <AdminRoute>
                  <AdminEscalations />
                </AdminRoute>
              } 
            />
            <Route 
              path="/admin/feedback" 
              element={
                <AdminRoute>
                  <AdminFeedback />
                </AdminRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
