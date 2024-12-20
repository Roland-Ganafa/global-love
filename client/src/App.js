import React, { useEffect, useState } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import theme from './theme';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes';
import { routerConfig } from './routerConfig';

function App() {
  const [backendStatus, setBackendStatus] = useState('Checking...');

  useEffect(() => {
    // Since we don't have a deployed backend yet, let's just show a message
    setBackendStatus('Backend not connected - Development mode');
    
    // Uncomment and update this when you have a deployed backend
    /*
    const apiUrl = process.env.NODE_ENV === 'production'
      ? 'https://your-production-backend-url.com/api/test'
      : 'http://localhost:8080/api/test';

    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        setBackendStatus(data.message || 'Connected to backend!');
      })
      .catch(error => {
        setBackendStatus('Backend not connected - Development mode');
        console.log('Backend not connected:', error);
      });
    */
  }, []);

  return (
    <Router future={routerConfig.future}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <SocketProvider>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h1>Global Love</h1>
              <p>Backend Status: {backendStatus}</p>
            </div>
            <AppRoutes />
            <ToastContainer
              position="bottom-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
