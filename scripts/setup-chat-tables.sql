-- DepxTech Live Chat: Database Setup
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor)

-- 1. Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  guest_name text,
  guest_email text,
  status text NOT NULL DEFAULT 'open',
  assigned_agent uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 2. Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
  sender_id uuid,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);

-- 4. Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies (permissive — service role handles auth in API routes)
DROP POLICY IF EXISTS chat_conv_select ON chat_conversations;
DROP POLICY IF EXISTS chat_conv_insert ON chat_conversations;
DROP POLICY IF EXISTS chat_conv_update ON chat_conversations;
CREATE POLICY chat_conv_select ON chat_conversations FOR SELECT USING (true);
CREATE POLICY chat_conv_insert ON chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY chat_conv_update ON chat_conversations FOR UPDATE USING (true);

DROP POLICY IF EXISTS chat_msg_select ON chat_messages;
DROP POLICY IF EXISTS chat_msg_insert ON chat_messages;
DROP POLICY IF EXISTS chat_msg_update ON chat_messages;
CREATE POLICY chat_msg_select ON chat_messages FOR SELECT USING (true);
CREATE POLICY chat_msg_insert ON chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY chat_msg_update ON chat_messages FOR UPDATE USING (true);

-- 6. Enable Realtime (ignore error if already added)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
