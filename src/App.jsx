import { useCallback, useState } from 'react'
import CaptureZone from './components/CaptureZone.jsx'
import OcrProcessor from './components/OcrProcessor.jsx'
import FieldReview from './components/FieldReview.jsx'
import Confirmation from './components/Confirmation.jsx'
import { extractFields } from './lib/fieldExtractor.js'
import './App.css'

const STEPS = {
  CAPTURE: 'capture',
  OCR: 'ocr',
  REVIEW: 'review',
  DONE: 'done',
}

export default function App() {
  const [step, setStep] = useState(STEPS.CAPTURE)
  const [docType, setDocType] = useState('cheque')
  const [image, setImage] = useState(null)
  const [rawText, setRawText] = useState('')
  const [extraction, setExtraction] = useState(null)
  const [validatedFields, setValidatedFields] = useState(null)

  const handleImageReady = useCallback((img) => {
    setImage(img)
    setStep(STEPS.OCR)
  }, [])

  const handleOcrComplete = useCallback(
    (text) => {
      setRawText(text)
      setExtraction(extractFields(text, docType))
      setStep(STEPS.REVIEW)
    },
    [docType]
  )

  const handleValidate = useCallback((fields) => {
    setValidatedFields(fields)
    setStep(STEPS.DONE)
  }, [])

  const reset = useCallback(() => {
    setImage(null)
    setRawText('')
    setExtraction(null)
    setValidatedFields(null)
    setStep(STEPS.CAPTURE)
  }, [])

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <span className="brand-name">Scan&nbsp;&amp;&nbsp;Saisie</span>
        </div>
        <span className="brand-tag">OCR</span>
      </header>

      <main className="app-main">
        {step === STEPS.CAPTURE && (
          <>
            <div className="doc-type-picker">
              <p className="picker-label">Type de document</p>
              <div className="picker-options">
                <button
                  className={`chip ${docType === 'cheque' ? 'chip-active' : ''}`}
                  onClick={() => setDocType('cheque')}
                >
                  Chèque
                </button>
                <button
                  className={`chip ${docType === 'declaration' ? 'chip-active' : ''}`}
                  onClick={() => setDocType('declaration')}
                >
                  Déclaration
                </button>
              </div>
            </div>
            <CaptureZone onImageReady={handleImageReady} />
          </>
        )}

        {step === STEPS.OCR && image && (
          <OcrProcessor imageUrl={image.url} onComplete={handleOcrComplete} />
        )}

        {step === STEPS.REVIEW && image && extraction && (
          <FieldReview
            imageUrl={image.url}
            extraction={extraction}
            rawText={rawText}
            onValidate={handleValidate}
            onRestart={reset}
          />
        )}

        {step === STEPS.DONE && validatedFields && (
          <Confirmation fields={validatedFields} onRestart={reset} />
        )}
      </main>
    </div>
  )
}
