import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import LandingPage from './pages/LandingPage';
import EmailVerification from './components/EmailVerification';

function App(){

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/verify-email' element={<EmailVerification />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  )
}
export default App
