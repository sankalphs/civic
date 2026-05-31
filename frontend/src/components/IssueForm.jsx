import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import VoiceRecorder from './VoiceRecorder'
import CameraCapture from './CameraCapture'
import LocationPicker from './LocationPicker'
import { classifyIssue } from '../services/classifier'
import { createIssue } from '../services/api'
import { AUTHORITIES, ISSUE_CATEGORIES } from '../data/authorities'

export default function IssueForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [description, setDescription] = useState('')
  const [transcript, setTranscript] = useState('')
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [position, setPosition] = useState(null)
  const [address, setAddress] = useState(null)
  const [classification, setClassification] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [reporterName, setReporterName] = useState('')
  const [reporterPhone, setReporterPhone] = useState('')
  const [reporterEmail, setReporterEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [trackingId, setTrackingId] = useState(null)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const [cameraError, setCameraError] = useState(null)

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    setVoiceSupported(!!SR)
  }, [])

  const handleVoiceTranscript = useCallback((text) => {
    setTranscript(text)
    setDescription(text)
    if (text.length > 5) {
      const result = classifyIssue(text)
      setClassification(result)
      if (result.category && result.category !== 'unknown') {
        setSelectedCategory(result.category)
      }
    }
  }, [])

  const handlePhotoCapture = useCallback((file) => {
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = (e) => setPhotoPreview(e.target.result)
    reader.readAsDataURL(file)
  }, [])

  const handlePhotoClear = useCallback(() => {
    setPhoto(null)
    setPhotoPreview(null)
  }, [])

  const handlePositionChange = useCallback((lat, lng) => {
    setPosition({ lat, lng })
  }, [])

  const handleAddressChange = useCallback((addr) => {
    setAddress(addr)
  }, [])

  const handleSubmit = async () => {
    if (!description.trim()) return alert('Please describe the issue')
    if (!position) return alert('Please set the location')
    if (!selectedCategory) return alert('Please select a category')

    setSubmitting(true)
    try {
      const result = await createIssue({
        description: description.trim(),
        category: selectedCategory,
        latitude: position.lat,
        longitude: position.lng,
        address: address?.display_name || '',
        area: address?.area || address?.neighbourhood || '',
        reporter_name: reporterName,
        reporter_phone: reporterPhone,
        reporter_email: reporterEmail,
        transcript,
        photo
      })
      setTrackingId(result.tracking_id)
      setSubmitted(true)
    } catch (err) {
      alert('Failed to submit: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const canProceed = (s) => {
    if (s === 2) return description.trim().length > 0
    if (s === 3) return position !== null
    if (s === 4) return selectedCategory !== null
    return true
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto p-4">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Issue Reported Successfully</h2>
          <p className="text-gray-600 mb-4">Your complaint has been submitted and routed to the relevant authority.</p>

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800 font-medium">Tracking ID</p>
            <p className="text-2xl font-bold text-blue-600 font-mono">{trackingId}</p>
            <p className="text-xs text-blue-600 mt-1">Save this ID to track your complaint</p>
          </div>

          {selectedCategory && AUTHORITIES[selectedCategory] && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
              <p className="text-sm font-medium text-gray-700 mb-1">Routed to:</p>
              <p className="font-semibold">{AUTHORITIES[selectedCategory].icon} {AUTHORITIES[selectedCategory].name}</p>
              <p className="text-sm text-gray-600">Helpline: {AUTHORITIES[selectedCategory].helpline}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => navigate(`/track/${trackingId}`)} className="btn-primary flex-1">
              Track Issue
            </button>
            <button onClick={() => { setSubmitted(false); setStep(1); setDescription(''); setTranscript(''); setPhoto(null); setPhotoPreview(null); setPosition(null); setClassification(null); setSelectedCategory(null); }} className="btn-secondary flex-1">
              Report Another
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              s <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {s}
            </div>
            {s < 4 && <div className={`w-12 h-0.5 ${s < step ? 'bg-blue-600' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 mb-6 -mt-4">
        <span>Describe</span>
        <span>Location</span>
        <span>Category</span>
        <span>Submit</span>
      </div>

      {/* Step 1: Describe */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Describe the Issue</h2>
          
          <VoiceRecorder onTranscript={handleVoiceTranscript} isSupported={voiceSupported} />

          <div className="card">
            <label className="block text-sm font-medium text-gray-700 mb-1">Or type your description</label>
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (e.target.value.length > 5) {
                  const result = classifyIssue(e.target.value)
                  setClassification(result)
                  if (result.category && result.category !== 'unknown') {
                    setSelectedCategory(result.category)
                  }
                }
              }}
              placeholder="Describe the civic issue (e.g., 'There is a large pothole on 80 Feet Road in Koramangala')"
              rows={4}
              className="input-field resize-none"
            />
          </div>

          <CameraCapture
            photoPreview={photoPreview}
            onCapture={handlePhotoCapture}
            onClear={handlePhotoClear}
            error={cameraError}
          />

          {classification && classification.category && classification.category !== 'unknown' && (
            <div className="card bg-blue-50 border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Auto-detected:</span> {AUTHORITIES[classification.category]?.icon} {AUTHORITIES[classification.category]?.category}
                {classification.matchedKeywords.length > 0 && (
                  <span className="text-blue-600"> ({classification.matchedKeywords.join(', ')})</span>
                )}
              </p>
            </div>
          )}

          <button onClick={() => setStep(2)} disabled={!canProceed(2)} className="btn-primary w-full">
            Next: Set Location
          </button>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Set Location</h2>
          <LocationPicker
            position={position}
            onPositionChange={handlePositionChange}
            onAddressChange={handleAddressChange}
          />
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">Back</button>
            <button onClick={() => setStep(3)} disabled={!canProceed(3)} className="btn-primary flex-1">
              Next: Category
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Category */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Issue Category</h2>
          
          {classification && classification.category && classification.category !== 'unknown' && (
            <div className="card bg-green-50 border-green-200">
              <p className="text-sm text-green-800">
                <span className="font-medium">Auto-classified from your description</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            {ISSUE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`card text-left transition-all ${
                  selectedCategory === cat.id
                    ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-300'
                    : 'hover:border-gray-400'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <p className="text-sm font-medium mt-1">{cat.label}</p>
              </button>
            ))}
          </div>

          {selectedCategory && AUTHORITIES[selectedCategory] && (
            <div className="card bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Will be routed to:</p>
              <p className="font-semibold mt-1">
                {AUTHORITIES[selectedCategory].icon} {AUTHORITIES[selectedCategory].name}
              </p>
              <p className="text-sm text-gray-600">
                Helpline: {AUTHORITIES[selectedCategory].helpline}
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">Back</button>
            <button onClick={() => setStep(4)} disabled={!canProceed(4)} className="btn-primary flex-1">
              Next: Review & Submit
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-800">Review & Submit</h2>

          <div className="card">
            <h3 className="font-medium text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-800">{description}</p>
          </div>

          {photoPreview && (
            <div className="card">
              <h3 className="font-medium text-gray-700 mb-2">Photo</h3>
              <img src={photoPreview} alt="Issue" className="w-full h-32 object-cover rounded-lg" />
            </div>
          )}

          {position && (
            <div className="card">
              <h3 className="font-medium text-gray-700 mb-2">Location</h3>
              <p className="text-sm text-gray-800">{address?.display_name || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}</p>
            </div>
          )}

          {selectedCategory && AUTHORITIES[selectedCategory] && (
            <div className="card">
              <h3 className="font-medium text-gray-700 mb-2">Routing</h3>
              <p className="text-sm">
                {AUTHORITIES[selectedCategory].icon} <span className="font-semibold">{AUTHORITIES[selectedCategory].name}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Helpline: {AUTHORITIES[selectedCategory].helpline}</p>
            </div>
          )}

          <div className="card">
            <h3 className="font-medium text-gray-700 mb-2">Your Details (optional)</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                placeholder="Your name"
                className="input-field"
              />
              <input
                type="tel"
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                placeholder="Phone number"
                className="input-field"
              />
              <input
                type="email"
                value={reporterEmail}
                onChange={(e) => setReporterEmail(e.target.value)}
                placeholder="Email (for updates)"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="btn-secondary flex-1">Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-success flex-1"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
