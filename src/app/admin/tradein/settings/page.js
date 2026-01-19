"use client"

import { useTransitionRouter } from "@/components/ui/pageTransitions"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
    ArrowLeftIcon,
    SaveIcon,
    SettingsIcon,
    PercentIcon,
    RefreshCwIcon
} from 'lucide-react'
import { toast } from 'sonner'

export default function TradeinSettingsPage() {
    const router = useTransitionRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState([])

    // Fetch settings
    useEffect(() => {
        async function fetchSettings() {
            try {
                setLoading(true)
                const response = await fetch('/api/admin/tradein/settings')
                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch settings')
                }

                setSettings(data.settings || [])
            } catch (err) {
                toast.error('Failed to load settings', { description: err.message })
            } finally {
                setLoading(false)
            }
        }

        fetchSettings()
    }, [])

    const handleSettingChange = (settingKey, value) => {
        setSettings(prev =>
            prev.map(s =>
                s.setting_key === settingKey
                    ? { ...s, setting_value: value }
                    : s
            )
        )
    }

    const handleSaveSettings = async () => {
        try {
            setSaving(true)
            const response = await fetch('/api/admin/tradein/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    settings: settings.map(s => ({
                        setting_key: s.setting_key,
                        setting_value: s.setting_value
                    }))
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save settings')
            }

            toast.success('Settings saved successfully!')
        } catch (err) {
            toast.error('Failed to save settings', { description: err.message })
        } finally {
            setSaving(false)
        }
    }

    const getSettingByKey = (key) => settings.find(s => s.setting_key === key)

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={() => router.push('/admin/tradein')}>
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Trade-in Products
                    </Button>
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
                        <SettingsIcon className="w-10 h-10" />
                        Trade-in Settings
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Configure eBay pricing multipliers
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PercentIcon className="w-5 h-5" />
                            eBay Price Multipliers
                        </CardTitle>
                        <CardDescription>
                            Configure how trade-in values are calculated from eBay market prices
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {loading ? (
                            <div className="flex items-center justify-center py-8">
                                <RefreshCwIcon className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            <>
                                {settings.map(setting => (
                                    <div key={setting.id} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-base font-medium">
                                                    {setting.label}
                                                </Label>
                                                <p className="text-sm text-muted-foreground">
                                                    {setting.description}
                                                </p>
                                            </div>
                                            <Badge variant="outline" className="text-lg px-4 py-1">
                                                {setting.setting_value}%
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-sm text-muted-foreground w-8">
                                                {setting.min_value}%
                                            </span>
                                            <Slider
                                                value={[parseFloat(setting.setting_value)]}
                                                min={parseFloat(setting.min_value)}
                                                max={parseFloat(setting.max_value)}
                                                step={1}
                                                onValueChange={([value]) =>
                                                    handleSettingChange(setting.setting_key, value)
                                                }
                                                className="flex-1"
                                            />
                                            <span className="text-sm text-muted-foreground w-8">
                                                {setting.max_value}%
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                <div className="pt-6 border-t">
                                    <h3 className="font-medium mb-4">Preview Calculation</h3>
                                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                                        <p>
                                            <span className="text-muted-foreground">If eBay used market median:</span>{' '}
                                            <strong>$100</strong>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Trade-in value:</span>{' '}
                                            <strong className="text-green-600">
                                                ${((getSettingByKey('used_market_multiplier')?.setting_value || 65)).toFixed(2)}
                                            </strong>
                                            {' '}({getSettingByKey('used_market_multiplier')?.setting_value || 65}%)
                                        </p>
                                        <p className="pt-2 border-t">
                                            <span className="text-muted-foreground">If no used listings, new market median:</span>{' '}
                                            <strong>$150</strong>
                                        </p>
                                        <p>
                                            <span className="text-muted-foreground">Trade-in value:</span>{' '}
                                            <strong className="text-green-600">
                                                ${(1.5 * (getSettingByKey('new_market_multiplier')?.setting_value || 40)).toFixed(2)}
                                            </strong>
                                            {' '}({getSettingByKey('new_market_multiplier')?.setting_value || 40}%)
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleSaveSettings} disabled={saving}>
                                        {saving ? (
                                            <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                                        ) : (
                                            <SaveIcon className="w-4 h-4 mr-2" />
                                        )}
                                        Save Settings
                                    </Button>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Note:</strong> Product-specific questions can be configured directly on each product's edit page.
                    </p>
                </div>
            </div>
        </div>
    )
}
