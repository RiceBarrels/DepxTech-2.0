'use client'

import { useAuth } from '@/lib/auth'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useTransitionRouter } from '@/components/ui/pageTransitions'
import { ArrowLeftIcon, UploadIcon, Loader2, UserIcon, XIcon } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function EditAccountPage() {
  const { user, profileData, updateProfile, loading: authLoading } = useAuth()
  const router = useTransitionRouter()
  const fileInputRef = useRef(null)
  
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
  })
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    if (!authLoading && profileData) {
      setFormData({
        full_name: profileData.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
      })
      
      // Set avatar preview if exists
      if (profileData.avatar && profileData.avatar !== 'default') {
        setAvatarPreview(profileData.avatar)
      }
    }
  }, [profileData, user, authLoading])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only images are allowed.')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File size exceeds 5MB limit')
      return
    }

    setSelectedFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setSelectedFile(null)
    setAvatarPreview(profileData?.avatar && profileData.avatar !== 'default' ? profileData.avatar : null)
  }

  const handleUploadAvatar = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/profile/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload image')
      }

      toast.success('Profile image uploaded successfully!')
      setSelectedFile(null)
      setAvatarPreview(data.url)
      
      // Refresh profile data
      window.location.reload()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.full_name.trim()) {
      toast.error('Full name is required')
      return
    }

    setLoading(true)
    try {
      const result = await updateProfile({
        full_name: formData.full_name.trim()
      })

      if (result.success) {
        toast.success('Profile updated successfully!')
        router.push('/account')
      } else {
        throw new Error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error(error.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/account')}
          className="mb-6"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Account
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information and avatar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload Section */}
              <div className="space-y-4">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-6">
                  {/* Avatar Preview */}
                  <div className="relative">
                    {avatarPreview ? (
                      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-border">
                        <Image
                          src={avatarPreview}
                          alt="Profile"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-4 border-border">
                        <UserIcon className="w-16 h-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="flex-1 space-y-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        <UploadIcon className="w-4 h-4 mr-2" />
                        {selectedFile ? 'Change Image' : 'Upload Image'}
                      </Button>
                      {avatarPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveAvatar}
                          disabled={uploading}
                        >
                          <XIcon className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    {selectedFile && (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Selected: {selectedFile.name}
                        </p>
                        <Button
                          type="button"
                          onClick={handleUploadAvatar}
                          disabled={uploading}
                          size="sm"
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Upload Now'
                          )}
                        </Button>
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF, WEBP up to 5MB
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact support if you need to update your email.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/account')}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

