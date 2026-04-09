import { useState } from 'react'
import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
} from 'react-bootstrap'
import { SUPPORT_FAQS } from '../../data/mockData'
import { useScentSwap } from '../../context/ScentSwapContext'

const defaultForm = {
  type: 'Support',
  subject: '',
  message: '',
}

export default function AboutPage() {
  const { submitSupportTicket, supportTickets, resetDemo } = useScentSwap()
  const [form, setForm] = useState(defaultForm)

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    submitSupportTicket(form)
    setForm(defaultForm)
  }

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <section className="mb-5">
        <div className="section-header mb-4">
          <p className="eyebrow mb-2">About the platform</p>
          <h1 className="mb-3">A fragrance platform designed around smarter decisions, not regret.</h1>
          <p className="text-secondary mb-0">
            ScentSwap helps users understand how a fragrance smells, see who owns it nearby,
            and ask for a local sample before buying a full bottle.
          </p>
        </div>

        <Row className="g-4">
          <Col lg={7}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <h2 className="h4 mb-3">What this prototype now includes</h2>
                <ul className="text-secondary mb-0 ps-3">
                  <li>Authentication-inspired onboarding with demo account access</li>
                  <li>Catalog pages with searchable notes, accords, and profile details</li>
                  <li>Personal collection management with sampling visibility controls</li>
                  <li>User-to-user request workflows from fragrance pages and community shelves</li>
                  <li>Support and FAQ space for product education and help requests</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={5}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <h2 className="h4 mb-3">Safe sampling principles</h2>
                <ul className="text-secondary mb-0 ps-3">
                  <li>Meet in public places and keep communication respectful.</li>
                  <li>Share clear sample sizes and bottle handling expectations.</li>
                  <li>Mark fragrances unavailable if you do not want active requests.</li>
                  <li>Use request approvals to keep all exchanges intentional.</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <Row className="g-4 align-items-start">
          <Col lg={6}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <div className="section-header mb-4">
                  <p className="eyebrow mb-2">FAQ</p>
                  <h2 className="mb-0">Common questions</h2>
                </div>
                <Accordion alwaysOpen>
                  {SUPPORT_FAQS.map((item, index) => (
                    <Accordion.Item eventKey={String(index)} key={item.question}>
                      <Accordion.Header>{item.question}</Accordion.Header>
                      <Accordion.Body>{item.answer}</Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={6}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <div className="section-header mb-4">
                  <p className="eyebrow mb-2">Support</p>
                  <h2 className="mb-0">Contact the product team</h2>
                </div>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="support-type">
                    <Form.Label>Message type</Form.Label>
                    <Form.Select name="type" value={form.type} onChange={updateForm}>
                      <option>Support</option>
                      <option>Bug report</option>
                      <option>Feature request</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3" controlId="support-subject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      required
                      name="subject"
                      value={form.subject}
                      onChange={updateForm}
                      placeholder="Example: Trouble with sample request approvals"
                    />
                  </Form.Group>
                  <Form.Group className="mb-4" controlId="support-message">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      required
                      as="textarea"
                      rows={5}
                      name="message"
                      value={form.message}
                      onChange={updateForm}
                      placeholder="Tell us what happened, what you expected, or what would make the experience better."
                    />
                  </Form.Group>
                  <div className="d-flex gap-2 flex-wrap">
                    <Button type="submit" variant="dark">Submit ticket</Button>
                    <Button type="button" variant="outline-secondary" onClick={resetDemo}>
                      Reset demo data
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section>
        <div className="section-header mb-4">
          <p className="eyebrow mb-2">Recent local tickets</p>
          <h2 className="mb-0">Saved support history in this demo</h2>
        </div>
        <Row className="g-3">
          {supportTickets.length > 0 ? supportTickets.map((ticket) => (
            <Col md={6} xl={4} key={ticket.id}>
              <Card className="glass-surface h-100">
                <Card.Body>
                  <span className="status-pill status-approved mb-3 d-inline-flex">{ticket.type}</span>
                  <Card.Title>{ticket.subject}</Card.Title>
                  <Card.Subtitle className="text-secondary small mb-3">{ticket.createdAt}</Card.Subtitle>
                  <Card.Text className="text-secondary mb-0">{ticket.message}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          )) : (
            <Col>
              <Card className="glass-surface">
                <Card.Body>No support tickets yet. Submit the form above to test the flow.</Card.Body>
              </Card>
            </Col>
          )}
        </Row>
      </section>
    </Container>
  )
}
