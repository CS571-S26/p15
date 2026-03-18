import { Container, Card } from 'react-bootstrap'

export default function AboutPage() {
  return (
    <Container>
      <h1 className="mb-4">About ScentSwap</h1>

      <Card className="shadow-sm">
        <Card.Body>
          <p>
            ScentSwap is a student-designed web application focused on helping fragrance
            enthusiasts trade and discover perfumes in a simple, organized way.
          </p>
          <p>
            The long-term goal is to support listing creation, user interaction, favorites,
            and a clean browsing experience using React, React Router, and React Bootstrap.
          </p>
          <p className="mb-0">
            This check-in version demonstrates the deployed app structure, navigation,
            multiple pages, and visual design direction.
          </p>
        </Card.Body>
      </Card>
    </Container>
  )
}