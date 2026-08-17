import type { SupabaseClient } from "@supabase/supabase-js";

import { devBypassSession, devBypassUser } from "./devBypass";
import { fixturesFor } from "./devFixtures";

/**
 * A Supabase client that answers locally instead of over the network.
 *
 * This project's Supabase instance no longer exists, so every query in the app
 * fails at the DNS layer. Each failure surfaces as an error toast, and several
 * hooks redirect away on error, which makes most of the app unreachable even
 * with sign-in bypassed.
 *
 * Patching hooks one at a time does not scale: authorisation and data loading
 * here are spread across dozens of independent hooks, each doing its own
 * round-trip. Replacing the client instead fixes all of them at once, and does
 * it in a single reviewable place.
 *
 * Queries resolve from the fixtures in devFixtures.ts, so the dashboards can be
 * judged as interfaces rather than as empty tables. Every row is invented, and
 * the banner across the top of the app says so on every screen. A table with no
 * fixtures defined still resolves empty rather than erroring.
 *
 * Dev only. Guarded at the call site in integrations/supabase/client.ts.
 */

/** Query builder methods that return the builder so calls can chain. */
const CHAINABLE = new Set([
  "select", "insert", "update", "upsert", "delete",
  "eq", "neq", "gt", "gte", "lt", "lte",
  "like", "ilike", "is", "in", "contains", "containedBy",
  "range", "overlaps", "match", "not", "or", "filter", "textSearch",
  "order", "limit", "abortSignal", "returns", "throwOnError", "explain",
  "rangeGt", "rangeGte", "rangeLt", "rangeLte", "rangeAdjacent",
  "csv", "geojson", "rollback", "setHeader", "overrideTypes",
]);

/** Methods that mean "one row", so the empty answer is null rather than []. */
const SINGULAR = new Set(["single", "maybeSingle"]);

interface QueryOutcome {
  data: unknown;
  error: null;
  count: number;
  status: number;
  statusText: string;
}

function outcome(rows: readonly unknown[], singular: boolean): QueryOutcome {
  return {
    // `.single()` wants one row or null; everything else wants the list.
    data: singular ? (rows[0] ?? null) : [...rows],
    error: null,
    count: rows.length,
    status: 200,
    statusText: "OK (development stub)",
  };
}

/**
 * A thenable that also chains.
 *
 * PostgREST builders are awaited directly, so the object has to behave both as
 * a builder and as a promise. `then` is what await looks for.
 */
function createQueryBuilder(table: string): unknown {
  let singular = false;
  const rows = fixturesFor(table);

  const builder: Record<string | symbol, unknown> = {};

  const proxy: unknown = new Proxy(builder, {
    get(_target, prop) {
      if (prop === "then") {
        return (
          resolve: (value: QueryOutcome) => unknown,
          _reject?: (reason: unknown) => unknown,
        ) => Promise.resolve(outcome(rows, singular)).then(resolve);
      }

      if (prop === "catch" || prop === "finally") {
        return () => proxy;
      }

      if (typeof prop === "string" && SINGULAR.has(prop)) {
        return () => {
          singular = true;
          return proxy;
        };
      }

      if (typeof prop === "string" && CHAINABLE.has(prop)) {
        return () => proxy;
      }

      // Unknown method: keep chaining rather than throwing. A stub that breaks
      // on an unrecognised call is worse than one that quietly returns nothing.
      return () => proxy;
    },
  });

  return proxy;
}

function createChannelStub(): unknown {
  const channel: Record<string, unknown> = {};
  channel.on = () => channel;
  channel.subscribe = () => channel;
  channel.unsubscribe = () => Promise.resolve("ok");
  channel.send = () => Promise.resolve("ok");
  return channel;
}

export function createDevSupabaseStub(): SupabaseClient {
  const stub = {
    from: (table: string) => createQueryBuilder(table),
    rpc: () => createQueryBuilder("__rpc"),
    channel: () => createChannelStub(),
    removeChannel: () => Promise.resolve("ok"),
    removeAllChannels: () => Promise.resolve([]),

    auth: {
      getSession: () =>
        Promise.resolve({ data: { session: devBypassSession() }, error: null }),
      getUser: () =>
        Promise.resolve({ data: { user: devBypassUser() }, error: null }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => undefined } },
      }),
      signInWithPassword: () =>
        Promise.resolve({
          data: { user: devBypassUser(), session: devBypassSession() },
          error: null,
        }),
      signUp: () =>
        Promise.resolve({
          data: { user: devBypassUser(), session: devBypassSession() },
          error: null,
        }),
      signOut: () => Promise.resolve({ error: null }),
      resetPasswordForEmail: () => Promise.resolve({ data: {}, error: null }),
      updateUser: () =>
        Promise.resolve({ data: { user: devBypassUser() }, error: null }),
    },

    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: { path: "dev/stub" }, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: [], error: null }),
        list: () => Promise.resolve({ data: [], error: null }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },

    functions: {
      invoke: () => Promise.resolve({ data: null, error: null }),
    },
  };

  // The stub implements the surface this app actually uses, not the whole
  // client. The cast is confined here and never runs in a production build.
  return stub as unknown as SupabaseClient;
}
