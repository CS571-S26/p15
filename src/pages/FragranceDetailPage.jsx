import { useMemo, useState } from 'react'
import {
  Accordion,
  Badge,
  Button,
  Card,
  Col,
  Container,
  ProgressBar,
  Row,
  Stack,
} from 'react-bootstrap'
import { Link, useNavigate, useParams } from 'react-router-dom'
import NotePyramid from '../components/NotePyramid'
import RequestSampleModal from '../components/RequestSampleModal'
import CreateFragranceModal from '../components/CreateFragranceModal'
import { useScentSwap } from '../../context/ScentSwapContext'

function humanizeSlug(slug = '') {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(' ')
}

export default function FragranceDetailPage() {
  const navigate = useNavigate()
  const {
    fragrances,
    collectionIds,
    favoriteIds,
    toggleFavorite,
    addToCollection,
    getOwnersForFragrance,
  } = useScentSwap()

  const { slug } = useParams()
  const [selectedOwner, setSelectedOwner] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const fragrance = fragrances.find((item) => item.slug === slug)

  const owners = useMemo(() => {
    if (!fragrance) {
      return []
    }

    return getOwnersForFragrance(fragrance.id)
  }, [fragrance, getOwnersForFragrance])

  if (!fragrance) {
    return (
      <Container fluid="lg" className="py-5 text-center">
        <p className="eyebrow mb-2">Catalog gap</p>
        <h1 className="mb-3">Fragrance not found</h1>
        <p className="text-secondary mb-4">
          That scent is not in the catalog yet. You can go back to Explore or create it now.
        </p>
        <div className="action-row justify-content-center">
          <Button as={Link} to="/explore" variant="outline-secondary">
            Return to explore
          </Button>
          <Button variant="dark" onClick={() => setShowCreateModal(true)}>
            Create this fragrance
          </Button>
        </div>

        <CreateFragranceModal
          show={showCreateModal}
          onHide={() => setShowCreateModal(false)}
          initialQuery={humanizeSlug(slug)}
          onCreated={(createdFragrance) => navigate(`/fragrances/${createdFragrance.slug}`)}
        />
      </Container>
    )
  }

  const saved = favoriteIds.includes(fragrance.id)
  const owned = collectionIds.includes(fragrance.id)

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <section className="mb-4">
        <p className="eyebrow mb-2">Fragrance profile</p>
        <Row className="g-4 align-items-start">
          <Col xl={7}>
            <Card className="glass-surface detail-hero">
              <Card.Body>
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                  <div>
                    <p className="eyebrow mb-1">{fragrance.brand}</p>
                    <h1 className="display-5 mb-2">{fragrance.name}</h1>
                    <p className="lead text-secondary mb-3">{fragrance.vibe}</p>
                    <Stack direction="horizontal" gap={2} className="flex-wrap">
                      <Badge bg="light" text="dark" pill>{fragrance.family}</Badge>
                      <Badge bg="light" text="dark" pill>{fragrance.concentration}</Badge>
                      <Badge bg="light" text="dark" pill>{fragrance.longevity}</Badge>
                    </Stack>
                  </div>
                  <div className="fragrance-avatar large">
                    <span>{fragrance.brand.slice(0, 1)}</span>
                    <small>{fragrance.name.slice(0, 2).toUpperCase()}</small>
                  </div>
                </div>

                <p className="text-secondary mb-4">{fragrance.description}</p>

                <Row className="g-3 mb-4">
                  {[{
                    label: 'Community fit',
                    value: `${fragrance.communityScore}%`,
                  }, {
                    label: 'Blind-buy risk',
                    value: `${fragrance.blindBuyRisk}%`,
                  }, {
                    label: 'Nearby owners',
                    value: owners.length,
                  }, {
                    label: 'Best for',
                    value: fragrance.idealFor[0],
                  }].map((stat) => (
                    <Col sm={6} md={3} key={stat.label}>
                      <div className="mini-stat-card h-100">
                        <span className="mini-stat-label">{stat.label}</span>
                        <strong>{stat.value}</strong>
                      </div>
                    </Col>
                  ))}
                </Row>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="eyebrow">Blind-buy confidence</span>
                    <strong>{100 - fragrance.blindBuyRisk}%</strong>
                  </div>
                  <ProgressBar now={100 - fragrance.blindBuyRisk} className="risk-progress" />
                </div>

                <Stack direction="horizontal" gap={2} className="flex-wrap mb-4">
                  {fragrance.accords.map((accord) => (
                    <span key={accord} className="note-chip">
                      {accord}
                    </span>
                  ))}
                </Stack>

                <div className="action-row">
                  <Button variant="dark" onClick={() => addToCollection(fragrance.id)}>
                    {owned ? 'Already in collection' : 'Add to my collection'}
                  </Button>
                  <Button
                    variant={saved ? 'outline-dark' : 'outline-secondary'}
                    onClick={() => toggleFavorite(fragrance.id)}
                  >
                    {saved ? 'Saved to shortlist' : 'Save fragrance'}
                  </Button>
                  {owners[0] ? (
                    <Button variant="outline-primary" onClick={() => setSelectedOwner(owners[0])}>
                      Request from nearest owner
                    </Button>
                  ) : null}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xl={5}>
            <NotePyramid fragrance={fragrance} />
          </Col>
        </Row>
      </section>

      <section className="mb-5">
        <Row className="g-4 align-items-start">
          <Col lg={7}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <div className="section-header mb-4">
                  <p className="eyebrow mb-2">Nearby sampling</p>
                  <h2 className="mb-0">Community members who own this fragrance</h2>
                </div>
                {owners.length > 0 ? owners.map((owner) => (
                  <div key={owner.id} className="owner-row">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
                        <strong>{owner.name}</strong>
                        {owner.verified ? <Badge bg="success">Verified</Badge> : <Badge bg="secondary">Community</Badge>}
                        <span className="text-secondary small">{owner.distance} miles away</span>
                      </div>
                      <p className="text-secondary mb-1">
                        {owner.ownedItem.sampleFormat} · bottle {owner.ownedItem.bottleMl} ml · {owner.ownedItem.condition}
                      </p>
                      <small className="text-secondary">
                        Response time {owner.responseTime} · Meet-up spot {owner.meetupSpot}
                      </small>
                    </div>
                    <Button variant="dark" onClick={() => setSelectedOwner(owner)}>
                      Request sample
                    </Button>
                  </div>
                )) : (
                  <div className="mini-stat-card">
                    <strong>No sample owners yet</strong>
                    <p className="text-secondary mb-0">
                      Add the fragrance to your collection to be first in the area offering samples.
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={5}>
            <Card className="glass-surface h-100">
              <Card.Body>
                <p className="eyebrow mb-2">Why people sample this</p>
                <h2 className="h4 mb-3">Before they commit to a bottle</h2>
                <p className="text-secondary mb-4">{fragrance.featuredReason}</p>
                <div className="mb-3">
                  <span className="eyebrow d-block mb-2">Best occasions</span>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {fragrance.idealFor.map((occasion) => (
                      <span key={occasion} className="note-pill">{occasion}</span>
                    ))}
                  </Stack>
                </div>
                <div>
                  <span className="eyebrow d-block mb-2">Best seasons</span>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {fragrance.seasons.map((season) => (
                      <span key={season} className="note-pill text-capitalize">{season}</span>
                    ))}
                  </Stack>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section>
        <Accordion alwaysOpen>
          <Accordion.Item eventKey="0">
            <Accordion.Header>How ScentSwap helps reduce blind buys</Accordion.Header>
            <Accordion.Body>
              Sampling works better when note structure, wearer context, and community access exist in one place.
              Use the scent profile and nearby owner list to decide whether a fragrance is worth trying locally.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>Suggested etiquette for sample requests</Accordion.Header>
            <Accordion.Body>
              Be specific about why you want to sample, respect bottle handling, and offer a convenient meet-up window.
              Clear communication leads to faster approvals and healthier local communities.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2">
            <Accordion.Header>More ways ScentSwap can help</Accordion.Header>
            <Accordion.Body>
              Future tools could include geolocation, image uploads, in-app messaging, verified swaps, user reviews,
              and decant shipping support.
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </section>

      <RequestSampleModal
        show={Boolean(selectedOwner)}
        onHide={() => setSelectedOwner(null)}
        fragrance={fragrance}
        owner={selectedOwner}
      />
    </Container>
  )
}
