import { createClient } from '@/lib/supabase/server';
import { hasAdminPrivilege } from '@/lib/admin-access';

export async function getAccountPrivileges() {
  try {
    const supabase = await createClient();
    // Read the current Auth record, not potentially stale role claims in a JWT.
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) return { userId: null, isAdmin: false };
    return { userId: data.user.id, isAdmin: hasAdminPrivilege(data.user) };
  } catch {
    return { userId: null, isAdmin: false };
  }
}
