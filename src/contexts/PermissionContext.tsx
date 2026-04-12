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
  const permissionsQuery = useMyPermissions();

  const permissions = permissionsQuery.data ?? [];
  // Admin if backend says so OR if the auth user has esAdmin flag (fallback when backend is unavailable)
  const isAdmin = permissions.includes("__admin__") || (user?.esAdmin === true);

  const value = useMemo<PermissionContextType>(() => ({
    permissions,
    // Not loading if user is admin (they have full access regardless) or if query settled
    isLoading: !isAdmin && permissionsQuery.isLoading && isAuthenticated,
    hasPermission: (featureKey: string) => {
      if (isAdmin) return true;
      return permissions.includes(featureKey);
    },
    hasAnyPermission: (featureKeys: string[]) => {
      if (isAdmin) return true;
      return featureKeys.some(key => permissions.includes(key));
    },
    isAdmin,
  }), [permissions, permissionsQuery.isLoading, isAuthenticated, isAdmin]);

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
