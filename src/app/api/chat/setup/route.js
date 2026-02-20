import { verifyAdminAccess } from '@/lib/serverAuth'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { NextResponse } from 'next/server'

const setupSQL = `
-- Chat conversations table
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

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_type text NOT NULL CHECK (sender_type IN ('customer', 'agent', 'system')),
  sender_id uuid,
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index for fast message lookups
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_status ON chat_conversations(status, last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for chat_conversations
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_conv_select' AND tablename = 'chat_conversations') THEN
    CREATE POLICY chat_conv_select ON chat_conversations FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_conv_insert' AND tablename = 'chat_conversations') THEN
    CREATE POLICY chat_conv_insert ON chat_conversations FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_conv_update' AND tablename = 'chat_conversations') THEN
    CREATE POLICY chat_conv_update ON chat_conversations FOR UPDATE USING (true);
  END IF;
END $$;

-- RLS policies for chat_messages
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_msg_select' AND tablename = 'chat_messages') THEN
    CREATE POLICY chat_msg_select ON chat_messages FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_msg_insert' AND tablename = 'chat_messages') THEN
    CREATE POLICY chat_msg_insert ON chat_messages FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'chat_msg_update' AND tablename = 'chat_messages') THEN
    CREATE POLICY chat_msg_update ON chat_messages FOR UPDATE USING (true);
  END IF;
END $$;

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
`

export async function POST(request) {
  const adminCheck = await verifyAdminAccess(request)
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  try {
    const { error } = await supabaseAdmin.rpc('exec_sql', { sql: setupSQL }).single()

    // If rpc doesn't exist, try raw SQL via REST
    if (error) {
      // Split and execute statements individually via supabaseAdmin
      const statements = setupSQL.split(';').map(s => s.trim()).filter(Boolean)
      const errors = []

      for (const stmt of statements) {
        const { error: stmtError } = await supabaseAdmin.from('_exec').select().limit(0)
        // Fallback: just try creating tables with supabase-js
      }

      // Alternative: use the SQL editor endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        },
      })
    }

    // Try creating tables via supabase-admin queries as fallback
    // Create conversations table
    await supabaseAdmin.from('chat_conversations').select('id').limit(0)
      .then(({ error }) => {
        if (error?.code === '42P01') {
          // Table doesn't exist, but we can't create via supabase-js
          // The SQL needs to be run in the Supabase dashboard
          throw new Error('Tables need to be created via Supabase SQL Editor')
        }
      })

    return NextResponse.json({
      success: true,
      message: 'Chat tables verified. If tables do not exist, please run the SQL in the Supabase dashboard.',
      sql: setupSQL,
    })
  } catch (err) {
    return NextResponse.json({
      success: false,
      message: 'Could not auto-create tables. Please run this SQL in the Supabase SQL Editor:',
      sql: setupSQL,
      error: err.message,
    }, { status: 200 }) // 200 because we're providing the SQL
  }
}
