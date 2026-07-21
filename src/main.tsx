import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './ga-bootstrap'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(220 15% 12%)',
          border: '1px solid hsl(220 10% 20%)',
          color: 'hsl(220 15% 95%)',
        },
      }}
    />
  </StrictMode>,
)
