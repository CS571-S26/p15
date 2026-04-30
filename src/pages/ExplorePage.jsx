import { useMemo, useState } from 'react'
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Pagination,
  Row,
} from 'react-bootstrap'
import { useNavigate, useSearchParams } from 'react-router-dom'
import FragranceCard from '../components/FragranceCard'
import CreateFragranceModal from '../components/CreateFragranceModal'
import { useScentSwap } from '../../context/ScentSwapContext'

const defaultFilters = {
  search: '',
  family: 'all',
  season: 'all',
  concentration: 'all',
  availability: 'all',
  sort: 'popular',
}

const PAGE_SIZE = 24

function getSearchableText(fragrance) {
  return [
    fragrance.brand,
    fragrance.name,
    fragrance.family,
    fragrance.vibe,
    ...fragrance.topNotes,
    ...fragrance.middleNotes,
    ...fragrance.baseNotes,
    ...fragrance.accords,
  ]
    .join(' ')
    .toLowerCase()
}

export default function ExplorePage() {
  const navigate = useNavigate()
  const { fragrances, getOwnersForFragrance } = useScentSwap()
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const activeSearch = searchParams.has('q') ? searchParams.get('q') ?? '' : filters.search

  const families = useMemo(
    () => [...new Set(fragrances.map((fragrance) => fragrance.family))].sort(),
    [fragrances],
  )

  const concentrations = useMemo(
    () => [...new Set(fragrances.map((fragrance) => fragrance.concentration))].sort(),
    [fragrances],
  )

  const seasons = ['spring', 'summer', 'fall', 'winter']

  const filtered = useMemo(() => {
    const lowerSearch = activeSearch.trim().toLowerCase()

    const result = fragrances.filter((fragrance) => {
      const matchesSearch = !lowerSearch || getSearchableText(fragrance).includes(lowerSearch)
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
  }, [activeSearch, filters, fragrances, getOwnersForFragrance])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const startIndex = (currentPage - 1) * PAGE_SIZE
  const visibleFragrances = filtered.slice(startIndex, startIndex + PAGE_SIZE)

  const updateFilter = (event) => {
    const { name, value } = event.target

    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
    setPage(1)

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
    setPage(1)
    setSearchParams({})
  }

  const handleCreated = (fragrance) => {
    navigate(`/fragrances/${fragrance.slug}`)
  }

  const pageItems = []
  for (let index = 1; index <= totalPages; index += 1) {
    if (
      index === 1
      || index === totalPages
      || Math.abs(index - currentPage) <= 1
    ) {
      pageItems.push(
        <Pagination.Item
          key={index}
          active={index === currentPage}
          onClick={() => setPage(index)}
        >
          {index}
        </Pagination.Item>,
      )
    } else if (pageItems[pageItems.length - 1]?.type !== Pagination.Ellipsis) {
      pageItems.push(<Pagination.Ellipsis key={`ellipsis-${index}`} disabled />)
    }
  }

  return (
    <Container fluid="lg" className="py-4 py-lg-5">
      <div className="section-header mb-4">
        <p className="eyebrow mb-2">Fragrance catalog</p>
        <h1 className="mb-3">Search by notes, family, season, or nearby availability</h1>
        <p className="text-secondary mb-0">
          Find scents by profile, compare risk and fit, and see which bottles are available nearby.
        </p>
      </div>

      <Row className="g-4 align-items-start">
        <Col lg={3}>
          <Card className="glass-surface sticky-lg-top filters-card">
            <Card.Body>
              <div className="section-heading-row mb-3">
                <h2 className="h5 mb-0">Filters</h2>
                <Button variant="link" className="p-0 text-decoration-none" onClick={clearFilters}>
                  Reset
                </Button>
              </div>

              <Form>
                <Form.Group className="mb-3" controlId="search-filter">
                  <Form.Label>Search</Form.Label>
                  <Form.Control
                    name="search"
                    placeholder="saffron, rose, smoky..."
                    value={activeSearch}
                    onChange={updateFilter}
                  />
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

              <div className="mt-4 pt-3 border-top border-secondary-subtle">
                <p className="eyebrow mb-2">Missing something?</p>
                <p className="text-secondary small mb-3">
                  Add a fragrance to the shared catalog.
                </p>
                <Button
                  variant="dark"
                  className="w-100"
                  onClick={() => setShowCreateModal(true)}
                >
                  Create new fragrance
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={9}>
          <div className="catalog-summary glass-surface mb-4">
            <div>
              <p className="eyebrow mb-1">Live results</p>
              <strong className="fs-4">{filtered.length} fragrances matched</strong>
              <p className="text-secondary mb-0">
                Showing {visibleFragrances.length} on page {currentPage} of {totalPages}
              </p>
            </div>
            <Button variant="outline-dark" onClick={() => setShowCreateModal(true)}>
              Create new fragrance
            </Button>
          </div>

          {filtered.length > 0 ? (
            <>
              <Row className="g-4">
                {visibleFragrances.map((fragrance) => (
                  <Col md={6} xl={4} key={fragrance.id}>
                    <FragranceCard fragrance={fragrance} />
                  </Col>
                ))}
              </Row>

              {totalPages > 1 ? (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination className="mb-0">
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => setPage((current) => Math.max(1, current - 1))}
                    />
                    {pageItems}
                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                    />
                  </Pagination>
                </div>
              ) : null}
            </>
          ) : (
            <Card className="glass-surface">
              <Card.Body className="p-4 p-lg-5">
                <p className="eyebrow mb-2">No matches</p>
                <h2 className="h3 mb-3">Nothing matched those filters.</h2>
                <p className="text-secondary mb-4">
                  Reset the filters or create the missing fragrance directly from here.
                </p>

                <div className="action-row">
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Clear filters
                  </Button>
                  <Button variant="dark" onClick={() => setShowCreateModal(true)}>
                    {activeSearch.trim()
                      ? `Create "${activeSearch.trim()}"`
                      : 'Create new fragrance'}
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      <CreateFragranceModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        initialQuery={activeSearch}
        onCreated={handleCreated}
      />
    </Container>
  )
}
