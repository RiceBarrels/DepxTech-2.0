"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    SettingsIcon,
    BellIcon,
    MailIcon,
    SmartphoneIcon,
    MessageSquareIcon,
    PaletteIcon,
    GlobeIcon,
    ShieldIcon,
    TrashIcon,
    ArrowLeftIcon,
    Loader2,
    SunIcon,
    MoonIcon,
    MonitorIcon,
    CheckIcon
} from "lucide-react"
import { toast } from "sonner"
import { TransitionLink } from "@/components/ui/pageTransitions"
import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useTranslations } from 'next-intl'

const LANGUAGE_OPTIONS = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'zh', label: '中文' },
]

export default function SettingsPage() {
    const t = useTranslations('account.settingsPage')
    const { user, loading: authLoading, signOut } = useAuth()
    const router = useTransitionRouter()

    const THEME_OPTIONS = [
        { value: 'system', label: t('themeSystem'), icon: MonitorIcon, description: t('themeSystemDesc') },
        { value: 'light', label: t('themeLight'), icon: SunIcon, description: t('themeLightDesc') },
        { value: 'dark', label: t('themeDark'), icon: MoonIcon, description: t('themeDarkDesc') },
    ]

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [settings, setSettings] = useState({
        notification_email: true,
        notification_push: true,
        notification_sms: false,
        theme: 'system',
        language: 'en'
    })

    useEffect(() => {
        if (user) {
            fetchSettings()
        } else if (!authLoading) {
            setLoading(false)
        }
    }, [user, authLoading])

    const fetchSettings = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('profiles')
                .select('notification_email, notification_push, notification_sms, theme, language')
                .eq('id', user.id)
                .single()

            if (error && error.code !== 'PGRST116') throw error

            if (data) {
                setSettings({
                    notification_email: data.notification_email ?? true,
                    notification_push: data.notification_push ?? true,
                    notification_sms: data.notification_sms ?? false,
                    theme: data.theme ?? 'system',
                    language: data.language ?? 'en'
                })
            }
        } catch (error) {
            console.error('Error fetching settings:', error)
            toast.error(t('errorLoadSettings'))
        } finally {
            setLoading(false)
        }
    }

    const updateSetting = async (key, value) => {
        // Optimistically update UI
        setSettings(prev => ({ ...prev, [key]: value }))

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('profiles')
                .update({
                    [key]: value,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error

            // Apply theme change immediately
            if (key === 'theme') {
                applyTheme(value)
            }

            toast.success(t('settingUpdated'))
        } catch (error) {
            console.error('Error updating setting:', error)
            // Revert on error
            fetchSettings()
            toast.error(t('errorUpdateSetting'))
        }
    }

    const applyTheme = (theme) => {
        const root = document.documentElement

        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
            root.classList.toggle('dark', prefersDark)
        } else if (theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        // Store preference
        localStorage.setItem('theme', theme)
    }

    const handleDeleteAccount = async () => {
        // Note: Actual account deletion would require backend implementation
        // This is a placeholder that signs out the user
        toast.error(t('errorDeleteAccount'))
        setDeleteDialogOpen(false)
    }

    if (!user && !authLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                        <SettingsIcon className="h-12 w-12 text-muted-foreground mb-4" />
                        <h2 className="text-xl font-semibold mb-2">{t('pleaseLogIn')}</h2>
                        <p className="text-muted-foreground mb-4">{t('needLogIn')}</p>
                        <TransitionLink href="/login">
                            <Button>{t('goToLogin')}</Button>
                        </TransitionLink>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">{t('loadingSettings')}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">{t('title')}</h1>
                <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            <div className="space-y-6">
                {/* Notifications Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BellIcon className="h-5 w-5" />
                            {t('notifications')}
                        </CardTitle>
                        <CardDescription>
                            {t('notificationsDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MailIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="email-notifications" className="font-medium">
                                        {t('emailNotifications')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('emailNotificationsDesc')}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="email-notifications"
                                checked={settings.notification_email}
                                onCheckedChange={(checked) => updateSetting('notification_email', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <SmartphoneIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="push-notifications" className="font-medium">
                                        {t('pushNotifications')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('pushNotificationsDesc')}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="push-notifications"
                                checked={settings.notification_push}
                                onCheckedChange={(checked) => updateSetting('notification_push', checked)}
                            />
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquareIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label htmlFor="sms-notifications" className="font-medium">
                                        {t('smsNotifications')}
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('smsNotificationsDesc')}
                                    </p>
                                </div>
                            </div>
                            <Switch
                                id="sms-notifications"
                                checked={settings.notification_sms}
                                onCheckedChange={(checked) => updateSetting('notification_sms', checked)}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Appearance Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PaletteIcon className="h-5 w-5" />
                            {t('appearance')}
                        </CardTitle>
                        <CardDescription>
                            {t('appearanceDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <Label className="font-medium">{t('theme')}</Label>
                            <div className="grid grid-cols-3 gap-3">
                                {THEME_OPTIONS.map((option) => {
                                    const Icon = option.icon
                                    const isSelected = settings.theme === option.value
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => updateSetting('theme', option.value)}
                                            className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                                                isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-border hover:border-muted-foreground/50'
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckIcon className="h-4 w-4 text-primary" />
                                                </div>
                                            )}
                                            <Icon className={`h-6 w-6 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                                            <span className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>
                                                {option.label}
                                            </span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <GlobeIcon className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <Label className="font-medium">{t('language')}</Label>
                                    <p className="text-sm text-muted-foreground">
                                        {t('languageDesc')}
                                    </p>
                                </div>
                            </div>
                            <Select
                                value={settings.language}
                                onValueChange={(value) => updateSetting('language', value)}
                            >
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LANGUAGE_OPTIONS.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Privacy & Security Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShieldIcon className="h-5 w-5" />
                            {t('privacySecurity')}
                        </CardTitle>
                        <CardDescription>
                            {t('privacySecurityDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <TransitionLink href="/reset-password" className="block">
                            <Button variant="outline" className="w-full justify-start">
                                {t('changePassword')}
                            </Button>
                        </TransitionLink>

                        <TransitionLink href="/address" className="block">
                            <Button variant="outline" className="w-full justify-start">
                                {t('manageAddresses')}
                            </Button>
                        </TransitionLink>

                        <TransitionLink href="/privacy-policy" className="block">
                            <Button variant="outline" className="w-full justify-start">
                                {t('privacyPolicy')}
                            </Button>
                        </TransitionLink>

                        <TransitionLink href="/terms-of-service" className="block">
                            <Button variant="outline" className="w-full justify-start">
                                {t('termsOfService')}
                            </Button>
                        </TransitionLink>
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <TrashIcon className="h-5 w-5" />
                            {t('dangerZone')}
                        </CardTitle>
                        <CardDescription>
                            {t('dangerZoneDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button
                            variant="destructive"
                            onClick={() => setDeleteDialogOpen(true)}
                            className="w-full"
                        >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            {t('deleteAccount')}
                        </Button>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            {t('deleteAccountPermanent')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Delete Account Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-destructive">{t('deleteAccount')}</DialogTitle>
                        <DialogDescription>
                            {t('deleteAccountConfirm')}
                            <ul className="list-disc list-inside mt-2 space-y-1">
                                <li>{t('deleteDataProfile')}</li>
                                <li>{t('deleteDataOrders')}</li>
                                <li>{t('deleteDataAddresses')}</li>
                                <li>{t('deleteDataPreferences')}</li>
                            </ul>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            {t('cancel')}
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteAccount}>
                            {t('deleteAccountButton')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
