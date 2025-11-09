'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'

export default function NewVoicePage() {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [isActive, setIsActive] = useState(true)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) {
            toast.error('Please select a file')
            return
        }

        setUploading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('voices')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('voices')
                .getPublicUrl(filePath)

            const { error: dbError } = await supabase
                .from('voices')
                .insert({
                    name,
                    description: description || null,
                    file_url: publicUrl,
                    file_path: filePath,
                    is_active: isActive,
                    created_by: user.id,
                })

            if (dbError) throw dbError

            toast.success('Voice uploaded successfully!')
            router.push('/admin/voices')
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload voice')
        } finally {
            setUploading(false)
        }
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
                    <h1 className="text-3xl font-bold">Upload New Voice</h1>
                    <p className="text-gray-500">Add a new audio file to your collection</p>
                </div>
            </div>

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
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Welcome Message"
                                required
                                disabled={uploading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Optional description of this voice file"
                                rows={3}
                                disabled={uploading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="file">Audio File *</Label>
                            <div className="flex items-center gap-4">
                                <Input
                                    id="file"
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    required
                                    disabled={uploading}
                                    className="cursor-pointer"
                                />
                                {file && (
                                    <span className="text-sm text-gray-500">{file.name}</span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500">
                                Supported formats: MP3, WAV, OGG, M4A
                            </p>
                        </div>

                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="active">Active Status</Label>
                                <p className="text-sm text-gray-500">
                                    Make this voice available to users immediately
                                </p>
                            </div>
                            <Switch
                                id="active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                disabled={uploading}
                            />
                        </div>

                        <div className="flex gap-4">
                            <Button type="submit" disabled={uploading}>
                                {uploading ? (
                                    <>Uploading...</>
                                ) : (
                                    <>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Voice
                                    </>
                                )}
                            </Button>
                            <Link href="/admin/voices">
                                <Button type="button" variant="outline" disabled={uploading}>
                                    Cancel
                                </Button>
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
