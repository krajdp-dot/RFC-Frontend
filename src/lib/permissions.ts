/**
 * Phase 10 — the permission strings this UI gates on.
 *
 * These mirror backend/src/modules/auth/authorization/permissions.ts. The
 * backend is the security boundary: hiding a button here stops nobody who
 * can open a terminal, and every route it points at is guarded server-side
 * regardless of what this file says. What this file buys is that people
 * don't see, click and get rejected by things their role was never going
 * to be allowed to do.
 *
 * The actual set a person holds always comes from /auth/me — never
 * recomputed here from their role — so the backend stays the one place
 * that decides what a role means.
 */

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard.view',

  BUSINESS_VIEW: 'business.view',
  BUSINESS_EDIT: 'business.edit',

  SALES_VIEW: 'sales.view',
  SALES_CREATE: 'sales.create',
  SALES_RETURN: 'sales.return',

  PURCHASES_VIEW: 'purchases.view',
  PURCHASES_CREATE: 'purchases.create',
  PURCHASES_RETURN: 'purchases.return',

  INVENTORY_VIEW: 'inventory.view',
  INVENTORY_ADJUST: 'inventory.adjust',
  INVENTORY_WASTAGE: 'inventory.wastage',

  CUSTOMERS_VIEW: 'customers.view',
  CUSTOMERS_CREATE: 'customers.create',
  CUSTOMERS_EDIT: 'customers.edit',

  SUPPLIERS_VIEW: 'suppliers.view',
  SUPPLIERS_CREATE: 'suppliers.create',
  SUPPLIERS_EDIT: 'suppliers.edit',

  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_RECEIVE: 'payments.receive',
  PAYMENTS_MAKE: 'payments.make',
  PAYMENTS_REFUND: 'payments.refund',

  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_CREATE: 'expenses.create',
  EXPENSES_DELETE: 'expenses.delete',

  ACCOUNTS_VIEW: 'accounts.view',
  ACCOUNTS_TRANSFER: 'accounts.transfer',
  ACCOUNTS_OPENING_BALANCE: 'accounts.opening_balance',
  ACCOUNTS_MANAGE: 'accounts.manage',

  RECONCILIATION_VIEW: 'reconciliation.view',
  RECONCILIATION_RUN: 'reconciliation.run',

  RECEIVABLES_VIEW: 'receivables.view',
  PAYABLES_VIEW: 'payables.view',

  REPORTS_VIEW: 'reports.view',
  // Phase 13: granted everywhere REPORTS_VIEW is — see the backend's copy
  // of this file for why Intelligence gets its own permission rather than
  // reusing REPORTS_VIEW directly.
  INTELLIGENCE_VIEW: 'intelligence.view',

  DAY_CLOSE_PREVIEW: 'day_close.preview',
  DAY_CLOSE_COMMIT: 'day_close.commit',

  PRICING_VIEW: 'pricing.view',
  PRICING_EDIT: 'pricing.edit',

  PRODUCTS_VIEW: 'products.view',
  PRODUCTS_EDIT: 'products.edit',

  USERS_VIEW: 'users.view',
  USERS_INVITE: 'users.invite',
  USERS_EDIT: 'users.edit',
  USERS_DISABLE: 'users.disable',

  ROLES_VIEW: 'roles.view',

  AUDIT_VIEW: 'audit.view',

  WHATSAPP_VIEW: 'whatsapp.view',
  WHATSAPP_SEND: 'whatsapp.send',
  WHATSAPP_MANAGE_SETTINGS: 'whatsapp.manage_settings',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Owner',
  MANAGER: 'Manager',
  STAFF: 'Staff',
};

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  OWNER: 'Full access, including accounts, audit trail and team management.',
  MANAGER: 'Runs the day: payments, returns, stock adjustments, day close, pricing.',
  STAFF: 'Records sales and purchases, and reads stock, customers and reports.',
};

/**
 * What each page needs before it is worth opening. Checked once in Shell
 * rather than page by page, so a new page can't quietly ship ungated —
 * anything not listed here is readable by any signed-in member, which is
 * the correct default only because every one of those pages' own API calls
 * is still permission-checked on the server.
 *
 * Longest prefix wins, so /inventory/wastage is matched before /inventory.
 */
export const ROUTE_PERMISSIONS: Record<string, Permission> = {
  '/': PERMISSIONS.DASHBOARD_VIEW,
  '/sales/returns': PERMISSIONS.SALES_RETURN,
  '/sales/new': PERMISSIONS.SALES_CREATE,
  '/sales/bulk-lot': PERMISSIONS.SALES_CREATE,
  '/sales': PERMISSIONS.SALES_VIEW,
  '/purchases/new': PERMISSIONS.PURCHASES_CREATE,
  '/purchases': PERMISSIONS.PURCHASES_VIEW,
  '/inventory/wastage': PERMISSIONS.INVENTORY_WASTAGE,
  '/inventory': PERMISSIONS.INVENTORY_VIEW,
  '/products': PERMISSIONS.PRODUCTS_VIEW,
  '/expenses': PERMISSIONS.EXPENSES_VIEW,
  '/customers': PERMISSIONS.CUSTOMERS_VIEW,
  '/suppliers': PERMISSIONS.SUPPLIERS_VIEW,
  '/cash': PERMISSIONS.ACCOUNTS_VIEW,
  '/receivables/receive-payment': PERMISSIONS.PAYMENTS_RECEIVE,
  '/receivables': PERMISSIONS.RECEIVABLES_VIEW,
  '/payables/make-payment': PERMISSIONS.PAYMENTS_MAKE,
  '/payables': PERMISSIONS.PAYABLES_VIEW,
  '/money-flow': PERMISSIONS.REPORTS_VIEW,
  '/day-close': PERMISSIONS.DAY_CLOSE_PREVIEW,
  '/freshness': PERMISSIONS.INVENTORY_VIEW,
  '/price-board': PERMISSIONS.PRICING_VIEW,
  '/reports': PERMISSIONS.REPORTS_VIEW,
  '/analytics': PERMISSIONS.REPORTS_VIEW,
  '/intelligence': PERMISSIONS.INTELLIGENCE_VIEW,
  '/settings': PERMISSIONS.BUSINESS_VIEW,
};

export function permissionForRoute(pathname: string): Permission | undefined {
  const match = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => pathname === route || (route !== '/' && pathname.startsWith(route + '/')) || pathname === route)
    .sort((a, b) => b.length - a.length)[0];
  return match ? ROUTE_PERMISSIONS[match] : undefined;
}
