const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
    constructor(){
        if(!process.env.GEMINI_API_KEY){
            throw new Error('Gemini_api_key is required');
        }

        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        this.model = this.genAI.getGenerativeModel({
            model: process.env.GEMINI_MODEL
        });
    }

        fileToGenerativePart(Buffer,mimeType){
            return {
                inlineData: {
                    data: Buffer.toString('base64'),
                    mimeType: mimeType,
                },
            };
        }

        async downloadFile(fileUrl){
            try {
                console.log('📥 Downloading file from:', fileUrl);
                const response = await fetch(fileUrl);
                if(!response.ok){
                    throw new Error(`Failed to download file: ${response.statusText}`);
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                console.log('✅ File downloaded successfully, size:', buffer.length, 'bytes');
                return buffer;
            } catch (error) {
                console.error('File download error:',error);
                throw new Error('Failed to download resume file');
            }
        }

        // Analyze resume with AI
        async analyzeResume(fileUrl,mimeType,jobTitle,jobDescription,companyName){
            try {
                console.log('🤖 Starting Gemini AI analysis...');
                console.log('📄 File URL:', fileUrl);
                console.log('📋 MIME Type:', mimeType);
                //download file from url
                const fileBuffer = await this.downloadFile(fileUrl);

                if (!fileBuffer || fileBuffer.length === 0) {
                    throw new Error('Downloaded file is empty or invalid');
                }

                //convert to gemini format
                const filePart = this.fileToGenerativePart(fileBuffer,mimeType);

                const prompt = this.createAnalysisPrompt(jobTitle,jobDescription,companyName);

                //send to Gemini
                console.log('Sending request to Gemini AI...');
                const result = await this.model.generateContent([prompt,filePart]);

                if(!result.response){
                    throw new Error('No response from Gemini API');
                }

                const responseText = result.response.text();
                console.log('Recieved response from Gemini API');
                console.log('Raw Gemini response: ',responseText);

                const analysisData = this.parseAIResponse(responseText);
                return this.structureAnalysisResponse(analysisData);
            } catch (error) {
                console.log('Gemini analysis error:',error);
                throw new Error(`AI analysis failed: ${error.message}`);
            }
        }

        // Create analysis prompt
        createAnalysisPrompt(jobTitle, jobDescription, companyName) {
            return `You are an expert in ATS (Applicant Tracking System) and resume analysis.
        Please analyze the resume in the attached PDF file and provide detailed feedback.

        **Job Context:**
        - Company: ${companyName}
        - Job Title: ${jobTitle}
        - Job Description: ${jobDescription}

        **Instructions:**
        - Rate the resume based on ATS compatibility, content quality, structure, tone, and skills
        - Be thorough and honest - give low scores if the resume needs improvement
        - Focus on how well the resume matches the specific job requirements
        - Provide actionable feedback for improvements

        **Response Format:**
        Return your analysis as a JSON object with this exact structure:

        {
        "overallScore": number (0-100),
        "ATS": {
            "score": number (0-100),
            "tips": [
            {
                "type": "good" or "improve",
                "tip": "short title",
                "explanation": "detailed explanation"
            }
            ]
        },
        "toneAndStyle": {
            "score": number (0-100),
            "tips": [
            {
                "type": "good" or "improve",
                "tip": "short title", 
                "explanation": "detailed explanation"
            }
            ]
        },
        "content": {
            "score": number (0-100),
            "tips": [
            {
                "type": "good" or "improve",
                "tip": "short title",
                "explanation": "detailed explanation"
            }
            ]
        },
        "structure": {
            "score": number (0-100),
            "tips": [
            {
                "type": "good" or "improve",
                "tip": "short title",
                "explanation": "detailed explanation"
            }
            ]
        },
        "skills": {
            "score": number (0-100),
            "tips": [
            {
                "type": "good" or "improve",
                "tip": "short title",
                "explanation": "detailed explanation"
            }
            ]
        }
        }

        Return ONLY the JSON object, no additional text or markdown formatting.`;
        }

        //parse AI response
        parseAIResponse(responseText){
            try {
                let cleaned = responseText.trim();

                cleaned = cleaned.replace(/```json\s*/g,'').replace(/```\s*/g,'');

                const jsonStart = cleaned.indexOf('{');
                const jsonEnd = cleaned.lastIndexOf('}')+1;

                if(jsonStart===-1 || jsonEnd === 0){
                    throw new Error('No valid JSON found in AI response');
                }

                const jsonString = cleaned.substring(jsonStart,jsonEnd);
                return JSON.parse(jsonString);
            } catch (error) {
                console.error('JSON parsing errro: ',error);
                console.error('Raw response: ',responseText);

                return this.getFallbackResponse();
            }
        }

        structureAnalysisResponse(analysisData){
            const sections = {
                contact: this.extractScore(analysisData.ATS?.score,null),
                summary: this.extractScore(analysisData.toneAndStyle?.score,null),
                experience: this.extractScore(analysisData.content?.score,null),
                education: this.extractScore(analysisData.structure?.score,null),
                skills: this.extractScore(analysisData.skills?.score,null)
            };

            const allTips = this.extractAllTips(analysisData);const strengths = allTips.filter(tip => tip.type === 'good').map(tip => tip.tip).slice(0,5);
            const improvements = allTips.filter(tip => tip.type === 'improve').map(tip => tip.tip).slice(0,5);
            const keywords = this.extractKeywords(allTips).slice(0,10);

            return {
                overallScore: this.extractScore(analysisData.overallScore,70),
                sections,
                strengths,
                improvements,
                keywords,
                rawAnalysis: analysisData
            };
        }

        extractScore(score,fallback=70){
            const numScore = parseInt(score);
            return (!isNaN(numScore) && numScore >=0 && numScore <= 100) ? numScore : fallback;
        }

        extractAllTips(analysisData){
            const allTips = [];

            ['ATS','toneAndStyle','content','structure','skills'].forEach(section => {
                if(analysisData[section]?.tips && Array.isArray(analysisData[section].tips)){
                    allTips.push(...analysisData[section].tips);
                }
            });
            return allTips;
        }

        extractKeywords(tips){
            const keywords = new Set();

            tips.forEach(tip => {
                if(tip.explanation){
                    const words = tip.explanation.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
                    words.forEach(word => {
                        if(word.lenth > 3 && !this.isCommonWord(word)){
                            keywords.add(word);
                        }
                    });
                }
            });

            const defaultKeywords = ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'Communication', 'Leadership'];
            defaultKeywords.forEach(keyword => keywords.add(keyword));

            return Array.from(keywords);
        }

        isCommonWord(word){
            const commonWords = ['The', 'This', 'That', 'With', 'Have', 'More', 'Some', 'Your', 'Could', 'Should', 'Would', 'When', 'Where'];
            return commonWords.includes(word);
        }
        
        // Fallback response if AI fails
        getFallbackResponse() {
            return {
            overallScore: 70,
            ATS: {
                score: 75,
                tips: [
                { type: 'improve', tip: 'Add more keywords', explanation: 'Include more job-specific keywords to improve ATS compatibility.' }
                ]
            },
            toneAndStyle: {
                score: 70,
                tips: [
                { type: 'improve', tip: 'Professional tone', explanation: 'Maintain a professional and confident tone throughout.' }
                ]
            },
            content: {
                score: 65,
                tips: [
                { type: 'improve', tip: 'Quantify achievements', explanation: 'Add specific numbers and metrics to demonstrate impact.' }
                ]
            },
            structure: {
                score: 80,
                tips: [
                { type: 'good', tip: 'Clear structure', explanation: 'Resume has a clear and organized structure.' }
                ]
            },
            skills: {
                    score: 70,
                    tips: [
                    { type: 'improve', tip: 'Skills alignment', explanation: 'Better align skills with job requirements.' }
                    ]
                }
                };
            }
}

module.exports = new GeminiService();