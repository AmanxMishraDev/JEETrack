import { z } from 'zod';

// ── Request validation (Phase 4) ──
// One shared helper + a schema per validated action, consistent 400 shape.
// Starting with exactly what the roadmap calls out: the login body, and
// admin.js's highest-traffic query-param actions. Every schema here was
// checked against admin.html's actual call sites (not just this file's
// own handler code) before being written, so these reject genuinely
// malformed input without rejecting anything the real admin panel sends.
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = result.error.issues.map(i => `${i.path.join('.') || '(root)'}: ${i.message}`).join('; ');
    return { ok: false, error: message };
  }
  return { ok: true, data: result.data };
}

export const schemas = {
  login: z.object({
    password: z.string().min(1).max(200),
  }),
  // page/pageSize/sort/dir match admin.html's user-table exactly (sortable
  // columns are name/created_at/last_active only; pageSize is hardcoded to
  // 20 client-side, but capped here regardless so a hand-crafted request
  // can't ask for an unbounded page of the roster in one query).
  users: z.object({
    page: z.coerce.number().int().min(0).default(0),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().max(100).optional().default('').transform(s => s.trim()),
    class_year: z.string().max(50).optional().default(''),
    coaching: z.string().max(50).optional().default(''),
    referral_source: z.string().max(50).optional().default(''),
    sort: z.enum(['name', 'last_active', 'created_at']).optional().default('created_at'),
    dir: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
  // distinct_id is always a Supabase auth user id (uuid) — every call site
  // in admin.html passes a roster row's own id straight through.
  user_detail: z.object({
    distinct_id: z.uuid(),
  }),
  // limit/offset match admin.html (limit hardcoded to 20, offset=page*20).
  // hasText/featuredOnly are left as loose optional strings rather than
  // booleans since the handler already does its own '1'/'true' comparison
  // afterward — validating here just rejects garbage, not reshaping them.
  feedback_list: z.object({
    limit: z.coerce.number().int().min(1).max(200).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    hasText: z.string().optional(),
    rating: z.coerce.number().int().min(1).max(5).optional(),
    featuredOnly: z.string().optional(),
  }),
};
