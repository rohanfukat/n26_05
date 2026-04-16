import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Trash2, MapPin } from 'lucide-react'

import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

import { useComplaints } from '../hooks/useComplaints'
import { useUser } from '../context/UserContext'

export default function ComplaintForm() {
  const navigate = useNavigate()
  const { createComplaint, loading: apiLoading, error: apiError } = useComplaints()
  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [submissionError, setSubmissionError] = useState('')
  const [successData, setSuccessData] = useState(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    latitude: null,
    longitude: null,
    citizenName: '',
    citizenEmail: '',
  })

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        citizenName: user.name || '',
        citizenEmail: user.email || '',
      }))
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 10) {
      newErrors.title = 'Minimum 10 characters required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 20) {
      newErrors.description = 'Minimum 20 characters required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location/Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const requestUserLocation = async () => {
    setLocationError('')
    setLocationLoading(true)

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.')
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setFormData(prev => ({
          ...prev,
          latitude,
          longitude,
        }))
        setLocationLoading(false)
      },
      (error) => {
        let errorMsg = 'Unable to retrieve your location.'
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = 'Location permission denied. Please enable it in your browser settings.'
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = 'Location information is unavailable.'
        } else if (error.code === error.TIMEOUT) {
          errorMsg = 'Request timed out. Please try again.'
        }
        setLocationError(errorMsg)
        setLocationLoading(false)
      }
    )
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type.startsWith('image/')) {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: file.type,
        file: file, // Store the actual File object
      })
    } else {
      alert('Only image files allowed.')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoading || apiLoading) return
    if (!validateForm()) return

    setSubmissionError('')
    setLocationError('')
    setIsLoading(true)

    try {
      // Request location permission if not already obtained
      if (formData.latitude === null || formData.longitude === null) {
        await new Promise((resolve) => {
          setLocationLoading(true)
          if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported.')
            setLocationLoading(false)
            resolve()
            return
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              setFormData(prev => ({
                ...prev,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }))
              setLocationLoading(false)
              resolve()
            },
            (error) => {
              let errorMsg = 'Unable to retrieve your location.'
              if (error.code === error.PERMISSION_DENIED) {
                errorMsg = 'Location permission denied.'
              } else if (error.code === error.POSITION_UNAVAILABLE) {
                errorMsg = 'Location information is unavailable.'
              } else if (error.code === error.TIMEOUT) {
                errorMsg = 'Request timed out.'
              }
              setLocationError(errorMsg)
              setLocationLoading(false)
              resolve() // Continue anyway, location is optional
            }
          )
        })
      }

      // Prepare form data with location info
      const complaintData = new FormData()
      complaintData.append('issue', formData.title)
      complaintData.append('description', formData.description)
      complaintData.append('location', formData.location)

      if (formData.latitude !== null) {
        complaintData.append('latitude', formData.latitude)
      }
      if (formData.longitude !== null) {
        complaintData.append('longitude', formData.longitude)
      }

      // Append file if present
      if (uploadedFile && uploadedFile.file) {
        complaintData.append('before_photo', uploadedFile.file)
      }

      const result = await createComplaint(complaintData)

      if (result && result.id) {
        setSuccessData(result)
        setIsSuccess(true)

        setTimeout(() => {
          navigate('/user-dashboard')
        }, 3000)
      } else {
        setSubmissionError(apiError || 'Complaint submission failed.')
      }

    } catch (err) {
      console.error(err)
      setSubmissionError(
        err?.response?.data?.detail ||
        err?.message ||
        (apiError || 'Something went wrong.')
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PageLayout>
      <div className="min-h-screen flex flex-col items-center px-4 py-10">
        <div className="w-full max-w-2xl">

          {!isSuccess ? (
            <Card className="p-8">

              <h2 className="text-3xl font-bold mb-2">File a Complaint</h2>
              <p className="text-slate-500 mb-6">
                Submit your grievance and track resolution status.
              </p>

              {submissionError && (
                <div className="mb-4 p-4 rounded-xl bg-red-100 text-red-700">
                  {submissionError}
                </div>
              )}

              {locationError && !isSuccess && (
                <div className="mb-4 p-4 rounded-xl bg-yellow-100 text-yellow-700">
                  {locationError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Title */}
                <Input
                  label="Complaint Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  error={errors.title}
                  required
                />

                {/* Description (same UI via textarea support) */}
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter complaint details..."
                  error={errors.description}
                  required
                  as="textarea"
                  rows={8}
                  className="min-h-[180px]"
                />

                {/* Location/Address */}
                <Input
                  label="Location/Address"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter your location or address"
                  error={errors.location}
                  required
                />

                {/* Geolocation Button */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Get Your Coordinates
                  </label>
                  <Button
                    type="button"
                    onClick={requestUserLocation}
                    isLoading={locationLoading}
                    className="w-full bg-blue-500 hover:bg-blue-600"
                  >
                    <MapPin className="inline mr-2 h-4 w-4" />
                    {locationLoading
                      ? 'Getting location...'
                      : formData.latitude && formData.longitude
                        ? `✓ Location Set (${formData.latitude.toFixed(4)}, ${formData.longitude.toFixed(4)})`
                        : 'Enable Location Access'}
                  </Button>
                  {locationError && (
                    <p className="text-sm text-orange-600 dark:text-orange-400">{locationError}</p>
                  )}
                </div>

                {/* File Upload (consistent UI) */}
                <Input
                  label="Before Photo (Optional)"
                  type="file"
                  name="file"
                  onChange={handleFileInput}
                />

                {/* Uploaded File Preview */}
                {uploadedFile && (
                  <div className="flex justify-between items-center bg-sky-50 p-3 rounded-xl border border-sky-200 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <Check className="text-sky-600" />
                      <span>{uploadedFile.name}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                    >
                      <Trash2 className="text-red-500" />
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading || apiLoading}
                >
                  {isLoading || apiLoading
                    ? 'Submitting...'
                    : 'Submit Complaint'}
                </Button>

              </form>
            </Card>

          ) : (
            <Card className="p-8 text-center">
              <Check className="mx-auto text-green-500 h-16 w-16 mb-4" />

              <h2 className="text-3xl font-bold mb-2">
                Complaint Submitted!
              </h2>

              <p className="mb-4 text-slate-500">
                Complaint ID: <strong>{successData?.id}</strong>
              </p>

              <p className="mb-4">
                Priority:{' '}
                <strong>
                  {successData?.priority
                    ? successData.priority.toUpperCase()
                    : 'N/A'}
                </strong>
              </p>

              <p className="text-sm text-slate-400">
                Redirecting to dashboard...
              </p>
            </Card>
          )}

        </div>
      </div>
    </PageLayout>
  )
}