const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');
const { randomUUID } = require('crypto');

// Configure multer for file upload (memory storage for Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept PDF, DOC, DOCX files
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
    }
  }
});

// Upload and analyze resume
const uploadResume = async (req, res) => {
  try {
    // Verify user authentication
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token'
      });
    }

    // Validate required fields
    const { companyName, jobTitle, jobDescription } = req.body;
    
    if (!companyName || !jobTitle || !jobDescription) {
                return res.status(400).json({
                    success: false,
                    message: 'Company name,job title and job description are required'
                });
            }

            if(!res.file){
                return res.status(400).json({
                    success: false,
                    message: 'Resume file is required'
                });
            }

            const {data: user, error: userError } = await supabase
                                                    .from('users')
                                                    .select('*')
                                                    .eq('email',decoded.email)
                                                    .single();

            if(userError || !user){
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if(!user.is_verified){
                return res.status(401).json({
                    success: false,
                    message: 'Please verify your email address first'
                });
            }

            const uploadResult = await new Promise((resolve,reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        resource_type: 'raw',
                        folder: 'resumes',
                        use_filename: true,
                        unique_filename: true,
                        access_mode: 'authenticated'
                    },
                    (error,result) => {
                        if(error){
                            reject(error);
                        }
                        else{
                            resolve(result);
                        }
                    }
                );
                uploadStream.end(req.file.buffer);
            });

            const resumeId = randomUUID();

            const { data: newResume, error: insertError } = await supabase
            .from('resumes')
            .insert([{
                id: resumeId,
                user_id: decoded.userId,
                file_name: uploadResult.public_id,
                original_name: req.file.original_name,
                file_size: req.file.size,
                file_path: uploadResult.secure_url,
                mime_type: req.file.mimetype,
                company_name: companyName,
                job_title: jobTitle,
                job_description: jobDescription,
                analysis_status: 'PENDING',
                strengths: [],
                improvements: [],
                keywords: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }])
            .select()
            .single();

            if(insertError){
                console.error('Resume insertion error: ',insertError);

                try {
                    await cloudinary.uploader.destroy(uploadResult.public_id,{ resource_type: 'raw' });

                } catch (error) {
                    console.error('File cleanup error: ',error);
                }

                return res.status(500).json({
                    success: false,
                    message: 'Failed to save resume data'
                });
            }

            setTimeout(async () => {
                await simulateResumeAnalysis(resumeId);
            }, 2000);

            res.status(201).json({
                success: true,
                message: 'Resume uploaded successfully. Analysis in progress...',
                resumeId: newResume.id,
                fileName: newResume.original_name,
                analysis_status: 'PENDING'
            });
        }
    } catch (error) {
        console.error('Resume upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during file upload'
        });
    }
};


// Get resume analysis status and results
const getResumeAnalysis = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', decoded.userId)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    res.status(200).json({
      success: true,
      resume: {
        id: resume.id,
        fileName: resume.original_name,
        companyName: resume.company_name,
        jobTitle: resume.job_title,
        jobDescription: resume.job_description,
        analysisStatus: resume.analysis_status,
        overallScore: resume.overall_score,
        sections: {
          contact: resume.contact_score,
          summary: resume.summary_score,
          experience: resume.experience_score,
          education: resume.education_score,
          skills: resume.skills_score
        },
        jobAnalysis: {
          matchScore: resume.job_match_score,
          strengths: resume.strengths,
          improvements: resume.improvements,
          keywords: resume.keywords
        },
        analysisData: resume.analysis_data,
        processedAt: resume.processed_at,
        createdAt: resume.created_at
      }
    });
    } catch (error) {
        console.error('Get resume analysis error:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error'
        });
    }
};

const getUserResumes = async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { data: resumes, error: resumesError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false });

    if (resumesError) {
      console.error('Get user resumes error:', resumesError);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch resumes'
      });
    }

    const formattedResumes = resumes.map(resume => ({
      id: resume.id,
      fileName: resume.original_name,
      companyName: resume.company_name,
      jobTitle: resume.job_title,
      analysisStatus: resume.analysis_status,
      overallScore: resume.overall_score,
      jobMatchScore: resume.job_match_score,
      createdAt: resume.created_at,
      processedAt: resume.processed_at
    }));

    res.status(200).json({
      success: true,
      resumes: formattedResumes,
      total: resumes.length
    });

    } catch (error) {
        console.error('Get user resumes error:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error'
        });
    }
};

const deleteResume = async (req, res) => {
  try {
    const { resumeId } = req.params;
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get resume to verify ownership and get file details
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', decoded.userId)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Delete from database first
    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', decoded.userId);

    if (deleteError) {
      console.error('Resume deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete resume'
      });
    }

    // Delete file from Cloudinary
    try {
      await cloudinary.uploader.destroy(resume.file_name, { resource_type: 'raw' });
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
      // Continue even if file deletion fails
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });

    } catch (error) {
        console.error('Delete resume error:', error);
        res.status(500).json({
        success: false,
        message: 'Internal server error'
        });
    }
};

const simulateResumeAnalysis = async (resumeId) => {
  try {
    // Update status to PROCESSING
    await supabase
      .from('resumes')
      .update({
        analysis_status: 'PROCESSING',
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId);

    // Simulate analysis time (2-5 seconds)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 2000));

    const mockAnalysis = {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100
      contactScore: Math.floor(Math.random() * 30) + 70,
      summaryScore: Math.floor(Math.random() * 40) + 60,
      experienceScore: Math.floor(Math.random() * 35) + 65,
      educationScore: Math.floor(Math.random() * 25) + 75,
      skillsScore: Math.floor(Math.random() * 30) + 70,
      jobMatchScore: Math.floor(Math.random() * 35) + 65,
      strengths: [
        'Strong technical skills alignment',
        'Relevant work experience',
        'Good educational background',
        'Clear resume structure'
      ],
      improvements: [
        'Add more quantifiable achievements',
        'Include relevant keywords from job description',
        'Improve summary section',
        'Add more specific skills'
      ],
      keywords: [
        'JavaScript', 'React', 'Node.js', 'MongoDB',
        'API Development', 'Agile', 'Git', 'AWS'
      ]
    };

    const { error: updateError } = await supabase
      .from('resumes')
      .update({
        analysis_status: 'COMPLETED',
        overall_score: mockAnalysis.overallScore,
        contact_score: mockAnalysis.contactScore,
        summary_score: mockAnalysis.summaryScore,
        experience_score: mockAnalysis.experienceScore,
        education_score: mockAnalysis.educationScore,
        skills_score: mockAnalysis.skillsScore,
        job_match_score: mockAnalysis.jobMatchScore,
        strengths: mockAnalysis.strengths,
        improvements: mockAnalysis.improvements,
        keywords: mockAnalysis.keywords,
        analysis_data: mockAnalysis,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId);

      if (updateError) {
      console.error('Analysis update error:', updateError);
      
      // Mark as failed
      await supabase
        .from('resumes')
        .update({
          analysis_status: 'FAILED',
          error_message: 'Analysis processing failed',
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);
    }

    } catch (error) {
        console.error('Analysis simulation error:', error);
        
        // Mark as failed
        await supabase
        .from('resumes')
        .update({
            analysis_status: 'FAILED',
            error_message: error.message,
            updated_at: new Date().toISOString()
        })
        .eq('id', resumeId);
    }
};


module.exports = {
  upload,
  uploadResume,
  getResumeAnalysis,
  getUserResumes,
  deleteResume
};