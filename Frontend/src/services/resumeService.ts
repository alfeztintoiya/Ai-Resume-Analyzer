// Services for resume upload and management
export interface UploadResponse {
  success: boolean;
  message: string;
  resumeId?: string;
  fileName?: string;
  analysisStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
}

export interface AnalysisResponse {
  success: boolean;
  resume?: {
    id: string;
    fileName: string;
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    analysisStatus: string;
    overallScore?: number;
    sections?: {
      contact?: number;
      summary?: number;
      experience?: number;
      education?: number;
      skills?: number;
    };
    jobAnalysis?: {
      matchScore?: number;
      strengths?: string[];
      improvements?: string[];
      keywords?: string[];
    };
    processedAt?: string;
    createdAt: string;
  };
}

export interface ResumeHistoryResponse {
  success: boolean;
  resumes: Array<{
    id: string;
    fileName: string;
    companyName: string;
    jobTitle: string;
    analysisStatus: string;
    overallScore?: number;
    jobMatchScore?: number;
    createdAt: string;
    processedAt?: string;
  }>;
  total: number;
}

class ResumeService {
  private baseURL = `${import.meta.env.VITE_API_BASE_URL}/resume`;

  // Upload resume with job details
  async uploadResume(
    file: File,
    companyName: string,
    jobTitle: string,
    jobDescription: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('companyName', companyName);
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable && onProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            onProgress(progress);
          }
        });

        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText);
            
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(data);
            } else {
              reject(new Error(data.message || `HTTP error! status: ${xhr.status}`));
            }
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Network error occurred during upload'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload was cancelled'));
        });

        xhr.withCredentials = true; // Include cookies for authentication
        xhr.open('POST', `${this.baseURL}/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Resume upload error:', error);
      throw error;
    }
  }

  // Get analysis results
  async getAnalysis(resumeId: string): Promise<AnalysisResponse> {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}/analysis`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get analysis error:', error);
      throw error;
    }
  }

  // Get user's resume history
  async getResumeHistory(): Promise<ResumeHistoryResponse> {
    try {
      const response = await fetch(`${this.baseURL}/history`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Get resume history error:', error);
      throw error;
    }
  }

  // Delete resume
  async deleteResume(resumeId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/${resumeId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Delete resume error:', error);
      throw error;
    }
  }

  // Poll for analysis completion
  async pollAnalysisStatus(
    resumeId: string,
    onStatusUpdate?: (status: string) => void,
    maxPolls: number = 30,
    interval: number = 2000
  ): Promise<AnalysisResponse> {
    let polls = 0;
    
    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          const result = await this.getAnalysis(resumeId);
          
          if (result.resume) {
            const status = result.resume.analysisStatus;
            
            if (onStatusUpdate) {
              onStatusUpdate(status);
            }

            if (status === 'COMPLETED' || status === 'FAILED') {
              resolve(result);
              return;
            }
          }

          polls++;
          if (polls >= maxPolls) {
            reject(new Error('Analysis timeout - please check back later'));
            return;
          }

          setTimeout(poll, interval);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }
}

export const resumeService = new ResumeService();
