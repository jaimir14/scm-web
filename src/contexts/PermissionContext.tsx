import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMyPermissions } from "@/services/roles.service";
import { useAuth } from "@/contexts/AuthContext";

interface PermissionContextType {
  /** All feature keys the current user has access to */
  permissions: string[];
  /** Whether permissions are still loading */
  isLoading: boolean;
  /** Check if user has a specific feature permission */
  hasPermission: (featureKey: string) => boolean;
  /** Check if user has any of the given permissions */
  hasAnyPermission: (featureKeys: string[]) => boolean;
  /** Whether the current user is a system administrator */
  isAdmin: boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const permissionsQuery = useMyPermissions();

  // Admin is determined by the user's role having esAdmin flag
  // The backend returns a special "__admin__" permission for admin users
  const permissions = permissionsQuery.data ?? [];
  const isAdmin = permissions.includes("__admin__");

  const value = useMemo<PermissionContextType>(() => ({
    permissions,
    isLoading: permissionsQuery.isLoading && isAuthenticated,
    hasPermission: (featureKey: string) => {
      if (isAdmin) return true; // Admin has access to everything
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
