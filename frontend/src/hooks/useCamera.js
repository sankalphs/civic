import { useState, useCallback } from 'react'

export function useCamera() {
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [error, setError] = useState(null)

  const capturePhoto = useCallback((file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB')
      return
    }

    setPhoto(file)
    setError(null)

    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
  }, [])

  const clearPhoto = useCallback(() => {
    setPhoto(null)
    setPhotoPreview(null)
    setError(null)
  }, [])

  return { photo, photoPreview, error, capturePhoto, clearPhoto }
}
