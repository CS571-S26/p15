import { Badge, Button, Card, Stack } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useScentSwap } from '../../context/ScentSwapContext'

function getFamilyClass(family) {
  const text = family.toLowerCase()

  if (text.includes('woody')) return 'family-woody'
  if (text.includes('amber')) return 'family-amber'
  if (text.includes('floral')) return 'family-floral'
  if (text.includes('aquatic') || text.includes('aromatic')) return 'family-fresh'
  return 'family-default'
}

export default function FragranceCard({ fragrance, compact = false }) {
  const {
    collectionIds,
    favoriteIds,
    toggleFavorite,
    addToCollection,
    getOwnersForFragrance,
  } = useScentSwap()

  const owners = getOwnersForFragrance(fragrance.id)
  const saved = favoriteIds.includes(fragrance.id)
  const owned = collectionIds.includes(fragrance.id)

  return (
    <Card className={`fragrance-card h-100 ${getFamilyClass(fragrance.family)}`}>
      <Card.Body className="d-flex flex-column">
        <div className="fragrance-avatar">
          <span>{fragrance.brand.slice(0, 1)}</span>
          <small>{fragrance.name.slice(0, 2).toUpperCase()}</small>
        </div>

        <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
          <div>
            <p className="eyebrow mb-1">{fragrance.brand}</p>
            <Card.Title className="mb-1">{fragrance.name}</Card.Title>
            <Card.Subtitle className="text-secondary small">
              {fragrance.concentration} · {fragrance.family}
            </Card.Subtitle>
          </div>
          <Badge bg="light" text="dark" pill>
            {fragrance.communityScore}% fit
          </Badge>
        </div>

        <Card.Text className="text-secondary mb-3 flex-grow-1">
          {fragrance.description}
        </Card.Text>

        <Stack direction="horizontal" gap={2} className="flex-wrap mb-3">
          {fragrance.accords.slice(0, compact ? 3 : 4).map((accord) => (
            <span key={accord} className="note-chip">
              {accord}
            </span>
          ))}
        </Stack>

        <div className="info-grid mb-3">
          <div>
            <span className="eyebrow">Top</span>
            <strong>{fragrance.topNotes[0]}</strong>
          </div>
          <div>
            <span className="eyebrow">Nearby owners</span>
            <strong>{owners.length}</strong>
          </div>
          <div>
            <span className="eyebrow">Blind-buy risk</span>
            <strong>{fragrance.blindBuyRisk}%</strong>
          </div>
        </div>

        <div className="action-row mt-auto">
          <Button as={Link} to={`/fragrances/${fragrance.slug}`} variant="dark">
            View details
          </Button>
          <Button
            variant={saved ? 'outline-dark' : 'outline-secondary'}
            onClick={() => toggleFavorite(fragrance.id)}
          >
            {saved ? 'Saved' : 'Save'}
          </Button>
          <Button
            variant={owned ? 'success' : 'outline-primary'}
            onClick={() => addToCollection(fragrance.id)}
          >
            {owned ? 'In collection' : 'Add'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}
