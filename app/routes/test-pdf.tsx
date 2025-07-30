import React, { useState } from 'react';
import { testPdfJsLibrary, convertPdfToImage } from '~/lib/pdf2img';

const TestPdf = () => {
  const [testResult, setTestResult] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleTestLibrary = async () => {
    setTestResult('Testing PDF.js library...');
    const result = await testPdfJsLibrary();
    setTestResult(`Library test: ${result.success ? 'SUCCESS' : `FAILED - ${result.error}`}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
  };

  const handleTestConversion = async () => {
    if (!file) {
      setTestResult('Please select a file first');
      return;
    }

    setTestResult('Testing PDF conversion...');
    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    });

    try {
      const result = await convertPdfToImage(file);
      console.log('Conversion result:', result);
      
      if (result.file) {
        setTestResult(`Conversion SUCCESS - Image created: ${result.file.name}, Size: ${result.file.size}`);
      } else {
        setTestResult(`Conversion FAILED - ${result.error}`);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      setTestResult(`Conversion ERROR - ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">PDF Conversion Test</h1>
      
      <div className="space-y-4">
        <button 
          onClick={handleTestLibrary}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test PDF.js Library
        </button>

        <div>
          <input 
            type="file" 
            accept=".pdf"
            onChange={handleFileChange}
            className="mb-2"
          />
          <button 
            onClick={handleTestConversion}
            disabled={!file}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Test PDF Conversion
          </button>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h3 className="font-bold">Test Result:</h3>
          <pre className="whitespace-pre-wrap">{testResult}</pre>
        </div>
      </div>
    </div>
  );
};

export default TestPdf;
