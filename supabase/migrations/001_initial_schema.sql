-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voices table
CREATE TABLE IF NOT EXISTS voices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_path TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Voices policies
CREATE POLICY "Anyone can view active voices"
  ON voices FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can view all voices"
  ON voices FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert voices"
  ON voices FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own voices"
  ON voices FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own voices"
  ON voices FOR DELETE
  USING (auth.uid() = created_by);

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_voices_updated_at
  BEFORE UPDATE ON voices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create storage bucket for voices (run this in Supabase dashboard SQL editor)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('voices', 'voices', true);

-- Storage policies for voices bucket
-- CREATE POLICY "Authenticated users can upload voices"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'voices' AND auth.role() = 'authenticated');

-- CREATE POLICY "Users can update their own voice files"
--   ON storage.objects FOR UPDATE
--   USING (bucket_id = 'voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete their own voice files"
--   ON storage.objects FOR DELETE
--   USING (bucket_id = 'voices' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Anyone can view voice files"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'voices');
