// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5003/api/v1';

// File upload constraints
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const ALLOWED_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx'];

// Analysis polling configuration
export const ANALYSIS_POLL_INTERVAL = 2000; // 2 seconds
export const ANALYSIS_MAX_POLLS = 30; // 1 minute max
