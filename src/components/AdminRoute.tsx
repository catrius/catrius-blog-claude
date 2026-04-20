import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/hooks/useAuth';

export default function AdminRoute() {
  const { isAdmin, isLoading } = useAuth();

  if (isLoading) return null;

  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}
