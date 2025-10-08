import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import './index.css';
import App from './App';
import Topbar from './Pages/TopBar';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Wrap here */}
      <Topbar />
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
