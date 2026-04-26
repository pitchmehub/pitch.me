import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { startKeepAlive } from './lib/keepAlive'
import './styles/modal.css'

startKeepAlive()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
