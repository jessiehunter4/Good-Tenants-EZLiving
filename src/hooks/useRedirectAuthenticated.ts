import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { dashboardPathFor } from '@/features/access/dashboardPath';

/**
 * Keep a signed-in account off the pages written for people who are not.
 *
 * ## Why it exists
 *
 * The landing page, the sign-in page and registration all describe a product to
 * someone who has not bought it yet. A signed-in tenant who lands on one has
 * either mistyped a URL or followed a stale link, and the useful thing to do is
 * put them where their work is. Until now this hook existed and was called from
 * nowhere, so it did none of that.
 *
 * ## The three things it is careful about
 *
 *  - **It waits for `loading`.** The auth context starts with no user and
 *    resolves the session asynchronously, so acting on the first render would
 *    mean deciding that everyone is signed out and then changing its mind.
 *  - **It replaces rather than pushes.** A redirect that pushes puts the
 *    landing page in the history stack, so Back returns to it, which redirects
 *    again. That is a trap, not navigation.
 *  - **It leaves a fresh login alone.** Signing in sets `fresh_login`, and the
 *    sign-in flow does its own navigation; racing it would send someone
 *    somewhere other than where they asked to go.
 */
export const useRedirectAuthenticated = () => {
  const { user, loading, getUserRole } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    // Session not resolved yet. Deciding now would mean deciding "signed out"
    // for everyone and correcting it a frame later.
    if (loading) return;
    if (!user) return;

    /*
     * A fresh login navigates itself. The flag is consumed here so the next
     * arrival at a public page is treated normally — leaving it set would
     * disable this hook for the rest of the session.
     */
    if (sessionStorage.getItem('fresh_login')) {
      sessionStorage.removeItem('fresh_login');
      return;
    }

    const destination = dashboardPathFor(getUserRole());
    if (destination === pathname) return;

    navigate(destination, { replace: true });
  }, [user, loading, pathname, navigate, getUserRole]);

  return { user, loading };
};

export default useRedirectAuthenticated;
