import { createClient } from '@/lib/supabase/server'
import { VoiceList } from '@/components/admin/voice-list'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function VoicesPage() {
    const supabase = await createClient()

    const { data: voices, error } = await supabase
        .from('voices')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Voice Management</h1>
                    <p className="text-gray-500">Manage audio files for your application</p>
                </div>
                <Link href="/admin/voices/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Upload Voice
                    </Button>
                </Link>
            </div>

            <VoiceList voices={voices || []} />
        </div>
    )
}
