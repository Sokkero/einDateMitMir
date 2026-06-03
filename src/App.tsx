import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DatePage from './pages/DatePage'

export default function App() {
  return (
    <div className="relative">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/date" element={<DatePage />} />
      </Routes>
    </div>
  )
}
