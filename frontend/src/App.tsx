import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Chat from './pages/Chat'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import About from './pages/About'
import Root from './pages/Root'
import ProtectedRoute from './components/ProtectedRoute'
import { ChatProvider } from './contexts/ChatContext'
import { CallProvider } from './contexts/CallContext'

const App = () => {
  return (
    <BrowserRouter>
      <ChatProvider>
        <CallProvider>
          <Routes>
            <Route path="/" element={<Root />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
          </Routes>
        </CallProvider>
      </ChatProvider>
    </BrowserRouter>
  )
}

export default App