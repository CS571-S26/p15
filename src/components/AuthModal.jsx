import { useState } from 'react'
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
  Tab,
  Tabs,
} from 'react-bootstrap'
import { useScentSwap } from '../../context/ScentSwapContext'

const blankSignIn = {
  name: '',
  email: '',
  city: '',
}

const blankRegister = {
  name: '',
  email: '',
  city: '',
}

export default function AuthModal() {
  const {
    authModalOpen,
    setAuthModalOpen,
    signIn,
    signInDemo,
    createAccount,
  } = useScentSwap()

  const [signInForm, setSignInForm] = useState(blankSignIn)
  const [registerForm, setRegisterForm] = useState(blankRegister)

  const handleSignInSubmit = (event) => {
    event.preventDefault()
    signIn(signInForm)
    setSignInForm(blankSignIn)
  }

  const handleRegisterSubmit = (event) => {
    event.preventDefault()
    createAccount(registerForm)
    setRegisterForm(blankRegister)
  }

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target
    setter((current) => ({
      ...current,
      [name]: value,
    }))
  }

  return (
    <Modal
      show={authModalOpen}
      onHide={() => setAuthModalOpen(false)}
      centered
      contentClassName="glass-surface"
    >
      <Modal.Header closeButton>
        <Modal.Title>Join the sampling community</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="text-secondary mb-4">
          Sign in to save fragrances, manage your collection, and request samples from nearby owners.
        </p>

        <Row className="g-3 mb-4">
          <Col sm={6}>
            <div className="mini-stat-card h-100">
              <span className="mini-stat-label">Try instantly</span>
              <strong className="d-block fs-5 mb-2">Demo login</strong>
              <p className="small text-secondary mb-3">
                Jump straight into a fully populated profile with requests, favorites, and a sample-ready collection.
              </p>
              <Button variant="dark" className="w-100" onClick={signInDemo}>
                Use demo account
              </Button>
            </div>
          </Col>
          <Col sm={6}>
            <div className="mini-stat-card h-100">
              <span className="mini-stat-label">What unlocks</span>
              <ul className="small text-secondary mb-0 ps-3">
                <li>Save fragrance wishlists</li>
                <li>Show what you own</li>
                <li>Approve or decline requests</li>
                <li>Get support and safety tips</li>
              </ul>
            </div>
          </Col>
        </Row>

        <Tabs defaultActiveKey="signin" className="mb-3 auth-tabs">
          <Tab eventKey="signin" title="Sign in">
            <Form onSubmit={handleSignInSubmit} className="mt-3">
              <Form.Group className="mb-3" controlId="signin-name">
                <Form.Label>Display name</Form.Label>
                <Form.Control
                  name="name"
                  value={signInForm.name}
                  onChange={updateForm(setSignInForm)}
                  placeholder="Alex Mercer"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="signin-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={signInForm.email}
                  onChange={updateForm(setSignInForm)}
                  placeholder="alex@scentswap.app"
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="signin-city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  name="city"
                  value={signInForm.city}
                  onChange={updateForm(setSignInForm)}
                  placeholder="Madison, WI"
                />
              </Form.Group>
              <Button type="submit" variant="dark" className="w-100">
                Sign in locally
              </Button>
            </Form>
          </Tab>
          <Tab eventKey="register" title="Create account">
            <Form onSubmit={handleRegisterSubmit} className="mt-3">
              <Form.Group className="mb-3" controlId="register-name">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  required
                  name="name"
                  value={registerForm.name}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="Your name"
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="register-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="you@example.com"
                />
              </Form.Group>
              <Form.Group className="mb-4" controlId="register-city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  required
                  name="city"
                  value={registerForm.city}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="Madison, WI"
                />
              </Form.Group>
              <Button type="submit" variant="dark" className="w-100">
                Create demo account
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  )
}
