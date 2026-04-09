import { Button, Card, Col, Container, Form, Row, Tab, Tabs } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useScentSwap } from '../../context/ScentSwapContext'

function RequestCard({ title, subtitle, message, status, children }) {
  return (
    <Card className="glass-surface mb-3">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-2">
          <div>
            <Card.Title className="mb-1">{title}</Card.Title>
            <Card.Subtitle className="text-secondary">{subtitle}</Card.Subtitle>
          </div>
          <span className={`status-pill status-${status.toLowerCase()}`}>{status}</span>
        </div>
        <p className="text-secondary mb-3">{message}</p>
        {children}
      </Card.Body>
    </Card>
  )
}

export default function CollectionPage() {
  const {
    currentUser,
    collection,
    fragrances,
    incomingRequests,
    outgoingRequests,
    removeFromCollection,
    toggleCollectionSharing,
    updateRequestStatus,
    getFragranceById,
    getUserById,
  } = useScentSwap()

  const suggestions = fragrances.filter(
    (fragrance) => !collection.some((item) => item.fragrance.id === fragrance.id),
  ).slice(0, 3)

  if (!currentUser) {
    return (
      <Container fluid="lg" className="py-5 text-center">
        <h1 className="mb-3">Your collection is waiting</h1>
        <p className="text-secondary mb-4">
          Sign in to manage your bottles, approve requests, and offer samples to nearby users.
        </p>
        <Button as={Link} to="/" variant="dark">Go home</Button>
      </Container>
    )
  }

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <section className="mb-5">
        <Row className="g-4">
          <Col xl={8}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <p className="eyebrow mb-2">Collector workspace</p>
                <h1 className="mb-3">{currentUser.name}&apos;s fragrance locker</h1>
                <p className="text-secondary mb-4">
                  Manage what you own, control whether each bottle is open for sampling, and keep track of inbound
                  and outbound requests from the community.
                </p>
                <Row className="g-3">
                  <Col sm={4}>
                    <div className="mini-stat-card h-100">
                      <span className="mini-stat-label">Bottle count</span>
                      <strong>{collection.length}</strong>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mini-stat-card h-100">
                      <span className="mini-stat-label">Open for samples</span>
                      <strong>{collection.filter((item) => item.shareEnabled).length}</strong>
                    </div>
                  </Col>
                  <Col sm={4}>
                    <div className="mini-stat-card h-100">
                      <span className="mini-stat-label">Pending inbox</span>
                      <strong>{incomingRequests.filter((request) => request.status === 'Pending').length}</strong>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col xl={4}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <p className="eyebrow mb-2">Account snapshot</p>
                <h2 className="h4 mb-3">Sampling-ready profile</h2>
                <ul className="text-secondary mb-0 ps-3">
                  <li>{currentUser.city}</li>
                  <li>Average response time: {currentUser.responseTime}</li>
                  <li>Meet-up preference: {currentUser.meetupSpot}</li>
                  <li>Trust rating: {currentUser.rating} / 5</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <div className="section-header d-flex justify-content-between align-items-end gap-3 mb-4">
          <div>
            <p className="eyebrow mb-2">My bottles</p>
            <h2 className="mb-0">Collection management</h2>
          </div>
          <Button as={Link} to="/explore" variant="outline-dark">
            Add more fragrances
          </Button>
        </div>
        <Row className="g-4">
          {collection.map((item) => (
            <Col md={6} xl={4} key={item.fragrance.id}>
              <Card className="fragrance-card h-100">
                <Card.Body>
                  <p className="eyebrow mb-1">{item.fragrance.brand}</p>
                  <Card.Title>{item.fragrance.name}</Card.Title>
                  <Card.Subtitle className="text-secondary small mb-3">
                    {item.bottleMl} ml · {item.condition} · {item.sampleFormat}
                  </Card.Subtitle>
                  <p className="text-secondary mb-3">{item.fragrance.vibe}</p>

                  <Form.Check
                    type="switch"
                    id={`share-${item.fragrance.id}`}
                    className="mb-3"
                    label={item.shareEnabled ? 'Open for sampling' : 'Hidden from sample requests'}
                    checked={item.shareEnabled}
                    onChange={() => toggleCollectionSharing(item.fragrance.id)}
                  />

                  <div className="d-flex gap-2 flex-wrap">
                    <Button as={Link} to={`/fragrances/${item.fragrance.slug}`} variant="dark">
                      View profile
                    </Button>
                    <Button
                      variant="outline-danger"
                      onClick={() => removeFromCollection(item.fragrance.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section className="mb-5">
        <Card className="cta-panel border-0">
          <Card.Body>
            <div className="section-header mb-4">
              <p className="eyebrow mb-2">Suggested next adds</p>
              <h2 className="mb-0">Complete your lineup</h2>
            </div>
            <Row className="g-3">
              {suggestions.map((fragrance) => (
                <Col md={4} key={fragrance.id}>
                  <div className="mini-stat-card h-100">
                    <strong className="d-block mb-1">{fragrance.name}</strong>
                    <p className="text-secondary small mb-3">{fragrance.brand} · {fragrance.family}</p>
                    <Button as={Link} to={`/fragrances/${fragrance.slug}`} variant="outline-dark" size="sm">
                      View fragrance
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </Card.Body>
        </Card>
      </section>

      <section>
        <div className="section-header mb-4">
          <p className="eyebrow mb-2">Requests</p>
          <h2 className="mb-0">Sampling inbox and outbox</h2>
        </div>
        <Tabs defaultActiveKey="incoming" className="mb-4 auth-tabs">
          <Tab eventKey="incoming" title={`Incoming (${incomingRequests.length})`}>
            <div className="mt-4">
              {incomingRequests.length > 0 ? incomingRequests.map((request) => {
                const fragrance = getFragranceById(request.fragranceId)
                const requester = getUserById(request.requesterId)

                return (
                  <RequestCard
                    key={request.id}
                    title={fragrance.name}
                    subtitle={`Requested by ${requester?.name ?? 'Unknown'} · ${request.createdAt}`}
                    message={request.message}
                    status={request.status}
                  >
                    {request.status === 'Pending' ? (
                      <div className="d-flex gap-2 flex-wrap">
                        <Button variant="dark" onClick={() => updateRequestStatus(request.id, 'Approved')}>
                          Approve
                        </Button>
                        <Button variant="outline-danger" onClick={() => updateRequestStatus(request.id, 'Declined')}>
                          Decline
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline-secondary" onClick={() => updateRequestStatus(request.id, 'Completed')}>
                        Mark completed
                      </Button>
                    )}
                  </RequestCard>
                )
              }) : (
                <Card className="glass-surface"><Card.Body>No incoming requests yet.</Card.Body></Card>
              )}
            </div>
          </Tab>
          <Tab eventKey="outgoing" title={`Sent (${outgoingRequests.length})`}>
            <div className="mt-4">
              {outgoingRequests.length > 0 ? outgoingRequests.map((request) => {
                const fragrance = getFragranceById(request.fragranceId)
                const owner = getUserById(request.ownerId)

                return (
                  <RequestCard
                    key={request.id}
                    title={fragrance.name}
                    subtitle={`Sent to ${owner?.name ?? 'Unknown'} · ${request.createdAt}`}
                    message={request.message}
                    status={request.status}
                  />
                )
              }) : (
                <Card className="glass-surface"><Card.Body>No outgoing requests yet.</Card.Body></Card>
              )}
            </div>
          </Tab>
        </Tabs>
      </section>
    </Container>
  )
}
