"use client"

import { useEffect, useState } from "react"
import { useTranslations } from 'next-intl'
import { useAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    MapPinIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    StarIcon,
    ArrowLeftIcon,
    Loader2,
    HomeIcon,
    BriefcaseIcon,
    BuildingIcon,
    CheckCircle,
    AlertCircle,
    ShieldCheckIcon
} from "lucide-react"
import { toast } from "sonner"
import { TransitionLink } from "@/components/ui/pageTransitions"
import { useWebHaptics } from 'web-haptics/react'

const ADDRESS_LABELS = [
    { value: 'Home', label: 'Home', icon: HomeIcon },
    { value: 'Work', label: 'Work', icon: BriefcaseIcon },
    { value: 'Other', label: 'Other', icon: BuildingIcon },
]

const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const emptyAddress = {
    label: 'Home',
    full_name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    is_default: false
}

export default function AddressPage() {
    const t = useTranslations('address')
    const { user, loading: authLoading } = useAuth()
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editingAddress, setEditingAddress] = useState(null)
    const [addressToDelete, setAddressToDelete] = useState(null)
    const [formData, setFormData] = useState(emptyAddress)
    const [validating, setValidating] = useState(false)
    const [validationResult, setValidationResult] = useState(null)
    const { trigger } = useWebHaptics()

    useEffect(() => {
        if (user) {
            fetchAddresses()
        } else if (!authLoading) {
            setLoading(false)
        }
    }, [user, authLoading])

    const fetchAddresses = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error
            setAddresses(data || [])
        } catch (error) {
            console.error('Error fetching addresses:', error)
            toast.error(t('failedLoadAddresses'))
        } finally {
            setLoading(false)
        }
    }

    const handleOpenDialog = (address = null) => {
        if (address) {
            setEditingAddress(address)
            setFormData(address)
        } else {
            setEditingAddress(null)
            setFormData({
                ...emptyAddress,
                full_name: user?.user_metadata?.full_name || ''
            })
        }
        setDialogOpen(true)
    }

    const handleCloseDialog = () => {
        setDialogOpen(false)
        setEditingAddress(null)
        setFormData(emptyAddress)
        setValidationResult(null)
    }

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
        // Clear validation when address fields change
        if (['address_line_1', 'address_line_2', 'city', 'state', 'postal_code'].includes(field)) {
            setValidationResult(null)
        }
    }

    const handleValidateAddress = async () => {
        // Check minimum required fields
        if (!formData.address_line_1?.trim() || !formData.city?.trim() || !formData.state || !formData.postal_code?.trim()) {
            toast.error(t('fillAllFields', { field: 'address, city, state, ZIP code' }))
            return
        }

        setValidating(true)
        try {
            const response = await fetch('/api/shipping/validate-address', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: {
                        full_name: formData.full_name,
                        address_line_1: formData.address_line_1,
                        address_line_2: formData.address_line_2,
                        city: formData.city,
                        state: formData.state,
                        postal_code: formData.postal_code,
                        country: formData.country
                    }
                })
            })

            const data = await response.json()
            setValidationResult(data)

            if (data.is_valid) {
                trigger('success')
                toast.success(t('addressVerifiedToast'))
            } else {
                trigger('warning')
                toast.warning(t('addressMayHaveIssuesToast'))
            }
        } catch (error) {
            trigger('error')
            console.error('Error validating address:', error)
            toast.error(t('failedValidateAddress'))
        } finally {
            setValidating(false)
        }
    }

    const handleUseSuggestedAddress = () => {
        if (validationResult?.suggested_address) {
            const suggested = validationResult.suggested_address
            setFormData(prev => ({
                ...prev,
                address_line_1: suggested.street1 || prev.address_line_1,
                address_line_2: suggested.street2 || '',
                city: suggested.city || prev.city,
                state: suggested.state || prev.state,
                postal_code: suggested.zip || prev.postal_code
            }))
            setValidationResult(null)
            toast.success(t('addressUpdatedSuggestions'))
        }
    }

    const validateForm = () => {
        const required = ['full_name', 'address_line_1', 'city', 'state', 'postal_code']
        for (const field of required) {
            if (!formData[field]?.trim()) {
                toast.error(t('fillAllFields', { field: field.replace(/_/g, ' ') }))
                return false
            }
        }

        // Validate postal code format
        const postalRegex = /^\d{5}(-\d{4})?$/
        if (!postalRegex.test(formData.postal_code)) {
            toast.error(t('validZipCode'))
            return false
        }

        return true
    }

    const handleSaveAddress = async () => {
        if (!validateForm()) return

        setSaving(true)
        try {
            const supabase = createClient()

            const addressData = {
                user_id: user.id,
                label: formData.label,
                full_name: formData.full_name.trim(),
                phone: formData.phone?.trim() || null,
                address_line_1: formData.address_line_1.trim(),
                address_line_2: formData.address_line_2?.trim() || null,
                city: formData.city.trim(),
                state: formData.state,
                postal_code: formData.postal_code.trim(),
                country: formData.country,
                is_default: formData.is_default,
                updated_at: new Date().toISOString()
            }

            if (editingAddress) {
                // Update existing address
                const { error } = await supabase
                    .from('addresses')
                    .update(addressData)
                    .eq('id', editingAddress.id)

                if (error) throw error
                trigger('success')
                toast.success(t('addressUpdated'))
            } else {
                // Create new address
                // If this is the first address, make it default
                if (addresses.length === 0) {
                    addressData.is_default = true
                }

                const { error } = await supabase
                    .from('addresses')
                    .insert(addressData)

                if (error) throw error
                trigger('success')
                toast.success(t('addressAdded'))
            }

            handleCloseDialog()
            fetchAddresses()
        } catch (error) {
            trigger('error')
            console.error('Error saving address:', error)
            toast.error(t('failedSaveAddress'))
        } finally {
            setSaving(false)
        }
    }

    const handleSetDefault = async (addressId) => {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('addresses')
                .update({ is_default: true, updated_at: new Date().toISOString() })
                .eq('id', addressId)

            if (error) throw error
            trigger('success')
            toast.success(t('defaultUpdated'))
            fetchAddresses()
        } catch (error) {
            trigger('error')
            console.error('Error setting default address:', error)
            toast.error(t('failedSetDefault'))
        }
    }

    const handleDeleteAddress = async () => {
        if (!addressToDelete) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', addressToDelete.id)

            if (error) throw error
            trigger('success')
            toast.success(t('addressDeleted'))
            setDeleteDialogOpen(false)
            setAddressToDelete(null)
            fetchAddresses()
        } catch (error) {
            trigger('error')
            console.error('Error deleting address:', error)
            toast.error(t('failedDeleteAddress'))
        }
    }

    const getLabelIcon = (label) => {
        const found = ADDRESS_LABELS.find(l => l.value === label)
        return found ? found.icon : MapPinIcon
    }

    if (!user && !authLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <MapPinIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t('pleaseLogIn')}</h2>
                        <p className="text-muted-foreground mb-4">{t('needLoginAddress')}</p>
                        <TransitionLink href="/login">
                            <Button>{t('goToLogin')}</Button>
                        </TransitionLink>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{t('shippingAddresses')}</h1>
                        <p className="text-muted-foreground">{t('manageAddresses')}</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        {t('addAddress')}
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">{t('loadingAddresses')}</span>
                </div>
            ) : addresses.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <MapPinIcon className="h-16 w-16 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t('noAddressesYet')}</h2>
                        <p className="text-muted-foreground mb-4">{t('addFirstAddress')}</p>
                        <Button onClick={() => handleOpenDialog()}>
                            <PlusIcon className="h-4 w-4 mr-2" />
                            {t('addAddress')}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => {
                        const LabelIcon = getLabelIcon(address.label)
                        return (
                            <Card key={address.id} className={address.is_default ? 'border-primary' : ''}>
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <LabelIcon className="h-4 w-4" />
                                            <CardTitle className="text-lg">{address.label}</CardTitle>
                                            {address.is_default && (
                                                <Badge variant="default" className="ml-2">
                                                    <StarIcon className="h-3 w-3 mr-1" />
                                                    {t('defaultBadge')}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1 text-sm">
                                        <p className="font-medium">{address.full_name}</p>
                                        {address.phone && <p className="text-muted-foreground">{address.phone}</p>}
                                        <p>{address.address_line_1}</p>
                                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                                        <p>{address.city}, {address.state} {address.postal_code}</p>
                                        <p>{address.country}</p>
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenDialog(address)}
                                        >
                                            <PencilIcon className="h-3 w-3 mr-1" />
                                            {t('edit')}
                                        </Button>
                                        {!address.is_default && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleSetDefault(address.id)}
                                            >
                                                <StarIcon className="h-3 w-3 mr-1" />
                                                {t('setDefault')}
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => {
                                                setAddressToDelete(address)
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            <TrashIcon className="h-3 w-3 mr-1" />
                                            {t('delete')}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {/* Add/Edit Address Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingAddress ? t('editAddress') : t('addNewAddress')}
                        </DialogTitle>
                        <DialogDescription>
                            {editingAddress ? t('updateDetails') : t('addNewDesc')}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="label">{t('addressLabel')}</Label>
                            <Select
                                value={formData.label}
                                onValueChange={(value) => handleInputChange('label', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t('selectLabel')} />
                                </SelectTrigger>
                                <SelectContent>
                                    {ADDRESS_LABELS.map((label) => (
                                        <SelectItem key={label.value} value={label.value}>
                                            <div className="flex items-center gap-2">
                                                <label.icon className="h-4 w-4" />
                                                {label.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">{t('fullName')} *</Label>
                                <Input
                                    id="full_name"
                                    value={formData.full_name}
                                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t('phone')}</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={formData.phone || ''}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="(555) 123-4567"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address_line_1">{t('addressLine1')} *</Label>
                            <Input
                                id="address_line_1"
                                value={formData.address_line_1}
                                onChange={(e) => handleInputChange('address_line_1', e.target.value)}
                                placeholder="123 Main Street"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address_line_2">{t('addressLine2')}</Label>
                            <Input
                                id="address_line_2"
                                value={formData.address_line_2 || ''}
                                onChange={(e) => handleInputChange('address_line_2', e.target.value)}
                                placeholder="Apt, Suite, Unit, etc."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="city">{t('city')} *</Label>
                                <Input
                                    id="city"
                                    value={formData.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    placeholder="New York"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="state">{t('state')} *</Label>
                                <Select
                                    value={formData.state}
                                    onValueChange={(value) => handleInputChange('state', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('selectState')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {US_STATES.map((state) => (
                                            <SelectItem key={state} value={state}>
                                                {state}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="postal_code">{t('zipCode')} *</Label>
                                <Input
                                    id="postal_code"
                                    value={formData.postal_code}
                                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                                    placeholder="10001"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="country">{t('country')}</Label>
                                <Input
                                    id="country"
                                    value={formData.country}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>
                        </div>

                        {/* Address Validation Section */}
                        <Separator />

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ShieldCheckIcon className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium">{t('addressVerification')}</span>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleValidateAddress}
                                    disabled={validating}
                                >
                                    {validating ? (
                                        <>
                                            <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                                            {t('verifying')}
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-3 w-3 mr-2" />
                                            {t('verifyAddress')}
                                        </>
                                    )}
                                </Button>
                            </div>

                            {validationResult && (
                                <div className={`p-3 rounded-lg ${
                                    validationResult.is_valid
                                        ? 'bg-green-50 border border-green-200'
                                        : 'bg-yellow-50 border border-yellow-200'
                                }`}>
                                    <div className="flex items-start gap-2">
                                        {validationResult.is_valid ? (
                                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        ) : (
                                            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${
                                                validationResult.is_valid ? 'text-green-800' : 'text-yellow-800'
                                            }`}>
                                                {validationResult.is_valid
                                                    ? t('addressVerifiedSuccess')
                                                    : t('addressMayHaveIssues')}
                                            </p>

                                            {validationResult.messages?.length > 0 && (
                                                <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
                                                    {validationResult.messages.map((msg, i) => (
                                                        <li key={i}>{msg.text || msg}</li>
                                                    ))}
                                                </ul>
                                            )}

                                            {!validationResult.is_valid && validationResult.suggested_address && (
                                                <div className="mt-2 p-2 bg-white rounded border">
                                                    <p className="text-xs font-medium text-gray-700 mb-1">{t('suggestedAddress')}</p>
                                                    <p className="text-xs text-gray-600">
                                                        {validationResult.suggested_address.street1}
                                                        {validationResult.suggested_address.street2 && `, ${validationResult.suggested_address.street2}`}
                                                    </p>
                                                    <p className="text-xs text-gray-600">
                                                        {validationResult.suggested_address.city}, {validationResult.suggested_address.state} {validationResult.suggested_address.zip}
                                                    </p>
                                                    <Button
                                                        type="button"
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 mt-1 text-xs"
                                                        onClick={handleUseSuggestedAddress}
                                                    >
                                                        {t('useThisAddress')}
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {!validationResult && (
                                <p className="text-xs text-muted-foreground">
                                    {t('verifyForDelivery')}
                                </p>
                            )}
                        </div>

                        <Separator />

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={formData.is_default}
                                onChange={(e) => handleInputChange('is_default', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="is_default" className="font-normal">
                                {t('setAsDefault')}
                            </Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseDialog}>
                            {t('cancel')}
                        </Button>
                        <Button onClick={handleSaveAddress} disabled={saving}>
                            {saving ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('saving')}
                                </>
                            ) : (
                                editingAddress ? t('updateAddressBtn') : t('addAddressBtn')
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('deleteAddress')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteConfirm')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAddress}>
                            {t('deleteBtn')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
