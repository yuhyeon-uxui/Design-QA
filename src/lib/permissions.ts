import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wrhkqffxjokowabmhija.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndyaGtxZmZ4am9rb3dhYm1oaWphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2MTg0NzMsImV4cCI6MjEwMzE5NDQ3M30.I-Sr3i95DgUsRF7zI5-TQ1zLT8oHbQhAYDGdnbz3BpU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Role = 'admin' | 'designer' | 'developer' | 'general';

export type ActionType = 
  | 'project.create' | 'project.delete'
  | 'issue.create' | 'issue.save' | 'issue.delete'
  | 'issue.statusChange'
  | 'devFeedback.create'
  | 'comment.create'
  | 'memberRole.manage';

const ROLE_PERMISSIONS: Record<ActionType, Role[]> = {
  'project.create': ['admin', 'designer'],
  'project.delete': ['admin', 'designer'],
  'issue.create': ['admin', 'designer'],
  'issue.save': ['admin', 'designer'],
  'issue.delete': ['admin', 'designer'],
  'issue.statusChange': ['admin', 'designer', 'developer'],
  'devFeedback.create': ['admin', 'developer'],
  'comment.create': ['admin', 'designer', 'developer', 'general'],
  'memberRole.manage': ['admin'],
};

export async function assertPermission(token: string | undefined, action: ActionType): Promise<{ userId: string; role: Role }> {
  if (!token) {
    throw new Error('Authentication token is missing');
  }

  // Verify token
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    throw new Error('Invalid or expired token');
  }

  // Assume user metadata or profiles table contains the role
  // We'll query 'profiles' as requested
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const role: Role = (profile?.role as Role) || 'general';

  const allowedRoles = ROLE_PERMISSIONS[action];
  if (!allowedRoles.includes(role)) {
    throw new Error(`Permission denied. User role '${role}' is not allowed to perform '${action}'`);
  }

  return { userId: user.id, role };
}
