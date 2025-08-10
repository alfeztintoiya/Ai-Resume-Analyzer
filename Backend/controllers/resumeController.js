const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');
const geminiService = require('../services/geminiService');
const cloudPdfToImageService = require('../services/cloudPdfToImageService');
const { randomUUID } = require('crypto');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
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

// Upload resume and start AI analysis
const uploadResume = async (req, res) => {
  try {
    // Authentication check
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

    // Validate input
    const { companyName, jobTitle, jobDescription } = req.body;
    
    if (!companyName || !jobTitle || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: 'Company name, job title, and job description are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required'
      });
    }

    // Verify user
    const userId = decoded.userId || decoded.id;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_verified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email address first'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'raw',
          folder: 'resumes',
          use_filename: true,
          unique_filename: true,
          access_mode: 'public'
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      uploadStream.end(req.file.buffer);
    });

    // Save to database
    const resumeId = randomUUID();
    const { data: newResume, error: insertError } = await supabase
      .from('resumes')
      .insert([{
        id: resumeId,
        user_id: userId,
        file_name: uploadResult.public_id,
        original_name: req.file.originalname,
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

    if (insertError) {
      console.error('Resume insertion error:', insertError);
      
      // Cleanup uploaded file
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'raw' });
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
      
      return res.status(500).json({
        success: false,
        message: 'Failed to save resume data'
      });
    }

    // Start AI analysis in background
    setTimeout(async () => {
      await analyzeResumeWithAI(
        resumeId, 
        uploadResult.secure_url, 
        req.file.mimetype,
        companyName, 
        jobTitle, 
        jobDescription
      );
    }, 1000);

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully. AI analysis in progress...',
      resumeId: newResume.id,
      fileName: newResume.original_name,
      analysisStatus: 'PENDING'
    });

  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload'
    });
  }
};

// AI Analysis function
const analyzeResumeWithAI = async (resumeId, fileUrl, mimeType, companyName, jobTitle, jobDescription) => {
  try {
    console.log(`🚀 Starting AI analysis for resume ${resumeId}...`);
    
    // Update status to PROCESSING
    await supabase
      .from('resumes')
      .update({
        analysis_status: 'PROCESSING',
        updated_at: new Date().toISOString()
      })
      .eq('id', resumeId);

    // 🤖 CALL GEMINI AI TO ANALYZE PDF
    const analysisPromise = geminiService.analyzeResume(
      fileUrl, 
      mimeType, 
      jobTitle, 
      jobDescription, 
      companyName
    );
    

    const imagePromise = mimeType === 'application/pdf'
      ? cloudPdfToImageService.convertPDFToImage(fileUrl,resumeId) : Promise.resolve(null);

    const [analysis,imageUrl] = await Promise.all([analysisPromise,imagePromise]);

    console.log('✅ AI analysis completed successfully');
    if(imageUrl){
      console.log('✅ PDF to image conversion completed successfully');
    }
    // Calculate job match score
    const jobMatchScore = Math.round(
      (analysis.sections.contact + analysis.sections.summary + 
       analysis.sections.experience + analysis.sections.education + 
       analysis.sections.skills) / 5
    );

    // Save analysis results with image URL
    const updateData = {
      analysis_status: 'COMPLETED',
      overall_score: analysis.overallScore,
      contact_score: analysis.sections.contact,
      summary_score: analysis.sections.summary,
      experience_score: analysis.sections.experience,
      education_score: analysis.sections.education,
      skills_score: analysis.sections.skills,
      job_match_score: jobMatchScore,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
      keywords: analysis.keywords,
      analysis_data: analysis.rawAnalysis,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if(imageUrl){
      updateData.resume_image_url = imageUrl;
    }

    // Save analysis results
    const { error: updateError } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', resumeId);

    if (updateError) {
      console.error('❌ Analysis update error:', updateError);
      throw new Error('Failed to save analysis results');
    }

    console.log(`✅ AI analysis completed and saved for resume ${resumeId}`);

  } catch (error) {
    console.error('❌ AI analysis error:', error);
    
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

// Get resume analysis
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
    const userId = decoded.userId || decoded.id;

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
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
        resumeImageUrl: resume.resume_image_url,
        processedAt: resume.processed_at,
        createdAt: resume.created_at,
        errorMessage: resume.error_message
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

// Get user resumes
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
    const userId = decoded.userId || decoded.id;

    const { data: resumes, error: resumesError } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
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
      resumeImageUrl: resume.resume_image_url,
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

const convertResumeToImage = async (req,res) => {
  try {
    const { resumeId } = req.params;
    const token = req.cookies.token;

    if(!token){
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    const { data: resume, error: resumeError } = await supabase.from('resumes').select('*').eq('id',resumeId).eq('user_id',userId).single();

    if(resumeError || !resume){
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const imageUrl = await cloudPdfToImageService.convertPDFToImage(resume.file_path,resumeId);

    const { error: updateError } = await supabase
                                  .from('resumes')
                                  .update({
                                    resume_image_url: imageUrl,
                                    updated_at: new Date().toISOString()
                                  })
                                  .eq('id',resumeId);
      
    if(updateError){
      return res.status(500).json({
        success: false,
        message: 'Failed to save image URL'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Resume converted to image successfully',
      imageUrl: imageUrl
    });

  } catch (error) {
    console.log('Convert resume to image error:',error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


// Delete resume
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
    const userId = decoded.userId || decoded.id;

    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId)
      .single();

    if (resumeError || !resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    const { error: deleteError } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Resume deletion error:', deleteError);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete resume'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(resume.file_name, { resource_type: 'raw' });

      if(resume.resume_image_url){
        const imagePublicId = `resume-images/resume_image_${resumeId}`;
        await cloudinary.uploader.destroy(imagePublicId,{ resource_type: 'image' });
      }
    } catch (cloudinaryError) {
      console.error('Cloudinary deletion error:', cloudinaryError);
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

module.exports = {
  upload,
  uploadResume,
  getResumeAnalysis,
  getUserResumes,
  deleteResume,
  convertResumeToImage
};