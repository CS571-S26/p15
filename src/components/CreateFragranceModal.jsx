import { useEffect, useState } from 'react'
import {
  Button,
  Col,
  Form,
  Modal,
  Row,
} from 'react-bootstrap'
import { useScentSwap } from '../../context/ScentSwapContext'

const baseForm = {
  brand: '',
  name: '',
  concentration: 'Eau de Parfum',
  family: 'Woody Aromatic',
  vibe: '',
  description: '',
  topNotes: '',
  middleNotes: '',
  baseNotes: '',
  accords: '',
  seasons: 'spring, fall',
  longevity: '6–8 hours',
  sillage: 'moderate',
  idealFor: 'sampling, everyday',
  addToCollection: true,
}

export default function CreateFragranceModal({
  show,
  onHide,
  initialQuery = '',
  onCreated,
}) {
  const { createFragrance } = useScentSwap()
  const [form, setForm] = useState(baseForm)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!show) {
      return
    }

    setForm({
      ...baseForm,
      name: initialQuery?.trim() || '',
    })
  }, [show, initialQuery])

  const updateField = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    const result = await createFragrance(form)
    setSubmitting(false)

    if (!result?.fragrance) {
      return
    }

    onCreated?.(result.fragrance, result.status)
    onHide()
  }

  return (
    <Modal show={show} onHide={onHide} centered size="lg" contentClassName="glass-surface">
      <Modal.Header closeButton>
        <Modal.Title>Create new fragrance</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="text-secondary mb-4">
          This writes straight to the shared `fragrances` table, so the entry persists across devices
          and becomes available to other users immediately.
        </p>

        <Form onSubmit={handleSubmit}>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="fragrance-brand">
                <Form.Label>Brand *</Form.Label>
                <Form.Control
                  name="brand"
                  value={form.brand}
                  onChange={updateField}
                  placeholder="Diptyque"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-name">
                <Form.Label>Fragrance name *</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={updateField}
                  placeholder="Tam Dao"
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-concentration">
                <Form.Label>Concentration</Form.Label>
                <Form.Control
                  name="concentration"
                  value={form.concentration}
                  onChange={updateField}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-family">
                <Form.Label>Family</Form.Label>
                <Form.Control
                  name="family"
                  value={form.family}
                  onChange={updateField}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="fragrance-vibe">
                <Form.Label>Vibe</Form.Label>
                <Form.Control
                  name="vibe"
                  value={form.vibe}
                  onChange={updateField}
                  placeholder="creamy woods, soft spice, clean musk"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="fragrance-description">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={form.description}
                  onChange={updateField}
                  placeholder="Short, useful summary of how it smells."
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="fragrance-top-notes">
                <Form.Label>Top notes</Form.Label>
                <Form.Control
                  name="topNotes"
                  value={form.topNotes}
                  onChange={updateField}
                  placeholder="bergamot, cardamom"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="fragrance-middle-notes">
                <Form.Label>Middle notes</Form.Label>
                <Form.Control
                  name="middleNotes"
                  value={form.middleNotes}
                  onChange={updateField}
                  placeholder="iris, jasmine"
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group controlId="fragrance-base-notes">
                <Form.Label>Base notes</Form.Label>
                <Form.Control
                  name="baseNotes"
                  value={form.baseNotes}
                  onChange={updateField}
                  placeholder="cedar, musk"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-accords">
                <Form.Label>Accords</Form.Label>
                <Form.Control
                  name="accords"
                  value={form.accords}
                  onChange={updateField}
                  placeholder="woody, musky, powdery"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-seasons">
                <Form.Label>Seasons</Form.Label>
                <Form.Control
                  name="seasons"
                  value={form.seasons}
                  onChange={updateField}
                  placeholder="spring, fall"
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-longevity">
                <Form.Label>Longevity</Form.Label>
                <Form.Control
                  name="longevity"
                  value={form.longevity}
                  onChange={updateField}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="fragrance-sillage">
                <Form.Label>Sillage</Form.Label>
                <Form.Control
                  name="sillage"
                  value={form.sillage}
                  onChange={updateField}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group controlId="fragrance-ideal-for">
                <Form.Label>Ideal for</Form.Label>
                <Form.Control
                  name="idealFor"
                  value={form.idealFor}
                  onChange={updateField}
                  placeholder="everyday, office, sampling"
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Check
                id="fragrance-add-to-collection"
                name="addToCollection"
                type="checkbox"
                checked={form.addToCollection}
                onChange={updateField}
                label="Add this fragrance to my collection right away"
              />
            </Col>
          </Row>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="outline-secondary" onClick={onHide}>
              Cancel
            </Button>
            <Button type="submit" variant="dark" disabled={submitting}>
              Create fragrance
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  )
}