import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, Users, Activity } from 'lucide-react'

export default async function AdminDashboard() {
    const supabase = await createClient()

    const { count: voicesCount } = await supabase
        .from('voices')
        .select('*', { count: 'exact', head: true })

    const { count: activeVoicesCount } = await supabase
        .from('voices')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

    const stats = [
        {
            title: 'Total Voices',
            value: voicesCount || 0,
            icon: Mic,
            description: 'Total voice files uploaded',
        },
        {
            title: 'Active Voices',
            value: activeVoicesCount || 0,
            icon: Activity,
            description: 'Currently active voices',
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-gray-500">Welcome to your admin panel</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-gray-500">{stat.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>Manage your content from here</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-sm text-gray-600">
                        Use the sidebar to navigate to different sections of the admin panel.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
