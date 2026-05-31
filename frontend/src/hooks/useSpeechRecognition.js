import { useState, useEffect, useCallback, useRef } from 'react'

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-IN'
      recognition.maxAlternatives = 1

      recognition.onresult = (event) => {
        let final = ''
        let interim = ''
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript
          } else {
            interim += event.results[i][0].transcript
          }
        }
        if (final) setTranscript(prev => prev + final)
        setInterimTranscript(interim)
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setError(event.error)
        if (event.error !== 'no-speech') {
          setIsListening(false)
        }
      }

      recognition.onend = () => {
        if (isListening) {
          try { recognition.start() } catch (e) { /* ignore */ }
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
      }
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    setTranscript('')
    setInterimTranscript('')
    setIsListening(true)
    try {
      recognitionRef.current.start()
    } catch (e) {
      setError(e.message)
    }
  }, [])

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return
    setIsListening(false)
    try {
      recognitionRef.current.stop()
    } catch (e) { /* ignore */ }
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript('')
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript
  }
}
