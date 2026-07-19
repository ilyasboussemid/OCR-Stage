import { useState } from 'react'

export default function FieldReview({ imageUrl, extraction, rawText, onValidate, onRestart }) {
  const [fields, setFields] = useState(extraction.fields)
  const [showRaw, setShowRaw] = useState(false)

  function updateField(id, value) {
    setFields((prev) => prev.map((f) => (f.id === id ? { ...f, value, confidence: 'corrige' } : f)))
  }

  const missingCount = fields.filter((f) => f.confidence === 'manquant').length

  return (
    <div className="review-layout">
      <div className="review-image">
        <img src={imageUrl} alt="Document scanné" />
      </div>

      <div className="review-fields">
        <div className="review-header">
          <span className="doc-type-badge">{extraction.type === 'cheque' ? 'Chèque' : 'Déclaration'}</span>
          {missingCount > 0 ? (
            <span className="badge badge-warn">{missingCount} champ(s) à compléter</span>
          ) : (
            <span className="badge badge-ok">Tous les champs détectés</span>
          )}
        </div>

        {fields.map((field) => (
          <label key={field.id} className="field-row">
            <span className="field-label">
              {field.label}
              {field.confidence === 'auto' && <span className="dot dot-ok" title="Détecté automatiquement" />}
              {field.confidence === 'manquant' && <span className="dot dot-warn" title="Non détecté" />}
              {field.confidence === 'corrige' && <span className="dot dot-info" title="Corrigé manuellement" />}
            </span>
            <input
              type="text"
              value={field.value}
              placeholder="Non détecté — saisir manuellement"
              onChange={(e) => updateField(field.id, e.target.value)}
            />
          </label>
        ))}

        <button className="btn btn-text btn-raw" onClick={() => setShowRaw((s) => !s)}>
          {showRaw ? 'Masquer' : 'Afficher'} le texte OCR brut
        </button>
        {showRaw && <pre className="raw-text">{rawText}</pre>}

        <div className="review-actions">
          <button className="btn btn-ghost" onClick={onRestart}>Recommencer</button>
          <button className="btn btn-primary" onClick={() => onValidate(fields)}>
            Valider le formulaire
          </button>
        </div>
      </div>
    </div>
  )
}
