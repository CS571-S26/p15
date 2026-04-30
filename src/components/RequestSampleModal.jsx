import { useState } from 'react'
import { Button, Form, Modal } from 'react-bootstrap'
import { useScentSwap } from '../../context/ScentSwapContext'

const defaultMessage = (fragranceName, ownerName) => (
  `Hi ${ownerName}, I would love to try ${fragranceName} before buying a full bottle. `
  + 'I am flexible on timing and can meet somewhere convenient.'
)

export default function RequestSampleModal({ show, onHide, fragrance, owner }) {
  const { sendSampleRequest } = useScentSwap()
  const [message, setMessage] = useState('')

  const resetMessage = () => {
    if (fragrance && owner) {
      setMessage(defaultMessage(fragrance.name, owner.name.split(' ')[0]))
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!fragrance || !owner) {
      return
    }

    sendSampleRequest({
      fragranceId: fragrance.id,
      ownerId: owner.id,
      message,
    })
    onHide()
  }

  return (
    <Modal
      show={show}
      onHide={onHide}
      onEntered={resetMessage}
      centered
      contentClassName="glass-surface"
    >
      <Modal.Header closeButton>
        <Modal.Title>Request a sample</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {fragrance && owner ? (
          <>
            <div className="mini-stat-card mb-3">
              <p className="eyebrow mb-1">Selected pairing</p>
              <strong className="d-block mb-1">
                {fragrance.brand} — {fragrance.name}
              </strong>
              <p className="mb-1 text-secondary">
                Owner: {owner.name} · {owner.distance} miles away · {owner.ownedItem.sampleFormat}
              </p>
              <small className="text-secondary">
                Meet-up preference: {owner.meetupSpot}
              </small>
            </div>
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="request-message">
                <Form.Label>Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                />
                <Form.Text className="text-secondary">
                  Be clear about timing, respectful with bottle handling, and specific about why you want to test it.
                </Form.Text>
              </Form.Group>
              <div className="action-row end mt-4">
                <Button type="button" variant="outline-secondary" onClick={onHide}>
                  Cancel
                </Button>
                <Button type="submit" variant="dark">
                  Send request
                </Button>
              </div>
            </Form>
          </>
        ) : null}
      </Modal.Body>
    </Modal>
  )
}
