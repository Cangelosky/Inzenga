// Funzione «account-soci»: crea e gestisce gli accessi all'area soci del sito.
// La possono usare solo Presidente, Vicepresidente e amministratore (accessi con password, non di prova).
// Azioni: crea, password (nuova password), attiva, comitato, elimina.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

// password leggibile: niente lettere che si confondono (l, I, O, 0, 1)
function nuovaPassword(): string {
  const L = "abcdefghjkmnpqrstuvwxyz", U = "ABCDEFGHJKLMNPQRSTUVWXYZ", N = "23456789";
  const r = new Uint32Array(12); crypto.getRandomValues(r);
  const pick = (s: string, i: number) => s[r[i] % s.length];
  return pick(U, 0) + pick(L, 1) + pick(L, 2) + pick(L, 3) + "-" + pick(N, 4) + pick(N, 5) + pick(N, 6) + pick(N, 7) + "-" + pick(U, 8) + pick(L, 9) + pick(L, 10) + pick(L, 11);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Metodo non ammesso" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!, service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, service, { auth: { persistSession: false } });
  const token = (req.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u, error: ue } = await admin.auth.getUser(token);
  if (ue || !u?.user) return json({ error: "Accesso non valido" }, 401);
  const { data: prof } = await admin.from("profili").select("nome_visualizzato, carica_id, is_admin, prova").eq("user_id", u.user.id).maybeSingle();
  const gestore = !!prof && (prof.is_admin || (!prof.prova && ["presidente", "vicepresidente"].includes(prof.carica_id)));
  if (!gestore) return json({ error: "Solo Presidente, Vicepresidente e amministratore gestiscono gli accessi dei soci." }, 403);

  let b: Record<string, unknown> = {};
  try { b = await req.json(); } catch { return json({ error: "Richiesta non valida" }, 400); }
  const azione = String(b.azione || ""), chi = prof!.nome_visualizzato as string;

  if (azione === "crea") {
    const email = String(b.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: "Email non valida" }, 400);
    const pw = nuovaPassword();
    const { data: cu, error: ce } = await admin.auth.admin.createUser({ email, password: pw, email_confirm: true, user_metadata: { area: "soci" } });
    if (ce || !cu?.user) return json({ error: ce?.message?.includes("already") ? "Esiste già un accesso con questa email." : (ce?.message || "Non creato") }, 400);
    const { error: ie } = await admin.from("account_soci").insert({ user_id: cu.user.id, socio_id: b.socio_id ? Number(b.socio_id) : null, email, comitato: !!b.comitato, creato_da: chi });
    if (ie) { await admin.auth.admin.deleteUser(cu.user.id); return json({ error: ie.message }, 400); }
    return json({ ok: true, user_id: cu.user.id, email, password: pw });
  }

  const id = String(b.user_id || "");
  const { data: acc } = await admin.from("account_soci").select("user_id, email, attivo").eq("user_id", id).maybeSingle();
  if (!acc) return json({ error: "Accesso non trovato" }, 404);

  if (azione === "password") {
    const pw = nuovaPassword();
    const { error } = await admin.auth.admin.updateUserById(id, { password: pw });
    if (error) return json({ error: error.message }, 400);
    await admin.from("account_soci").update({ cambio_password: true }).eq("user_id", id);
    return json({ ok: true, email: acc.email, password: pw });
  }
  if (azione === "attiva") {
    const on = !!b.attivo;
    const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: on ? "none" : "876000h" });
    if (error) return json({ error: error.message }, 400);
    await admin.from("account_soci").update({ attivo: on }).eq("user_id", id);
    return json({ ok: true });
  }
  if (azione === "comitato") {
    await admin.from("account_soci").update({ comitato: !!b.comitato }).eq("user_id", id);
    return json({ ok: true });
  }
  if (azione === "elimina") {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return json({ error: error.message }, 400);
    return json({ ok: true });
  }
  return json({ error: "Azione sconosciuta" }, 400);
});
