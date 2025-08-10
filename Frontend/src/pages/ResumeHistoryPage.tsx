import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Eye,
  ArrowLeft,
  Search,
  Filter
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { resumeService } from '../services/resumeService';
import './ResumeHistoryPage.css';

interface ResumeHistoryItem {
  id: string;
  fileName: string;
  companyName: string;
  jobTitle: string;
  analysisStatus: string;
  overallScore: number;
  jobMatchScore: number;
  resumeImageUrl?: string;
  createdAt: string;
  processedAt?: string;
}

const ResumeHistoryPage: React.FC = () => {
  const [resumes, setResumes] = useState<ResumeHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      setLoading(true);
      const response = await resumeService.getUserResumes();
      
      if (response.success) {
        setResumes(response.resumes);
      } else {
        setError('Failed to load resume history');
      }
    } catch (err) {
      setError('Error loading resume history');
      console.error('Resume history fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResumeClick = (resumeId: string) => {
    navigate(`/analysis/${resumeId}`);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { color: '#10b981', bg: '#f0fdf4', text: 'Completed' };
      case 'PROCESSING':
        return { color: '#f59e0b', bg: '#fffbeb', text: 'Processing' };
      case 'PENDING':
        return { color: '#6b7280', bg: '#f9fafb', text: 'Pending' };
      case 'FAILED':
        return { color: '#ef4444', bg: '#fef2f2', text: 'Failed' };
      default:
        return { color: '#6b7280', bg: '#f9fafb', text: status };
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredResumes = resumes.filter(resume => {
    const matchesSearch = resume.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resume.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || resume.analysisStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="history-page">
        <Navbar />
        <div className="history-loading">
          <div className="loading-spinner"></div>
          <p>Loading your resume history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page">
      <Navbar />
      
      <div className="history-container">
        {/* Header */}
        <div className="history-header">
          <div className="history-title">
            <h1>My Resume Analysis</h1>
            <p>{resumes.length} {resumes.length === 1 ? 'analysis' : 'analyses'} found</p>
          </div>
        </div>

        {/* Filters */}
        <div className="history-filters">
          <div className="search-bar">
            <Search className="w-5 h-5" />
            <input
              type="text"
              placeholder="Search by file name, company, or job title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-dropdown">
            <Filter className="w-4 h-4" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PROCESSING">Processing</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>

        {/* Resume Cards */}
        <div className="resume-cards-grid">
          {filteredResumes.length === 0 ? (
            <div className="no-resumes">
              {error ? (
                <div className="error-state">
                  <p>{error}</p>
                  <button onClick={fetchResumes} className="retry-btn">
                    Try Again
                  </button>
                </div>
              ) : (
                <div className="empty-state">
                  <FileText className="w-16 h-16" />
                  <h3>No resumes found</h3>
                  <p>Start by uploading your first resume for analysis</p>
                  <button onClick={handleBackClick} className="upload-btn">
                    Upload Resume
                  </button>
                </div>
              )}
            </div>
          ) : (
            filteredResumes.map((resume) => {
              const statusInfo = getStatusBadge(resume.analysisStatus);
              
              return (
                <div 
                  key={resume.id} 
                  className="resume-card"
                  onClick={() => handleResumeClick(resume.id)}
                >
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="file-info">
                      <FileText className="w-5 h-5" />
                      <div>
                        <h3 className="file-name">{resume.fileName}</h3>
                        <p className="job-info">{resume.jobTitle} at {resume.companyName}</p>
                      </div>
                    </div>
                    
                    <div 
                      className="status-badge"
                      style={{ 
                        backgroundColor: statusInfo.bg, 
                        color: statusInfo.color 
                      }}
                    >
                      {statusInfo.text}
                    </div>
                  </div>

                  {/* Scores */}
                  {resume.analysisStatus === 'COMPLETED' && (
                    <div className="score-section">
                      <div className="score-item">
                        <span className="score-label">Overall Score</span>
                        <span 
                          className="score-value"
                          style={{ color: getScoreColor(resume.overallScore) }}
                        >
                          {resume.overallScore}%
                        </span>
                      </div>
                      <div className="score-item">
                        <span className="score-label">ATS Match</span>
                        <span 
                          className="score-value"
                          style={{ color: getScoreColor(resume.jobMatchScore) }}
                        >
                          {resume.jobMatchScore}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="date-section">
                    <div className="date-item">
                      <Calendar className="w-4 h-4" />
                      <span>Created: {formatDate(resume.createdAt)}</span>
                    </div>
                    {resume.processedAt && (
                      <div className="date-item">
                        <Clock className="w-4 h-4" />
                        <span>Processed: {formatDate(resume.processedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="card-action">
                    <button className="view-btn">
                      <Eye className="w-4 h-4" />
                      View Analysis
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeHistoryPage;