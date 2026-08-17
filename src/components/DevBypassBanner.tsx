import { isDevAuthBypass, devBypassRole } from "@/lib/devBypass";

/**
 * Says, on screen, that nobody is really signed in.
 *
 * Without this the app looks like a working product with an empty database,
 * which is exactly the wrong impression: the database is gone, and the person
 * looking at it is not authenticated.
 */
const DevBypassBanner = () => {
  if (!isDevAuthBypass()) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 px-4 py-2 text-center text-sm font-medium text-amber-950">
      Development mode: sign-in bypassed, acting as{" "}
      <strong>{devBypassRole()}</strong>. This project&apos;s database no longer
      exists, so data will be empty. Not possible in a production build.
    </div>
  );
};

export default DevBypassBanner;
