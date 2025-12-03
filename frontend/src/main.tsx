import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        className: 'bg-white dark:bg-slate-900 text-text-primary border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg',
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#ffffff',
          },
        },
      }}
    />
  </StrictMode>,
)
