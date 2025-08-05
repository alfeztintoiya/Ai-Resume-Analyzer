import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'
import LandingPage from './pages/LandingPage';

function App(){

  return (
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  )
}
export default App
