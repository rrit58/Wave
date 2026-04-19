import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Signin from './pages/SignIn.tsx'
import Signup from './pages/SignUp.tsx'
import About from './pages/About.tsx'
// import { ThemeProvider } from '@/components/theme-provider'

const RootRedirect = () => {
  const isAuthenticated = localStorage.getItem('wave_token') !== null
  return isAuthenticated ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />
}

const App = () => {
  return (
    // <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Signin />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/chat" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
    // </ThemeProvider>
  )
}

export default App