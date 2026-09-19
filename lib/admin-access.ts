import type { User } from '@supabase/supabase-js';

// Only Supabase administrators can write app_metadata. Never use user_metadata,
// the email address, profile fields, or the generic JWT "authenticated" role.
export function hasAdminPrivilege(user: Pick<User, 'id' | 'app_metadata'> | null | undefined): boolean {
  return Boolean(user?.id && user.app_metadata?.kurtes_role === 'admin');
}
