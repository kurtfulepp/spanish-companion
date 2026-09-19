import { notFound } from 'next/navigation';
import { ApprovalPreview } from './review';
import { getAccountPrivileges } from '@/lib/supabase/admin-access';

export default async function ApprovalPreviewPage() {
  // Sample requests and simulated decisions are only available in development.
  if (process.env.NODE_ENV !== 'development') notFound();
  if (!(await getAccountPrivileges()).isAdmin) notFound();
  return <ApprovalPreview />;
}
