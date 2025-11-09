import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-gray-500">Manage your account settings</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={user?.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={profile?.full_name || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={profile?.role || 'user'} disabled />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Storage Information</CardTitle>
                    <CardDescription>Supabase storage bucket details</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-600">
                        Voice files are stored in the <code className="rounded bg-gray-100 px-2 py-1">voices</code> bucket.
                        Make sure this bucket is created in your Supabase project.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
