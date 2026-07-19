import { useRef, useState, useCallback } from 'react'

export default function CaptureZone({ onImageReady }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)
  const streamRef = useRef(null)

  const [cameraOn, setCameraOn] = useState(false)
  const [error, setError] = useState('')

  const startCamera = useCallback(async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }, // caméra arrière sur mobile
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOn(true)
    } catch (err) {
      setError("Caméra inaccessible. Vérifie les autorisations du navigateur.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setCameraOn(false)
  }, [])

  const capturePhoto = useCallback(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      onImageReady({ blob, url })
      stopCamera()
    }, 'image/jpeg', 0.92)
  }, [onImageReady, stopCamera])

  const handleFileUpload = useCallback(
    (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      const url = URL.createObjectURL(file)
      onImageReady({ blob: file, url })
    },
    [onImageReady]
  )

  return (
    <div className="capture-zone">
      {!cameraOn && (
        <div className="capture-actions">
          <button className="btn btn-primary" onClick={startCamera}>
            <span className="btn-icon">◉</span>
            Ouvrir la caméra
          </button>
          <button className="btn btn-ghost" onClick={() => fileInputRef.current?.click()}>
            <span className="btn-icon">⇧</span>
            Importer un fichier
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
        </div>
      )}

      {error && <p className="capture-error">{error}</p>}

      <div className={`camera-frame ${cameraOn ? 'is-live' : ''}`}>
        <video ref={videoRef} playsInline muted className="camera-video" />
        {cameraOn && <div className="scan-line" />}
        {cameraOn && (
          <div className="camera-controls">
            <button className="btn btn-shutter" onClick={capturePhoto} aria-label="Prendre la photo" />
            <button className="btn btn-text" onClick={stopCamera}>Annuler</button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
