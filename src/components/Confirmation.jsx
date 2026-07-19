export default function Confirmation({ fields, onRestart }) {
  return (
    <div className="confirmation">
      <div className="confirmation-mark">✓</div>
      <h2>Formulaire validé</h2>
      <p className="confirmation-sub">Les champs suivants ont été enregistrés localement :</p>
      <dl className="confirmation-list">
        {fields.map((f) => (
          <div key={f.id} className="confirmation-item">
            <dt>{f.label}</dt>
            <dd>{f.value || '—'}</dd>
          </div>
        ))}
      </dl>
      <button className="btn btn-primary" onClick={onRestart}>
        Scanner un nouveau document
      </button>
    </div>
  )
}
