"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoaderIcon, UploadIcon, XIcon } from 'lucide-react'

// Helper to check if a value is a File object
const isFile = (value) => value instanceof File

// Helper to extract URL from value (handles string URLs and {url: "..."} objects)
const extractUrl = (value) => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value.url) return value.url
  return null
}

// Helper to check if a value is a URL string or object with URL
const isUrl = (value) => {
  const url = extractUrl(value)
  return url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:') || url.startsWith('data:'))
}

// Helper to check if a value is an external URL (not a blob or data URL)
const isExternalUrl = (value) => {
  const url = extractUrl(value)
  return url && (url.startsWith('http://') || url.startsWith('https://'))
}

// Helper to create preview URL from File
const createPreview = (file) => URL.createObjectURL(file)

export function ImageUpload({
  value,
  onChange,
  multiple = false,
  folder = 'uploads',
  label = 'Upload Image',
  accept = 'image/*',
  onDelete, // Callback when an image is deleted (for bucket cleanup)
  compact = false, // Compact mode for inline use
  placeholder = 'Click to select or drag and drop'
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
    // Handle both string URLs and {url: "..."} objects
    return extractUrl(item) || item
  }

  // Get display name
  const getDisplayName = (item) => {
    if (isFile(item)) {
      return item.name
    }
    // Handle both string URLs and {url: "..."} objects
    return extractUrl(item) || item
  }

  const hasValue = multiple 
    ? (Array.isArray(value) && value.length > 0)
    : (value && value !== '' && (isFile(value) || isUrl(value)))

  // Compact mode - inline image upload
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {hasValue ? (
          <div className="flex items-center gap-2 p-1 border rounded bg-muted/30">
            <img
              src={getPreviewUrl(multiple && Array.isArray(value) ? value[0] : value)}
              alt="Preview"
              className="w-8 h-8 object-cover rounded"
            />
            <span className="text-xs text-muted-foreground truncate max-w-[100px]">
              {isFile(multiple && Array.isArray(value) ? value[0] : value) ? 'New image' : 'Uploaded'}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeImage(multiple && Array.isArray(value) ? value[0] : value, 0)
              }}
              className="text-red-500 hover:text-red-700 p-1"
            >
              <XIcon className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1.5 border border-dashed border-gray-300 rounded hover:border-gray-400 transition-colors cursor-pointer text-muted-foreground"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <UploadIcon className="w-4 h-4" />
            <span className="text-xs">{placeholder}</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}

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
            {placeholder}
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
              <div key={index} className="flex items-center gap-2 p-2 border rounded overflow-hidden">
                <img
                  src={getPreviewUrl(item)}
                  alt={`Preview ${index + 1}`}
                  className="w-16 h-16 object-cover rounded shrink-0"
                />
                <div className="flex-1 w-1 min-w-0 truncate text-sm line-clamp-1">
                  {getDisplayName(item)}
                  {isFile(item) && (
                    <p className="text-xs text-blue-600">(New - will upload on save)</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(item, index)}
                  className="text-red-600 hover:text-red-800 shrink-0"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded overflow-hidden">
              <img
                src={getPreviewUrl(value)}
                alt="Preview"
                className="w-16 h-16 object-cover rounded shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{getDisplayName(value)}</p>
                {isFile(value) && (
                  <p className="text-xs text-blue-600">(New - will upload on save)</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeImage(value, 0)}
                className="text-red-600 hover:text-red-800 shrink-0"
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

// Helper function to check if value is a valid URL string
function isValidUrl(value) {
  if (!value) return false
  if (typeof value === 'string') {
    return value.startsWith('http://') || value.startsWith('https://')
  }
  if (typeof value === 'object' && value?.url) {
    return value.url.startsWith('http://') || value.url.startsWith('https://')
  }
  return false
}

// Helper function to extract URL string from various formats
function getUrlString(value) {
  if (!value) return null
  if (typeof value === 'string') return value
  if (typeof value === 'object' && value?.url) return value.url
  return null
}

// Helper function to upload files and return URLs
// External URLs (http/https) are passed through without uploading
export async function uploadFiles(files, folder = 'uploads') {
  if (!files || (Array.isArray(files) && files.length === 0)) {
    return []
  }

  const fileArray = Array.isArray(files) ? files : [files]

  // Process each item - upload Files, pass through URLs
  const uploadPromises = fileArray.map(async (item) => {
    // Skip empty/null values
    if (!item) return null

    // If it's already a URL (string or object with url), just return it
    if (isValidUrl(item)) {
      const url = getUrlString(item)
      console.log('Using existing URL (no upload needed):', url?.substring(0, 50) + '...')
      return url
    }

    // If it's a File, upload it
    if (item instanceof File) {
      console.log('Uploading file:', item.name, 'type:', item.type, 'size:', item.size, 'to folder:', folder)

      const formData = new FormData()
      formData.append('file', item)
      formData.append('folder', folder)

      try {
        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
          credentials: 'include' // Ensure cookies are sent for auth
        })

        const data = await response.json()
        console.log('Upload response:', data)

        if (!response.ok) {
          console.error('Upload failed:', data.error)
          throw new Error(data.error || 'Upload failed')
        }

        if (!data.url) {
          console.error('Upload succeeded but no URL returned:', data)
          throw new Error('Upload succeeded but no URL returned')
        }

        return data.url
      } catch (err) {
        console.error('Upload error for file:', item.name, err)
        throw err
      }
    }

    // Unknown type - skip
    console.warn('Skipping unknown item type:', typeof item, item)
    return null
  })

  const results = await Promise.all(uploadPromises)
  return results.filter(Boolean) // Remove null values
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
