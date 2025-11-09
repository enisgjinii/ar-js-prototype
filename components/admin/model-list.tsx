'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Trash2,
  Edit,
  Download,
  Copy,
  ExternalLink,
  Box,
  Calendar,
  Clock,
  FileType,
  HardDrive,
  Eye,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Model {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_path: string;
  file_size: number | null;
  file_type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function ModelList({ models: initialModels }: { models: Model[] }) {
  const [models, setModels] = useState(initialModels);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const supabase = createClient();
  const router = useRouter();

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('models')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      setModels(
        models.map(m => (m.id === id ? { ...m, is_active: !currentState } : m))
      );
      toast.success(`Model ${!currentState ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update model status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const model = models.find(m => m.id === deleteId);
      if (!model) return;

      const { error: storageError } = await supabase.storage
        .from('models')
        .remove([model.file_path]);

      const { error: dbError } = await supabase
        .from('models')
        .delete()
        .eq('id', deleteId);

      if (dbError) throw dbError;

      setModels(models.filter(m => m.id !== deleteId));
      toast.success('Model deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete model');
    } finally {
      setDeleteId(null);
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied to clipboard');
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
    toast.success('Download started');
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
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

  if (models.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Box className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No 3D models uploaded yet</p>
          <p className="text-sm text-gray-400">
            Click "Upload Model" to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {models.map(model => (
          <Card
            key={model.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Main Content Row */}
                <div className="flex items-start gap-4 p-6">
                  {/* Icon */}
                  <div className="flex-shrink-0 h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Box className="h-6 w-6 text-green-600" />
                  </div>

                  {/* Model Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold truncate">
                            {model.name}
                          </h3>
                          <Badge
                            variant={model.is_active ? 'default' : 'secondary'}
                          >
                            {model.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Badge variant="outline" className="uppercase">
                            {model.file_type}
                          </Badge>
                        </div>
                        {model.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {model.description}
                          </p>
                        )}

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(model.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatTime(model.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <HardDrive className="h-3.5 w-3.5" />
                            <span>{formatFileSize(model.file_size)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <FileType className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {getRelativeTime(model.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Switch
                          checked={model.is_active}
                          onCheckedChange={() =>
                            toggleActive(model.id, model.is_active)
                          }
                        />
                        <Link href={`/ar-viewer?model=${model.id}`} target="_blank">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View in AR"
                          >
                            <Eye className="h-4 w-4 text-blue-500" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyUrl(model.file_url)}
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            downloadFile(model.file_url, model.name)
                          }
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(model.file_url, '_blank')}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/admin/models/${model.id}/edit`)
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(model.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with additional info */}
                <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="font-mono">{model.id.slice(0, 8)}...</span>
                    <span>•</span>
                    <span className="truncate max-w-xs">{model.file_path}</span>
                  </div>
                  {model.updated_at &&
                    model.updated_at !== model.created_at && (
                      <span>Updated {getRelativeTime(model.updated_at)}</span>
                    )}
                </div>
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
              This action cannot be undone. This will permanently delete the 3D
              model file from storage and database.
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
  );
}
