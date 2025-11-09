'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft, RefreshCw, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Model {
    id: string;
    name: string;
    file_url: string;
    usdz_url: string | null;
    conversion_status: string | null;
    file_type: string;
}

export default function ConvertModelsPage() {
    const [models, setModels] = useState<Model[]>([]);
    const [loading, setLoading] = useState(true);
    const [converting, setConverting] = useState<Set<string>>(new Set());
    const supabase = createClient();

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('models')
            .select('id, name, file_url, usdz_url, conversion_status, file_type')
            .eq('file_type', 'glb')
            .order('created_at', { ascending: false });

        if (error) {
            toast.error('Failed to fetch models');
            console.error(error);
        } else {
            setModels(data || []);
        }
        setLoading(false);
    };

    const convertModel = async (model: Model) => {
        setConverting((prev) => new Set(prev).add(model.id));
        toast.info(`Converting ${model.name}...`);

        try {
            const response = await fetch('/api/convert-model', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    modelId: model.id,
                    glbUrl: model.file_url,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(`${model.name} converted successfully!`);
                fetchModels(); // Refresh list
            } else {
                toast.error(result.error || 'Conversion failed');
                console.error('Conversion error:', result);
            }
        } catch (error: any) {
            toast.error(`Failed to convert: ${error.message}`);
            console.error(error);
        } finally {
            setConverting((prev) => {
                const next = new Set(prev);
                next.delete(model.id);
                return next;
            });
        }
    };

    const convertAll = async () => {
        const pendingModels = models.filter(
            (m) => !m.usdz_url || m.conversion_status === 'failed'
        );

        if (pendingModels.length === 0) {
            toast.info('All models already converted!');
            return;
        }

        toast.info(`Converting ${pendingModels.length} models...`);

        for (const model of pendingModels) {
            await convertModel(model);
            // Wait 2 seconds between conversions to avoid rate limits
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        toast.success('Batch conversion complete!');
    };

    const getStatusBadge = (model: Model) => {
        if (model.usdz_url) {
            return (
                <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completed
                </Badge>
            );
        }

        switch (model.conversion_status) {
            case 'converting':
                return (
                    <Badge className="bg-blue-600">
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Converting
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Not Started
                    </Badge>
                );
        }
    };

    const stats = {
        total: models.length,
        completed: models.filter((m) => m.usdz_url).length,
        pending: models.filter((m) => !m.usdz_url && m.conversion_status !== 'failed').length,
        failed: models.filter((m) => m.conversion_status === 'failed').length,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/models">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold">USDZ Conversion</h1>
                        <p className="text-gray-500">Convert GLB models to USDZ for iOS</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchModels} variant="outline" disabled={loading}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                    <Button onClick={convertAll} disabled={loading || stats.pending === 0}>
                        Convert All Pending
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Total Models
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Completed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {stats.completed}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Pending
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">
                            {stats.pending}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            Failed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Models List */}
            <Card>
                <CardHeader>
                    <CardTitle>Models</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                            <p className="text-gray-500">Loading models...</p>
                        </div>
                    ) : models.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No GLB models found</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {models.map((model) => (
                                <div
                                    key={model.id}
                                    className="flex items-center justify-between p-4 border rounded-lg"
                                >
                                    <div className="flex-1">
                                        <h3 className="font-medium">{model.name}</h3>
                                        <p className="text-sm text-gray-500 truncate max-w-md">
                                            {model.file_url}
                                        </p>
                                        {model.usdz_url && (
                                            <p className="text-sm text-green-600 truncate max-w-md mt-1">
                                                ✓ USDZ: {model.usdz_url}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(model)}
                                        <Button
                                            onClick={() => convertModel(model)}
                                            disabled={converting.has(model.id) || model.conversion_status === 'converting'}
                                            size="sm"
                                            variant={model.usdz_url ? 'outline' : 'default'}
                                        >
                                            {converting.has(model.id) ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Converting...
                                                </>
                                            ) : model.usdz_url ? (
                                                'Reconvert'
                                            ) : (
                                                'Convert'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Setup Instructions */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900">Setup Required</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 space-y-2">
                    <p>
                        To enable automatic conversion, configure one of these methods:
                    </p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                            <strong>External API:</strong> Set CONVERSION_API_URL and
                            CONVERSION_API_KEY in .env
                        </li>
                        <li>
                            <strong>Reality Converter (Mac):</strong> Install Xcode Command
                            Line Tools
                        </li>
                        <li>
                            <strong>Python USD:</strong> Install usd-core and set
                            PYTHON_USD_AVAILABLE=true
                        </li>
                    </ul>
                    <p className="mt-3">
                        See <code className="bg-blue-100 px-1 py-0.5 rounded">AUTO_CONVERSION_GUIDE.md</code> for detailed setup instructions.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
