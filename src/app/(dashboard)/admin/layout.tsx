import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/shared/auth';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  }

  // Only users with ADMIN role can access admin pages
  if (session.role !== 'ADMIN') {
    redirect('/products');
  }

  return <>{children}</>;
}
