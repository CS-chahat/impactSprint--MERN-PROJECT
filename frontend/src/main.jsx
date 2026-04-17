import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import { GlobalModalProvider } from './GlobalModalContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalModalProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </GlobalModalProvider>
  </React.StrictMode>
)
