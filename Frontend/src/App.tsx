import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import LandingPage from './pages/LandingPage';
import EmailVerification from './components/EmailVerification';
import ResumeAnalysisPage from './pages/ResumeAnalysisPage';
import ResumeHistoryPage from './pages/ResumeHistoryPage';

function App(){

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/verify-email' element={<EmailVerification />} />
          <Route path="/analysis/:resumeId" element={<ResumeAnalysisPage />}/>
          <Route path="/history" element={<ResumeHistoryPage />}/>
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  )
}
export default App
