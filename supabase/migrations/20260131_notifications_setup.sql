-- Create in_app_notifications table
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',  -- 'email_sync', 'budget_alert', 'ia_insight'
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON in_app_notifications(user_id, is_read, created_at DESC);

-- Enable RLS
ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own notifications" ON in_app_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON in_app_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Add preferred_sync_hour to gmail_tokens
ALTER TABLE gmail_tokens ADD COLUMN IF NOT EXISTS preferred_sync_hour INTEGER DEFAULT 9;
