/* Avvisi di tossicità, condivisi da scheda specie, elenco, chiave e caratteri liberi.
   Classificazione PRELIMINARE: da verificare con il comitato scientifico.
   Livelli: m = pericolo di morte, t = tossico, s = sospetto o difficile da distinguere. */
(function () {
  var SP = {
    /* pericolo di morte */
    "Amanita phalloides": "m", "Amanita verna": "m", "Amanita virosa": "m", "Amanita proxima": "m",
    "Galerina marginata": "m", "Gyromitra esculenta": "m", "Paxillus involutus": "m",
    "Cortinarius orellanus": "m", "Cortinarius rubellus": "m", "Cortinarius speciosissimus": "m",
    "Lepiota brunneoincarnata": "m", "Lepiota helveola": "m", "Lepiota josserandii": "m", "Lepiota subincarnata": "m",
    "Lepiota castanea": "m", "Lepiota pseudohelveola": "m", "Conocybe rugosa": "m", "Conocybe filaris": "m", "Pholiotina rugosa": "m",
    /* tossici */
    "Amanita muscaria": "t", "Amanita pantherina": "t", "Amanita gemmata": "t", "Amanita citrina": "t", "Amanita junquillea": "t",
    "Tricholoma pardinum": "t", "Tricholoma tigrinum": "t", "Tricholoma josserandii": "t", "Tricholoma equestre": "t", "Tricholoma auratum": "t",
    "Tricholoma sulphureum": "t", "Tricholoma virgatum": "t", "Tricholoma bufonium": "t",
    "Agaricus xanthodermus": "t", "Agaricus phaeolepidotus": "t", "Agaricus praeclaresquamosus": "t", "Agaricus iodosmus": "t",
    "Clitocybe rivulosa": "t", "Clitocybe phyllophila": "t", "Clitocybe dealbata": "t", "Clitocybe candicans": "t", "Clitocybe cerussata": "t",
    "Hypholoma fasciculare": "t", "Omphalotus olearius": "t", "Omphalotus illudens": "t",
    "Rubroboletus satanas": "t", "Rubroboletus legaliae": "t", "Rubroboletus pulchrotinctus": "t", "Rubroboletus lupinus": "t", "Rubroboletus rhodoxanthus": "t", "Rubroboletus demonensis": "t",
    "Entoloma sinuatum": "t", "Entoloma lividum": "t", "Entoloma rhodopolium": "t", "Entoloma nidorosum": "t",
    "Chlorophyllum molybdites": "t", "Mycena pura": "t", "Mycena rosea": "t", "Coprinopsis atramentaria": "t",
    "Hebeloma sinapizans": "t", "Hebeloma crustuliniforme": "t", "Pluteus salicinus": "t", "Panaeolus semiovatus": "s",
    "Russula emetica": "t", "Russula mairei": "t", "Russula fragilis": "t", "Russula sardonia": "t", "Russula queletii": "t", "Russula luteotacta": "t", "Russula betularum": "t", "Russula veternosa": "t",
    "Lactarius torminosus": "t", "Lactarius pubescens": "t", "Lactarius helvus": "t", "Lactarius turpis": "t", "Lactarius necator": "t", "Lactarius chrysorrheus": "t", "Lactarius blennius": "t", "Lactarius uvidus": "t",
    /* sospetti */
    "Chlorophyllum rhacodes": "s", "Neoboletus luridiformis": "s", "Neoboletus erythropus": "s", "Suillellus luridus": "s", "Suillellus queletii": "s", "Caloboletus calopus": "s",
    "Clitocybe nebularis": "s", "Gymnopilus junonius": "s", "Gymnopilus spectabilis": "s", "Pholiota squarrosa": "s", "Tapinella atrotomentosa": "s",
    "Sarcosphaera coronaria": "s", "Ramaria pallida": "s", "Ramaria formosa": "s", "Ramaria gelatinosa": "s", "Amanita rubescens": "s", "Amanita ovoidea": "s", "Hypholoma lateritium": "s",
    "Amanita caesarea": ""
  };
  var GN = {
    Amanita: "s", Galerina: "s", Lepiota: "s", Cortinarius: "s", Inocybe: "t", Entoloma: "s", Hebeloma: "s", Conocybe: "s", Pholiotina: "s",
    Scleroderma: "t", Omphalotus: "t", Gyromitra: "m", Psilocybe: "t", Panaeolus: "s", Helvella: "s", Verpa: "s", Chlorophyllum: "s",
    Rubroboletus: "t", Paxillus: "t", Hypholoma: "s", Tapinella: "s", Gymnopilus: "s", Clitocybe: "s"
  };
  var RK = { m: 3, t: 2, s: 1 };
  var LBL = { m: "Pericolo di morte", t: "Tossico", s: "Tossicità sospetta" };
  var TXT = {
    m: "Specie mortale o gravissima. Non va raccolta né mangiata. Se qualcuno ne ha mangiata, anche poca, bisogna andare subito al pronto soccorso portando con sé il fungo.",
    t: "Specie tossica: non va mangiata. In caso di assunzione, andare al pronto soccorso portando con sé il fungo.",
    s: "Specie di tossicità sospetta o dubbia, oppure facile da confondere con specie pericolose. Non va mangiata senza il parere di un micologo."
  };
  var GTXT = {
    m: "Questo genere comprende specie mortali.",
    t: "Questo genere comprende specie tossiche.",
    s: "Questo genere comprende specie tossiche o difficili da distinguere."
  };
  var NOTE = "Classificazione preliminare, da confermare con il comitato scientifico. Un fungo senza avviso rosso non è per questo sicuro: il sito non dà mai indicazioni di commestibilità.";
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function sp(name) {
    name = String(name || "").trim();
    var w = name.split(/\s+/);
    if (w.length >= 2) { var b = w[0] + " " + w[1]; if (b in SP) return SP[b] || null; }
    return GN[w[0]] || null;
  }
  /* testo libero (gruppo, elenco di esempi): livello massimo fra le specie e i generi nominati */
  function txt(text) {
    var best = null, ws = String(text || "").match(/[A-Z][a-z]+(?:\s+[a-z\-]{3,})?/g) || [];
    ws.forEach(function (x) {
      var p = x.split(/\s+/), l = null;
      if (p.length > 1 && (p[0] + " " + p[1]) in SP) l = SP[p[0] + " " + p[1]] || null;
      else l = GN[p[0]] || null;
      if (l && (!best || RK[l] > RK[best])) best = l;
    });
    return best;
  }
  function badge(l) { return l ? '<span class="tx-bd tx-' + l + '" title="' + esc(TXT[l]) + '">⚠ ' + LBL[l] + "</span>" : ""; }
  function banner(l, group) {
    if (!l) return "";
    return '<div class="tx-ban tx-' + l + '" role="alert"><strong>⚠ ' + (group ? "Attenzione: " + GTXT[l].replace(/\.$/, "") : LBL[l]) + "</strong>" +
      (group ? "" : "<span>" + TXT[l] + "</span>") + '<small>' + NOTE + "</small></div>";
  }
  var css = ".tx-bd{display:inline-block;font-size:.72rem;font-weight:700;letter-spacing:.02em;padding:2px 8px;border-radius:99px;margin:2px 4px 2px 0;background:#b3001b;color:#fff;border:1px solid #7f0014}" +
    ".tx-bd.tx-t{background:#cc2a2a;border-color:#8f1b1b}.tx-bd.tx-s{background:#fff;color:#b3001b;border:1.5px solid #b3001b}" +
    ".tx-ban{border:2px solid #b3001b;border-left-width:8px;background:#fde8ea;color:#5c000e;border-radius:10px;padding:10px 14px;margin:12px 0;display:flex;flex-direction:column;gap:4px;line-height:1.4}" +
    ".tx-ban strong{font-size:1.05rem;color:#b3001b;text-transform:uppercase;letter-spacing:.03em}.tx-ban small{opacity:.85;font-size:.78rem}" +
    ".tx-ban.tx-m{background:#b3001b;color:#fff;border-color:#6d000f}.tx-ban.tx-m strong{color:#fff}" +
    ".tx-gen{border:2px solid #b3001b;background:#fde8ea;color:#5c000e;border-radius:10px;padding:10px 14px;margin:10px 0 14px;line-height:1.45;font-size:.92rem}.tx-gen b{color:#b3001b}" +
    "@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .tx-ban,:root:not([data-theme=light]) .tx-gen{background:#3a0a10;color:#ffd9de;border-color:#ff5a6e}:root:not([data-theme=light]) .tx-ban strong,:root:not([data-theme=light]) .tx-gen b{color:#ff8b99}:root:not([data-theme=light]) .tx-ban.tx-m{background:#b3001b;color:#fff}:root:not([data-theme=light]) .tx-bd.tx-s{background:transparent;color:#ff8b99;border-color:#ff8b99}}" +
    ":root[data-theme=dark] .tx-ban,:root[data-theme=dark] .tx-gen{background:#3a0a10;color:#ffd9de;border-color:#ff5a6e}:root[data-theme=dark] .tx-ban strong,:root[data-theme=dark] .tx-gen b{color:#ff8b99}:root[data-theme=dark] .tx-ban.tx-m{background:#b3001b;color:#fff}:root[data-theme=dark] .tx-bd.tx-s{background:transparent;color:#ff8b99;border-color:#ff8b99}";
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  window.TX = { sp: sp, txt: txt, badge: badge, banner: banner, note: NOTE,
    general: function () { return '<div class="tx-gen" role="note"><b>⚠ Attenzione.</b> Molti funghi sono tossici e alcuni sono mortali; diversi somigliano a specie ritenute buone. Le specie e i generi pericolosi o dubbi hanno un avviso rosso. ' + NOTE + "</div>"; } };
})();
