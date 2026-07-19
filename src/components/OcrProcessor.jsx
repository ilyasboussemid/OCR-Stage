import { useEffect, useRef, useState } from 'react'
import { createWorker } from 'tesseract.js'

export default function OcrProcessor({ imageUrl, onComplete }) {
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('Initialisation du moteur OCR…')
  const cancelledRef = useRef(false)

  useEffect(() => {
    cancelledRef.current = false

    async function run() {
      const worker = await createWorker('fra', 1, {
        logger: (m) => {
          if (cancelledRef.current) return
          if (m.status === 'recognizing text') {
            setStage('Lecture du texte…')
            setProgress(Math.round(m.progress * 100))
          } else if (m.status === 'loading tesseract core') {
            setStage('Chargement du moteur OCR (local)…')
          } else if (m.status === 'loading language traineddata') {
            setStage('Chargement du modèle de langue…')
          }
        },
      })

      const { data } = await worker.recognize(imageUrl)
      await worker.terminate()

      if (!cancelledRef.current) {
        onComplete(data.text)
      }
    }

    run()

    return () => {
      cancelledRef.current = true
    }
  }, [imageUrl, onComplete])

  return (
    <div className="ocr-processing">
      <div className="ocr-ring" style={{ '--progress': `${progress}%` }}>
        <span className="ocr-percent">{progress}%</span>
      </div>
      <p className="ocr-stage">{stage}</p>
      <p className="ocr-note">Traitement 100% local — aucune donnée envoyée à un serveur.</p>
    </div>
  )
}
