import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.tsx'
import DatePage from './pages/DatePage.tsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/date" element={<DatePage />} />
    </Routes>
  )
}
