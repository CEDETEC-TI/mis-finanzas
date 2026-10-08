// Crea un usuario nuevo con contraseña por defecto. Solo lo puede llamar
// el admin (Guillermo) — se verifica su identidad por el token de sesión
// que manda el panel, nunca confiar en nada que venga del cliente salvo eso.
import { createClient } from 'npm:@supabase/supabase-js@2';

const ADMIN_USER_ID = 'a9542a3b-a674-427e-9c54-cd0984c16ad2';
const DEFAULT_PASSWORD = '123456';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'missing_auth' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const callerClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userErr } = await callerClient.auth.getUser();
  if (userErr || !user) return json({ error: 'invalid_session' }, 401);
  if (user.id !== ADMIN_USER_ID) return json({ error: 'forbidden' }, 403);

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad_json' }, 400);
  }

  const email = (body.email || '').trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ error: 'invalid_email' }, 400);
  }

  const adminClient = createClient(supabaseUrl, serviceKey);
  const { error } = await adminClient.auth.admin.createUser({
    email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
  });

  if (error) return json({ error: error.message || 'create_failed' }, 400);
  return json({ ok: true, email, default_password: DEFAULT_PASSWORD });
});
