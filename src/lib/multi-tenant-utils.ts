import { NextRequest } from 'next/server';

export interface TenantContext {
  pharmacyId: string | null;
  userRole: string;
  userId: string;
}

export function getTenantContext(request: NextRequest): TenantContext {
  return {
    pharmacyId: request.headers.get('x-pharmacy-id'),
    userRole: request.headers.get('x-user-role') || '',
    userId: request.headers.get('x-user-id') || '',
  };
}

export function validateTenantAccess(context: TenantContext): { isValid: boolean; error?: string } {
  // Allow super_admin without pharmacyId
  if (context.userRole === 'super_admin') {
    return { isValid: true };
  }
  
  // All other roles need pharmacyId
  if (!context.pharmacyId) {
    return {
      isValid: false,
      error: 'Pharmacy ID required for non-super admin users'
    };
  }
  
  return { isValid: true };
}

export function buildTenantQuery(context: TenantContext, baseQuery: any = {}): any {
  const query = { ...baseQuery };
  
  // Add pharmacy filter unless user is super admin
  if (context.pharmacyId) {
    query.pharmacyId = context.pharmacyId;
  } else if (context.userRole !== 'super_admin') {
    // This should not happen if validateTenantAccess is called first
    throw new Error('Access denied: Missing pharmacy context');
  }
  
  return query;
}

export function addTenantData(context: TenantContext, data: any): any {
  if (!context.pharmacyId && context.userRole !== 'super_admin') {
    throw new Error('Cannot add tenant data: Missing pharmacy context');
  }
  
  return {
    ...data,
    pharmacyId: context.pharmacyId
  };
}