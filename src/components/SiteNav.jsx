import { useState } from 'react'
import {
  Badge,
  Button,
  Container,
  Form,
  Nav,
  Navbar,
} from 'react-bootstrap'
import { NavLink, useNavigate } from 'react-router-dom'
import { useScentSwap } from '../../context/ScentSwapContext'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/collection', label: 'My Collection' },
  { to: '/community', label: 'Community' },
  { to: '/about', label: 'About & Support' },
]

export default function SiteNav() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const {
    currentUser,
    incomingRequests,
    favoriteIds,
    setAuthModalOpen,
    signOut,
  } = useScentSwap()

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const trimmed = query.trim()
    navigate(trimmed ? `/explore?q=${encodeURIComponent(trimmed)}` : '/explore')
  }

  return (
    <Navbar expand="xl" className="site-navbar sticky-top" variant="dark">
      <Container fluid="lg">
        <Navbar.Brand as={NavLink} to="/" className="brand-mark">
          <span className="brand-orb" />
          <span>
            <strong>ScentSwap</strong>
            <small>sample before the full bottle</small>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav" className="align-items-center gap-3">
          <Nav className="me-auto">
            {navItems.map((item) => (
              <Nav.Link
                key={item.to}
                as={NavLink}
                to={item.to}
                end={item.to === '/'}
                className="nav-link-custom"
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <Form className="nav-search d-flex" onSubmit={handleSearchSubmit}>
            <Form.Control
              aria-label="Search fragrances"
              placeholder="Search notes, brands, vibes..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </Form>

          <div className="d-flex align-items-center gap-2 flex-wrap justify-content-end">
            <Badge bg="light" text="dark" pill className="px-3 py-2 nav-pill">
              {favoriteIds.length} saved
            </Badge>
            <Badge bg="light" text="dark" pill className="px-3 py-2 nav-pill">
              {incomingRequests.filter((request) => request.status === 'Pending').length} inbox
            </Badge>
            {currentUser ? (
              <>
                <Button variant="outline-light" size="sm" onClick={() => navigate('/collection')}>
                  {currentUser.name.split(' ')[0]}
                </Button>
                <Button variant="light" size="sm" onClick={signOut}>
                  Sign out
                </Button>
              </>
            ) : (
              <Button variant="light" size="sm" onClick={() => setAuthModalOpen(true)}>
                Sign in
              </Button>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
