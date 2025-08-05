import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, BarChart3, Users, Shield, CheckCircle, AlertCircle, Clock, TrendingUp, Star, ArrowRight, X } from 'lucide-react';
import './LandingPage.css';
import Navbar from '../components/Navbar';

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
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

  const handleAnalyze = () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      setAnalysisResult({
        score: 85,
        strengths: ['Strong technical skills', 'Relevant experience', 'Good education background'],
        improvements: ['Add more quantifiable achievements', 'Include relevant keywords', 'Improve formatting'],
        keywords: ['React', 'TypeScript', 'Node.js', 'AWS', 'Agile'],
        sections: {
          contact: 90,
          summary: 80,
          experience: 85,
          education: 88,
          skills: 82
        }
      });
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <Navbar onUploadClick={openFileDialog} />

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
                onClick={openFileDialog}
                className="btn-hero-primary"
              >
                <Upload className="w-5 h-5" />
                Upload Resume
              </button>
              <button className="btn-hero-secondary">
                View Sample Analysis
              </button>
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
                <div>
                  <FilePreview file={selectedFile} onRemove={handleRemoveFile} />
                  
                  {!analysisResult && !isAnalyzing && (
                    <button
                      onClick={handleAnalyze}
                      className="analyze-btn"
                    >
                      <BarChart3 className="w-5 h-5" />
                      Analyze Resume
                    </button>
                  )}

                  {isAnalyzing && (
                    <div className="loading-container">
                      <div className="loading-spinner"></div>
                      <p className="loading-text">Analyzing your resume...</p>
                    </div>
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

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <StatCard
              icon={<Users className="w-6 h-6" />}
              value="50K+"
              label="Resumes Analyzed"
              change="+12%"
              positive={true}
            />
            <StatCard
              icon={<CheckCircle className="w-6 h-6" />}
              value="85%"
              label="Success Rate"
              change="+5%"
              positive={true}
            />
            <StatCard
              icon={<Clock className="w-6 h-6" />}
              value="< 30s"
              label="Analysis Time"
              change="-20%"
              positive={true}
            />
            <StatCard
              icon={<Star className="w-6 h-6" />}
              value="4.9/5"
              label="User Rating"
              change="+0.2"
              positive={true}
            />
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

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-container">
            <h2 className="cta-title">
              Ready to Optimize Your Resume?
            </h2>
            <p className="cta-description">
              Join thousands of professionals who have improved their job prospects with our AI-powered resume analysis.
            </p>
            <button 
              onClick={openFileDialog}
              className="cta-button"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
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
