import { Toaster } from 'react-hot-toast';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SegmentBuilder from './pages/SegmentBuilder';
import AudiencePreview from './pages/AudiencePreview';
import CampaignSubmission from './pages/CampaignSubmission';
import CampaignHistory from './pages/CampaignHistory';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#333',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#14b8a6',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/segments/builder" /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/segments/builder" 
            element={isAuthenticated ? <SegmentBuilder /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/segments/audience" 
            element={isAuthenticated ? <AudiencePreview /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/campaigns/new" 
            element={isAuthenticated ? <CampaignSubmission /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/campaigns/history" 
            element={isAuthenticated ? <CampaignHistory /> : <Navigate to="/login" />} 
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;