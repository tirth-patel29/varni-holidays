'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/auth/types';
import { getCurrentAuthUserAction } from '@/app/actions/auth';

interface CrmContextType {
  currentUser: UserSession;
  allUsers: Array<{
    id: string;
    email: string;
    fullName: string;
    phone: string;
    role: string;
    avatarUrl: string;
  }>;
  setCurrentUserId: (id: string) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasServiceAccess: (service: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL') => boolean;
}

const DEFAULT_FALLBACK_USER: UserSession = {
  id: '',
  email: '',
  fullName: 'Authenticating...',
  role: 'SALES_EXECUTIVE',
  servicePermissions: ['FLIGHT', 'PACKAGE', 'VISA', 'GENERAL'],
  canViewSupplierCosts: false,
  canApprovePricing: false,
  canMergeCustomers: false,
  canManageUsers: false,
  canViewAuditLogs: false,
};

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession>(DEFAULT_FALLBACK_USER);

  useEffect(() => {
    async function loadAuth() {
      try {
        const authUser = await getCurrentAuthUserAction();
        if (authUser) {
          setCurrentUser({
            id: authUser.id,
            email: authUser.email,
            fullName: authUser.fullName,
            role: authUser.role as any,
            phone: authUser.phone || '',
            avatarUrl: authUser.avatarUrl || '',
            servicePermissions: ['FLIGHT', 'PACKAGE', 'VISA', 'GENERAL', 'CUSTOM_HOLIDAY', 'TRAVEL_INSURANCE'],
            canViewSupplierCosts: authUser.isSuperAdmin || authUser.role === 'ADMIN',
            canApprovePricing: authUser.isSuperAdmin,
            canMergeCustomers: authUser.isSuperAdmin || authUser.role === 'ADMIN',
            canManageUsers: authUser.isSuperAdmin,
            canViewAuditLogs: authUser.isSuperAdmin || authUser.permissions.includes('audit_logs.view'),
          });
        }
      } catch (err) {
        console.warn('Failed to load current authenticated user:', err);
      }
    }
    loadAuth();
  }, []);

  const isSuperAdmin = currentUser.role === 'OWNER' || (currentUser.role as any) === 'SUPER_ADMIN';
  const isAdmin = isSuperAdmin || currentUser.role === 'ADMIN';

  const hasServiceAccess = (service: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL') => {
    if (isSuperAdmin || currentUser.role === 'MANAGER') return true;
    return currentUser.servicePermissions.includes(service);
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        allUsers: [],
        setCurrentUserId: () => {},
        isSuperAdmin,
        isAdmin,
        hasServiceAccess,
      }}
    >
      {children}
    </CrmContext.Provider>
  );
}

export function useCrm() {
  const context = useContext(CrmContext);
  if (!context) {
    throw new Error('useCrm must be used within a CrmProvider');
  }
  return context;
}

