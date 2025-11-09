import { createAdminClient } from '@/lib/supabase/admin';
import { ModelList } from '@/components/admin/model-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Box, Activity, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function ModelsPage() {
  const supabaseAdmin = createAdminClient();

  const { data: models, error } = await supabaseAdmin
    .from('models')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching models:', error);
  }

  // Calculate statistics
  const totalModels = models?.length || 0;
  const activeModels = models?.filter(m => m.is_active).length || 0;
  const inactiveModels = totalModels - activeModels;
  const recentModels =
    models?.filter(m => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(m.created_at) > dayAgo;
    }).length || 0;

  const stats = [
    {
      title: 'Total Models',
      value: totalModels,
      icon: Box,
      description: 'All uploaded models',
      color: 'text-green-500',
    },
    {
      title: 'Active',
      value: activeModels,
      icon: Activity,
      description: 'Currently published',
      color: 'text-blue-500',
    },
    {
      title: 'Inactive',
      value: inactiveModels,
      icon: Clock,
      description: 'Unpublished models',
      color: 'text-gray-500',
    },
    {
      title: 'Recent',
      value: recentModels,
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
          <h1 className="text-3xl font-bold">3D Model Management</h1>
          <p className="text-gray-500">Upload and manage GLB/GLTF 3D models</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/models/convert">
            <Button size="lg" variant="outline">
              🔄 Convert to USDZ
            </Button>
          </Link>
          <Link href="/admin/models/new">
            <Button size="lg">
              <Plus className="mr-2 h-4 w-4" />
              Upload Model
            </Button>
          </Link>
        </div>
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

      {/* Model List */}
      <ModelList models={models || []} />
    </div>
  );
}
