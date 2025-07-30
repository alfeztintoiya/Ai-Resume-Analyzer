import React,{useState, type FormEvent} from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { prepareInstructions } from '~/constants';
import { convertPdfToImage, testPdfJsLibrary } from '~/lib/pdf2img';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const upload = () => {
    const {auth,isLoading,fs, ai, kv} = usePuterStore();
    const [isProcessing, setisProcessing] = useState(false);
    const [statusText, setstatusText] = useState("");
    const [file,setFile] = useState<File | null>(null);
    const navigate = useNavigate();

    const handleFileSubmit = (file: File | null) => {
        setFile(file);
    };

    const handleAnalyze = async ({ companyName , jobTitle , jobDescription, file }: {companyName: string, jobTitle: string, jobDescription: string, file: File}) => {
        setisProcessing(true);
        setstatusText('Uploading the file...');

        const uploadedFile = await fs.upload([file]);

        if(!uploadedFile)return setstatusText('Error: Failed to upload file');

        setstatusText('Testing PDF.js library...');
        
        const pdfJsTest = await testPdfJsLibrary();
        console.log('PDF.js library test:', pdfJsTest);
        
        if (!pdfJsTest.success) {
            return setstatusText(`Error: PDF.js library failed - ${pdfJsTest.error}`);
        }

        setstatusText('Converting to image...');
        
        console.log('Starting PDF conversion for file:', file.name, 'Size:', file.size, 'Type:', file.type);

        const imageFile = await convertPdfToImage(file);
        
        console.log('PDF Conversion result:', imageFile);

        if(!imageFile.file) {
            const errorMsg = imageFile.error || 'Unknown error during PDF conversion';
            console.error('PDF Conversion Error:', errorMsg);
            return setstatusText(`Error: Failed to Convert PDF to image - ${errorMsg}`);
        }

        setstatusText('Uploading the image...');

        const uploadedImage = await fs.upload([imageFile.file]);

        if(!uploadedImage)return setstatusText('Error: Failed to upload file');

        setstatusText('Preparing data...');

        const uuid = generateUUID();

        const data = {
            id: uuid,
            resumePath: uploadedFile.path,
            imagePath: uploadedImage.path,
            companyName,jobTitle,jobDescription,
            feedback: '',
        }

        await kv.set(`resume:${uuid}`,JSON.stringify(data));
        setstatusText('Analyzing...');
        
        const feedback = await ai.feedback(
            uploadedFile.path,
            prepareInstructions({ jobTitle,jobDescription }),
        );

        if(!feedback)return setstatusText('Error: Failed to analyze resume');

        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content[1]
            : feedback.message.content[0].text;

        data.feedback = JSON.stringify(feedbackText);

        await kv.set(`resume:${uuid}`,JSON.stringify(data));

        setstatusText('Analysis Completed , redirecting...');
        console.log(data);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name')as string ;
        const jobTitle = formData.get('job-title')as string ;
        const jobDescription = formData.get('job-description')as string ;

        if(!file)return;

        handleAnalyze({ companyName , jobTitle, jobDescription , file });
    };
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            
            <section className='main-section'>
                <div className='page-heading py-16'>
                    <h1>Smart feedback for your dream job.</h1>
                    { isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" alt="resume_scanner" className='w-full'/>
                        </>
                    ):(
                        <>
                            <h2>Drop your resume for an ATS score and improvement tips</h2>
                        </>
                    )}

                    { !isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                            <div className='form-div'>
                                <label htmlFor='company-name'>Company Name</label>
                                <input type='text' name='company-name' placeholder='Company Name' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor='job-title'>Job Title</label>
                                <input type='text' name='job-title' placeholder='Job Title' />
                            </div>
                            <div className='form-div'>
                                <label htmlFor='job-desciption'>Job Description</label>
                                <textarea rows={5} name='job-description' placeholder='Job Description' />
                            </div>


                            <div className='form-div'>
                                <label htmlFor='uploader'>Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSubmit}/>
                            </div>

                            <button className='primary-button' type='submit'>
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default upload