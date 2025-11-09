'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mail,
  Calendar,
  Clock,
  Shield,
  Search,
  Filter,
  Download,
  UserCheck,
  UserX,
  ExternalLink,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  email?: string;
  email_confirmed_at?: string;
  created_at: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
    iss?: string;
  };
  profile?: {
    full_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

export function UserList({ users: initialUsers }: { users: User[] }) {
  const [users] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'verified' | 'unverified'
  >('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return formatDate(dateString);
  };

  const getUserName = (user: User) => {
    return (
      user.profile?.full_name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'Unknown User'
    );
  };

  const getUserAvatar = (user: User) => {
    return (
      user.profile?.avatar_url ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture
    );
  };

  const getUserInitials = (user: User) => {
    const name = getUserName(user);
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isVerified = (user: User) => !!user.email_confirmed_at;

  const getProvider = (user: User) => {
    // Check app_metadata first
    if (user.app_metadata?.provider) {
      return user.app_metadata.provider;
    }
    if (
      user.app_metadata?.providers &&
      user.app_metadata.providers.length > 0
    ) {
      return user.app_metadata.providers[0];
    }
    // Check if it's a Google user from metadata
    if (user.user_metadata?.iss?.includes('google')) {
      return 'google';
    }
    // Default to email
    return 'email';
  };

  const getProviderDisplay = (provider: string) => {
    const providers: Record<
      string,
      { name: string; icon: string; color: string }
    > = {
      email: { name: 'Email', icon: '📧', color: 'bg-blue-100 text-blue-700' },
      google: { name: 'Google', icon: '🔵', color: 'bg-red-100 text-red-700' },
      github: {
        name: 'GitHub',
        icon: '⚫',
        color: 'bg-gray-100 text-gray-700',
      },
      facebook: {
        name: 'Facebook',
        icon: '🔵',
        color: 'bg-blue-100 text-blue-700',
      },
    };
    return (
      providers[provider] || {
        name: provider,
        icon: '🔑',
        color: 'bg-gray-100 text-gray-700',
      }
    );
  };

  const exportUsers = () => {
    const csv = [
      [
        'Name',
        'Email',
        'Status',
        'Provider',
        'Created',
        'Last Sign In',
        'Role',
      ].join(','),
      ...filteredAndSortedUsers.map(user =>
        [
          getUserName(user),
          user.email,
          isVerified(user) ? 'Verified' : 'Unverified',
          getProviderDisplay(getProvider(user)).name,
          formatDate(user.created_at),
          formatDate(user.last_sign_in_at),
          user.profile?.role || 'user',
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      searchQuery === '' ||
      getUserName(user).toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'verified' && isVerified(user)) ||
      (filterStatus === 'unverified' && !isVerified(user));

    return matchesSearch && matchesFilter;
  });

  // Sort users
  const filteredAndSortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'newest') {
      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
    if (sortBy === 'oldest') {
      return (
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    }
    if (sortBy === 'name') {
      return getUserName(a).localeCompare(getUserName(b));
    }
    return 0;
  });

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No users found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filterStatus}
                onValueChange={(value: any) => setFilterStatus(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value: any) => setSortBy(value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredAndSortedUsers.length} of {users.length} users
          </div>
        </CardContent>
      </Card>

      {/* User Cards */}
      <div className="grid gap-4">
        {filteredAndSortedUsers.map(user => (
          <Card
            key={user.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardContent className="p-0">
              <div className="flex items-start gap-4 p-6">
                {/* Avatar */}
                <Avatar className="h-14 w-14 flex-shrink-0">
                  <AvatarImage
                    src={getUserAvatar(user)}
                    alt={getUserName(user)}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {getUserInitials(user)}
                  </AvatarFallback>
                </Avatar>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold truncate">
                          {getUserName(user)}
                        </h3>
                        {isVerified(user) ? (
                          <Badge variant="default" className="gap-1">
                            <UserCheck className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <UserX className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                        {user.profile?.role === 'admin' && (
                          <Badge variant="destructive" className="gap-1">
                            <Shield className="h-3 w-3" />
                            Admin
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-3">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="truncate">{user.email}</span>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          <div>
                            <p className="font-medium">Joined</p>
                            <p>{formatDate(user.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          <div>
                            <p className="font-medium">Last Sign In</p>
                            <p>{getRelativeTime(user.last_sign_in_at)}</p>
                          </div>
                        </div>
                        {user.email_confirmed_at && (
                          <div className="flex items-center gap-1.5">
                            <UserCheck className="h-3.5 w-3.5" />
                            <div>
                              <p className="font-medium">Verified</p>
                              <p>{formatDate(user.email_confirmed_at)}</p>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5" />
                          <div>
                            <p className="font-medium">Role</p>
                            <p className="capitalize">
                              {user.profile?.role || 'user'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Provider Badge */}
                      <div className="mt-3">
                        {(() => {
                          const provider = getProvider(user);
                          const providerInfo = getProviderDisplay(provider);
                          return (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${providerInfo.color}`}
                            >
                              <span>{providerInfo.icon}</span>
                              <span>Signed up with {providerInfo.name}</span>
                            </span>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(user.email || '');
                        }}
                        title="Copy email"
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          window.open(`mailto:${user.email}`, '_blank');
                        }}
                        title="Send email"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono">{user.id.slice(0, 8)}...</span>
                <span>
                  Member for{' '}
                  {Math.floor(
                    (new Date().getTime() -
                      new Date(user.created_at).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{' '}
                  days
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedUsers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500">No users match your filters</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
