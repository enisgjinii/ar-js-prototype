'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Trash2,
  Edit,
  Play,
  Pause,
  Download,
  Copy,
  Clock,
  Calendar,
  FileAudio,
  User,
  ExternalLink,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
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

interface Voice {
  id: string;
  name: string;
  description: string | null;
  file_url: string;
  file_path: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  created_by: string;
}

export function VoiceList({ voices: initialVoices }: { voices: Voice[] }) {
  const [voices, setVoices] = useState(initialVoices);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [audioDurations, setAudioDurations] = useState<Record<string, number>>(
    {}
  );
  const [audioProgress, setAudioProgress] = useState<number>(0);
  const supabase = createClient();
  const router = useRouter();

  // Load audio durations
  useEffect(() => {
    voices.forEach(voice => {
      const audio = new Audio(voice.file_url);
      audio.addEventListener('loadedmetadata', () => {
        setAudioDurations(prev => ({
          ...prev,
          [voice.id]: audio.duration,
        }));
      });
    });
  }, [voices]);

  // Update progress for playing audio
  useEffect(() => {
    if (audio) {
      const updateProgress = () => {
        const progress = (audio.currentTime / audio.duration) * 100;
        setAudioProgress(progress);
      };
      audio.addEventListener('timeupdate', updateProgress);
      return () => audio.removeEventListener('timeupdate', updateProgress);
    }
  }, [audio]);

  const toggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('voices')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      setVoices(
        voices.map(v => (v.id === id ? { ...v, is_active: !currentState } : v))
      );
      toast.success(`Voice ${!currentState ? 'activated' : 'deactivated'}`);
    } catch (error) {
      toast.error('Failed to update voice status');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const voice = voices.find(v => v.id === deleteId);
      if (!voice) return;

      const { error: storageError } = await supabase.storage
        .from('voices')
        .remove([voice.file_path]);

      const { error: dbError } = await supabase
        .from('voices')
        .delete()
        .eq('id', deleteId);

      if (dbError) throw dbError;

      setVoices(voices.filter(v => v.id !== deleteId));
      toast.success('Voice deleted successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to delete voice');
    } finally {
      setDeleteId(null);
    }
  };

  const togglePlay = (voice: Voice) => {
    if (playingId === voice.id && audio) {
      audio.pause();
      setPlayingId(null);
      setAudio(null);
      setAudioProgress(0);
    } else {
      if (audio) {
        audio.pause();
      }
      const newAudio = new Audio(voice.file_url);
      newAudio.play();
      newAudio.onended = () => {
        setPlayingId(null);
        setAudio(null);
        setAudioProgress(0);
      };
      setAudio(newAudio);
      setPlayingId(voice.id);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (url: string) => {
    // This is a placeholder - in production you'd fetch actual file size
    return 'N/A';
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

  if (voices.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No voices uploaded yet</p>
          <p className="text-sm text-gray-400">
            Click &quot;Upload Voice&quot; to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {voices.map(voice => (
          <Card
            key={voice.id}
            className="overflow-hidden transition-shadow hover:shadow-md"
          >
            <CardContent className="p-0">
              <div className="flex flex-col">
                {/* Main Content Row */}
                <div className="flex items-start gap-4 p-6">
                  {/* Play Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 flex-shrink-0"
                    onClick={() => togglePlay(voice)}
                  >
                    {playingId === voice.id ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  {/* Voice Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold truncate">
                            {voice.name}
                          </h3>
                          <Badge
                            variant={voice.is_active ? 'default' : 'secondary'}
                          >
                            {voice.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        {voice.description && (
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {voice.description}
                          </p>
                        )}

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{formatDate(voice.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{formatTime(voice.created_at)}</span>
                          </div>
                          {audioDurations[voice.id] && (
                            <div className="flex items-center gap-1.5">
                              <FileAudio className="h-3.5 w-3.5" />
                              <span>
                                {formatDuration(audioDurations[voice.id])}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5" />
                            <span className="truncate">
                              {getRelativeTime(voice.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Switch
                          checked={voice.is_active}
                          onCheckedChange={() =>
                            toggleActive(voice.id, voice.is_active)
                          }
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyUrl(voice.file_url)}
                          title="Copy URL"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            downloadFile(voice.file_url, voice.name)
                          }
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(voice.file_url, '_blank')}
                          title="Open in new tab"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push(`/admin/voices/${voice.id}/edit`)
                          }
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(voice.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar (when playing) */}
                {playingId === voice.id && (
                  <div className="px-6 pb-4">
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-100"
                        style={{ width: `${audioProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Footer with additional info */}
                <div className="px-6 py-3 bg-gray-50 border-t flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="font-mono">{voice.id.slice(0, 8)}...</span>
                    <span>•</span>
                    <span className="truncate max-w-xs">{voice.file_path}</span>
                  </div>
                  {voice.updated_at &&
                    voice.updated_at !== voice.created_at && (
                      <span>Updated {getRelativeTime(voice.updated_at)}</span>
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
              This action cannot be undone. This will permanently delete the
              voice file from storage and database.
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
