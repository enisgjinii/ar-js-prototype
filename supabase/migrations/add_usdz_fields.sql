-- Add USDZ fields to models table
ALTER TABLE models 
ADD COLUMN IF NOT EXISTS usdz_url TEXT,
ADD COLUMN IF NOT EXISTS usdz_path TEXT,
ADD COLUMN IF NOT EXISTS auto_convert_usdz BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS conversion_status TEXT DEFAULT 'pending';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_models_conversion_status ON models(conversion_status);

-- Add comment
COMMENT ON COLUMN models.usdz_url IS 'Public URL for USDZ file (iOS AR Quick Look)';
COMMENT ON COLUMN models.usdz_path IS 'Storage path for USDZ file';
COMMENT ON COLUMN models.auto_convert_usdz IS 'Automatically convert GLB to USDZ on upload';
COMMENT ON COLUMN models.conversion_status IS 'Status: pending, converting, completed, failed';

-- Update existing models to have conversion status
UPDATE models 
SET conversion_status = 'pending' 
WHERE conversion_status IS NULL AND auto_convert_usdz = true;
