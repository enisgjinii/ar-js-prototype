import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { UserList } from '@/components/admin/user-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';

export default async function UsersPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  // Fetch all users from auth.users (requires service role)
  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  // Handle errors
  if (error) {
    console.error('Error fetching users:', error);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-gray-500">View and manage all registered users</p>
        </div>
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  Unable to Fetch Users
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  {error.message === 'User not allowed'
                    ? 'Service role key is missing or invalid.'
                    : error.message}
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left max-w-2xl mx-auto">
                  <p className="text-sm font-semibold mb-2">To fix this:</p>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Go to your Supabase Dashboard</li>
                    <li>
                      Navigate to <strong>Project Settings → API</strong>
                    </li>
                    <li>
                      Copy the <strong>service_role</strong> key (not the anon
                      key!)
                    </li>
                    <li>
                      Add it to your{' '}
                      <code className="bg-gray-200 px-1 rounded">
                        .env.local
                      </code>{' '}
                      file:
                    </li>
                  </ol>
                  <pre className="mt-3 bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
                    SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
                  </pre>
                  <p className="text-sm text-gray-600 mt-3">
                    5. Restart your development server
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  ⚠️ Keep the service role key secret - never expose it to the
                  client!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch profiles for additional data
  const { data: profiles } = await supabaseAdmin.from('profiles').select('*');

  // Merge user data with profiles
  const usersWithProfiles =
    users?.map(user => {
      const profile = profiles?.find(p => p.id === user.id);
      return {
        ...user,
        profile,
      };
    }) || [];

  // Calculate statistics
  const totalUsers = usersWithProfiles.length;
  const verifiedUsers = usersWithProfiles.filter(
    u => u.email_confirmed_at
  ).length;
  const unverifiedUsers = totalUsers - verifiedUsers;
  const recentUsers = usersWithProfiles.filter(u => {
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 7);
    return new Date(u.created_at) > dayAgo;
  }).length;

  const stats = [
    {
      title: 'Total Users',
      value: totalUsers,
      icon: Users,
      description: 'All registered users',
      color: 'text-blue-500',
    },
    {
      title: 'Verified',
      value: verifiedUsers,
      icon: UserCheck,
      description: 'Email confirmed',
      color: 'text-green-500',
    },
    {
      title: 'Unverified',
      value: unverifiedUsers,
      icon: UserX,
      description: 'Pending verification',
      color: 'text-orange-500',
    },
    {
      title: 'Recent',
      value: recentUsers,
      icon: Clock,
      description: 'Last 7 days',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-gray-500">View and manage all registered users</p>
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

      {/* User List */}
      <UserList users={usersWithProfiles} />
    </div>
  );
}
