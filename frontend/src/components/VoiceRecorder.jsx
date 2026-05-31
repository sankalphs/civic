import { useState, useEffect, useRef } from 'react'

export default function VoiceRecorder({ onTranscript, isSupported }) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const isListeningRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return

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
      if (final) {
        setTranscript(prev => {
          const next = prev ? prev + ' ' + final : final
          onTranscript?.(next)
          return next
        })
      }
      setInterimTranscript(interim)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setError(event.error)
      if (event.error !== 'no-speech') {
        setIsListening(false)
        isListeningRef.current = false
      }
    }

    recognition.onend = () => {
      if (isListeningRef.current) {
        try { recognition.start() } catch (e) { /* ignore */ }
      }
    }

    recognitionRef.current = recognition
    return () => {
      isListeningRef.current = false
      try { recognition.stop() } catch (e) { /* ignore */ }
    }
  }, [onTranscript])

  const toggleListening = () => {
    if (!recognitionRef.current) return
    setError(null)

    if (isListening) {
      isListeningRef.current = false
      setIsListening(false)
      try { recognitionRef.current.stop() } catch (e) { /* ignore */ }
    } else {
      setTranscript('')
      setInterimTranscript('')
      isListeningRef.current = true
      setIsListening(true)
      try { recognitionRef.current.start() } catch (e) { setError(e.message) }
    }
  }

  const clearTranscript = () => {
    setTranscript('')
    setInterimTranscript('')
    onTranscript?.('')
  }

  if (!isSupported) {
    return (
      <div className="card">
        <p className="text-sm text-gray-500">
          Voice input is not supported in this browser. Please type your issue description below.
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">Voice Input</h3>
        {transcript && (
          <button onClick={clearTranscript} className="text-sm text-gray-500 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={toggleListening}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200'
          }`}
        >
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-75"></span>
              <svg className="w-7 h-7 text-white relative z-10" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4M12 1a3 3 0 00-3 3v4a3 3 0 006 0V4a3 3 0 00-3-3z" />
            </svg>
          )}
        </button>

        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">
            {isListening ? 'Listening... Tap to stop' : 'Tap to start speaking'}
          </p>
          {isListening && (
            <div className="flex items-center gap-1 mt-1">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-red-600">Recording</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-2">Error: {error}</p>
      )}

      {(transcript || interimTranscript) && (
        <div className="bg-gray-50 rounded-lg p-3 min-h-[60px]">
          <p className="text-sm text-gray-800">
            {transcript}
            {interimTranscript && (
              <span className="text-gray-400">{interimTranscript}</span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
