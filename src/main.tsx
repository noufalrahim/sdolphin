import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { HashRouter } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)

// Remove Preload loading screen
// @ts-ignore
window.postMessage({ payload: 'removeLoading' }, '*')

// Use contextBridge
(window as any).ipcRenderer.on('main-process-message', (_event: any, message: any) => {
  console.log(message)
})
