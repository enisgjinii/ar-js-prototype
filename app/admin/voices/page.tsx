import { createClient } from '@/lib/supabase/server';
import { VoiceList } from '@/components/admin/voice-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Mic, Activity, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function VoicesPage() {
  const supabase = await createClient();

  const { data: voices, error } = await supabase
    .from('voices')
    .select('*')
    .order('created_at', { ascending: false });

  // Calculate statistics
  const totalVoices = voices?.length || 0;
  const activeVoices = voices?.filter(v => v.is_active).length || 0;
  const inactiveVoices = totalVoices - activeVoices;
  const recentVoices =
    voices?.filter(v => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(v.created_at) > dayAgo;
    }).length || 0;

  const stats = [
    {
      title: 'Total Voices',
      value: totalVoices,
      icon: Mic,
      description: 'All uploaded files',
      color: 'text-blue-500',
    },
    {
      title: 'Active',
      value: activeVoices,
      icon: Activity,
      description: 'Currently published',
      color: 'text-green-500',
    },
    {
      title: 'Inactive',
      value: inactiveVoices,
      icon: Clock,
      description: 'Unpublished files',
      color: 'text-gray-500',
    },
    {
      title: 'Recent',
      value: recentVoices,
      icon: TrendingUp,
      description: 'Added in last 24h',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Voice Management</h1>
          <p className="text-gray-500">
            Manage audio files for your application
          </p>
        </div>
        <Link href="/admin/voices/new">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Upload Voice
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Voice List */}
      <VoiceList voices={voices || []} />
    </div>
  );
}
