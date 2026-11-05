import crypto from 'crypto';
import { UserRoleCode, ServiceTypeCode, UserSession } from './types';

export const DEFAULT_USERS: Array<{
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRoleCode;
  passwordPlain: string;
  avatarUrl: string;
  servicePermissions: ServiceTypeCode[];
  canViewSupplierCosts: boolean;
  canApprovePricing: boolean;
  canMergeCustomers: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
}> = [
  {
    id: 'usr-neel-patel-superadmin',
    email: 'neel@varniholidays.com',
    fullName: 'Neel Patel',
    phone: '+91 63570 50505',
    role: 'SUPER_ADMIN',
    passwordPlain: 'Varni@Admin2026',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    servicePermissions: ['FLIGHT', 'PACKAGE', 'VISA', 'GENERAL', 'CUSTOM_HOLIDAY', 'TRAVEL_INSURANCE'],
    canViewSupplierCosts: true,
    canApprovePricing: true,
    canMergeCustomers: true,
    canManageUsers: true,
    canViewAuditLogs: true,
  },
  {
    id: 'usr-priya-sharma-flights',
    email: 'priya@varniholidays.com',
    fullName: 'Priya Sharma',
    phone: '+91 98980 23456',
    role: 'FLIGHTS_AGENT',
    passwordPlain: 'Priya@Varni2026',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    servicePermissions: ['FLIGHT', 'GENERAL'],
    canViewSupplierCosts: false,
    canApprovePricing: false,
    canMergeCustomers: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  {
    id: 'usr-harshil-desai-packages',
    email: 'harshil@varniholidays.com',
    fullName: 'Harshil Desai',
    phone: '+91 98251 34567',
    role: 'PACKAGES_AGENT',
    passwordPlain: 'Harshil@Varni2026',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    servicePermissions: ['PACKAGE', 'CUSTOM_HOLIDAY', 'GENERAL'],
    canViewSupplierCosts: false,
    canApprovePricing: false,
    canMergeCustomers: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  {
    id: 'usr-ananya-joshi-visa',
    email: 'ananya@varniholidays.com',
    fullName: 'Ananya Joshi',
    phone: '+91 94260 45678',
    role: 'VISA_AGENT',
    passwordPlain: 'Ananya@Varni2026',
    avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    servicePermissions: ['VISA', 'TRAVEL_INSURANCE', 'GENERAL'],
    canViewSupplierCosts: false,
    canApprovePricing: false,
    canMergeCustomers: false,
    canManageUsers: false,
    canViewAuditLogs: false,
  },
  {
    id: 'usr-ketan-parekh-manager',
    email: 'ketan@varniholidays.com',
    fullName: 'Ketan Parekh',
    phone: '+91 98790 56789',
    role: 'MANAGER',
    passwordPlain: 'Ketan@Varni2026',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    servicePermissions: ['FLIGHT', 'PACKAGE', 'VISA', 'GENERAL', 'CUSTOM_HOLIDAY', 'TRAVEL_INSURANCE'],
    canViewSupplierCosts: true,
    canApprovePricing: false,
    canMergeCustomers: true,
    canManageUsers: false,
    canViewAuditLogs: true,
  },
];

export function hashPassword(plain: string): string {
  return crypto.createHash('sha256').update(plain + 'VARNI_HOLIDAYS_SALT_2026').digest('hex');
}

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash;
}

export function getUserSession(userId: string): UserSession | null {
  const user = DEFAULT_USERS.find((u) => u.id === userId);
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    servicePermissions: user.servicePermissions,
    canViewSupplierCosts: user.canViewSupplierCosts,
    canApprovePricing: user.canApprovePricing,
    canMergeCustomers: user.canMergeCustomers,
    canManageUsers: user.canManageUsers,
    canViewAuditLogs: user.canViewAuditLogs,
  };
}

