'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Trash2, Edit, Play, Pause } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Voice {
    id: string
    name: string
    description: string | null
    file_url: string
    file_path: string
    is_active: boolean
    created_at: string
}

export function VoiceList({ voices: initialVoices }: { voices: Voice[] }) {
    const [voices, setVoices] = useState(initialVoices)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [playingId, setPlayingId] = useState<string | null>(null)
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
    const supabase = createClient()
    const router = useRouter()

    const toggleActive = async (id: string, currentState: boolean) => {
        try {
            const { error } = await supabase
                .from('voices')
                .update({ is_active: !currentState })
                .eq('id', id)

            if (error) throw error

            setVoices(voices.map(v => v.id === id ? { ...v, is_active: !currentState } : v))
            toast.success(`Voice ${!currentState ? 'activated' : 'deactivated'}`)
        } catch (error) {
            toast.error('Failed to update voice status')
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            const voice = voices.find(v => v.id === deleteId)
            if (!voice) return

            const { error: storageError } = await supabase.storage
                .from('voices')
                .remove([voice.file_path])

            const { error: dbError } = await supabase
                .from('voices')
                .delete()
                .eq('id', deleteId)

            if (dbError) throw dbError

            setVoices(voices.filter(v => v.id !== deleteId))
            toast.success('Voice deleted successfully')
            router.refresh()
        } catch (error) {
            toast.error('Failed to delete voice')
        } finally {
            setDeleteId(null)
        }
    }

    const togglePlay = (voice: Voice) => {
        if (playingId === voice.id && audio) {
            audio.pause()
            setPlayingId(null)
            setAudio(null)
        } else {
            if (audio) {
                audio.pause()
            }
            const newAudio = new Audio(voice.file_url)
            newAudio.play()
            newAudio.onended = () => {
                setPlayingId(null)
                setAudio(null)
            }
            setAudio(newAudio)
            setPlayingId(voice.id)
        }
    }

    if (voices.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-gray-500">No voices uploaded yet</p>
                    <p className="text-sm text-gray-400">Click &quot;Upload Voice&quot; to get started</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <div className="grid gap-4">
                {voices.map((voice) => (
                    <Card key={voice.id}>
                        <CardContent className="flex items-center justify-between p-6">
                            <div className="flex items-center gap-4">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => togglePlay(voice)}
                                >
                                    {playingId === voice.id ? (
                                        <Pause className="h-4 w-4" />
                                    ) : (
                                        <Play className="h-4 w-4" />
                                    )}
                                </Button>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold">{voice.name}</h3>
                                        <Badge variant={voice.is_active ? 'default' : 'secondary'}>
                                            {voice.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                    {voice.description && (
                                        <p className="text-sm text-gray-500">{voice.description}</p>
                                    )}
                                    <p className="text-xs text-gray-400">
                                        {new Date(voice.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={voice.is_active}
                                    onCheckedChange={() => toggleActive(voice.id, voice.is_active)}
                                />
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push(`/admin/voices/${voice.id}/edit`)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(voice.id)}
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the voice
                            file from storage and database.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
