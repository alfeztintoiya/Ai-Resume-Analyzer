import React, { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface EmailVerificationNoticeProps {
  email: string;
  onClose?: () => void;
}

const EmailVerificationNotice: React.FC<EmailVerificationNoticeProps> = ({ email, onClose }) => {
  const [isResending, setIsResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleResendVerification = async () => {
    setIsResending(true);
    setResendStatus('idle');
    
    try {
      const response = await authService.resendVerificationEmail(email);
      
      if (response.success) {
        setResendStatus('success');
        setMessage('Verification email sent successfully! Please check your inbox.');
      } else {
        setResendStatus('error');
        setMessage(response.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setResendStatus('error');
      setMessage('An error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
      <div className="flex justify-center mb-4">
        <Mail className="w-12 h-12 text-blue-600" />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Check Your Email
      </h3>
      
      <p className="text-gray-600 mb-4">
        We've sent a verification link to <strong>{email}</strong>. 
        Please check your inbox and click the link to verify your account.
      </p>

      {resendStatus === 'success' && (
        <div className="flex items-center justify-center mb-4 text-green-600">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      {resendStatus === 'error' && (
        <div className="flex items-center justify-center mb-4 text-red-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span className="text-sm">{message}</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={handleResendVerification}
          disabled={isResending || resendStatus === 'success'}
          className={`w-full py-2 px-4 rounded-lg transition-colors ${
            isResending || resendStatus === 'success'
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isResending ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </div>
          ) : resendStatus === 'success' ? (
            'Email Sent!'
          ) : (
            'Resend Verification Email'
          )}
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Didn't receive the email? Check your spam folder or try resending.
      </p>
    </div>
  );
};

export default EmailVerificationNotice;
