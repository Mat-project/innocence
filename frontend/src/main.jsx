import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'
/* import './styles/global.css';  */// Add this import
import { ThemeProvider } from './providers/ThemeProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="innovsence-theme">
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
