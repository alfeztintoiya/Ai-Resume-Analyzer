export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  status: ResumeStatus;
  createdAt: string;
  updatedAt: string;
}

export const ResumeStatus = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED'
} as const;

export type ResumeStatus = typeof ResumeStatus[keyof typeof ResumeStatus];

export interface ResumeAnalysis {
  id: string;
  resumeId: string;
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
  skillsFound: string[];
  missingSkills: string[];
  createdAt: string;
}

export interface ResumeUploadData {
  file: File;
  description?: string;
}

export interface ResumeListItem {
  id: string;
  fileName: string;
  originalName: string;
  status: ResumeStatus;
  score?: number;
  createdAt: string;
}
