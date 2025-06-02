import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { BarChart } from 'lucide-react';

const LoginPage = () => {
  const { isAuthenticated, login, loading } = useAuth();
  const navigate = useNavigate();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/segments/builder');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    setAnimate(true);
  }, []);

  return loading ? (
    <div className="text-center p-4">🔐 Checking login...</div>
  ) : (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex items-center justify-center px-4">
      <div 
        className={`w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 ease-out ${
          animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-primary-100 rounded-full mb-4">
              <BarChart className="h-10 w-10 text-primary-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">MarketPro Platform</h1>
            <p className="mt-2 text-gray-600">Sign in to access your marketing tools</p>
          </div>

          <div className="space-y-4">
            <Button
              onClick={login}
              isLoading={loading}
              fullWidth
              className="py-2.5"
              leftIcon={
                !loading && (
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92..." />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77..." />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09..." />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15..." />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                )
              }
            >
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>

            <div className="text-center text-sm text-gray-500 mt-6">
              <p>Google Sign-in via Firebase is enabled.</p>
              <p className="mt-1">Click the button to continue.</p>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-center text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
