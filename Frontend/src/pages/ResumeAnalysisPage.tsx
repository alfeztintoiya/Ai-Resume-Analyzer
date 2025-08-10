// Frontend/src/pages/ResumeAnalysisPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronUp, 
  FileText,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Lightbulb
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { resumeService } from '../services/resumeService';
import './ResumeAnalysisPage.css';

interface AnalysisSection {
  score: number;
  tips: Array<{
    type: 'good' | 'improve';
    tip: string;
    explanation: string;
  }>;
}

interface ResumeAnalysisData {
  id: string;
  fileName: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  overallScore: number;
  analysisStatus?: string;
  sections: {
    contact: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
  };
  jobAnalysis: {
    matchScore: number;
    strengths: string[];
    improvements: string[];
    keywords: string[];
  };
  resumeImageUrl?: string;
  analysisData?: {
    ATS?: AnalysisSection;
    toneAndStyle?: AnalysisSection;
    content?: AnalysisSection;
    structure?: AnalysisSection;
    skills?: AnalysisSection;
  };
}

interface ApiResumeResponse {
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
  resumeImageUrl?: string;
  analysisData?: {
    ATS?: AnalysisSection;
    toneAndStyle?: AnalysisSection;
    content?: AnalysisSection;
    structure?: AnalysisSection;
    skills?: AnalysisSection;
  };
}

const ResumeAnalysisPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  
  const [analysisData, setAnalysisData] = useState<ResumeAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (resumeId) {
      fetchAnalysisData();
    }
  }, [resumeId]);

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const response = await resumeService.getResumeAnalysis(resumeId!);
      
      if (response.success && response.resume) {
        // Transform API response to match our interface
      const apiData: ApiResumeResponse = response.resume;
      
      // Create properly typed analysis data with defaults
      const transformedData: ResumeAnalysisData = {
        id: apiData.id,
        fileName: apiData.fileName,
        companyName: apiData.companyName,
        jobTitle: apiData.jobTitle,
        jobDescription: apiData.jobDescription,
        analysisStatus: apiData.analysisStatus,
        overallScore: apiData.overallScore ?? 0,
        sections: {
          contact: apiData.sections?.contact ?? 0,
          summary: apiData.sections?.summary ?? 0,
          experience: apiData.sections?.experience ?? 0,
          education: apiData.sections?.education ?? 0,
          skills: apiData.sections?.skills ?? 0,
        },
        jobAnalysis: {
          matchScore: apiData.jobAnalysis?.matchScore ?? 0,
          strengths: apiData.jobAnalysis?.strengths ?? [],
          improvements: apiData.jobAnalysis?.improvements ?? [],
          keywords: apiData.jobAnalysis?.keywords ?? [],
        },
        resumeImageUrl: apiData.resumeImageUrl,
        analysisData: apiData.analysisData,
      };
      
      setAnalysisData(transformedData);
      } else {
        setError('Failed to load analysis data');
      }
    } catch (err) {
      setError('Error loading analysis data');
      console.error('Analysis fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="analysis-page">
        <Navbar />
        <div className="analysis-loading">
          <div className="loading-spinner"></div>
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  if (error || !analysisData) {
    return (
      <div className="analysis-page">
        <Navbar />
        <div className="analysis-error">
          <p>{error || 'Analysis not found'}</p>
          <button onClick={handleBackClick} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="analysis-page">
      <Navbar />
      
      <div className="analysis-container">
        {/* Header */}
        <div className="analysis-header">
          <div className="analysis-title">
            <h1>Resume Analysis</h1>
            <p>{analysisData.fileName}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="analysis-content">
          {/* Left Side - Resume Preview */}
          <div className="resume-preview-section">
            <div className="resume-preview-card">
              {/* {analysisData.resumeImageUrl ? (
                <img 
                  src={analysisData.resumeImageUrl} 
                  alt="Resume Preview" 
                  className="resume-preview-image"
                />
              ) : (
                <div className="resume-preview-placeholder">
                  <FileText className="w-16 h-16" />
                  <p>Resume Preview</p>
                </div>
              )} */}
              <div className="resume-preview-placeholder under-process">
                <FileText className="w-16 h-16" />
                <div className="under-process-content">
                  <h3>Resume Preview</h3>
                  <p className="under-process-message">This section is under process</p>
                  <div className="process-indicator">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Analysis Details */}
          <div className="analysis-details-section">
            {/* Overall Score */}
            <div className="score-card overall-score">
              <div className="score-content">
                <div className="score-number" style={{ color: getScoreColor(analysisData.overallScore) }}>
                  {analysisData.overallScore}
                </div>
                <div className="score-label">Overall Score</div>
              </div>
            </div>

            {/* ATS Score */}
            <div className="score-card ats-score">
              <div className="score-content">
                <div className="score-number" style={{ color: getScoreColor(analysisData.jobAnalysis.matchScore) }}>
                  {analysisData.jobAnalysis.matchScore}
                </div>
                <div className="score-label">ATS Score</div>
              </div>
            </div>

            {/* Expandable Sections */}
            <div className="analysis-sections">
              {/* Tone & Style */}
              <AnalysisSection
                title="Tone & Style"
                icon={<CheckCircle className="w-5 h-5" />}
                score={analysisData.sections.summary}
                data={analysisData.analysisData?.toneAndStyle}
                isExpanded={expandedSections['toneStyle']}
                onToggle={() => toggleSection('toneStyle')}
              />

              {/* Content */}
              <AnalysisSection
                title="Content"
                icon={<FileText className="w-5 h-5" />}
                score={analysisData.sections.experience}
                data={analysisData.analysisData?.content}
                isExpanded={expandedSections['content']}
                onToggle={() => toggleSection('content')}
              />

              {/* Structure */}
              <AnalysisSection
                title="Structure"
                icon={<BarChart3 className="w-5 h-5" />}
                score={analysisData.sections.education}
                data={analysisData.analysisData?.structure}
                isExpanded={expandedSections['structure']}
                onToggle={() => toggleSection('structure')}
              />

              {/* Skills */}
              <AnalysisSection
                title="Skills"
                icon={<CheckCircle className="w-5 h-5" />}
                score={analysisData.sections.skills}
                data={analysisData.analysisData?.skills}
                isExpanded={expandedSections['skills']}
                onToggle={() => toggleSection('skills')}
              />

              {/* Tips */}
              <TipsSection
                strengths={analysisData.jobAnalysis.strengths}
                improvements={analysisData.jobAnalysis.improvements}
                keywords={analysisData.jobAnalysis.keywords}
                isExpanded={expandedSections['tips']}
                onToggle={() => toggleSection('tips')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analysis Section Component
interface AnalysisSectionProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  data?: AnalysisSection;
  isExpanded: boolean;
  onToggle: () => void;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  title,
  icon,
  score,
  data,
  isExpanded,
  onToggle
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="analysis-section-card">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          {icon}
          <span>{title}</span>
        </div>
        <div className="section-controls">
          <span className="section-score" style={{ color: getScoreColor(score) }}>
            {score}%
          </span>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="section-content">
          {data?.tips ? (
            <div className="tips-list">
              {data.tips.map((tip, index) => (
                <div key={index} className={`tip-item ${tip.type}`}>
                    {tip.type === 'good' ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <div className='tip-content'>
                        <div className="tip-header">
                    <span className="tip-title">{tip.tip}</span>
                        </div>
                    <p className="tip-explanation">{tip.explanation}</p>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tips">
              <p>Detailed analysis data not available for this section.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Tips Section Component
interface TipsSectionProps {
  strengths: string[];
  improvements: string[];
  keywords: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

const TipsSection: React.FC<TipsSectionProps> = ({
  strengths,
  improvements,
  keywords,
  isExpanded,
  onToggle
}) => {
  return (
    <div className="analysis-section-card">
      <div className="section-header" onClick={onToggle}>
        <div className="section-title">
          <Lightbulb className="w-5 h-5" />
          <span>Tips</span>
        </div>
        <div className="section-controls">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="section-content">
          <div className="tips-grid">
            <div className="tips-column">
              <h4 className="tips-heading">Strengths</h4>
              <div className="tips-list">
                {strengths.map((strength, index) => (
                  <div key={index} className="tip-item good">
                    <CheckCircle className="flex-shrink-0 w-4 h-4 text-green-500" />
                    <span>{strength}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="tips-column">
              <h4 className="tips-heading">Improvements</h4>
              <div className="tips-list">
                {improvements.map((improvement, index) => (
                  <div key={index} className="tip-item improve">
                    <AlertCircle className="flex flex-shrink-0 w-4 h-4 text-yellow-500" />
                    <span>{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="tips-column full-width">
              <h4 className="tips-heading">Keywords</h4>
              <div className="keywords-list">
                {keywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalysisPage;