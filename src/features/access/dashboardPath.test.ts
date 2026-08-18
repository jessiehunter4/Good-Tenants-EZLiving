import { describe, expect, it } from 'vitest';
import {
  dashboardPathFor,
  isDashboardPath,
  FALLBACK_DASHBOARD,
} from './dashboardPath';

/**
 * The routing rule, tested without a session or a render.
 *
 * Worth testing because the failure is a redirect loop rather than an error:
 * send someone to a dashboard their role cannot open, the role guard bounces
 * them out, and the redirect sends them straight back. Nothing throws, nothing
 * logs, and the person is simply stuck.
 */
describe('dashboardPathFor', () => {
  it('sends each role to its own dashboard', () => {
    expect(dashboardPathFor('tenant')).toBe('/dashboard-tenant');
    expect(dashboardPathFor('agent')).toBe('/dashboard-agent');
    expect(dashboardPathFor('landlord')).toBe('/dashboard-landlord');
    expect(dashboardPathFor('admin')).toBe('/admin-dashboard');
    expect(dashboardPathFor('lender')).toBe('/lender');
  });

  it('falls back rather than guessing', () => {
    // The five copies of this switch disagreed here: one dropped unknown roles
    // on the generic dashboard, one treated them as tenants. Guessing puts
    // someone on a screen their role cannot open.
    expect(dashboardPathFor(null)).toBe(FALLBACK_DASHBOARD);
    expect(dashboardPathFor(undefined)).toBe(FALLBACK_DASHBOARD);
    expect(dashboardPathFor('')).toBe(FALLBACK_DASHBOARD);
    expect(dashboardPathFor('landlord ')).toBe(FALLBACK_DASHBOARD);
    expect(dashboardPathFor('superuser')).toBe(FALLBACK_DASHBOARD);
  });

  it('never returns the landing page', () => {
    // The bug this whole change exists to fix: a signed-in visitor sitting on
    // the public marketing page. No role may resolve there.
    for (const role of ['tenant', 'agent', 'landlord', 'admin', 'nonsense', null]) {
      expect(dashboardPathFor(role)).not.toBe('/');
    }
  });
});

describe('isDashboardPath', () => {
  it('recognises every path the map can produce', () => {
    // The guard against redirecting someone who is already where they belong,
    // which would replace their history entry on every render.
    for (const role of ['tenant', 'agent', 'landlord', 'admin', null]) {
      expect(isDashboardPath(dashboardPathFor(role))).toBe(true);
    }
  });

  it('does not recognise the landing page or an onboarding route', () => {
    expect(isDashboardPath('/')).toBe(false);
    expect(isDashboardPath('/onboarding/tenant')).toBe(false);
    expect(isDashboardPath('/auth')).toBe(false);
  });
});
