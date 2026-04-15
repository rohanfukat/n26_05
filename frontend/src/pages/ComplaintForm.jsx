import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Upload, Trash2, Check } from 'lucide-react'

import PageLayout from '../components/PageLayout'
import Card from '../components/ui/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'

import { useComplaints } from '../hooks/useComplaints'
import { useUser } from '../context/UserContext'
import { getPriorityBadge } from '../utils/priorityCalculation'

export default function ComplaintForm() {
  const navigate = useNavigate()
  const { createComplaint, loading: apiLoading, error: apiError } = useComplaints()
  const { user } = useUser()

  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState({})
  const [submissionError, setSubmissionError] = useState('')
  const [successData, setSuccessData] = useState(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const processFile = (file) => {
    if (file.type.startsWith('image/') || file.type === 'application/pdf') {
      setUploadedFile({
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: file.type,
      })
    } else {
      alert('Only image or PDF files allowed.')
    }
  }

  const handleFileInput = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoading || apiLoading) return
    if (!validateForm()) return

    setSubmissionError('')
    setIsLoading(true)

    try {
      const complaintData = {
        title: formData.title,
        description: formData.description,
        category: 'other',
        citizenName: user?.name || 'Anonymous',
        citizenEmail: user?.email || 'anonymous@example.com',
        citizenPhone: user?.phone || '',
        source: 'web',
        locationType: 'manual',
        location: '',
        pinCode: '',
        attachments: uploadedFile ? [uploadedFile.name] : [],
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
      <div className="min-h-screen flex items-center justify-center px-4 py-10">
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

              <form onSubmit={handleSubmit} className="space-y-6">

                <Input
                  label="Complaint Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter title"
                  error={errors.title}
                  required
                />

                <div>
                  <label className="block font-medium mb-2">Description</label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="6"
                    className="w-full border rounded-xl p-4"
                    placeholder="Enter complaint details..."
                  />

                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Attachment (Optional)
                  </label>

                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-6 text-center ${
                      dragActive ? 'border-blue-500' : 'border-gray-300'
                    }`}
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileInput}
                    />

                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto mb-2" />
                      <p>
                        {uploadedFile
                          ? uploadedFile.name
                          : 'Click or Drag file here'}
                      </p>
                    </label>
                  </div>
                </div>

                {uploadedFile && (
                  <div className="flex justify-between items-center bg-green-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Check className="text-green-600" />
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