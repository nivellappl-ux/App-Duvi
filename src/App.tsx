import { StrictMode } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
    </StrictMode>
  );
}
