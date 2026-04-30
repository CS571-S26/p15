import { useMemo, useState } from 'react'
import { Badge, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import RequestSampleModal from '../components/RequestSampleModal'
import { useScentSwap } from '../../context/ScentSwapContext'

export default function CommunityPage() {
  const { fragrances, getOwnersForFragrance, getFragranceById } = useScentSwap()
  const [radius, setRadius] = useState('15')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [selectedPairing, setSelectedPairing] = useState(null)

  const owners = useMemo(() => {
    const merged = fragrances.flatMap((fragrance) => (
      getOwnersForFragrance(fragrance.id).map((owner) => ({
        ...owner,
        fragrance,
      }))
    ))

    return merged.filter((entry) => {
      const withinRadius = entry.distance <= Number(radius)
      const matchesVerification = !verifiedOnly || entry.verified
      return withinRadius && matchesVerification
    })
  }, [fragrances, getOwnersForFragrance, radius, verifiedOnly])

  const uniqueMembers = useMemo(() => {
    const map = new Map()

    owners.forEach((entry) => {
      if (!map.has(entry.id)) {
        map.set(entry.id, {
          id: entry.id,
          name: entry.name,
          city: entry.city,
          distance: entry.distance,
          verified: entry.verified,
          rating: entry.rating,
          responseTime: entry.responseTime,
          bio: entry.bio,
          meetupSpot: entry.meetupSpot,
          collection: [],
        })
      }

      map.get(entry.id).collection.push(entry.ownedItem)
    })

    return [...map.values()].sort((a, b) => a.distance - b.distance)
  }, [owners])

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <section className="mb-5">
        <div className="section-header mb-4">
          <p className="eyebrow mb-2">Community sampling</p>
          <h1 className="mb-3">Browse nearby collectors and request from their shelves directly</h1>
          <p className="text-secondary mb-0">
            View member collections, compare sampling preferences, and request from a specific bottle.
          </p>
        </div>

        <Card className="glass-surface">
          <Card.Body>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group controlId="radius-filter">
                  <Form.Label>Distance radius</Form.Label>
                  <Form.Select value={radius} onChange={(event) => setRadius(event.target.value)}>
                    <option value="5">Within 5 miles</option>
                    <option value="10">Within 10 miles</option>
                    <option value="15">Within 15 miles</option>
                    <option value="25">Within 25 miles</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="verified-filter"
                  label="Show verified members only"
                  checked={verifiedOnly}
                  onChange={(event) => setVerifiedOnly(event.target.checked)}
                />
              </Col>
              <Col md={4}>
                <div className="mini-stat-card h-100">
                  <span className="mini-stat-label">Visible pairings</span>
                  <strong>{owners.length} sample opportunities</strong>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </section>

      <section className="mb-5">
        <div className="section-header mb-4">
          <p className="eyebrow mb-2">Members nearby</p>
          <h2 className="mb-0">Collectors open to requests</h2>
        </div>
        <Row className="g-4">
          {uniqueMembers.map((member) => (
            <Col xl={6} key={member.id}>
              <Card className="glass-surface h-100">
                <Card.Body>
                  <div className="section-heading-row align-items-start mb-3">
                    <div>
                      <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                        <Card.Title className="mb-0">{member.name}</Card.Title>
                        {member.verified ? <Badge bg="success">Verified</Badge> : null}
                        <span className="text-secondary small">{member.distance} miles away</span>
                      </div>
                      <Card.Subtitle className="text-secondary mb-2">
                        {member.city} · {member.responseTime} average response
                      </Card.Subtitle>
                      <p className="text-secondary mb-0">{member.bio}</p>
                    </div>
                    <div className="mini-stat-card text-center">
                      <span className="mini-stat-label">Meet-up spot</span>
                      <strong>{member.meetupSpot}</strong>
                    </div>
                  </div>

                  <div className="community-shelf">
                    {member.collection.map((item) => {
                      const fragrance = getFragranceById(item.fragranceId)

                      return (
                        <div key={`${member.id}-${item.fragranceId}`} className="owner-shelf-item">
                          <div>
                            <strong>{fragrance.name}</strong>
                            <p className="text-secondary mb-1 small">
                              {fragrance.brand} · {item.sampleFormat} · {item.condition}
                            </p>
                            <small className="text-secondary">Bottle {item.bottleMl} ml</small>
                          </div>
                          <div className="action-row end">
                            <Button as={Link} to={`/fragrances/${fragrance.slug}`} size="sm" variant="outline-dark">
                              View notes
                            </Button>
                            <Button
                              size="sm"
                              variant="dark"
                              onClick={() => setSelectedPairing({ fragrance, owner: { ...member, ownedItem: item } })}
                            >
                              Request
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </section>

      <section>
        <Card className="cta-panel border-0">
          <Card.Body className="p-4 p-lg-5">
            <Row className="g-4 align-items-center">
              <Col lg={8}>
                <p className="eyebrow mb-2">Reverse discovery flow</p>
                <h2 className="mb-3">Users can also start with a member collection, then inspect notes and profile.</h2>
                <p className="text-secondary mb-0">
                  That means discovery works both ways: fragrance-first from the catalog, or owner-first from the community shelf.
                  Both routes end in the same sample request flow.
                </p>
              </Col>
              <Col lg={4} className="text-lg-end">
                <Button as={Link} to="/explore" variant="dark">
                  Explore by fragrance first
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </section>

      <RequestSampleModal
        show={Boolean(selectedPairing)}
        onHide={() => setSelectedPairing(null)}
        fragrance={selectedPairing?.fragrance}
        owner={selectedPairing?.owner}
      />
    </Container>
  )
}
