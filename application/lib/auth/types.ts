export type UserRoleCode =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'FLIGHTS_AGENT'
  | 'PACKAGES_AGENT'
  | 'VISA_AGENT'
  | 'ACCOUNTANT'
  | 'OPERATIONS';

export type ServiceTypeCode = 'FLIGHT' | 'PACKAGE' | 'VISA' | 'GENERAL';

export type PipelineStageCode =
  | 'REQUESTS'
  | 'GENERAL'
  | 'PRIORITY'
  | 'CONVERTED'
  | 'CLOSED';

export type PriorityLevelCode = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface UserSession {
  id: string;
  email: string;
  fullName: string;
  role: UserRoleCode;
  phone?: string;
  avatarUrl?: string;
  servicePermissions: ServiceTypeCode[];
  canViewSupplierCosts: boolean;
  canApprovePricing: boolean;
  canMergeCustomers: boolean;
  canManageUsers: boolean;
  canViewAuditLogs: boolean;
}

