"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoaderIcon, UploadIcon, XIcon } from 'lucide-react'

// Helper to check if a value is a File object
const isFile = (value) => value instanceof File

// Helper to check if a value is a URL string
const isUrl = (value) => typeof value === 'string' && (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('blob:'))

// Helper to create preview URL from File
const createPreview = (file) => URL.createObjectURL(file)

export function ImageUpload({ 
  value, 
  onChange, 
  multiple = false, 
  folder = 'uploads',
  label = 'Upload Image',
  accept = 'image/*',
  onDelete // Callback when an image is deleted (for bucket cleanup)
}) {
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      if (multiple && Array.isArray(value)) {
        value.forEach(item => {
          if (isFile(item)) {
            URL.revokeObjectURL(createPreview(item))
          }
        })
      } else if (isFile(value)) {
        URL.revokeObjectURL(createPreview(value))
      }
    }
  }, [])

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setError(null)

    try {
      if (multiple) {
        const currentItems = Array.isArray(value) ? value : []
        const newItems = [...currentItems, ...files]
        onChange(newItems)
      } else {
        onChange(files[0])
      }
    } catch (err) {
      setError(err.message || 'Failed to add image')
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const removeImage = async (itemToRemove, index) => {
    // If it's a URL (already uploaded), delete from bucket
    if (isUrl(itemToRemove) && onDelete) {
      try {
        await onDelete(itemToRemove)
      } catch (err) {
        console.error('Error deleting from bucket:', err)
        // Continue with removal from UI even if bucket delete fails
      }
    } else if (isFile(itemToRemove)) {
      // Cleanup preview URL for File objects
      URL.revokeObjectURL(createPreview(itemToRemove))
    }

    if (multiple && Array.isArray(value)) {
      onChange(value.filter((_, i) => i !== index))
    } else {
      onChange('')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    if (files.length > 0) {
      const event = { target: { files } }
      handleFileSelect(event)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Get preview URL for display
  const getPreviewUrl = (item) => {
    if (isFile(item)) {
      return createPreview(item)
    }
    return item
  }

  // Get display name
  const getDisplayName = (item) => {
    if (isFile(item)) {
      return item.name
    }
    return item
  }

  const hasValue = multiple 
    ? (Array.isArray(value) && value.length > 0)
    : (value && value !== '' && (isFile(value) || isUrl(value)))

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      
      {/* Upload Area */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="flex flex-col items-center gap-2">
          <UploadIcon className="w-8 h-8 text-gray-400" />
          <p className="text-sm text-muted-foreground">
            Click to select or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF, WEBP up to 10MB (uploaded on save)
          </p>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {/* Preview Images */}
      {hasValue && (
        <div className="space-y-2 mt-4">
          {multiple && Array.isArray(value) ? (
            value.map((item, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <img 
                  src={getPreviewUrl(item)} 
                  alt={`Preview ${index + 1}`} 
                  className="w-16 h-16 object-cover rounded"
                />
                <span className="flex-1 text-sm truncate">{getDisplayName(item)}</span>
                {isFile(item) && (
                  <span className="text-xs text-blue-600">(New - will upload on save)</span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(item, index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded">
              <img 
                src={getPreviewUrl(value)} 
                alt="Preview" 
                className="w-16 h-16 object-cover rounded"
              />
              <span className="flex-1 text-sm truncate">{getDisplayName(value)}</span>
              {isFile(value) && (
                <span className="text-xs text-blue-600">(New - will upload on save)</span>
              )}
              <button
                type="button"
                onClick={() => removeImage(value, 0)}
                className="text-red-600 hover:text-red-800"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual URL Input (fallback) */}
      <div className="mt-2">
        <p className="text-xs text-muted-foreground mb-1">Or enter URL manually:</p>
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                const url = e.target.value.trim()
                if (url) {
                  if (multiple) {
                    const currentItems = Array.isArray(value) ? value : []
                    onChange([...currentItems, url])
                  } else {
                    onChange(url)
                  }
                  e.target.value = ''
                }
              }
            }}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  )
}

// Helper function to upload files and return URLs
export async function uploadFiles(files, folder = 'uploads') {
  if (!files || (Array.isArray(files) && files.length === 0)) {
    return []
  }

  const fileArray = Array.isArray(files) ? files : [files]
  
  // Check if all are already URLs
  const allUrls = fileArray.every(f => !(f instanceof File))
  if (allUrls) {
    return fileArray
  }

  // Upload files and preserve order
  const uploadPromises = fileArray.map(async (item) => {
    if (item instanceof File) {
      const formData = new FormData()
      formData.append('file', item)
      formData.append('folder', folder)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }
      return data.url
    } else {
      // Already a URL, return as is
      return item
    }
  })

  return await Promise.all(uploadPromises)
}

// Helper function to delete a file from bucket
export async function deleteFileFromBucket(url) {
  const response = await fetch('/api/admin/upload/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url })
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data.error || 'Delete failed')
  }

  return data
}
