import type { Registration } from '../types/vms';

export function createVisitorReference(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `VMS-${year}${month}${day}-${suffix}`;
}

export function isHostApprovalActionAllowed(registration?: Registration | null) {
  if (!registration) return false;

  return !['Approved', 'Rejected', 'Expired'].includes(registration.Host_Approval_Status ?? 'Pending');
}

export function canCheckInVisitor(registration?: Registration | null) {
  if (!registration) return false;

  return registration.Host_Approval_Status === 'Approved' && registration.Verified === true;
}
