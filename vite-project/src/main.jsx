import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import YeahNahMaybe from './YeahNahMaybe.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <YeahNahMaybe />
  </StrictMode>,
)
