// Configuration for Admin Panel Access
// When true, the Admin Panel is temporarily stopped due to pending payment.
// Lead generation, booking submissions, email notifications, and visitor analytics
// continue running in the background uninterrupted.

export const IS_ADMIN_PANEL_STOPPED = false;

export const ADMIN_LOCK_INFO = {
  reason: 'pending_payment',
  title: 'Admin Access Temporarily Suspended',
  badge: 'Pending Payment Settlement',
  refCode: 'WTP-BILLING-HOLD-2026',
  supportEmail: 'info@walktheplan.in',
  supportPhone: '+91 97110 22075',
  supportWhatsapp: '+919711022075'
};
