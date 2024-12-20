import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-url.com/api/test'  // You'll need to update this with your deployed backend URL
      : 'http://localhost:8080/api/test';

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setBackendStatus(data.message || 'Connected to backend!');
      })
      .catch(error => {
        setBackendStatus('Error connecting to backend');
        console.error('Backend connection error:', error);
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <SocketProvider>
          <Router basename="/global-love">
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Global Love</h1>
              <p>Backend Status: {backendStatus}</p>
            </div>
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
