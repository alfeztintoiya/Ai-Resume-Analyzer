// Add these to your types/resume.ts
export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  filePath: string;
  mimeType: string;
  companyName: string;      // Required field
  jobTitle: string;         // Required field  
  jobDescription: string;   // Required field
  overallScore?: number;
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  analysisData?: any;
  contactScore?: number;
  summaryScore?: number;
  experienceScore?: number;
  educationScore?: number;
  skillsScore?: number;
  jobMatchScore?: number;
  strengths: string[];
  improvements: string[];
  keywords: string[];
  processedAt?: Date;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeAnalysisRequest {
  file: File;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
}

export interface ResumeAnalysisResponse {
  resumeId: string;
  analysisResult: {
    score: number;
    strengths: string[];
    improvements: string[];
    keywords: string[];
    sections: {
      contact: number;
      summary: number;
      experience: number;
      education: number;
      skills: number;
    };
    jobAnalysis: {
      companyName: string;
      jobTitle: string;
      jobDescription: string;
      matchScore: number;
    };
  };
}