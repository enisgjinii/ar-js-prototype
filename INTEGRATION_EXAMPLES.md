# Native AR Integration Examples

## Example 1: Product Page with AR

```tsx
// app/products/[id]/page.tsx
import { createClient } from '@/lib/supabase/server';
import ModelARLauncherButton from '@/components/model-ar-launcher';
import { Button } from '@/components/ui/button';

export default async function ProductPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <img 
            src={product.image_url} 
            alt={product.name}
            className="w-full rounded-lg"
          />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-2xl font-bold mb-6">${product.price}</p>

          {/* AR Button */}
          {product.model_url && (
            <ModelARLauncherButton
              modelUrl={product.model_url}
              modelTitle={product.name}
              className="w-full mb-4 bg-blue-600 hover:bg-blue-700"
            >
              📱 View in Your Space
            </ModelARLauncherButton>
          )}

          <Button className="w-full">
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Example 2: Model Gallery from Database

```tsx
// app/models/page.tsx
import { createClient } from '@/lib/supabase/server';
import ARModelGallery from '@/components/ar-model-gallery';

export default async function ModelsPage() {
  const supabase = createClient();
  
  const { data: models } = await supabase
    .from('models')
    .select('*')
    .order('created_at', { ascending: false });

  // Transform database models to AR models format
  const arModels = models?.map(model => ({
    id: model.id,
    name: model.name,
    description: model.description,
    glbUrl: model.file_url,
    usdzUrl: model.usdz_url,
    thumbnail: model.thumbnail_url,
    category: model.category
  })) || [];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">3D Model Gallery</h1>
      <ARModelGallery models={arModels} columns={3} showCategory />
    </div>
  );
}
```

## Example 3: Dynamic AR with Search

```tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ARModelGallery from '@/components/ar-model-gallery';
import { Input } from '@/components/ui/input';

export default function SearchableModels() {
  const [models, setModels] = useState([]);
  const [search, setSearch] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchModels() {
      let query = supabase.from('models').select('*');
      
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      const { data } = await query;
      
      const arModels = data?.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        glbUrl: model.file_url,
        thumbnail: model.thumbnail_url
      })) || [];
      
      setModels(arModels);
    }
    
    fetchModels();
  }, [search]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <Input
          type="search"
          placeholder="Search models..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <ARModelGallery models={models} columns={3} />
    </div>
  );
}
```

## Example 4: AR with Model Upload

```tsx
// app/admin/models/upload/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function UploadModelPage() {
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const glbFile = formData.get('glb') as File;
    const usdzFile = formData.get('usdz') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    try {
      // Upload GLB file
      const glbPath = `models/${Date.now()}-${glbFile.name}`;
      const { data: glbData, error: glbError } = await supabase.storage
        .from('models')
        .upload(glbPath, glbFile);

      if (glbError) throw glbError;

      // Upload USDZ file (optional)
      let usdzPath = null;
      if (usdzFile) {
        usdzPath = `models/${Date.now()}-${usdzFile.name}`;
        const { error: usdzError } = await supabase.storage
          .from('models')
          .upload(usdzPath, usdzFile);

        if (usdzError) throw usdzError;
      }

      // Get public URLs
      const { data: glbUrl } = supabase.storage
        .from('models')
        .getPublicUrl(glbPath);

      const usdzUrl = usdzPath
        ? supabase.storage.from('models').getPublicUrl(usdzPath).data
        : null;

      // Save to database
      const { error: dbError } = await supabase.from('models').insert({
        name,
        description,
        file_url: glbUrl.publicUrl,
        usdz_url: usdzUrl?.publicUrl,
        created_at: new Date().toISOString()
      });

      if (dbError) throw dbError;

      alert('Model uploaded successfully!');
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Upload 3D Model</h1>

      <form onSubmit={handleUpload} className="space-y-6">
        <div>
          <Label htmlFor="name">Model Name</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="Modern Chair"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            name="description"
            placeholder="A stylish modern chair"
          />
        </div>

        <div>
          <Label htmlFor="glb">GLB File (Android)</Label>
          <Input
            id="glb"
            name="glb"
            type="file"
            accept=".glb,.gltf"
            required
          />
          <p className="text-sm text-gray-600 mt-1">
            Required for Android AR
          </p>
        </div>

        <div>
          <Label htmlFor="usdz">USDZ File (iOS)</Label>
          <Input
            id="usdz"
            name="usdz"
            type="file"
            accept=".usdz"
          />
          <p className="text-sm text-gray-600 mt-1">
            Optional - Required for iOS AR
          </p>
        </div>

        <Button type="submit" disabled={uploading} className="w-full">
          {uploading ? 'Uploading...' : 'Upload Model'}
        </Button>
      </form>
    </div>
  );
}
```

## Example 5: AR Button in Product Card

```tsx
// components/product-card.tsx
import ModelARLauncherButton from '@/components/model-ar-launcher';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string;
    model_url?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full aspect-square object-cover"
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4">
        <div className="w-full">
          <h3 className="font-semibold">{product.name}</h3>
          <p className="text-lg font-bold">${product.price}</p>
        </div>
        
        {product.model_url && (
          <ModelARLauncherButton
            modelUrl={product.model_url}
            modelTitle={product.name}
            className="w-full text-sm"
          >
            👁️ View in AR
          </ModelARLauncherButton>
        )}
      </CardFooter>
    </Card>
  );
}
```

## Example 6: AR with Analytics

```tsx
'use client';

import { launchNativeAR, detectPlatform } from '@/lib/ar-utils';
import { Button } from '@/components/ui/button';

interface ARButtonWithAnalyticsProps {
  modelUrl: string;
  modelTitle: string;
  productId: string;
}

export default function ARButtonWithAnalytics({
  modelUrl,
  modelTitle,
  productId
}: ARButtonWithAnalyticsProps) {
  const handleARClick = async () => {
    const platform = detectPlatform();
    
    // Track AR view started
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'ar_view_started',
        product_id: productId,
        platform,
        timestamp: new Date().toISOString()
      })
    });

    // Launch AR
    try {
      launchNativeAR({
        glbUrl: modelUrl,
        title: modelTitle
      });
    } catch (error) {
      // Track error
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'ar_view_error',
          product_id: productId,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      });
    }
  };

  return (
    <Button onClick={handleARClick}>
      📱 View in AR
    </Button>
  );
}
```

## Database Schema Example

```sql
-- Models table
CREATE TABLE models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,  -- GLB file URL
  usdz_url TEXT,           -- USDZ file URL (optional)
  thumbnail_url TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Models are viewable by everyone"
  ON models FOR SELECT
  USING (true);

-- Admin write access
CREATE POLICY "Models are editable by admins"
  ON models FOR ALL
  USING (auth.jwt() ->> 'role' = 'admin');

-- AR analytics table
CREATE TABLE ar_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  product_id UUID REFERENCES models(id),
  platform TEXT,
  user_id UUID REFERENCES auth.users(id),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Storage Bucket Setup

```typescript
// Setup storage bucket for models
const { data, error } = await supabase.storage.createBucket('models', {
  public: true,
  fileSizeLimit: 52428800, // 50MB
  allowedMimeTypes: [
    'model/gltf-binary',
    'model/gltf+json',
    'model/vnd.usdz+zip'
  ]
});
```

These examples show how to integrate native AR into your existing app with database, storage, analytics, and more!
