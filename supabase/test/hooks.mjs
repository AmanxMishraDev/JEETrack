// Maps the Deno-only specifier to an in-memory fake so the real function code runs under Node.
export async function resolve(spec, ctx, next) {
  if (spec === 'npm:@supabase/supabase-js@2') return { url: new URL('./fake-supabase.mjs', import.meta.url).href, shortCircuit: true };
  return next(spec, ctx);
}
