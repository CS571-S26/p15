import { Routes, Route } from 'react-router-dom'
import SiteNav from './components/SiteNav'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <>
      <SiteNav />
        <main className="container py-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
      </main>
    </>
  )
}