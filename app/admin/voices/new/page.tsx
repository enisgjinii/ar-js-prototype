'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Upload, Mic, Square, Play, Pause, FileAudio } from 'lucide-react';
import Link from 'next/link';

export default function NewVoicePage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const router = useRouter();
  const supabase = createClient();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert to File for upload
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: 'audio/webm' });
        setFile(file);

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.info('Recording paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      toast.info('Recording resumed');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
      toast.success('Recording stopped');
    }
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const transcribeAudio = async () => {
    if (!file) {
      toast.error('Please select or record an audio file first');
      return;
    }

    setTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      setTranscript(data.transcript);
      setDescription(data.transcript); // Auto-fill description
      toast.success('Transcription completed!');
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select or record an audio file');
      return;
    }

    setUploading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('voices')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(
          uploadError.message || 'Failed to upload file to storage'
        );
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('voices').getPublicUrl(filePath);

      const { error: dbError } = await supabase.from('voices').insert({
        name,
        description: description || null,
        file_url: publicUrl,
        file_path: filePath,
        is_active: isActive,
        created_by: user.id,
      });

      if (dbError) throw dbError;

      toast.success('Voice uploaded successfully!');
      router.push('/admin/voices');
      router.refresh();
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.message || 'Failed to upload voice';

      // Provide helpful error messages
      if (
        errorMessage.includes('not found') ||
        errorMessage.includes('does not exist')
      ) {
        toast.error(
          'Storage bucket not found. Please create the "voices" bucket in Supabase Storage.'
        );
      } else if (errorMessage.includes('policy')) {
        toast.error(
          'Storage policy error. Please check your storage policies in Supabase.'
        );
      } else if (errorMessage.includes('authenticated')) {
        toast.error('Authentication error. Please log out and log in again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

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
          <p className="text-gray-500">
            Add a new audio file to your collection
          </p>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="e.g., Welcome Message"
                required
                disabled={uploading}
              />
            </div>

            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="record">
                  <Mic className="mr-2 h-4 w-4" />
                  Record Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Audio File *</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="audio/*"
                    onChange={e => {
                      const selectedFile = e.target.files?.[0] || null;
                      setFile(selectedFile);
                      setAudioBlob(null);
                      setAudioUrl(null);
                    }}
                    disabled={uploading || isRecording}
                    className="cursor-pointer"
                  />
                  {file && !audioBlob && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <FileAudio className="h-4 w-4" />
                      <span>{file.name}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    Supported formats: MP3, WAV, OGG, M4A, WebM
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="record" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-4 rounded-lg border p-6">
                    {!isRecording && !audioBlob && (
                      <Button
                        type="button"
                        onClick={startRecording}
                        disabled={uploading}
                        size="lg"
                        className="w-full"
                      >
                        <Mic className="mr-2 h-5 w-5" />
                        Start Recording
                      </Button>
                    )}

                    {isRecording && (
                      <div className="w-full space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 animate-pulse">
                            <Mic className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-2xl font-mono font-bold">
                            {formatTime(recordingTime)}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isPaused ? (
                            <Button
                              type="button"
                              onClick={pauseRecording}
                              variant="outline"
                              className="flex-1"
                            >
                              <Pause className="mr-2 h-4 w-4" />
                              Pause
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={resumeRecording}
                              variant="outline"
                              className="flex-1"
                            >
                              <Play className="mr-2 h-4 w-4" />
                              Resume
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={stopRecording}
                            variant="destructive"
                            className="flex-1"
                          >
                            <Square className="mr-2 h-4 w-4" />
                            Stop
                          </Button>
                        </div>
                      </div>
                    )}

                    {audioBlob && audioUrl && (
                      <div className="w-full space-y-4">
                        <div className="flex items-center justify-center gap-4">
                          <FileAudio className="h-8 w-8 text-green-500" />
                          <span className="text-sm font-medium">
                            Recording complete ({formatTime(recordingTime)})
                          </span>
                        </div>
                        <audio
                          ref={audioRef}
                          src={audioUrl}
                          onEnded={() => setIsPlaying(false)}
                          className="w-full"
                          controls
                        />
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={startRecording}
                            variant="outline"
                            className="flex-1"
                          >
                            <Mic className="mr-2 h-4 w-4" />
                            Record Again
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {file && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Transcription</Label>
                  <Button
                    type="button"
                    onClick={transcribeAudio}
                    disabled={transcribing || uploading}
                    variant="outline"
                    size="sm"
                  >
                    {transcribing ? 'Transcribing...' : 'Generate Transcript'}
                  </Button>
                </div>
                {transcript && (
                  <div className="rounded-lg border bg-gray-50 p-4">
                    <p className="text-sm text-gray-700">{transcript}</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setDescription(e.target.value)
                }
                placeholder="Optional description (auto-filled from transcript)"
                rows={3}
                disabled={uploading}
              />
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
              <Button type="submit" disabled={uploading || isRecording}>
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
                <Button type="button" variant="outline" disabled={uploading || isRecording}>
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
