import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap'

export default function HomePage() {
  return (
    <Container>
      <section className="py-5">
        <Row className="align-items-center g-4">
          <Col md={7}>
            <Badge bg="dark" className="mb-3">CS571 Project Preview</Badge>
            <h1 className="display-4 fw-bold">Trade fragrances with confidence.</h1>
            <p className="lead text-muted">
              ScentSwap is a fragrance exchange platform where users can discover perfumes,
              post bottles for swap, and connect with others who share their taste.
            </p>
            <div className="d-flex gap-3 flex-wrap mt-4">
              <Button variant="dark" size="lg">Browse Listings</Button>
              <Button variant="outline-dark" size="lg">Learn More</Button>
            </div>
          </Col>

          <Col md={5}>
            <Card className="shadow-sm border-0">
              <Card.Body>
                <h2 className="h4">Project idea</h2>
                <p className="mb-2">
                  Our website helps fragrance lovers:
                </p>
                <ul>
                  <li>list perfumes they want to trade</li>
                  <li>search by notes, brand, or scent family</li>
                  <li>save favorites</li>
                  <li>contact other users about swaps</li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="py-4">
        <h2 className="mb-4">Core features</h2>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Browse scents</Card.Title>
                <Card.Text>
                  Explore fragrance listings by category, notes, brand, or popularity.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Swap requests</Card.Title>
                <Card.Text>
                  Users can request trades and compare bottle conditions before committing.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>Save favorites</Card.Title>
                <Card.Text>
                  Bookmark interesting fragrances and return to them later.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </section>

      <section className="py-4">
        <Card className="bg-light border-0 shadow-sm">
          <Card.Body>
            <h2 className="h3">Ch</h2>
            <p className="mb-0">
               navigation, multiple pages, and visual design direction.
            </p>
          </Card.Body>
        </Card>
      </section>
    </Container>
  )
}