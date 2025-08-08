import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';
import './UploadProgress.css';

interface UploadProgressProps {
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  message?: string;
  fileName?: string;
  onRetry?: () => void;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  progress,
  status,
  message,
  fileName,
  onRetry
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="upload-status-icon uploading" />;
      case 'processing':
        return <Loader2 className="upload-status-icon spinning" />;
      case 'completed':
        return <CheckCircle className="upload-status-icon success" />;
      case 'error':
        return <AlertCircle className="upload-status-icon error" />;
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    if (message) return message;
    
    switch (status) {
      case 'uploading':
        return 'Uploading your resume...';
      case 'processing':
        return 'Processing your resume for analysis...';
      case 'completed':
        return 'Upload completed successfully!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
        return '#3b82f6';
      case 'processing':
        return '#8b5cf6';
      case 'completed':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className={`upload-progress ${status}`}>
      <div className="upload-progress-header">
        {getStatusIcon()}
        <div className="upload-progress-info">
          {fileName && (
            <div className="upload-file-name">{fileName}</div>
          )}
          <div className="upload-progress-message">{getStatusMessage()}</div>
        </div>
        <div className="upload-progress-percentage">
          {status !== 'error' && `${Math.round(progress)}%`}
        </div>
      </div>
      
      {(status === 'uploading' || status === 'processing') && (
        <div className="upload-progress-bar-container">
          <div 
            className="upload-progress-bar"
            style={{ 
              width: `${progress}%`,
              backgroundColor: getStatusColor()
            }}
          />
        </div>
      )}

      {status === 'error' && onRetry && (
        <button 
          onClick={onRetry}
          className="upload-retry-btn"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default UploadProgress;
