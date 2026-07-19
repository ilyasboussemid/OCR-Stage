// Extraction de champs métier à partir du texte OCR brut.
// Approche par règles (regex) — 100% locale, aucune dépendance externe.
// À terme, cette couche peut être enrichie avec un modèle NER local
// (ex: Transformers.js) sans jamais faire sortir la donnée du navigateur.

const MONTANT_REGEX = /(\d{1,3}(?:[ .]\d{3})*(?:[,.]\d{2})?)\s*(?:DH|MAD|DHS)?/i
const DATE_REGEX = /(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/
const CHEQUE_NUM_REGEX = /n[°ºo]?\s*[:.]?\s*(\d{6,12})/i
const IBAN_REGEX = /([A-Z]{2}\d{2}[\s]?(?:\d[\s]?){10,26})/

function findFirst(text, regex) {
  const match = text.match(regex)
  return match ? match[0].trim() : ''
}

// Extraction dédiée aux chèques bancaires
export function extractCheque(rawText) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)

  const montant = findFirst(rawText, MONTANT_REGEX)
  const date = findFirst(rawText, DATE_REGEX)
  const numeroCheque = findFirst(rawText, CHEQUE_NUM_REGEX)

  // Le bénéficiaire suit souvent "Payez contre ce chèque à l'ordre de"
  const beneficiaireLine = lines.find((l) =>
    /ordre de|payez|beneficiaire|bénéficiaire/i.test(l)
  )

  return {
    type: 'cheque',
    fields: [
      { id: 'montant', label: 'Montant', value: montant, confidence: montant ? 'auto' : 'manquant' },
      { id: 'date', label: 'Date', value: date, confidence: date ? 'auto' : 'manquant' },
      { id: 'numeroCheque', label: 'N° de chèque', value: numeroCheque, confidence: numeroCheque ? 'auto' : 'manquant' },
      { id: 'beneficiaire', label: 'Bénéficiaire', value: beneficiaireLine || '', confidence: beneficiaireLine ? 'auto' : 'manquant' },
    ],
  }
}

// Extraction dédiée aux formulaires de déclaration
export function extractDeclaration(rawText) {
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean)

  const date = findFirst(rawText, DATE_REGEX)
  const montant = findFirst(rawText, MONTANT_REGEX)
  const iban = findFirst(rawText.replace(/\s/g, ' '), IBAN_REGEX)

  const nomLine = lines.find((l) => /nom\s*[:\-]/i.test(l))
  const objetLine = lines.find((l) => /objet|motif/i.test(l))

  return {
    type: 'declaration',
    fields: [
      { id: 'nom', label: 'Nom déclarant', value: nomLine || '', confidence: nomLine ? 'auto' : 'manquant' },
      { id: 'date', label: 'Date', value: date, confidence: date ? 'auto' : 'manquant' },
      { id: 'montant', label: 'Montant', value: montant, confidence: montant ? 'auto' : 'manquant' },
      { id: 'iban', label: 'IBAN', value: iban, confidence: iban ? 'auto' : 'manquant' },
      { id: 'objet', label: 'Objet', value: objetLine || '', confidence: objetLine ? 'auto' : 'manquant' },
    ],
  }
}

export function extractFields(rawText, docType) {
  if (docType === 'cheque') return extractCheque(rawText)
  return extractDeclaration(rawText)
}
