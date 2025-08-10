import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, BarChart3, Users, Shield, CheckCircle, AlertCircle, TrendingUp, X } from 'lucide-react';
import './LandingPage.css';
import Navbar from '../components/Navbar';
import AuthModal from '../components/AuthModal';
import UploadProgress from '../components/UploadProgress';
import { useAuth } from '../contexts/AuthContext';
import { resumeService } from '../services/resumeService';
import { useNavigate } from 'react-router-dom';

interface FilePreviewProps {
  file: File;
  onRemove: () => void;
}

const FilePreview: React.FC<FilePreviewProps> = ({ file, onRemove }) => {
  return (
    <div className="file-preview">
      <div className="file-preview-icon">
        <FileText className="w-5 h-5" />
      </div>
      <div className="file-preview-info">
        <div className="file-preview-name">{file.name}</div>
        <div className="file-preview-size">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="file-remove-btn"
        aria-label="Remove file"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="feature-card">
      <div className="feature-card-icon">
        {icon}
      </div>
      <h3 className="feature-card-title">{title}</h3>
      <p className="feature-card-description">{description}</p>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  change: string;
  positive: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, change, positive }) => {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="stat-card-icon">
          {icon}
        </div>
        <div className={`stat-card-change ${positive ? 'positive' : 'negative'}`}>
          <TrendingUp className="w-4 h-4" />
          {change}
        </div>
      </div>
      <div className="stat-card-value">{value}</div>
      <div className="stat-card-label">{label}</div>
    </div>
  );
};

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup'>('login');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  // Upload states
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentResumeId, setCurrentResumeId] = useState<string | null>(null);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in-view');
        }
      });
    }, observerOptions);

    // Observe all sections that should animate on scroll
    const sections = document.querySelectorAll('.hero-section, .upload-section, .stats-section, .features-section, .cta-section, .footer');
    sections.forEach((section) => observer.observe(section));

    // Observe individual elements within sections
    const animateElements = document.querySelectorAll('.hero-content, .upload-container, .stat-card, .feature-card, .cta-container, .footer-container');
    animateElements.forEach((element) => observer.observe(element));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      animateElements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setAnalysisResult(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileSelect(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    // Validate that all required fields are filled
    if (!companyName.trim() || !jobTitle.trim() || !jobDescription.trim()) {
      alert('Please fill in all fields: Company Name, Job Title, and Job Description');
      return;
    }

    try {
      // Reset states
      setUploadError(null);
      setUploadStatus('uploading');
      setUploadProgress(0);
      setAnalysisResult(null);

      // Upload the resume
      const uploadResponse = await resumeService.uploadResume(
        selectedFile,
        companyName.trim(),
        jobTitle.trim(),
        jobDescription.trim(),
        (progress) => {
          setUploadProgress(progress);
        }
      );

      if (uploadResponse.success && uploadResponse.resumeId) {
        setCurrentResumeId(uploadResponse.resumeId);
        setUploadStatus('processing');
        setUploadProgress(100);

        // Start polling for analysis results
        try {
          const analysisResponse = await resumeService.pollAnalysisStatus(
            uploadResponse.resumeId,
            (status) => {
              if (status === 'PROCESSING') {
                setUploadStatus('processing');
              }
            }
          );

          if (analysisResponse.success && analysisResponse.resume) {
            
            navigate(`/analysis/${uploadResponse.resumeId}`);
          } else {
            throw new Error('Analysis failed - no results received');
          }
        } catch (analysisError) {
          console.error('Analysis polling error:', analysisError);
          setUploadStatus('error');
          setUploadError(analysisError instanceof Error ? analysisError.message : 'Analysis failed');
        }
      } else {
        throw new Error(uploadResponse.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setCompanyName('');
    setJobTitle('');
    setJobDescription('');
    
    // Reset upload states
    setUploadProgress(0);
    setUploadStatus('idle');
    setUploadError(null);
    setCurrentResumeId(null);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRetryUpload = () => {
    setUploadStatus('idle');
    setUploadError(null);
    setUploadProgress(0);
    handleAnalyze();
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSignInClick = () => {
    setAuthModalTab('login');
    setAuthModalOpen(true);
  };

  const handleSignUpClick = () => {
    setAuthModalTab('signup');
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const scrollToUploadSection = () => {
    const uploadSection = document.querySelector('.upload-section');
    if (uploadSection) {
      uploadSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleUploadResumeClick = () => {
    scrollToUploadSection();
    // Small delay to ensure smooth scrolling starts before opening file dialog
    setTimeout(() => {
      openFileDialog();
    }, 300);
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <Navbar 
        onUploadClick={openFileDialog} 
        onSignInClick={handleSignInClick}
      />

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Optimize Your Resume with
              <span className="hero-title-highlight"> AI-Powered</span> Analysis
            </h1>
            <p className="hero-description">
              Get instant feedback on your resume, improve your chances of landing interviews, and stand out from the competition with our advanced AI analysis.
            </p>
            <div className="hero-buttons">
              <button 
                onClick={handleUploadResumeClick}
                className="btn-hero-primary"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
              {!isAuthenticated && (
                <button 
                  className="btn-hero-secondary"
                  onClick={handleSignUpClick}
                >
                  Sign Up Free
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Upload Section */}
      <section className="upload-section">
        <div className="container">
          <div className="upload-container">
            <div className="upload-header">
              <h2 className="upload-title">Analyze Your Resume</h2>
              <p className="upload-description">Upload your resume and get instant AI-powered feedback</p>
            </div>

            <div className="upload-card">
              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
              />

              {!selectedFile ? (
                <>
                  {isAuthenticated ? (
                    <div
                      className={`upload-area ${isDragging ? 'dragging' : ''}`}
                      onClick={openFileDialog}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <Upload className="upload-icon" />
                      <h3 className="upload-area-title">Upload your resume</h3>
                      <p className="upload-area-description">Drag and drop your file here, or click to browse</p>
                      <p className="upload-area-formats">Supports PDF, DOC, DOCX (Max 10MB)</p>
                    </div>
                  ) : (
                    <div className="upload-area login-required">
                      <div className="shield-lock-icon">
                        <Shield className="upload-icon shield-outer" />
                        <div className="lock-inner">
                          <div className="lock-body"></div>
                          <div className="lock-shackle"></div>
                        </div>
                      </div>
                      <h3 className="upload-area-title">Authentication Required</h3>
                      <p className="upload-area-description">Please sign in to upload and analyze your resume</p>
                      <button 
                        onClick={handleSignInClick}
                        className="auth-required-btn"
                      >
                        Sign In to Continue
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
                  
                  {!analysisResult && (uploadStatus === 'idle' || uploadStatus === 'error') && (
                    <div className="job-details-form">
                      <h3 className="job-details-title">Job Details</h3>
                      <p className="job-details-description">
                        Provide job details to get tailored resume analysis
                      </p>
                      
                      <div className="form-grid">
                        <div className="form-group">
                          <label htmlFor="companyName" className="form-label">
                            Company Name *
                          </label>
                          <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g., Google, Microsoft, Apple"
                            className="form-input"
                            style={{ textAlign: 'left', textIndent: '0', paddingLeft: '12px' }}
                            dir="ltr"
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="jobTitle" className="form-label">
                            Job Title *
                          </label>
                          <input
                            id="jobTitle"
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g., Frontend Developer, Data Scientist"
                            className="form-input"
                            style={{ textAlign: 'left', textIndent: '0', paddingLeft: '12px' }}
                            dir="ltr"
                          />
                        </div>
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="jobDescription" className="form-label">
                          Job Description *
                        </label>
                        <textarea
                          id="jobDescription"
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                          placeholder="Paste the job description here..."
                          className="form-textarea"
                          rows={6}
                          style={{ textAlign: 'left', textIndent: '0', paddingLeft: '12px' }}
                          dir="ltr"
                        />
                      </div>
                      
                      <button
                        onClick={handleAnalyze}
                        className="analyze-btn"
                        disabled={
                          !companyName.trim() || 
                          !jobTitle.trim() || 
                          !jobDescription.trim()
                        }
                      >
                        <BarChart3 className="w-5 h-5" />
                        Analyze Resume
                      </button>
                    </div>
                  )}

                  {(uploadStatus === 'uploading' || uploadStatus === 'processing' || uploadStatus === 'error') && (
                    <UploadProgress
                      progress={uploadProgress}
                      status={uploadStatus === 'error' ? 'error' : uploadStatus}
                      message={uploadError || undefined}
                      fileName={selectedFile?.name}
                      onRetry={uploadStatus === 'error' ? handleRetryUpload : undefined}
                    />
                  )}

                  {analysisResult && (
                    <div className="analysis-results">
                      <div className="score-display">
                        <div className="score-number">{analysisResult.score}/100</div>
                        <p className="score-label">Overall Resume Score</p>
                      </div>

                      <div className="analysis-grid">
                        <div className="analysis-section">
                          <h4 className="analysis-section-title">
                            <CheckCircle className="w-5 h-5" style={{color: '#10b981'}} />
                            Strengths
                          </h4>
                          <div className="analysis-list">
                            {analysisResult.strengths.map((strength: string, index: number) => (
                              <div key={index} className="analysis-item">
                                <div className="analysis-bullet green"></div>
                                {strength}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="analysis-section">
                          <h4 className="analysis-section-title">
                            <AlertCircle className="w-5 h-5" style={{color: '#f59e0b'}} />
                            Improvements
                          </h4>
                          <div className="analysis-list">
                            {analysisResult.improvements.map((improvement: string, index: number) => (
                              <div key={index} className="analysis-item">
                                <div className="analysis-bullet yellow"></div>
                                {improvement}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {analysisResult.jobAnalysis && (
                        <div className="job-analysis-section">
                          <h4 className="analysis-section-title">
                            <BarChart3 className="w-5 h-5" style={{color: '#3b82f6'}} />
                            Job Match Analysis
                          </h4>
                          <div className="job-analysis-content">
                            <div className="job-analysis-header">
                              <div className="job-analysis-info">
                                <p className="job-company">{analysisResult.jobAnalysis.companyName}</p>
                                <p className="job-title">{analysisResult.jobAnalysis.jobTitle}</p>
                              </div>
                              <div className="job-match-score">
                                <span className="match-score-number">{analysisResult.jobAnalysis.matchScore}%</span>
                                <span className="match-score-label">Match</span>
                              </div>
                            </div>
                            <div className="job-description-preview">
                              <p className="job-description-text">{analysisResult.jobAnalysis.jobDescription}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="section-scores">
                        <h4 className="section-scores-title">Section Scores</h4>
                        <div className="score-bars">
                          {Object.entries(analysisResult.sections).map(([section, score]) => (
                            <div key={section} className="score-bar-item">
                              <span className="score-bar-label">{section}</span>
                              <div className="score-bar-container">
                                <div className="score-bar">
                                  <div 
                                    className="score-bar-fill"
                                    style={{ width: `${score}%` }}
                                  ></div>
                                </div>
                                <span className="score-bar-value">{String(score)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="features-header">
            <h2 className="features-title">
              Powerful Features for Resume Optimization
            </h2>
            <p className="features-description">
              Our AI-powered platform provides comprehensive analysis to help you create the perfect resume
            </p>
          </div>

          <div className="features-grid">
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="AI-Powered Analysis"
              description="Advanced machine learning algorithms analyze your resume against industry standards and best practices."
            />
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Content Optimization"
              description="Get suggestions for improving your content, formatting, and keyword optimization for ATS systems."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Privacy Secure"
              description="Your resume data is encrypted and secure. We never share your information with third parties."
            />
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Instant Feedback"
              description="Receive detailed feedback and actionable recommendations in under 30 seconds."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Score Tracking"
              description="Track your resume improvements over time with detailed scoring and analytics."
            />
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Industry Specific"
              description="Tailored analysis based on your target industry and job role requirements."
            />
          </div>
        </div>
      </section>

      

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-container">
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="footer-logo">
                  <div className="footer-logo-icon">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="footer-logo-text">ResumeAI</span>
                </div>
                <p className="footer-description">
                  AI-powered resume analysis to help you land your dream job.
                </p>
              </div>
              
              <div className="footer-section">
                <h3 className="footer-section-title">Product</h3>
                <div className="footer-links">
                  <a href="#" className="footer-link">Features</a>
                  <a href="#" className="footer-link">Pricing</a>
                  <a href="#" className="footer-link">API</a>
                </div>
              </div>
              
              <div className="footer-section">
                <h3 className="footer-section-title">Company</h3>
                <div className="footer-links">
                  <a href="#" className="footer-link">About</a>
                  <a href="#" className="footer-link">Blog</a>
                  <a href="#" className="footer-link">Careers</a>
                </div>
              </div>
              
              <div className="footer-section">
                <h3 className="footer-section-title">Support</h3>
                <div className="footer-links">
                  <a href="#" className="footer-link">Help Center</a>
                  <a href="#" className="footer-link">Contact</a>
                  <a href="#" className="footer-link">Privacy</a>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p className="footer-copyright">
                © 2024 ResumeAI. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
