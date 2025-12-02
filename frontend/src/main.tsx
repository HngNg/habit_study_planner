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
        style: {
          background: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          border: '1px solid var(--bg-card)',
          borderRadius: 'var(--radius-md)',
        },
        success: {
          iconTheme: {
            primary: 'var(--success)',
            secondary: 'var(--text-primary)',
          },
        },
      }}
    />
  </StrictMode>,
)
