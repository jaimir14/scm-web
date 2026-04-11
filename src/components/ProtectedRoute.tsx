import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="space-y-4 w-64">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required, check it
  if (requiredRole && user?.rol !== requiredRole) {
    // Redirect to the appropriate dashboard based on actual role
    if (user?.rol === "MEDICO") {
      return <Navigate to="/doctor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  // If no requiredRole but user is MEDICO, redirect to doctor dashboard
  if (!requiredRole && user?.rol === "MEDICO") {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return <>{children}</>;
}
