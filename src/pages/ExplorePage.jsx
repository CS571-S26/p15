import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  InputGroup,
  Row,
} from 'react-bootstrap'
import { useSearchParams } from 'react-router-dom'
import FragranceCard from '../components/FragranceCard'
import { useScentSwap } from '../../context/ScentSwapContext'

const defaultFilters = {
  search: '',
  family: 'all',
  season: 'all',
  concentration: 'all',
  availability: 'all',
  sort: 'popular',
}

export default function ExplorePage() {
  const { fragrances, getOwnersForFragrance } = useScentSwap()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(defaultFilters)

  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setFilters((current) => ({
        ...current,
        search: query,
      }))
    }
  }, [searchParams])

  const families = [...new Set(fragrances.map((fragrance) => fragrance.family))]
  const concentrations = [...new Set(fragrances.map((fragrance) => fragrance.concentration))]
  const seasons = ['spring', 'summer', 'fall', 'winter']

  const filtered = useMemo(() => {
    const lowerSearch = filters.search.trim().toLowerCase()

    const result = fragrances.filter((fragrance) => {
      const haystack = [
        fragrance.brand,
        fragrance.name,
        fragrance.family,
        fragrance.vibe,
        ...fragrance.topNotes,
        ...fragrance.middleNotes,
        ...fragrance.baseNotes,
        ...fragrance.accords,
      ].join(' ').toLowerCase()

      const matchesSearch = !lowerSearch || haystack.includes(lowerSearch)
      const matchesFamily = filters.family === 'all' || fragrance.family === filters.family
      const matchesSeason = filters.season === 'all' || fragrance.seasons.includes(filters.season)
      const matchesConcentration = (
        filters.concentration === 'all'
        || fragrance.concentration === filters.concentration
      )
      const matchesAvailability = (
        filters.availability === 'all'
        || getOwnersForFragrance(fragrance.id).length > 0
      )

      return (
        matchesSearch
        && matchesFamily
        && matchesSeason
        && matchesConcentration
        && matchesAvailability
      )
    })

    return [...result].sort((left, right) => {
      switch (filters.sort) {
        case 'rating':
          return right.communityScore - left.communityScore
        case 'risk-low':
          return left.blindBuyRisk - right.blindBuyRisk
        case 'availability':
          return getOwnersForFragrance(right.id).length - getOwnersForFragrance(left.id).length
        case 'name':
          return left.name.localeCompare(right.name)
        default:
          return right.popularity - left.popularity
      }
    })
  }, [filters, fragrances, getOwnersForFragrance])

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))

    if (name === 'search') {
      const next = new URLSearchParams(searchParams)
      if (value.trim()) {
        next.set('q', value)
      } else {
        next.delete('q')
      }
      setSearchParams(next)
    }
  }

  const clearFilters = () => {
    setFilters(defaultFilters)
    setSearchParams({})
  }

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <div className="section-header mb-4">
        <p className="eyebrow mb-2">Fragrance catalog</p>
        <h1 className="mb-3">Search by notes, family, season, or nearby availability</h1>
        <p className="text-secondary mb-0">
          This catalog is built to make discovery practical. Filter by what you like, inspect the scent pyramid,
          then jump into a request flow if someone nearby owns it.
        </p>
      </div>

      <Row className="g-4 align-items-start">
        <Col lg={3}>
          <Card className="glass-surface sticky-lg-top filters-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="h5 mb-0">Filters</h2>
                <Button variant="link" className="p-0 text-decoration-none" onClick={clearFilters}>
                  Reset
                </Button>
              </div>

              <Form>
                <Form.Group className="mb-3" controlId="search-filter">
                  <Form.Label>Search</Form.Label>
                  <InputGroup>
                    <Form.Control
                      name="search"
                      placeholder="saffron, rose, smoky..."
                      value={filters.search}
                      onChange={updateFilter}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="family-filter">
                  <Form.Label>Family</Form.Label>
                  <Form.Select name="family" value={filters.family} onChange={updateFilter}>
                    <option value="all">All families</option>
                    {families.map((family) => (
                      <option key={family} value={family}>{family}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="season-filter">
                  <Form.Label>Best season</Form.Label>
                  <Form.Select name="season" value={filters.season} onChange={updateFilter}>
                    <option value="all">Any season</option>
                    {seasons.map((season) => (
                      <option key={season} value={season}>
                        {season[0].toUpperCase() + season.slice(1)}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="concentration-filter">
                  <Form.Label>Concentration</Form.Label>
                  <Form.Select
                    name="concentration"
                    value={filters.concentration}
                    onChange={updateFilter}
                  >
                    <option value="all">Any concentration</option>
                    {concentrations.map((concentration) => (
                      <option key={concentration} value={concentration}>{concentration}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3" controlId="availability-filter">
                  <Form.Label>Community availability</Form.Label>
                  <Form.Select
                    name="availability"
                    value={filters.availability}
                    onChange={updateFilter}
                  >
                    <option value="all">Show everything</option>
                    <option value="nearby-only">Only scents with nearby owners</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group controlId="sort-filter">
                  <Form.Label>Sort by</Form.Label>
                  <Form.Select name="sort" value={filters.sort} onChange={updateFilter}>
                    <option value="popular">Most popular</option>
                    <option value="rating">Highest fit score</option>
                    <option value="availability">Most owners nearby</option>
                    <option value="risk-low">Lowest blind-buy risk</option>
                    <option value="name">Name</option>
                  </Form.Select>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <div className="catalog-summary glass-surface mb-4">
            <div>
              <p className="eyebrow mb-1">Live results</p>
              <strong className="fs-4">{filtered.length} fragrances matched</strong>
            </div>
            <p className="text-secondary mb-0">
              Use the save button to build a shortlist and the add button to simulate collecting bottles you already own.
            </p>
          </div>

          <Row className="g-4">
            {filtered.map((fragrance) => (
              <Col md={6} xl={4} key={fragrance.id}>
                <FragranceCard fragrance={fragrance} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
    </Container>
  )
}
