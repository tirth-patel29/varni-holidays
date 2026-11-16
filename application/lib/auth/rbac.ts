import { cookies, headers } from 'next/headers';
import prisma from '@/lib/prisma';

export const ALL_ROLES = [
  {
    code: 'OWNER',
    name: 'Business Owner & Managing Director',
    description: 'Supreme executive authority across Anand headquarters, rate governance, financial ledgers, and staff security.',
    isSystem: true,
  },
  {
    code: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Full organizational authority across all modules, rate governance, security audit logs, and user management.',
    isSystem: true,
  },
  {
    code: 'ADMIN',
    name: 'Operations Administrator',
    description: 'Operational oversight, lead assignment, booking validations, quotation approvals, and client communications.',
    isSystem: true,
  },
  {
    code: 'SALES_MANAGER',
    name: 'Sales Manager',
    description: 'Sales team supervision, enquiry pipelines, holiday tariff negotiations, and conversion metrics.',
    isSystem: true,
  },
  {
    code: 'SALES_EXECUTIVE',
    name: 'Senior Travel Specialist',
    description: 'Client consultation, custom package planning, live tariff configuration, quotation dispatch, and follow-ups.',
    isSystem: true,
  },
  {
    code: 'OPERATIONS_MANAGER',
    name: 'Operations & Logistics Manager',
    description: 'Chauffeur coordination, hotel reservations, flight ticketing PNR, and visa submission workflows.',
    isSystem: true,
  },
  {
    code: 'OPERATIONS_EXECUTIVE',
    name: 'Operations & Visa Executive',
    description: 'Hotel voucher dispatch, document vault uploads, embassy appointment tracking, and traveller logistics.',
    isSystem: true,
  },
] as const;

export type RoleCode = (typeof ALL_ROLES)[number]['code'];

export const ALL_PERMISSIONS = [
  // Dashboard
  { code: 'dashboard.view', category: 'DASHBOARD', description: 'View executive metrics and daily activity overview' },

  // Employee Management
  { code: 'employees.view', category: 'EMPLOYEES', description: 'View staff directory, active sessions, and profiles' },
  { code: 'employees.invite', category: 'EMPLOYEES', description: 'Invite new staff members via secure cryptographic email tokens' },
  { code: 'employees.edit', category: 'EMPLOYEES', description: 'Modify employee contact details, role assignments, and overrides' },
  { code: 'employees.suspend', category: 'EMPLOYEES', description: 'Suspend or reactivate employee accounts and terminate access' },

  // RBAC & Roles
  { code: 'roles.view', category: 'ROLES', description: 'View role definitions and permission matrices' },
  { code: 'roles.manage', category: 'ROLES', description: 'Create and customize organizational roles and permission boundaries' },
  { code: 'permissions.manage', category: 'ROLES', description: 'Assign custom permission overrides to specific staff accounts' },

  // Leads & Pipeline
  { code: 'leads.view', category: 'LEADS', description: 'View leads pipeline and customer enquiries' },
  { code: 'leads.create', category: 'LEADS', description: 'Create new travel inquiries and holiday requests' },
  { code: 'leads.edit', category: 'LEADS', description: 'Update lead status, travel preferences, and notes' },
  { code: 'leads.delete', category: 'LEADS', description: 'Archive or remove disqualified leads' },
  { code: 'leads.assign', category: 'LEADS', description: 'Assign leads to sales specialists across Gujarat desks' },

  // Customers
  { code: 'customers.view', category: 'CUSTOMERS', description: 'Access customer 360 dossiers and travel history' },
  { code: 'customers.edit', category: 'CUSTOMERS', description: 'Edit customer profiles, contact info, and identity documents' },
  { code: 'customers.merge', category: 'CUSTOMERS', description: 'Merge duplicate customer records with audit trail' },

  // Bookings
  { code: 'bookings.view', category: 'BOOKINGS', description: 'View confirmed package and hotel reservations' },
  { code: 'bookings.create', category: 'BOOKINGS', description: 'Create bookings and issue reservation vouchers' },
  { code: 'bookings.edit', category: 'BOOKINGS', description: 'Modify booking dates, hotel tiers, and logistics' },

  // Quotations
  { code: 'quotations.view', category: 'QUOTATIONS', description: 'View published quotations and tariff proposals' },
  { code: 'quotations.create', category: 'QUOTATIONS', description: 'Generate custom holiday and hotel quotations' },
  { code: 'quotations.send', category: 'QUOTATIONS', description: 'Dispatch official PDF proposals to clients via email/WhatsApp' },

  // Visa & Documents
  { code: 'visa.view', category: 'VISA', description: 'View visa applications, requirements, and checklists' },
  { code: 'visa.manage', category: 'VISA', description: 'Process embassy applications, upload approved visas, and dispatch official emails' },

  // Finance & Ledger
  { code: 'finance.view', category: 'FINANCE', description: 'View financial ledgers, revenue reports, and transactions' },
  { code: 'payments.record', category: 'FINANCE', description: 'Record customer payment advances and reconcile balances' },

  // Settings & Integrations
  { code: 'settings.manage', category: 'SETTINGS', description: 'Manage company contact info, destinations, and Google Sheets integrations' },

  // Security & Audit
  { code: 'security.manage', category: 'SECURITY', description: 'Manage TOTP MFA policies and enterprise security settings' },
  { code: 'audit_logs.view', category: 'SECURITY', description: 'View immutable security audit logs and staff activity feeds' },
  { code: 'sessions.revoke', category: 'SECURITY', description: 'Terminate active employee sessions and revoke tokens' },
] as const;

export type PermissionCode = (typeof ALL_PERMISSIONS)[number]['code'];

// Standard Default Permission Templates per Role
export const DEFAULT_ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  OWNER: ALL_PERMISSIONS.map((p) => p.code as PermissionCode),
  SUPER_ADMIN: ALL_PERMISSIONS.map((p) => p.code as PermissionCode),
  ADMIN: [
    'dashboard.view',
    'employees.view',
    'roles.view',
    'leads.view',
    'leads.create',
    'leads.edit',
    'leads.assign',
    'customers.view',
    'customers.edit',
    'customers.merge',
    'bookings.view',
    'bookings.create',
    'bookings.edit',
    'quotations.view',
    'quotations.create',
    'quotations.send',
    'visa.view',
    'visa.manage',
    'finance.view',
    'payments.record',
    'settings.manage',
    'audit_logs.view',
  ],
  SALES_MANAGER: [
    'dashboard.view',
    'employees.view',
    'leads.view',
    'leads.create',
    'leads.edit',
    'leads.assign',
    'customers.view',
    'customers.edit',
    'bookings.view',
    'quotations.view',
    'quotations.create',
    'quotations.send',
    'finance.view',
    'payments.record',
  ],
  SALES_EXECUTIVE: [
    'dashboard.view',
    'leads.view',
    'leads.create',
    'leads.edit',
    'customers.view',
    'quotations.view',
    'quotations.create',
    'quotations.send',
  ],
  OPERATIONS_MANAGER: [
    'dashboard.view',
    'employees.view',
    'bookings.view',
    'bookings.create',
    'bookings.edit',
    'visa.view',
    'visa.manage',
    'customers.view',
    'finance.view',
  ],
  OPERATIONS_EXECUTIVE: [
    'dashboard.view',
    'bookings.view',
    'bookings.edit',
    'visa.view',
    'visa.manage',
    'customers.view',
  ],
};

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  role: RoleCode;
  phone?: string | null;
  avatarUrl?: string | null;
  status: string;
  twoFactorEnabled: boolean;
  permissions: PermissionCode[];
  sessionId: string;
}

/**
 * Resolve effective permissions for a user: Role Permissions + Custom Overrides
 */
export async function resolveUserPermissions(userId: string, roleCode: RoleCode): Promise<PermissionCode[]> {
  const rolePermissions = (DEFAULT_ROLE_PERMISSIONS[roleCode] || []) as PermissionCode[];
  const permSet = new Set<PermissionCode>(rolePermissions);

  try {
    if (prisma && prisma.userPermissionOverride) {
      const overrides = await prisma.userPermissionOverride.findMany({
        where: { userId },
        include: { permission: true },
      });

      for (const ov of overrides) {
        const code = ov.permission.code as PermissionCode;
        if (ov.isGranted) {
          permSet.add(code);
        } else {
          permSet.delete(code);
        }
      }
    }
  } catch (err) {
    console.warn('[resolveUserPermissions Warning]:', err);
  }

  return Array.from(permSet);
}

/**
 * Check if a permission set grants a specific action (supports wildcard "*")
 */
export function hasPermission(userPermissions: string[], requiredPermission: string): boolean {
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(requiredPermission);
}

/**
 * Server-Side Session Extraction from Request Cookies or Authorization Header
 */
export async function getSessionUser(): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies();
    // Check possible session cookie names (varni_session, better-auth.session_token, etc.)
    const sessionToken =
      cookieStore.get('varni.session_token')?.value ||
      cookieStore.get('better-auth.session_token')?.value ||
      cookieStore.get('varni_session')?.value;

    if (!sessionToken) {
      // Also check Authorization header for API callers
      const headerList = headers();
      const authHeader = headerList.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.slice(7).trim();
        return await validateSessionToken(bearerToken);
      }
      return null;
    }

    return await validateSessionToken(sessionToken);
  } catch (err) {
    console.error('[getSessionUser Error]:', err);
    return null;
  }
}

/**
 * Validate session token against database with active expiration check
 */
export async function validateSessionToken(token: string): Promise<AuthenticatedUser | null> {
  if (!token || !prisma || !prisma.session) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
            phone: true,
            avatarUrl: true,
            status: true,
            twoFactorEnabled: true,
            userRoles: {
              include: {
                role: true,
              },
            },
          },
        },
      },
    });

    if (!session || !session.user) return null;

    // Check expiration
    if (new Date(session.expiresAt) < new Date()) {
      return null;
    }

    // Check user account status
    if (session.user.status === 'DISABLED') {
      return null;
    }

    // Determine primary role code
    const primaryRole = (session.user.userRoles?.[0]?.role?.code as RoleCode) || 'SALES_EXECUTIVE';
    const permissions = await resolveUserPermissions(session.user.id, primaryRole);

    return {
      id: session.user.id,
      email: session.user.email,
      fullName: session.user.fullName,
      role: primaryRole,
      phone: session.user.phone,
      avatarUrl: session.user.avatarUrl,
      status: session.user.status,
      twoFactorEnabled: Boolean(session.user.twoFactorEnabled),
      permissions,
      sessionId: session.id,
    };
  } catch (err) {
    console.error('[validateSessionToken Error]:', err);
    return null;
  }
}

/**
 * Enforce Authentication: Throws Error if not logged in
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error('Authentication required. Please sign in to access this resource.');
  }
  return user;
}

/**
 * Enforce Permission: Throws Error if caller lacks required permission
 */
export async function requirePermission(permission: PermissionCode): Promise<AuthenticatedUser> {
  const user = await requireAuth();

  // OWNER and SUPER_ADMIN have supreme permission
  if (user.role === 'OWNER' || user.role === 'SUPER_ADMIN') {
    return user;
  }

  if (!hasPermission(user.permissions, permission)) {
    throw new Error(`Unauthorized. You lack the required permission: [${permission}].`);
  }

  return user;
}

/**
 * Enforce Role: Throws Error if caller does not possess one of the required roles
 */
export async function requireRole(allowedRoles: RoleCode[]): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Unauthorized. Access restricted to roles: [${allowedRoles.join(', ')}].`);
  }
  return user;
}
