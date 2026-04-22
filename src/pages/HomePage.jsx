import { Badge, Button, Card, Col, Container, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import heroGraphic from '../../hero.png'
import FragranceCard from '../components/FragranceCard'
import { useScentSwap } from '../../context/ScentSwapContext'

export default function HomePage() {
  const { fragrances, stats, currentUser } = useScentSwap()

  const featured = fragrances.slice(0, 4)

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <section className="hero-shell mb-5">
        <Row className="align-items-center g-4 g-xl-5">
          <Col lg={6}>
            <Badge bg="light" text="dark" pill className="hero-badge mb-3">
              Interactive fragrance sampling + community trust
            </Badge>
            <h1 className="display-3 fw-bold mb-3">
              Test fragrances with real people before the full bottle commitment.
            </h1>
            <p className="lead text-secondary mb-4">
              ScentSwap turns fragrance shopping into a smarter local experience. Explore detailed note pyramids,
              save scents to your shortlist, and request a sample from nearby collectors who already own the bottle.
            </p>
            <div className="d-flex gap-3 flex-wrap mb-4">
              <Button as={Link} to="/explore" variant="dark" size="lg">
                Explore catalog
              </Button>
              <Button as={Link} to="/community" variant="outline-dark" size="lg">
                Browse nearby owners
              </Button>
            </div>
            <div className="hero-chip-row">
              <span>Detailed scent notes</span>
              <span>Personal collection locker</span>
              <span>Local sample requests</span>
              <span>Support and safety guidance</span>
            </div>
          </Col>
          <Col lg={6}>
            <div className="hero-visual glass-surface">
              <div className="hero-visual-copy">
                <p className="eyebrow">Product vision</p>
                <h2 className="h3">A social layer on top of fragrance discovery</h2>
                <p className="text-secondary mb-4">
                  Your uploaded starter concept becomes a living interface: catalog, collection, community requests,
                  and a trust-focused flow for trying before buying.
                </p>
                <div className="hero-stat-grid">
                  <div>
                    <span className="eyebrow">Catalog</span>
                    <strong>{stats.totalFragrances} scents in catalog</strong>
                  </div>
                  <div>
                    <span className="eyebrow">Nearby owners</span>
                    <strong>{stats.localOwners} within 10 miles</strong>
                  </div>
                  <div>
                    <span className="eyebrow">Active samples</span>
                    <strong>{stats.activeSamples} pending</strong>
                  </div>
                  <div>
                    <span className="eyebrow">Your status</span>
                    <strong>{currentUser ? 'Signed in' : 'Browsing guest'}</strong>
                  </div>
                </div>
              </div>
              <img src={heroGraphic} alt="Abstract layered product illustration" className="hero-graphic" />
            </div>
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <Row className="g-4">
          {[
            {
              title: '1. Explore with context',
              body: 'Every fragrance includes top, middle, and base notes, scent family, use case, and blind-buy risk so users understand what they are testing.',
            },
            {
              title: '2. Build your collection',
              body: 'Users add bottles they already own, choose whether they are open to sampling, and manage visibility with one tap.',
            },
            {
              title: '3. Request from nearby owners',
              body: 'Community members who own a fragrance appear on the detail page so you can send a respectful sample request before buying.',
            },
          ].map((step) => (
            <Col md={4} key={step.title}>
              <Card className="glass-surface h-100 info-card">
                <Card.Body>
                  <p className="eyebrow mb-2">Core flow</p>
                  <Card.Title>{step.title}</Card.Title>
                  <Card.Text className="text-secondary mb-0">{step.body}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="mb-5">
        <div className="section-header d-flex justify-content-between align-items-end gap-3 mb-4">
          <div>
            <p className="eyebrow mb-2">Featured catalog</p>
            <h2 className="mb-0">Popular scents people want to test first</h2>
          </div>
          <Button as={Link} to="/explore" variant="outline-dark">
            View full catalog
          </Button>
        </div>
        <Row className="g-4">
          {featured.map((fragrance) => (
            <Col md={6} xl={3} key={fragrance.id}>
              <FragranceCard fragrance={fragrance} compact />
            </Col>
          ))}
        </Row>
      </section>

      <section>
        <Card className="cta-panel border-0">
          <Card.Body className="p-4 p-lg-5">
            <Row className="align-items-center g-4">
              <Col lg={8}>
                <p className="eyebrow mb-2">Why this product works</p>
                <h2 className="mb-3">It solves the regret of blind buying with a community-first sampling loop.</h2>
                <p className="text-secondary mb-0">
                  Instead of guessing from influencer reviews or buying an expensive decant, users see real nearby owners,
                  send requests, and compare scent profiles before making a purchase.
                </p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <div className="d-flex flex-column gap-2 align-items-lg-end">
                  <Button as={Link} to="/collection" variant="dark">
                    Open my collection
                  </Button>
                  <Button as={Link} to="/about" variant="outline-dark">
                    Read support & safety tips
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </section>
    </Container>
  )
}
