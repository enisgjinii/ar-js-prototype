'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowLeft, Save, Play, Pause } from 'lucide-react'
import Link from 'next/link'

interface Voice {
    id: string
    name: string
    description: string | null
    file_url: string
    file_path: string
    is_active: boolean
    created_at: string
    updated_at: string
}

export default function EditVoicePage() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [voice, setVoice] = useState<Voice | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [playing, setPlaying] = useState(false)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()

    useEffect(() => {
        if (params?.id) {
            loadVoice()
        }
    }, [params?.id])

    const loadVoice = async () => {
        if (!params?.id) return

        try {
            const { data, error } = await supabase
                .from('voices')
                .select('*')
                .eq('id', params.id as string)
                .single()

            if (error) throw error

            setVoice(data)
            setName(data.name)
            setDescription(data.description || '')
            setIsActive(data.is_active)
        } catch (error: any) {
            toast.error('Failed to load voice')
            router.push('/admin/voices')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            if (!params?.id) return

            const { error } = await supabase
                .from('voices')
                .update({
                    name,
                    description: description || null,
                    is_active: isActive,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', params.id as string)

            if (error) throw error

            toast.success('Voice updated successfully!')
            router.push('/admin/voices')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to update voice')
        } finally {
            setSaving(false)
        }
    }

    const togglePlay = () => {
        if (!voice) return

        if (playing && audio) {
            audio.pause()
            setPlaying(false)
        } else {
            if (audio) {
                audio.pause()
            }
            const newAudio = new Audio(voice.file_url)
            newAudio.play()
            newAudio.onended = () => {
                setPlaying(false)
                setAudio(null)
            }
            setAudio(newAudio)
            setPlaying(true)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading voice...</p>
                </div>
            </div>
        )
    }

    if (!voice) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-gray-500">Voice not found</p>
                    <Link href="/admin/voices">
                        <Button className="mt-4">Back to Voices</Button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/voices">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold">Edit Voice</h1>
                    <p className="text-gray-500">Update voice details and settings</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Voice Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="e.g., Welcome Message"
                                        required
                                        disabled={saving}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={description}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Optional description of this voice file"
                                        rows={4}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <Label htmlFor="active">Active Status</Label>
                                        <p className="text-sm text-gray-500">
                                            Make this voice available to users
                                        </p>
                                    </div>
                                    <Switch
                                        id="active"
                                        checked={isActive}
                                        onCheckedChange={setIsActive}
                                        disabled={saving}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? (
                                            <>Saving...</>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                    <Link href="/admin/voices">
                                        <Button type="button" variant="outline" disabled={saving}>
                                            Cancel
                                        </Button>
                                    </Link>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Voice Info Sidebar */}
                <div className="space-y-6">
                    {/* Audio Preview */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Audio Preview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={togglePlay}
                            >
                                {playing ? (
                                    <>
                                        <Pause className="mr-2 h-4 w-4" />
                                        Pause
                                    </>
                                ) : (
                                    <>
                                        <Play className="mr-2 h-4 w-4" />
                                        Play Audio
                                    </>
                                )}
                            </Button>
                            <audio
                                src={voice.file_url}
                                className="w-full"
                                controls
                            />
                        </CardContent>
                    </Card>

                    {/* File Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>File Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">File ID</p>
                                <p className="font-mono text-xs break-all">{voice.id}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">File Path</p>
                                <p className="font-mono text-xs break-all">{voice.file_path}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Created</p>
                                <p>
                                    {new Date(voice.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Last Updated</p>
                                <p>
                                    {new Date(voice.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Public URL</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-1"
                                    onClick={() => {
                                        navigator.clipboard.writeText(voice.file_url)
                                        toast.success('URL copied to clipboard')
                                    }}
                                >
                                    Copy URL
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
