"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MessageSquareIcon,
  MapPinIcon,
  SmartphoneIcon,
  TagIcon,
  ImageIcon,
  FileTextIcon,
  ArrowLeft,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/lib/auth'
import { motion } from 'framer-motion'
import { useTransitionRouter, TransitionLink } from '@/components/ui/pageTransitions'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'
import { useWebHaptics } from 'web-haptics/react'

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export default function CustomTradeInForm({ categories }) {
  const { user } = useAuth()
  const { trigger } = useWebHaptics()
  const t = useTranslations('trade.custom')
  const tProduct = useTranslations('trade.product')
  const router = useTransitionRouter()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    deviceName: '',
    category: '',
    brand: '',
    conditionDesc: '',
    notes: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  })
  const [photos, setPhotos] = useState([])
  const [photoUrls, setPhotoUrls] = useState([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Auto-fill contact info from auth
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || '',
        email: prev.email || user.email || '',
      }))
    }
  }, [user])

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Photo upload
  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    if (photos.length + files.length > 5) {
      toast.error(t('maxPhotos'))
      return
    }

    setUploading(true)
    const supabase = getSupabaseClient()
    const newPhotos = []
    const newUrls = []

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('photoTooLarge'))
        continue
      }

      const ext = file.name.split('.').pop()
      const path = `custom-tradein/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

      const { error } = await supabase.storage
        .from('trade-photos')
        .upload(path, file)

      if (error) {
        console.error('Upload error:', error)
        toast.error(t('photoUploadError'))
        continue
      }

      const { data: urlData } = supabase.storage
        .from('trade-photos')
        .getPublicUrl(path)

      newPhotos.push(path)
      newUrls.push(urlData.publicUrl)
    }

    setPhotos(prev => [...prev, ...newPhotos])
    setPhotoUrls(prev => [...prev, ...newUrls])
    setUploading(false)
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoUrls(prev => prev.filter((_, i) => i !== index))
  }

  // Validation & submit
  const handleRequestSubmit = (e) => {
    e.preventDefault()

    if (!formData.deviceName || !formData.category || !formData.conditionDesc) {
      toast.error(t('errorDeviceFieldsRequired'))
      return
    }
    if (!formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast.error(tProduct('errorFieldsRequired'))
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error(tProduct('errorInvalidEmail'))
      return
    }

    setConfirmOpen(true)
  }

  const handleConfirmSubmit = async () => {
    setConfirmOpen(false)
    setSubmitting(true)

    try {
      const res = await fetch('/api/tradeins/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: null,
          productTitle: formData.deviceName,
          estimatedValue: 0,
          customDevice: {
            deviceName: formData.deviceName,
            category: formData.category,
            brand: formData.brand || null,
            conditionDesc: formData.conditionDesc,
            photos: photoUrls,
          },
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          notes: formData.notes || null,
          userId: user?.id || null,
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit')

      trigger('success')
      setSubmitted(true)
      toast.success(t('successToast'))
    } catch (error) {
      trigger('error')
      console.error('Error submitting custom trade-in:', error)
      toast.error(error.message || t('errorSubmit'))
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen
  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="py-8"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
            className="w-16 h-16 mx-auto mb-5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </motion.div>
          <h3 className="text-xl font-bold text-foreground mb-2">{t('successTitle')}</h3>
          <p className="text-sm text-muted-foreground mb-6">{t('successDesc')}</p>

          <div className="space-y-2">
            <TransitionLink href="/trade/custom">
              <Button variant="outline" className="w-full">
                {t('submitAnother')}
              </Button>
            </TransitionLink>
            {user && (
              <TransitionLink href="/account/trade-ins">
                <Button variant="outline" className="w-full">
                  {tProduct('viewMyTradeIns')}
                </Button>
              </TransitionLink>
            )}
            <TransitionLink href="/trade">
              <Button variant="ghost" className="w-full gap-1.5">
                <ArrowLeft className="w-4 h-4" />
                {t('backToTrade')}
              </Button>
            </TransitionLink>
          </div>
        </div>
      </motion.div>
    )
  }

  const categoryName = categories.find(c => c.slug === formData.category)?.name

  return (
    <div>
      {/* Back button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.back()}
        className="gap-1.5 mb-4 -ml-2"
      >
        <ChevronLeft className="w-4 h-4" />
        {tProduct('back')}
      </Button>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleRequestSubmit} className="space-y-6">
        {/* Device Info Section */}
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-foreground">{t('deviceInfoTitle')}</h3>

          <div className="space-y-1.5">
            <Label htmlFor="deviceName" className="text-sm font-medium">
              {t('deviceName')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <SmartphoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="deviceName"
                type="text"
                value={formData.deviceName}
                onChange={(e) => handleInputChange('deviceName', e.target.value)}
                placeholder={t('deviceNamePlaceholder')}
                className="h-11 pl-9"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="category" className="text-sm font-medium">
              {t('category')} <span className="text-red-500">*</span>
            </Label>
            <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.slug} value={cat.slug}>{cat.name}</SelectItem>
                ))}
                <SelectItem value="other">{t('categoryOther')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brand" className="text-sm font-medium">
              {t('brand')} <span className="text-xs text-muted-foreground">({tProduct('optional')})</span>
            </Label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="brand"
                type="text"
                value={formData.brand}
                onChange={(e) => handleInputChange('brand', e.target.value)}
                placeholder={t('brandPlaceholder')}
                className="h-11 pl-9"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="conditionDesc" className="text-sm font-medium">
              {t('conditionDesc')} <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FileTextIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                id="conditionDesc"
                className="w-full min-h-[100px] pl-9 px-3 py-2.5 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-sm"
                value={formData.conditionDesc}
                onChange={(e) => handleInputChange('conditionDesc', e.target.value)}
                placeholder={t('conditionDescPlaceholder')}
                required
              />
            </div>
          </div>

          {/* Photo Upload */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {t('photos')} <span className="text-xs text-muted-foreground">({tProduct('optional')})</span>
            </Label>
            <p className="text-xs text-muted-foreground">{t('photosHint')}</p>

            {photoUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {photoUrls.map((url, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
                    <Image src={url} alt={`Photo ${i + 1}`} fill className="object-cover" />
                    <Button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {photos.length < 5 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-1.5 mt-1"
              >
                {uploading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('uploading')}</>
                ) : (
                  <><ImageIcon className="w-3.5 h-3.5" /> {t('addPhotos')}</>
                )}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handlePhotoSelect}
            />
          </div>
        </div>

        {/* Contact Info Section */}
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">{tProduct('contactInfo')}</h3>
            <p className="text-sm text-muted-foreground">{tProduct('contactDesc')}</p>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                {tProduct('fullName')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name" type="text" value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={tProduct('namePlaceholder')} className="h-11 pl-9" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                {tProduct('emailAddress')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email" type="email" value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder={tProduct('emailPlaceholder')} className="h-11 pl-9" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-sm font-medium">
                {tProduct('phoneNumber')} <span className="text-xs text-muted-foreground">({tProduct('optional')})</span>
              </Label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phone" type="tel" value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder={tProduct('phonePlaceholder')} className="h-11 pl-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-sm font-medium">
                {tProduct('address')} <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="address" type="text" value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder={tProduct('addressPlaceholder')} className="h-11 pl-9" required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-medium">
                  {tProduct('city')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city" type="text" value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder={tProduct('cityPlaceholder')} className="h-11" required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-sm font-medium">
                  {tProduct('state')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state" type="text" value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder={tProduct('statePlaceholder')} className="h-11" required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="zipCode" className="text-sm font-medium">
                {tProduct('zipCode')} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="zipCode" type="text" value={formData.zipCode}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                placeholder={tProduct('zipCodePlaceholder')} className="h-11" required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-sm font-medium">
                {tProduct('additionalNotes')} <span className="text-xs text-muted-foreground">({tProduct('optional')})</span>
              </Label>
              <div className="relative">
                <MessageSquareIcon className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <textarea
                  id="notes"
                  className="w-full min-h-[80px] pl-9 px-3 py-2.5 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring bg-background text-sm"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder={tProduct('notesPlaceholder')}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={submitting || !formData.deviceName || !formData.category || !formData.conditionDesc || !formData.name || !formData.email || !formData.address || !formData.city || !formData.state || !formData.zipCode}
          className="w-full gap-2"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t('submitting')}</>
          ) : (
            <>{t('submitButton')} <ChevronRight className="w-4 h-4" /></>
          )}
        </Button>

        <div className="flex items-center justify-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {tProduct('freeShipping')}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> {tProduct('response24h')}
          </span>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmTitle')}</DialogTitle>
            <DialogDescription>{t('confirmDesc')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('deviceName')}</span>
              <span className="font-medium text-foreground">{formData.deviceName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('category')}</span>
              <span className="font-medium text-foreground">{categoryName || formData.category}</span>
            </div>
            {formData.brand && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('brand')}</span>
                <span className="font-medium text-foreground">{formData.brand}</span>
              </div>
            )}
            {photoUrls.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('photos')}</span>
                <span className="font-medium text-foreground">{photoUrls.length} {t('photosCount')}</span>
              </div>
            )}
            <div className="border-t border-border pt-3 space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tProduct('fullName')}</span>
                <span className="font-medium text-foreground">{formData.name}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tProduct('emailAddress')}</span>
                <span className="font-medium text-foreground">{formData.email}</span>
              </div>
              {formData.phone && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{tProduct('phoneNumber')}</span>
                  <span className="font-medium text-foreground">{formData.phone}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tProduct('address')}</span>
                <span className="font-medium text-foreground text-right">{formData.address}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{tProduct('cityStateZip')}</span>
                <span className="font-medium text-foreground">{formData.city}, {formData.state} {formData.zipCode}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {tProduct('cancelButton')}
            </Button>
            <Button onClick={handleConfirmSubmit} className="gap-2">
              {t('confirmSubmit')} <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
