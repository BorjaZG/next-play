import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { ConfirmProvider } from './hooks/useConfirm.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfirmProvider>
      <App />
      <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#1c2228',
          color: '#f3f4f6',
          border: '1px solid #2c3440',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#00e054', secondary: '#1c2228' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#1c2228' } },
      }}
    />
    </ConfirmProvider>
  </React.StrictMode>,
)