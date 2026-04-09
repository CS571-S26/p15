import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'
import { ScentSwapProvider } from '../context/ScentSwapContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ScentSwapProvider>
        <App />
      </ScentSwapProvider>
    </HashRouter>
  </StrictMode>,
)