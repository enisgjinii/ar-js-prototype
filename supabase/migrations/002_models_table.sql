-- Create 3D models table
CREATE TABLE IF NOT EXISTS models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT NOT NULL CHECK (file_type IN ('glb', 'gltf')),
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- Models policies
CREATE POLICY "Anyone can view active models"
  ON models FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all models"
  ON models FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert models"
  ON models FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own models"
  ON models FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own models"
  ON models FOR DELETE
  USING (auth.uid() = created_by);

-- Trigger for updated_at
CREATE TRIGGER update_models_updated_at
  BEFORE UPDATE ON models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for models (run this in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('models', 'models', true);

-- Storage policies for models bucket
-- CREATE POLICY "Authenticated users can upload models"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'models' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update their own model files"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own model files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'models' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view model files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'models');
