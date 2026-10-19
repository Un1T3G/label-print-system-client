import { redirect } from 'next/navigation';
import { getCurrentSession } from '@/shared/auth';

export default async function HomePage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect('/login');
  } else {
    redirect('/products');
  }
}
