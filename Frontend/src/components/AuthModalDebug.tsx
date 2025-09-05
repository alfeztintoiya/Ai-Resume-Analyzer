import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButtonDebug from './GoogleSignInButtonDebug';
import './AuthModal.css';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AuthModalDebug({ isOpen, onClose }: Props) {
  const { setUser } = useAuth();
  const [error, setError] = useState<string>('');

  const handleGoogleSuccess = (userData: any) => {
    console.log('[DEBUG] handleGoogleSuccess called with:', userData);
    
    // Set user immediately (optimistic update)
    setUser(userData);
    console.log('[DEBUG] User set in context, closing modal');
    onClose();
    
    // No background refresh - just trust the data we got
    console.log('[DEBUG] Auth flow complete');
  };

  const handleGoogleError = (message: string) => {
    console.error('[DEBUG] Google auth error:', message);
    setError(message);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Welcome to Resume Analyzer</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="modal-body">
          <p>Sign in to analyze and save your resume reviews</p>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="google-signin-container">
            <GoogleSignInButtonDebug 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
