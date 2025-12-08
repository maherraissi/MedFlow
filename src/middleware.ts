import { auth } from '@/auth';
import { NextResponse, NextRequest } from 'next/server';

export const runtime = 'nodejs';

/**
 * RBAC Middleware - Gestion des rôles et permissions
 * Cahier des Charges: MedFlow SaaS
 */

// ============= ROUTE PERMISSIONS =============

const routePermissions: Record<string, string[]> = {
  // Dashboard routes
  '/dashboard': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/patients': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/appointments': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  '/dashboard/consultations': ['ADMIN', 'DOCTOR'],
  '/dashboard/invoices': ['ADMIN', 'RECEPTIONIST'],
  '/dashboard/services': ['ADMIN'],
  '/dashboard/users': ['ADMIN'],
  '/dashboard/settings': ['ADMIN'],

  // Portal routes
  '/portal': ['PATIENT'],
  '/portal/appointments': ['PATIENT'],
  '/portal/invoices': ['PATIENT'],
  '/portal/prescriptions': ['PATIENT'],

  // Auth routes (public)
  '/auth/login': ['PUBLIC'],
  '/auth/register': ['PUBLIC'],
};

// ============= API ENDPOINT PERMISSIONS =============

const apiPermissions: Record<string, string[]> = {
  // Patients
  'POST /api/patients': ['ADMIN', 'RECEPTIONIST'],
  'GET /api/patients': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  'PATCH /api/patients/:id': ['ADMIN', 'RECEPTIONIST'],
  'GET /api/patients/:id/records': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],

  // Services
  'POST /api/services': ['ADMIN'],
  'GET /api/services': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  'PATCH /api/services/:id': ['ADMIN'],
  'DELETE /api/services/:id': ['ADMIN'],

  // Appointments
  'POST /api/appointments': ['ADMIN', 'RECEPTIONIST'],
  'GET /api/appointments': ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],
  'PATCH /api/appointments/:id': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  'DELETE /api/appointments/:id': ['ADMIN', 'RECEPTIONIST'],
  'POST /api/appointments/book': ['PUBLIC'],

  // Consultations
  'POST /api/consultations': ['DOCTOR'],
  'GET /api/consultations': ['ADMIN', 'DOCTOR'],
  'PATCH /api/consultations/:id': ['DOCTOR'],

  // Prescriptions
  'POST /api/prescriptions': ['DOCTOR'],
  'GET /api/prescriptions/:id': ['DOCTOR', 'ADMIN', 'PATIENT'],
  'POST /api/prescriptions/:id/generate-pdf': ['DOCTOR'],

  // Invoices
  'POST /api/invoices': ['ADMIN', 'RECEPTIONIST'],
  'GET /api/invoices': ['ADMIN', 'RECEPTIONIST', 'PATIENT'],
  'PATCH /api/invoices/:id': ['ADMIN', 'RECEPTIONIST'],
  'GET /api/invoices/:id/pdf': ['ADMIN', 'RECEPTIONIST', 'PATIENT'],

  // Payments
  'POST /api/payments/stripe/checkout': ['PATIENT'],
  'POST /api/payments/manual': ['ADMIN', 'RECEPTIONIST'],

  // Users
  'GET /api/users': ['ADMIN'],
  'PATCH /api/users/:id/role': ['ADMIN'],
  'POST /api/users/invite': ['ADMIN'],

  // Auth
  'POST /api/auth/register': ['PUBLIC'],
  'POST /api/auth/login': ['PUBLIC'],
  'POST /api/auth/logout': ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT'],

  // Clinic
  'GET /api/clinics/:id': ['ADMIN', 'DOCTOR', 'RECEPTIONIST'],
  'PATCH /api/clinics/:id': ['ADMIN'],
  'GET /api/clinics/:id/stats': ['ADMIN'],
};

// ============= HELPER FUNCTIONS =============

function hasPermission(userRole: string | undefined, requiredRoles: string[]): boolean {
  if (requiredRoles.includes('PUBLIC')) return true;
  if (!userRole) return false;
  return requiredRoles.includes(userRole);
}

function getRequiredRoles(path: string, method: string): string[] {
  // Check exact API path
  const apiKey = `${method} ${path}`;
  if (apiPermissions[apiKey]) {
    return apiPermissions[apiKey];
  }

  // Check route patterns
  for (const [route, roles] of Object.entries(routePermissions)) {
    if (path.startsWith(route)) {
      return roles;
    }
  }

  // Default deny
  return [];
}

// ============= MIDDLEWARE =============

export default auth((req: NextRequest & { auth: any }) => {
  const isLoggedIn = !!req.auth;
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const userRole = (req.auth?.user as any)?.role;
  const clinicId = (req.auth?.user as any)?.clinicId;

  // --------- Page Routes (UI) ---------

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/portal')) {
    // Public routes
    if (pathname.startsWith('/auth')) {
      return NextResponse.next();
    }

    // Require login for protected routes
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/login', nextUrl));
    }

    // Check role-based access
    const requiredRoles = getRequiredRoles(pathname, 'GET');
    if (!hasPermission(userRole, requiredRoles)) {
      // Redirect to correct dashboard based on role
      if (userRole === 'PATIENT') {
        return NextResponse.redirect(new URL('/portal', nextUrl));
      } else {
        return NextResponse.redirect(new URL('/dashboard', nextUrl));
      }
    }

    // Add clinicId to headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-clinic-id', clinicId || '');

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  // --------- Public Pages ---------
  if (pathname.startsWith('/auth')) {
    // If already logged in, redirect to dashboard or portal based on role
    if (isLoggedIn) {
      if (userRole === 'PATIENT') {
        return NextResponse.redirect(new URL('/portal', nextUrl));
      }
      return NextResponse.redirect(new URL('/dashboard', nextUrl));
    }
    return NextResponse.next();
  }

  // --------- API Routes ---------
  if (pathname.startsWith('/api')) {
    const method = req.method;
    const requiredRoles = getRequiredRoles(pathname, method);

    // Public API endpoints
    if (requiredRoles.includes('PUBLIC')) {
      return NextResponse.next();
    }

    // Check authentication
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check role permissions
    if (!hasPermission(userRole, requiredRoles)) {
      return NextResponse.json(
        { error: 'Forbidden: Insufficient permissions' },
        { status: 403 }
      );
    }

    // Add clinicId to headers for API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-clinic-id', clinicId || '');
    requestHeaders.set('x-user-id', (req.auth?.user as any)?.id || '');
    requestHeaders.set('x-user-role', userRole || '');

    return NextResponse.next({
      request: { headers: requestHeaders },
    });
  }

  return NextResponse.next();
});

// ============= MATCHER CONFIGURATION =============

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

