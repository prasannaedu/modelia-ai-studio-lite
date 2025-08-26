import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './ui/App'
import './styles.css'

// Register basic service worker for PWA bonus
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
