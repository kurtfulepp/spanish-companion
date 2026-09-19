import { getAccountPrivileges } from '@/lib/supabase/admin-access';

export async function GET() {
  const privileges = await getAccountPrivileges();
  return Response.json(privileges, {
    status: privileges.userId ? 200 : 401,
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
