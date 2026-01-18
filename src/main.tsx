import { StrictMode } from 'react'
import * as ReactDOMClient from 'react-dom/client'
import './index.css'
import 'katex/dist/katex.min.css';
import App from './App.tsx'

// React 19 / Vite interop safety check
const createRoot = ReactDOMClient.createRoot || (ReactDOMClient as any).default?.createRoot;

if (!createRoot) {
  console.error('Failed to find createRoot in react-dom/client', ReactDOMClient);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
