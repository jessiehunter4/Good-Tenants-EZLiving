// Typed CRUD over the admin tables.
//
// The daily wrote list/upsert/delete by hand for every table — fourteen near
// identical server-function modules. The shapes are the same, so the plumbing
// lives here once and each screen supplies only what differs: the table, the
// ordering, and the shape of a row.
//
// These run in the browser under RLS rather than as service-role server
// functions. Every table involved carries an admin-only policy, so a
// non-admin's request is refused by the database rather than by a middleware
// somebody has to remember to attach.
import {
  queryOptions,
  useMutation,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type PublicTables = Database["public"]["Tables"];

export type TableName = keyof PublicTables;
export type Row<K extends TableName> = PublicTables[K]["Row"];
export type Insert<K extends TableName> = PublicTables[K]["Insert"];
export type Update<K extends TableName> = PublicTables[K]["Update"];

export type SortSpec = { column: string; ascending?: boolean };

export const adminKey = (table: TableName, ...rest: string[]) =>
  ["admin", table, ...rest] as const;

// ---------------------------------------------------------------------------
// The one place the generic defeats the query builder
// ---------------------------------------------------------------------------
// PostgREST's builder resolves a row type from a *literal* table name. Here the
// name is a type parameter, so it cannot — every call would fail to compile no
// matter how correct it is.
//
// Rather than scatter casts through the module, the client is narrowed once to
// a structural description of the four operations used. Nothing here is `any`:
// results come back as `unknown` and are handed to the typed wrappers below,
// which is where the shape is asserted — once, against the type the caller's
// generic already promises.
type Failure = { message: string } | null;
type Result<T> = { data: T; error: Failure };

type Filtered = Promise<Result<unknown>>;
type Ordered = PromiseLike<Result<unknown>> & {
  order: (column: string, opts: { ascending: boolean }) => Ordered;
};

type LooseTable = {
  select: (columns: string) => Ordered;
  insert: (values: unknown) => { select: (columns: string) => { single: () => Promise<Result<unknown>> } };
  update: (values: unknown) => { eq: (column: string, value: string) => Filtered };
  delete: () => { eq: (column: string, value: string) => Filtered };
};

function table(name: TableName): LooseTable {
  return (supabase as unknown as { from: (n: string) => LooseTable }).from(name);
}

function fail(error: Failure): void {
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Typed surface
// ---------------------------------------------------------------------------

export function adminListQuery<K extends TableName>(
  name: K,
  sort: SortSpec[] = [],
  select = "*",
) {
  return queryOptions({
    queryKey: adminKey(name),
    queryFn: async (): Promise<Row<K>[]> => {
      let query = table(name).select(select);
      for (const s of sort) {
        query = query.order(s.column, { ascending: s.ascending ?? true });
      }
      const { data, error } = await query;
      fail(error);
      return (data ?? []) as Row<K>[];
    },
  });
}

function invalidate(client: QueryClient, name: TableName) {
  return client.invalidateQueries({ queryKey: adminKey(name) });
}

export type UpsertInput<K extends TableName> = {
  id?: string | null;
  values: Insert<K>;
};

/** Insert when there is no id, update when there is. */
export function useAdminUpsert<K extends TableName>(name: K) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: UpsertInput<K>): Promise<string> => {
      if (id) {
        const { error } = await table(name).update(values).eq("id", id);
        fail(error);
        return id;
      }
      const { data, error } = await table(name).insert(values).select("id").single();
      fail(error);
      return (data as { id: string }).id;
    },
    onSuccess: () => invalidate(client, name),
  });
}

export function useAdminDelete<K extends TableName>(name: K) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await table(name).delete().eq("id", id);
      fail(error);
    },
    onSuccess: () => invalidate(client, name),
  });
}

/** Patch a few columns on one row — status flips, toggles, review decisions. */
export function useAdminPatch<K extends TableName>(name: K) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: Update<K> }) => {
      const { error } = await table(name).update(values).eq("id", id);
      fail(error);
    },
    onSuccess: () => invalidate(client, name),
  });
}

/** The message a failed mutation should show. Never leaks an object. */
export function errorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}
