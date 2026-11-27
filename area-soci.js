/* Area soci: accesso con email e password personale (account creati dal gestionale).
   Per ora l'area è aperta solo al Comitato scientifico; si apre a tutti i soci dal gestionale.
   Usato da index.html e da impara/index.html. */
(function () {
  var SB = 'https://vqmxyexwdxjbeakksypz.supabase.co', KEY = 'sb_publishable_jrmse0Bys256kjYFvNl9mQ_QBoECrd3';
  var KS = 'inz-soci-sess', KO = 'inz-soci-stato';
  function get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function put(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function salva(d) { put(KS, { at: d.access_token, rt: d.refresh_token, exp: Date.now() + (d.expires_in || 3600) * 1000, email: d.user && d.user.email }); }
  async function auth(path, body, tok) {
    var r = await fetch(SB + '/auth/v1/' + path, { method: tok && !body.refresh_token && path === 'user' ? 'PUT' : 'POST', headers: Object.assign({ apikey: KEY, 'Content-Type': 'application/json' }, tok ? { Authorization: 'Bearer ' + tok } : {}), body: JSON.stringify(body) });
    var j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) throw new Error(j.error_description || j.msg || j.message || 'Errore ' + r.status);
    return j;
  }
  async function token() {
    var s = get(KS); if (!s) return null;
    if (Date.now() < s.exp - 60000) return s.at;
    try { var d = await auth('token?grant_type=refresh_token', { refresh_token: s.rt }); salva(d); return d.access_token; }
    catch (e) { put(KS, null); put(KO, null); return null; }
  }
  async function rpc(f, tok) {
    var r = await fetch(SB + '/rest/v1/rpc/' + f, { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + tok, 'Content-Type': 'application/json' }, body: '{}' });
    if (!r.ok) throw new Error('Errore ' + r.status);
    var t = await r.text(); return t ? JSON.parse(t) : null;
  }
  var A = window.AREA = {
    /* risposta immediata dall'ultima verifica (per non far lampeggiare le pagine); la verifica vera arriva con stato() */
    okSubito: function () { var o = get(KO); return !!(o && o.ok && get(KS)); },
    stato: async function () {
      var tok = await token(); if (!tok) { put(KO, null); return { ok: false, fuori: true }; }
      try { var st = await rpc('area_soci_stato', tok); put(KO, st && st.ok ? { ok: true, t: Date.now() } : null); return st || { ok: false }; }
      catch (e) { return { ok: A.okSubito(), errore: e.message }; }
    },
    entra: async function (email, pw) {
      var d = await auth('token?grant_type=password', { email: String(email).trim().toLowerCase(), password: pw });
      salva(d); try { await rpc('area_soci_accesso', d.access_token); } catch (e) {}
      return A.stato();
    },
    cambiaPassword: async function (pw) {
      var tok = await token(); if (!tok) throw new Error('Accesso scaduto: entra di nuovo.');
      await auth('user', { password: pw }, tok); await rpc('area_soci_password_cambiata', tok); return A.stato();
    },
    esci: async function () {
      var tok = await token();
      if (tok) { try { await fetch(SB + '/auth/v1/logout', { method: 'POST', headers: { apikey: KEY, Authorization: 'Bearer ' + tok } }); } catch (e) {} }
      put(KS, null); put(KO, null);
    },
    email: function () { var s = get(KS); return s && s.email; }
  };
})();
