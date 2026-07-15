import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMyPermissions } from "@/services/roles.service";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionContextType {
  permissions: string[];
  isLoading: boolean;
  hasPermission: (featureKey: string) => boolean;
  hasAnyPermission: (featureKeys: string[]) => boolean;
  isAdmin: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const permissionsQuery = useMyPermissions(isAuthenticated);

  const permissions = permissionsQuery.data ?? [];
  // Admin if backend says so OR if the auth user has esAdmin flag (fallback when backend is unavailable)
  const isAdmin = permissions.includes("__admin__") || (user?.esAdmin === true);

  // Prototype fallback: if backend unavailable, grant all permissions so the sidebar is not empty
  const backendUnavailable = permissionsQuery.isError;

  // Not loading if: not authenticated, user is admin, query settled, or query errored (backend not ready)
  const isPermLoading = isAuthenticated && !isAdmin && permissionsQuery.isLoading && !permissionsQuery.isError;

  const value = useMemo<PermissionContextType>(() => ({
    permissions,
    isLoading: isPermLoading,
    hasPermission: (featureKey: string) => {
      if (isAdmin || backendUnavailable) return true;
      return permissions.includes(featureKey);
    },
    hasAnyPermission: (featureKeys: string[]) => {
      if (isAdmin || backendUnavailable) return true;
      return featureKeys.some(key => permissions.includes(key));
    },
    isAdmin,
  }), [permissions, isPermLoading, isAuthenticated, isAdmin, backendUnavailable]);

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions(): PermissionContextType {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
}
