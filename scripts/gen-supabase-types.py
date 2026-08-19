"""Generate src/integrations/supabase/types.ts from the live schema.

The Supabase CLI needs Docker for this, which is not available here. This reads
the same catalogs the CLI does and emits the same shape: Row/Insert/Update per
table, Relationships, Views, Functions, Enums.
"""
import json, subprocess, sys, textwrap

PGURL = ("postgresql://postgres.wgryjqfokqiorfuihjqc:odp7A7lLMHzFBmWG"
         "@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres")

def q(sql):
    out = subprocess.run(["psql", PGURL, "-X", "-t", "-A", "-c",
                          f"select coalesce(json_agg(t),'[]') from ({sql}) t"],
                         capture_output=True, text=True, check=True)
    return json.loads(out.stdout.strip())

TYPE_MAP = {
    "uuid": "string", "text": "string", "character varying": "string",
    "citext": "string", "name": "string",
    "integer": "number", "bigint": "number", "smallint": "number",
    "numeric": "number", "double precision": "number", "real": "number",
    "boolean": "boolean",
    "timestamp with time zone": "string", "timestamp without time zone": "string",
    "date": "string", "time without time zone": "string", "interval": "string",
    "json": "Json", "jsonb": "Json",
    "bytea": "string", "inet": "string",
}

enums = {}
for r in q("""
  select t.typname as name, e.enumlabel as label
  from pg_type t join pg_enum e on e.enumtypid = t.oid
  join pg_namespace n on n.oid = t.typnamespace
  where n.nspname = 'public' order by t.typname, e.enumsortorder
"""):
    enums.setdefault(r["name"], []).append(r["label"])

def ts_type(col):
    dt, udt = col["data_type"], col["udt_name"]
    if dt == "ARRAY":
        inner = udt.lstrip("_")
        base = enums and inner in enums and f'Database["public"]["Enums"]["{inner}"]'
        return (base or TYPE_MAP.get({"varchar": "character varying", "int4": "integer",
                                      "int8": "bigint", "text": "text", "uuid": "uuid",
                                      "bool": "boolean", "numeric": "numeric",
                                      "timestamptz": "timestamp with time zone"}.get(inner, inner), "string")) + "[]"
    if dt == "USER-DEFINED" and udt in enums:
        return f'Database["public"]["Enums"]["{udt}"]'
    return TYPE_MAP.get(dt, "string")

cols = q("""
  select c.table_name, c.column_name, c.data_type, c.udt_name,
         c.is_nullable, c.column_default, c.is_generated, c.identity_generation,
         t.table_type
  from information_schema.columns c
  join information_schema.tables t
    on t.table_name = c.table_name and t.table_schema = c.table_schema
  where c.table_schema = 'public'
  order by c.table_name, c.ordinal_position
""")

fks = q("""
  select tc.constraint_name, tc.table_name,
         kcu.column_name, ccu.table_name as foreign_table_name,
         ccu.column_name as foreign_column_name
  from information_schema.table_constraints tc
  join information_schema.key_column_usage kcu
    on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
  join information_schema.constraint_column_usage ccu
    on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
  where tc.constraint_type = 'FOREIGN KEY' and tc.table_schema = 'public'
  order by tc.table_name, tc.constraint_name
""")

funcs = q("""
  select p.proname as name,
         pg_get_function_arguments(p.oid) as args,
         pg_get_function_result(p.oid) as result
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind = 'f'
    and not exists (select 1 from pg_depend d
                    where d.objid = p.oid and d.deptype = 'e')
  order by p.proname
""")

tables, views = {}, {}
for c in cols:
    bucket = views if c["table_type"] == "VIEW" else tables
    bucket.setdefault(c["table_name"], []).append(c)

def emit_table(name, columns, is_view):
    row, ins, upd = [], [], []
    for c in columns:
        t = ts_type(c)
        nullable = c["is_nullable"] == "YES"
        row.append(f"          {c['column_name']}: {t}{' | null' if nullable else ''}")
        if is_view:
            continue
        optional = nullable or c["column_default"] is not None or c["identity_generation"]
        generated = c["is_generated"] == "ALWAYS"
        if not generated:
            ins.append(f"          {c['column_name']}{'?' if optional else ''}: {t}{' | null' if nullable else ''}")
            upd.append(f"          {c['column_name']}?: {t}{' | null' if nullable else ''}")
    rels = [f for f in fks if f["table_name"] == name]
    rel_lines = []
    for f in rels:
        rel_lines.append(
            "{\n"
            f'            foreignKeyName: "{f["constraint_name"]}"\n'
            f'            columns: ["{f["column_name"]}"]\n'
            "            isOneToOne: false\n"
            f'            referencedRelation: "{f["foreign_table_name"]}"\n'
            f'            referencedColumns: ["{f["foreign_column_name"]}"]\n'
            "          }"
        )
    rel_block = ("[\n          " + ",\n          ".join(rel_lines) + ",\n        ]") if rel_lines else "[]"
    parts = [f"      {name}: {{", "        Row: {", *row, "        }"]
    if is_view:
        parts += ["        Insert: {", "          [_ in never]: never", "        }",
                  "        Update: {", "          [_ in never]: never", "        }"]
    else:
        parts += ["        Insert: {", *ins, "        }", "        Update: {", *upd, "        }"]
    parts += [f"        Relationships: {rel_block}", "      }"]
    return "\n".join(parts)

PG_RESULT = {"boolean": "boolean", "integer": "number", "numeric": "number",
             "text": "string", "uuid": "string", "void": "undefined",
             "jsonb": "Json", "json": "Json", "bigint": "number"}

def emit_func(f):
    result = f["result"].strip()
    setof = result.startswith("SETOF ")
    base = result[6:] if setof else result
    ret = PG_RESULT.get(base, "Json")
    if setof:
        ret += "[]"
    args = f["args"].strip()
    if not args:
        arg_ts = "Record<PropertyKey, never>"
    else:
        entries = []
        for a in args.split(","):
            a = a.strip()
            if not a:
                continue
            bits = a.split()
            if len(bits) < 2:
                continue
            nm, ty = bits[0], " ".join(bits[1:])
            ty = ty.split(" DEFAULT")[0].strip()
            entries.append(f"{nm}: {PG_RESULT.get(ty, 'string')}")
        arg_ts = "{ " + "; ".join(entries) + " }" if entries else "Record<PropertyKey, never>"
    return f"      {f['name']}: {{\n        Args: {arg_ts}\n        Returns: {ret}\n      }}"

out = ["""// Generated from the live platform schema (project wgryjqfokqiorfuihjqc).
//
// The Supabase CLI generates this file, but it shells out to Docker, which is
// not available here. This was produced by scripts/gen-supabase-types.py, which
// reads the same catalogs the CLI does. Regenerate it after every migration —
// a stale file is worse than none, because it type-checks against a schema that
// no longer exists.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {"""]

for name in sorted(tables):
    out.append(emit_table(name, tables[name], is_view=False))
out.append("    }")
out.append("    Views: {")
if views:
    for name in sorted(views):
        out.append(emit_table(name, views[name], is_view=True))
else:
    out.append("      [_ in never]: never")
out.append("    }")
out.append("    Functions: {")
if funcs:
    for f in funcs:
        out.append(emit_func(f))
else:
    out.append("      [_ in never]: never")
out.append("    }")
out.append("    Enums: {")
if enums:
    for e in sorted(enums):
        vals = " | ".join(f'"{v}"' for v in enums[e])
        out.append(f"      {e}: {vals}")
else:
    out.append("      [_ in never]: never")
out.append("    }")
out.append("    CompositeTypes: {\n      [_ in never]: never\n    }")
out.append("  }\n}")

out.append("""
type DefaultSchema = Database["public"]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]),
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R }
  ? R
  : never

export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never

export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
""")

sys.stdout.write("\n".join(out) + "\n")
