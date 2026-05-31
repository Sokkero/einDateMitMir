import { Routes, Route } from 'react-router-dom'
import LanguageToggle from './components/LanguageToggle'
import LandingPage from './pages/LandingPage'
import DatePage from './pages/DatePage'

export default function App() {
  return (
    <div className="relative">
      <header className="absolute right-4 top-4 z-10">
        <LanguageToggle />
      </header>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/date" element={<DatePage />} />
      </Routes>
    </div>
  )
}
