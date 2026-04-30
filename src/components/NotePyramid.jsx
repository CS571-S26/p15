import { Card } from 'react-bootstrap'

function NoteTier({ title, notes }) {
  return (
    <div className="note-tier">
      <span className="eyebrow">{title}</span>
      <div className="d-flex gap-2 flex-wrap justify-content-center">
        {notes.map((note) => (
          <span key={note} className="note-pill">
            {note}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function NotePyramid({ fragrance }) {
  return (
    <Card className="glass-surface note-pyramid-card h-100">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <p className="eyebrow mb-1">Scent pyramid</p>
            <h2 className="h4 mb-0">How the scent unfolds</h2>
          </div>
          <span className="fit-pill">{fragrance.sillage}</span>
        </div>

        <div className="note-pyramid">
          <NoteTier title="Top notes" notes={fragrance.topNotes} />
          <NoteTier title="Middle notes" notes={fragrance.middleNotes} />
          <NoteTier title="Base notes" notes={fragrance.baseNotes} />
        </div>
      </Card.Body>
    </Card>
  )
}
