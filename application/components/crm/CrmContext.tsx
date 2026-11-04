'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSession } from '@/lib/auth/types';
import { DEFAULT_USERS, getUserSession } from '@/lib/auth/session';

interface CrmContextType {
  currentUser: UserSession;
  allUsers: typeof DEFAULT_USERS;
  setCurrentUserId: (id: string) => void;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  hasServiceAccess: (service: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL') => boolean;
}

const CrmContext = createContext<CrmContextType | undefined>(undefined);

export function CrmProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState<string>('usr-neel-patel-superadmin');
  const [currentUser, setCurrentUser] = useState<UserSession>(
    getUserSession('usr-neel-patel-superadmin')!
  );

  useEffect(() => {
    const session = getUserSession(currentUserId);
    if (session) setCurrentUser(session);
  }, [currentUserId]);

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN';

  const hasServiceAccess = (service: 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL') => {
    if (isSuperAdmin || currentUser.role === 'MANAGER') return true;
    return currentUser.servicePermissions.includes(service);
  };

  return (
    <CrmContext.Provider
      value={{
        currentUser,
        allUsers: DEFAULT_USERS,
        setCurrentUserId,
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

