import { useMemo, useState } from 'react'
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
  email: '',
  password: '',
}

const blankRegister = {
  name: '',
  email: '',
  city: '',
  password: '',
  confirmPassword: '',
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
  const [submitting, setSubmitting] = useState(false)

  const demoEnabled = useMemo(
    () => Boolean(import.meta.env.VITE_DEMO_EMAIL && import.meta.env.VITE_DEMO_PASSWORD),
    [],
  )

  const updateForm = (setter) => (event) => {
    const { name, value } = event.target
    setter((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSignInSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    await signIn(signInForm)
    setSubmitting(false)
    setSignInForm(blankSignIn)
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()

    if (registerForm.password !== registerForm.confirmPassword) {
      return
    }

    setSubmitting(true)
    await createAccount(registerForm)
    setSubmitting(false)
    setRegisterForm(blankRegister)
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
          Real accounts now live in Supabase Auth, with collections, favorites, requests, and added
          fragrances stored in Postgres.
        </p>

        <Row className="g-3 mb-4">
          <Col sm={6}>
            <div className="mini-stat-card h-100">
              <span className="mini-stat-label">What unlocks</span>
              <ul className="small text-secondary mb-0 ps-3">
                <li>Saved fragrances</li>
                <li>Persistent collection</li>
                <li>Real cross-device login</li>
                <li>Permanent custom fragrances</li>
              </ul>
            </div>
          </Col>

          <Col sm={6}>
            <div className="mini-stat-card h-100">
              <span className="mini-stat-label">Demo login</span>
              <p className="small text-secondary mb-3">
                Use a real seeded demo account if you configured demo env variables.
              </p>
              <Button
                variant="dark"
                className="w-100"
                onClick={signInDemo}
                disabled={!demoEnabled || submitting}
              >
                {demoEnabled ? 'Use demo account' : 'Demo not configured'}
              </Button>
            </div>
          </Col>
        </Row>

        <Tabs defaultActiveKey="signin" className="mb-3 auth-tabs">
          <Tab eventKey="signin" title="Sign in">
            <Form onSubmit={handleSignInSubmit} className="mt-3">
              <Form.Group className="mb-3" controlId="signin-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={signInForm.email}
                  onChange={updateForm(setSignInForm)}
                  placeholder="you@example.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="signin-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={signInForm.password}
                  onChange={updateForm(setSignInForm)}
                  placeholder="••••••••"
                  required
                />
              </Form.Group>

              <Button type="submit" variant="dark" className="w-100" disabled={submitting}>
                Sign in
              </Button>
            </Form>
          </Tab>

          <Tab eventKey="register" title="Create account">
            <Form onSubmit={handleRegisterSubmit} className="mt-3">
              <Form.Group className="mb-3" controlId="register-name">
                <Form.Label>Display name</Form.Label>
                <Form.Control
                  name="name"
                  value={registerForm.name}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="Alex Mercer"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="register-email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={registerForm.email}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="alex@example.com"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="register-city">
                <Form.Label>City</Form.Label>
                <Form.Control
                  name="city"
                  value={registerForm.city}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="Madison, WI"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="register-password">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={registerForm.password}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="At least 8 characters"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="register-confirm-password">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={registerForm.confirmPassword}
                  onChange={updateForm(setRegisterForm)}
                  placeholder="Repeat password"
                  required
                  isInvalid={
                    Boolean(registerForm.confirmPassword)
                    && registerForm.confirmPassword !== registerForm.password
                  }
                />
                <Form.Control.Feedback type="invalid">
                  Passwords must match.
                </Form.Control.Feedback>
              </Form.Group>

              <Button type="submit" variant="dark" className="w-100" disabled={submitting}>
                Create account
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  )
}