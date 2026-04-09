import { Route, Routes } from 'react-router-dom'
import { Toast, ToastContainer } from 'react-bootstrap'
import './App.css'
import SiteNav from './components/SiteNav'
import AuthModal from './components/AuthModal'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import FragranceDetailPage from './pages/FragranceDetailPage'
import CollectionPage from './pages/CollectionPage'
import CommunityPage from './pages/CommunityPage'
import AboutPage from './pages/AboutPage'
import { useScentSwap } from '../context/ScentSwapContext'

function NotFoundPage() {
  return (
    <main className="container py-5 text-center">
      <p className="eyebrow mb-2">404</p>
      <h1 className="mb-3">That page has drifted out of the scent trail.</h1>
      <p className="text-secondary mb-0">Try the catalog or head back home.</p>
    </main>
  )
}

export default function App() {
  const { toasts, dismissToast } = useScentSwap()

  return (
    <div className="app-shell">
      <SiteNav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/fragrances/:slug" element={<FragranceDetailPage />} />
        <Route path="/collection" element={<CollectionPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <AuthModal />

      <ToastContainer position="bottom-end" className="p-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            bg="dark"
            onClose={() => dismissToast(toast.id)}
            delay={3200}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">{toast.title}</strong>
            </Toast.Header>
            <Toast.Body className="text-white">{toast.body}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </div>
  )
}
