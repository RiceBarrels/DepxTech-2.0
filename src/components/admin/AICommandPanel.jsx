"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
    SparklesIcon,
    LoaderIcon,
    SendIcon,
    XIcon,
    CheckIcon,
    TrashIcon,
    PlusIcon,
    EditIcon,
    AlertCircleIcon,
    GlobeIcon,
} from 'lucide-react'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const AI_MODELS = [
    { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash', tag: 'Fast' },
    { id: 'deepseek/deepseek-chat-v3-0324:free', label: 'DeepSeek V3', tag: 'Smart' },
    { id: 'meta-llama/llama-4-maverick:free', label: 'Llama 4 Maverick', tag: 'Smart' },
    { id: 'qwen/qwen3-235b-a22b:free', label: 'Qwen3 235B', tag: 'Large' },
    { id: 'arcee-ai/trinity-large-preview:free', label: 'Trinity Large', tag: 'Free' },
]

function ActionRow({ action, index, status, result, onApprove, onReject }) {
    const Icon = action.type === 'add' ? PlusIcon
        : action.type === 'delete' ? TrashIcon
        : EditIcon

    const typeColor = action.type === 'add' ? 'text-green-600 dark:text-green-400'
        : action.type === 'delete' ? 'text-red-600 dark:text-red-400'
        : 'text-blue-600 dark:text-blue-400'

    const typeBg = action.type === 'add' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
        : action.type === 'delete' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'

    const d = action.data || {}
    const title = d.title || ''
    const brand = d.brand || ''
    const series = d.series || ''
    const category = d.category || ''
    const price = d.base_price ?? d.fields?.base_price
    const fields = d.fields ? Object.keys(d.fields) : []

    return (
        <div className={cn(
            "flex items-center gap-2 px-2.5 py-2 rounded-md border text-sm transition-colors",
            status === 'rejected' && "opacity-40",
            status === 'success' && "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
            status === 'error' && "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800",
            status === 'approved' && "bg-primary/5 border-primary/20",
            (status === 'pending') && "hover:bg-muted/50",
        )}>
            <Icon className={cn("w-4 h-4 shrink-0 mt-0.5 self-start", typeColor)} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium truncate">{title || action.description}</span>
                    <Badge className={cn("text-[10px] h-4 px-1 shrink-0", typeBg)}>
                        {action.type}
                    </Badge>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {brand && <span className="text-[10px] text-muted-foreground">{brand}</span>}
                    {series && (
                        <>
                            {brand && <span className="text-[10px] text-muted-foreground/50">/</span>}
                            <span className="text-[10px] text-muted-foreground">{series}</span>
                        </>
                    )}
                    {category && (
                        <Badge variant="outline" className="text-[9px] h-3.5 px-1 text-muted-foreground">
                            {category}
                        </Badge>
                    )}
                    {price !== undefined && price !== null && (
                        <span className="text-[10px] font-medium text-foreground">${Number(price).toFixed(2)}</span>
                    )}
                    {action.type === 'update' && fields.length > 0 && (
                        <span className="text-[10px] text-muted-foreground">
                            ({fields.map(f => {
                                const v = d.fields[f]
                                return `${f}: ${typeof v === 'number' ? (f.includes('price') ? `$${v.toFixed(2)}` : v) : v}`
                            }).join(', ')})
                        </span>
                    )}
                </div>
            </div>

            {status === 'pending' && (
                <div className="flex items-center gap-0.5 shrink-0">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onApprove(index)} title="Approve">
                        <CheckIcon className="w-3.5 h-3.5 text-green-600" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => onReject(index)} title="Reject">
                        <XIcon className="w-3.5 h-3.5 text-red-600" />
                    </Button>
                </div>
            )}
            {status === 'approved' && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0 text-green-600 border-green-300 dark:text-green-400 dark:border-green-700">
                    Approved
                </Badge>
            )}
            {status === 'rejected' && (
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 shrink-0 text-muted-foreground">
                    Rejected
                </Badge>
            )}
            {status === 'executing' && (
                <LoaderIcon className="w-4 h-4 animate-spin shrink-0 text-muted-foreground" />
            )}
            {status === 'success' && (
                <CheckIcon className="w-4 h-4 shrink-0 text-green-600" />
            )}
            {status === 'error' && (
                <span className="text-[10px] text-red-600 truncate max-w-[120px] shrink-0" title={result}>
                    {result}
                </span>
            )}
        </div>
    )
}

function HistoryEntry({ entry, onApprove, onReject, onApproveAll, onExecute }) {
    const pendingCount = entry.actions.filter((_, i) => entry.actionStatuses[i] === 'pending').length
    const approvedCount = entry.actions.filter((_, i) => entry.actionStatuses[i] === 'approved').length
    const doneCount = entry.actions.filter((_, i) =>
        entry.actionStatuses[i] === 'success' || entry.actionStatuses[i] === 'error'
    ).length

    return (
        <div className="space-y-1.5 pb-3 border-b last:border-b-0">
            {/* Command header */}
            <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] shrink-0">{entry.modelLabel}</Badge>
                <span className="text-xs font-medium truncate">{entry.command}</span>
            </div>

            {/* Error */}
            {entry.error && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 dark:bg-red-950/20 rounded-md px-2.5 py-1.5">
                    <AlertCircleIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{entry.error}</span>
                </div>
            )}

            {/* Summary */}
            {entry.summary && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
                    <SparklesIcon className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary/60" />
                    <span>{entry.summary}</span>
                </div>
            )}

            {/* No actions */}
            {!entry.error && entry.actions.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
                    <AlertCircleIcon className="w-3.5 h-3.5" />
                    No actions generated.
                </div>
            )}

            {/* Actions */}
            {entry.actions.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                            {entry.actions.length} action{entry.actions.length !== 1 ? 's' : ''}
                            {doneCount > 0 && ` (${doneCount} done)`}
                        </span>
                        <div className="flex gap-1.5">
                            {pendingCount > 0 && (
                                <Button variant="outline" size="sm" className="h-6 text-[10px] px-2" onClick={onApproveAll}>
                                    <CheckIcon className="w-3 h-3 mr-1" />
                                    Approve All
                                </Button>
                            )}
                            {approvedCount > 0 && !entry.hasExecuted && (
                                <Button size="sm" className="h-6 text-[10px] px-2" onClick={onExecute}>
                                    Execute ({approvedCount})
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1">
                        {entry.actions.map((action, i) => (
                            <ActionRow
                                key={i}
                                action={action}
                                index={i}
                                status={entry.actionStatuses[i] || 'pending'}
                                result={entry.executionResults[i]}
                                onApprove={onApprove}
                                onReject={onReject}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export function AICommandPanel({ products, onProductsChanged }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [command, setCommand] = useState('')
    const [model, setModel] = useState(AI_MODELS[0].id)
    const [history, setHistory] = useState([])
    const [streaming, setStreaming] = useState(null) // { command, modelLabel, text }
    const [webSearch, setWebSearch] = useState(false)
    const scrollRef = useRef(null)

    const isLoading = streaming !== null

    // Auto-scroll on new history or streaming updates
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [history.length, streaming?.text?.length])

    const handleSubmitCommand = async () => {
        if (!command.trim() || isLoading) return

        const cmdText = command.trim()
        const modelInfo = AI_MODELS.find(m => m.id === model) || AI_MODELS[0]

        setCommand('')
        setStreaming({ command: cmdText, modelLabel: modelInfo.label, text: '' })

        try {
            const productContext = products.map(p => ({
                id: p.id,
                title: p.title,
                brand: p.brand,
                series: p.series,
                category: p.category,
                base_price: p.base_price,
            }))

            // Build chat history from past entries
            const chatHistory = history.flatMap(e => [
                { role: 'user', content: e.command },
                ...(e.rawResponse ? [{ role: 'assistant', content: e.rawResponse }] : []),
            ])

            const response = await fetch('/api/admin/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'tradein_command_stream',
                    command: cmdText,
                    productContext,
                    model,
                    chatHistory,
                    webSearch,
                }),
            })

            if (!response.ok) {
                let errMsg = 'AI request failed'
                try {
                    const data = await response.json()
                    errMsg = data.error || errMsg
                } catch {}
                throw new Error(errMsg)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let fullText = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                const chunk = decoder.decode(value, { stream: true })
                fullText += chunk
                setStreaming(prev => prev ? { ...prev, text: fullText } : null)
            }

            // Done streaming — parse JSON
            const cleaned = fullText.replace(/```(?:json)?\s*/g, '').replace(/```\s*/g, '').trim()

            try {
                const parsed = JSON.parse(cleaned)
                const actions = parsed.actions || []
                const statuses = {}
                actions.forEach((_, i) => { statuses[i] = 'pending' })

                setHistory(prev => [...prev, {
                    id: Date.now(),
                    command: cmdText,
                    modelLabel: modelInfo.label,
                    rawResponse: fullText,
                    summary: parsed.summary || '',
                    actions,
                    actionStatuses: statuses,
                    executionResults: {},
                    hasExecuted: false,
                    error: null,
                }])

                if (actions.length > 0) {
                    toast.success(`${actions.length} actions proposed`)
                }
            } catch {
                setHistory(prev => [...prev, {
                    id: Date.now(),
                    command: cmdText,
                    modelLabel: modelInfo.label,
                    rawResponse: fullText,
                    summary: '',
                    actions: [],
                    actionStatuses: {},
                    executionResults: {},
                    hasExecuted: false,
                    error: 'Failed to parse AI response. Raw output was displayed above.',
                }])
            }
        } catch (err) {
            setHistory(prev => [...prev, {
                id: Date.now(),
                command: cmdText,
                modelLabel: modelInfo.label,
                rawResponse: '',
                summary: '',
                actions: [],
                actionStatuses: {},
                executionResults: {},
                hasExecuted: false,
                error: err.message,
            }])
        } finally {
            setStreaming(null)
        }
    }

    // Entry-scoped action handlers
    const updateEntry = (entryId, fn) => {
        setHistory(prev => prev.map(e => e.id === entryId ? fn(e) : e))
    }

    const approveAction = (entryId, index) => {
        updateEntry(entryId, e => ({
            ...e, actionStatuses: { ...e.actionStatuses, [index]: 'approved' }
        }))
    }

    const rejectAction = (entryId, index) => {
        updateEntry(entryId, e => ({
            ...e, actionStatuses: { ...e.actionStatuses, [index]: 'rejected' }
        }))
    }

    const approveAll = (entryId) => {
        updateEntry(entryId, e => {
            const next = { ...e.actionStatuses }
            e.actions.forEach((_, i) => {
                if (next[i] === 'pending') next[i] = 'approved'
            })
            return { ...e, actionStatuses: next }
        })
    }

    const executeAction = async (action) => {
        let response
        switch (action.type) {
            case 'add':
                response = await fetch('/api/admin/tradein', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: action.data.title,
                        category: action.data.category || '',
                        brand: action.data.brand || '',
                        series: action.data.series || '',
                        base_price: action.data.base_price || 0,
                        des: action.data.des || '',
                    }),
                })
                break
            case 'delete':
                if (!action.data.id) throw new Error('Missing product ID')
                response = await fetch(`/api/admin/tradein?id=${action.data.id}`, { method: 'DELETE' })
                break
            case 'update': {
                if (!action.data.id) throw new Error('Missing product ID')
                const current = products.find(p => p.id === action.data.id)
                if (!current) throw new Error('Product not found')
                response = await fetch('/api/admin/tradein', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: action.data.id, title: current.title, ...action.data.fields }),
                })
                break
            }
            default:
                throw new Error(`Unknown action type: ${action.type}`)
        }
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Request failed')
    }

    const executeApproved = async (entryId) => {
        const entry = history.find(e => e.id === entryId)
        if (!entry) return

        updateEntry(entryId, e => ({ ...e, hasExecuted: true }))

        const approvedIndices = entry.actions
            .map((_, i) => i)
            .filter(i => entry.actionStatuses[i] === 'approved')

        for (const i of approvedIndices) {
            updateEntry(entryId, e => ({
                ...e, actionStatuses: { ...e.actionStatuses, [i]: 'executing' }
            }))

            try {
                await executeAction(entry.actions[i])
                updateEntry(entryId, e => ({
                    ...e,
                    actionStatuses: { ...e.actionStatuses, [i]: 'success' },
                    executionResults: { ...e.executionResults, [i]: 'OK' },
                }))
            } catch (err) {
                updateEntry(entryId, e => ({
                    ...e,
                    actionStatuses: { ...e.actionStatuses, [i]: 'error' },
                    executionResults: { ...e.executionResults, [i]: err.message },
                }))
            }
        }

        if (onProductsChanged) await onProductsChanged()
        toast.success(`Executed ${approvedIndices.length} actions`)
    }

    if (!isExpanded) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(true)}
                className="gap-1.5"
            >
                <SparklesIcon className="w-4 h-4" />
                AI Command
            </Button>
        )
    }

    return (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
            <CardContent className="pt-4 pb-3 space-y-3">
                {/* Chat history + streaming area */}
                {(history.length > 0 || streaming) && (
                    <div ref={scrollRef} className="max-h-[400px] overflow-y-auto space-y-3 pr-1">
                        {history.map(entry => (
                            <HistoryEntry
                                key={entry.id}
                                entry={entry}
                                onApprove={(index) => approveAction(entry.id, index)}
                                onReject={(index) => rejectAction(entry.id, index)}
                                onApproveAll={() => approveAll(entry.id)}
                                onExecute={() => executeApproved(entry.id)}
                            />
                        ))}

                        {/* Currently streaming */}
                        {streaming && (
                            <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-[10px] shrink-0">{streaming.modelLabel}</Badge>
                                    <span className="text-xs font-medium truncate">{streaming.command}</span>
                                </div>
                                <div className="bg-muted/50 rounded-md px-3 py-2 text-xs font-mono whitespace-pre-wrap break-all max-h-[200px] overflow-y-auto">
                                    {streaming.text || '...'}
                                    <span className="inline-block w-1.5 h-3.5 bg-primary/60 animate-pulse ml-0.5 align-middle" />
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Input row */}
                <div className="flex gap-2">
                    <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="h-9 w-[160px] text-xs shrink-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {AI_MODELS.map(m => (
                                <SelectItem key={m.id} value={m.id} className="text-xs">
                                    <span>{m.label}</span>
                                    <Badge variant="outline" className="ml-1.5 text-[9px] h-4 px-1">{m.tag}</Badge>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <button
                        type="button"
                        onClick={() => setWebSearch(prev => !prev)}
                        className={cn(
                            "flex items-center gap-1 h-9 px-2 rounded-md border text-xs shrink-0 transition-colors",
                            webSearch
                                ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950/40 dark:border-blue-700 dark:text-blue-400"
                                : "bg-background border-input text-muted-foreground hover:bg-muted/50"
                        )}
                        title="Enable web search for real-time pricing data"
                    >
                        <GlobeIcon className="w-3.5 h-3.5" />
                        Web
                    </button>
                    <div className="relative flex-1">
                        <SparklesIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
                        <Input
                            value={command}
                            onChange={(e) => setCommand(e.target.value)}
                            placeholder="e.g. 'Add all Surface series' or '将所有apple产品减去10%'"
                            className="pl-8 h-9 text-sm"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmitCommand()}
                            disabled={isLoading}
                        />
                    </div>
                    <Button onClick={handleSubmitCommand} disabled={isLoading || !command.trim()} size="sm" className="h-9 px-3">
                        {isLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={() => setIsExpanded(false)}>
                        <XIcon className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
