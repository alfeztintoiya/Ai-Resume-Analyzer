# 📄 Resume Analyzer - AI-Powered Resume Analysis Platform

> Transform your job search with intelligent resume analysis powered by Google Gemini AI

[![Demo](https://img.shields.io/badge/Live-Demo-brightgreen.svg)](https://your-demo-link.com)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)

## 🚀 **What This Project Does**

Resume Analyzer is a modern web application that uses artificial intelligence to provide comprehensive resume analysis and optimization suggestions. Upload your resume, specify the job you're targeting, and get detailed feedback to improve your chances of landing interviews.

## ✨ **Key Features**

### 🤖 **AI-Powered Analysis**

- **Google Gemini AI Integration** - Leverages the latest Gemini 2.0 Flash model for accurate analysis
- **Intelligent Content Review** - Analyzes resume content, structure, and job alignment
- **ATS Optimization** - Ensures your resume passes Applicant Tracking Systems

### 📊 **Comprehensive Scoring System**

- **Overall Score** - Complete resume evaluation (0-100)
- **Section-Specific Scores** - Contact, Summary, Experience, Education, Skills
- **Job Match Analysis** - How well your resume fits the target position
- **Keyword Optimization** - Identifies missing and relevant keywords

### 🎯 **Job-Specific Feedback**

- **Target Company Analysis** - Tailored suggestions for specific companies
- **Role-Based Recommendations** - Customized advice for different job titles
- **Industry Insights** - Relevant tips based on job descriptions

### 📈 **User Experience Features**

- **Analysis History** - Track all your resume analyses over time
- **Progress Tracking** - Real-time status updates during processing
- **Responsive Design** - Works perfectly on desktop and mobile devices
- **Intuitive Interface** - Clean, user-friendly design

### 🔒 **Security & Authentication**

- **Secure User Accounts** - JWT-based authentication system
- **Protected File Storage** - Cloudinary integration for secure PDF handling
- **Privacy First** - Your resumes and data are kept completely private

## 🛠️ **Technology Stack**

### **Frontend Technologies**

- **React 18 + TypeScript** - Modern, type-safe user interface
- **Vite** - Lightning-fast development and build tool
- **React Router** - Seamless single-page application navigation
- **Custom CSS** - Professional, responsive design without heavy frameworks
- **Lucide React** - Beautiful, consistent iconography

### **Backend Technologies**

- **Node.js + Express** - Robust server-side architecture
- **Google Gemini AI** - State-of-the-art AI for resume analysis
- **JWT Authentication** - Secure, stateless user sessions
- **Multer** - Efficient file upload handling
- **Cloudinary** - Cloud-based file storage and processing

### **Database & Storage**

- **PostgreSQL (Supabase)** - Reliable, scalable database solution
- **Real-time Updates** - Live status tracking for analysis progress
- **Secure File Handling** - Safe PDF upload and storage

## 🎯 **What Makes This Special**

### **Intelligent Analysis Engine**

Our AI doesn't just scan for keywords - it understands context, evaluates content quality, and provides actionable feedback that actually helps you land interviews.

### **Real-World Job Matching**

Input specific job descriptions and company names to get tailored advice that matches real job requirements in your industry.

### **Professional Development Tool**

Track your resume improvements over time and see how your scores improve as you implement suggestions.

## 📱 **How It Works**

1. **📤 Upload Your Resume** - Drag and drop your PDF resume
2. **🎯 Specify Target Role** - Enter company name, job title, and description
3. **🤖 AI Analysis** - Our Gemini AI processes your resume in seconds
4. **📊 Get Detailed Feedback** - Receive scores, suggestions, and optimization tips
5. **📈 Track Progress** - Save results and compare multiple analyses

## 🚀 **Quick Start**

### **Prerequisites**

- Node.js 18+
- Google Gemini API Key ([Get one here](https://ai.google.dev/))
- Supabase Account ([Free tier available](https://supabase.com/))
- Cloudinary Account ([Free tier available](https://cloudinary.com/))

### **Installation**

```bash
# Clone the repository
git clone https://github.com/yourusername/resume-analyzer.git
cd resume-analyzer

# Install backend dependencies
cd Backend && npm install

# Install frontend dependencies
cd ../Frontend && npm install
```

### **Environment Setup**

Create `.env` files in both Backend and Frontend directories:

**Backend/.env:**

```env
PORT=5003
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

**Frontend/.env:**

```env
VITE_API_BASE_URL=http://localhost:5003/api/v1
```

### **Run the Application**

```bash
# Start backend (from Backend directory)
npm start

# Start frontend (from Frontend directory)
npm run dev
```

Visit `http://localhost:5173` to see the application!

## 🎨 **Feature Highlights**

### **📊 Intelligent Scoring System**

- **Overall Resume Score** - Comprehensive evaluation from 0-100
- **Section Breakdown** - Individual scores for Contact, Summary, Experience, Education, Skills
- **ATS Compatibility** - Ensures your resume passes automated screening
- **Job Match Percentage** - How well your resume fits the target position

### **🎯 Smart Analysis Features**

- **Keyword Optimization** - Identifies missing industry-relevant keywords
- **Content Quality Assessment** - Evaluates language, tone, and professionalism
- **Structure Analysis** - Reviews formatting, organization, and readability
- **Achievement Highlighting** - Suggests ways to better showcase accomplishments

### **📈 User Dashboard**

- **Analysis History** - View all previous resume analyses
- **Progress Tracking** - See how your scores improve over time
- **Comparison Tools** - Compare different versions of your resume
- **Export Options** - Download analysis reports for reference

### **🔍 Real-time Processing**

- **Live Status Updates** - Watch your analysis progress in real-time
- **Quick Processing** - Get results in under 30 seconds
- **Detailed Feedback** - Comprehensive suggestions and recommendations
- **Visual Indicators** - Easy-to-understand score displays and progress bars

## 📋 **Analysis Categories**

| Category                 | What It Analyzes                      | Why It Matters                          |
| ------------------------ | ------------------------------------- | --------------------------------------- |
| **Contact Information**  | Phone, email, LinkedIn, location      | Ensures recruiters can reach you        |
| **Professional Summary** | Opening statement quality             | First impression and career positioning |
| **Work Experience**      | Relevance, achievements, descriptions | Core of your professional story         |
| **Education**            | Degrees, certifications, relevance    | Educational background alignment        |
| **Skills**               | Technical and soft skills             | Keyword matching and competency         |
| **ATS Optimization**     | Format, keywords, structure           | Automated system compatibility          |
| **Job Matching**         | Role-specific alignment               | Fit for target position                 |

````

### **Environment Configuration**

#### **Backend Environment Variables**

Create `Backend/.env` file:

```env
# Server Configuration
PORT=5003
NODE_ENV=development

# Database Configuration (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# Cloudinary Configuration
## 📁 **Project Structure**

````

Resume_Analyzer/
├── Backend/ # Node.js/Express API
│ ├── controllers/ # Business logic
│ │ ├── authController.js # User authentication
│ │ └── resumeController.js # Resume processing
│ ├── services/ # External services
│ │ ├── geminiService.js # AI analysis
│ │ └── cloudPdfToImageService.js # PDF processing
│ ├── routes/ # API endpoints
│ └── middleware/ # Authentication middleware
│
├── Frontend/ # React/TypeScript UI
│ ├── src/
│ │ ├── pages/ # Main application pages
│ │ │ ├── LandingPage.tsx # Home page
│ │ │ ├── ResumeAnalysisPage.tsx # Results display
│ │ │ └── ResumeHistoryPage.tsx # User history
│ │ ├── components/ # Reusable UI components
│ │ ├── services/ # API communication
│ │ └── types/ # TypeScript definitions
│ └── public/ # Static assets

````

## 🔧 **Key Features in Detail**

### **AI Analysis Engine**
- **Multi-dimensional Evaluation** - Analyzes content, structure, keywords, and job fit
- **Contextual Understanding** - Considers industry, role level, and company culture
- **Actionable Recommendations** - Specific suggestions for improvement
- **ATS Optimization** - Ensures compatibility with tracking systems

### **User Experience**
- **Drag & Drop Upload** - Easy PDF resume uploading
- **Real-time Processing** - Live status updates during analysis
- **Responsive Design** - Works on all devices and screen sizes
- **Intuitive Interface** - Clean, professional design

### **Data Management**
- **Secure Storage** - All files stored securely in the cloud
- **Analysis History** - Track multiple resume versions over time
- **Progress Tracking** - See how your scores improve
- **Export Options** - Download results for offline reference

## 🎯 **Use Cases**

- **Job Seekers** - Optimize resumes for specific positions
- **Career Changers** - Adapt resumes for new industries
- **Students** - Improve first professional resumes
- **Professionals** - Fine-tune resumes for promotions
- **Recruiters** - Quickly assess candidate resume quality

## 🚀 **Deployment**

### **Quick Deploy Options**

**Frontend (Vercel/Netlify):**
```bash
npm run build
# Deploy the 'dist' folder
````

**Backend (Railway/Render):**

```bash
# Set environment variables in platform
# Deploy with: npm start
```

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ **Support**

- 📧 **Email:** [your-email@domain.com](mailto:your-email@domain.com)
- 🐛 **Issues:** [GitHub Issues](https://github.com/yourusername/resume-analyzer/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/resume-analyzer/discussions)

## ⭐ **Show Your Support**

If this project helped you, please give it a ⭐ on GitHub!

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
job_title VARCHAR(255) NOT NULL,
job_description TEXT NOT NULL,
analysis_status VARCHAR(50) DEFAULT 'PENDING',
overall_score INTEGER,
contact_score INTEGER,
summary_score INTEGER,
experience_score INTEGER,
education_score INTEGER,
skills_score INTEGER,
job_match_score INTEGER,
strengths TEXT[],
improvements TEXT[],
keywords TEXT[],
analysis_data JSONB,
resume_image_url TEXT,
error_message TEXT,
processed_at TIMESTAMP WITH TIME ZONE,
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

````

### **Running the Application**

1. **Start the Backend**

```bash
cd Backend
npm start
````

Server runs on `http://localhost:5003`

2. **Start the Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```
   Client runs on `http://localhost:5173`

---

## 📁 **Project Structure**

```
Resume_Analyzer/
├── Backend/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   └── resumeController.js    # Resume upload and analysis
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── routes/
│   │   ├── auth.js               # Auth routes
│   │   └── resume.js             # Resume routes
│   ├── services/
│   │   ├── geminiService.js      # Gemini AI integration
│   │   ├── cloudPdfToImageService.js # PDF processing
│   │   └── emailService.js       # Email notifications
│   ├── utils/
│   │   ├── supabaseClient.js     # Database connection
│   │   └── cloudinaryConfig.js   # File storage config
│   ├── .env
│   ├── package.json
│   └── server.js                 # Express server setup
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Navigation component
│   │   │   ├── AuthModal.tsx     # Login/Register modal
│   │   │   ├── UploadProgress.tsx # File upload progress
│   │   │   └── Avatar.tsx        # User avatar component
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx   # Main landing page
│   │   │   ├── ResumeAnalysisPage.tsx # Analysis results
│   │   │   └── ResumeHistoryPage.tsx  # User's analysis history
│   │   ├── services/
│   │   │   └── resumeService.ts  # API service layer
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript definitions
│   │   ├── App.tsx               # Main app component
│   │   └── main.tsx              # React entry point
│   ├── public/
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── README.md
└── .gitignore
```

## 🔧 **Key Features in Detail**

### **AI Analysis Engine**

- **Multi-dimensional Evaluation** - Analyzes content, structure, keywords, and job fit
- **Contextual Understanding** - Considers industry, role level, and company culture
- **Actionable Recommendations** - Specific suggestions for improvement
- **ATS Optimization** - Ensures compatibility with tracking systems

### **User Experience**

- **Drag & Drop Upload** - Easy PDF resume uploading
- **Real-time Processing** - Live status updates during analysis
- **Responsive Design** - Works on all devices and screen sizes
- **Intuitive Interface** - Clean, professional design

### **Data Management**

- **Secure Storage** - All files stored securely in the cloud
- **Analysis History** - Track multiple resume versions over time
- **Progress Tracking** - See how your scores improve
- **Export Options** - Download results for offline reference

## 🎯 **Use Cases**

- **Job Seekers** - Optimize resumes for specific positions
- **Career Changers** - Adapt resumes for new industries
- **Students** - Improve first professional resumes
- **Professionals** - Fine-tune resumes for promotions
- **Recruiters** - Quickly assess candidate resume quality

## 🚀 **Deployment**

### **Quick Deploy Options**

**Frontend (Vercel/Netlify):**

```bash
npm run build
# Deploy the 'dist' folder
```

**Backend (Railway/Render):**

```bash
# Set environment variables in platform
# Deploy with: npm start
```

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## �‍♂️ **Support**

- 📧 **Email:** [your-email@domain.com](mailto:your-email@domain.com)
- � **Issues:** [GitHub Issues](https://github.com/yourusername/resume-analyzer/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/resume-analyzer/discussions)

## ⭐ **Show Your Support**

If this project helped you, please give it a ⭐ on GitHub!

---

**Built with ❤️ using React, Node.js, and Google Gemini AI**
