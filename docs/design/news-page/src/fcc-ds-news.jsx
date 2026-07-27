// fcc-ds-news.jsx — public "News" page (Neuigkeiten). Deliberately SMALL:
// a lead story + a compact chronological list + an article page. No blog machinery
// (no tags cloud, no author pages, no comments, no filters).
// Konfetti-Kinetik only: tokens from window.KK, Anton/Archivo, hard "Plakat" shadow
// reserved for ONE hero element per screen.
// Exports NewsPage({ mode, device, view }) + NewsTeaser({ mode, device }).

const nHard = (c, n = 8, col) => `${n}px ${n}px 0 ${col || c.ink}`;
const N_CREAM = '#FBF4E6';
const nPanel = (c) => (c.bg === '#15110E'
  ? { bg: '#0C0806', fg: N_CREAM, sub: 'rgba(251,244,230,0.62)' }
  : { bg: c.bg, fg: c.ink, sub: c.sub });
const nTint = (c, k) => (k === 'red' ? c.red : k === 'gold' ? c.gold : c.ink);

// ── content ─────────────────────────────────────────────────────────────
// img:false → typographic "Plakat" fallback instead of a photo. Kategorien are
// labels only (4 fixed ones) — no filter UI at ~10 posts a year.
const NEWS = [
  {
    id: 'motto-56', kat: 'Session', tint: 'red', datum: '18. Juli 2026', kurz: '18.07.',
    titel: 'Das Motto der 56. Session steht',
    teaser: 'Vier Monate hat der Elferrat gebrütet, jetzt ist es raus: „Groß Furria hebt ab“. Was das für Wagen, Kostüme und die Prunksitzungen bedeutet.',
    img: true, autor: 'Franz-Josef Besen',
    body: [
      'Es war ein langer Abend im Vereinsheim, mit viel Kaffee und noch mehr Widerspruch — aber am Ende stand es einstimmig: Die 56. Session steht unter dem Motto <b>„Groß Furria hebt ab“</b>. Luftfahrt, Raumfahrt, Höhenflüge aller Art: Alles ist erlaubt, was den Boden verlässt.',
      'Für den Wagenbau heißt das ab September Vollgas. Uwe hat schon angekündigt, dass er „irgendwas mit Rakete“ vorhat — Details verrät er nicht, aber wer Blech biegen kann, ist ab dem ersten Bautag herzlich willkommen.',
      'Die Garden richten ihre Choreografien am Motto aus, die Kostümgruppe trifft sich Ende August zum ersten Zuschnitt. Wer Stoff, Ideen oder eine Nähmaschine beisteuern kann: bitte bei Marlies melden.',
      'Und für alle, die einfach nur feiern wollen: Der Termin für die große Eröffnung steht ebenfalls. Am <b>11.11. um 19:11 Uhr</b> wecken wir die fünfte Jahreszeit — diesmal mit Startrampe.',
    ],
  },
  { id: 'landestreffen', kat: 'Erfolge', tint: 'gold', datum: '12. Juli 2026', kurz: '12.07.', titel: 'Tanzgarde tanzt auf Platz 2 beim Landestreffen', teaser: 'Nur zwei Zehntel hinter dem Sieger — die beste Platzierung seit 2019. Und das mit zwei kurzfristigen Umbesetzungen.', img: true },
  { id: 'wagenbau', kat: 'Verein', tint: 'ink', datum: '4. Juli 2026', kurz: '04.07.', titel: 'Wir suchen Hände für den Wagenbau', teaser: 'Ab September wird gebaut. Schweißen, schrauben, streichen, Kaffee kochen — jede Fähigkeit findet einen Platz in der Halle.', img: false },
  { id: 'ballett-probe', kat: 'Gruppen', tint: 'ink', datum: '26. Juni 2026', kurz: '26.06.', titel: 'Männerballett probt ab August wieder mittwochs', teaser: 'Neue Zeit, gleicher Ernst: ab dem 5. August immer 20:00 Uhr im Vereinsheim. Zwei Plätze sind frei.', img: false },
  { id: 'jhv', kat: 'Verein', tint: 'red', datum: '14. Juni 2026', kurz: '14.06.', titel: 'Jahreshauptversammlung: Marlies bleibt Präsidentin', teaser: 'Der Vorstand wurde für zwei weitere Jahre bestätigt, die Kasse einstimmig entlastet — und der Beitrag bleibt bei 30 Euro.', img: true },
  { id: 'stadtfest', kat: 'Erfolge', tint: 'gold', datum: '30. Mai 2026', kurz: '30.05.', titel: 'Kindergarde beim Stadtfest: 24 Kinder, ein Auftritt', teaser: 'Der erste große Auftritt der Kleinsten in diesem Jahr — und ein Applaus, der die halbe Marktstraße füllte.', img: true },
];

// typographic fallback: the headline itself becomes the picture
function NewsPlakat({ c, n, h, fs = 34, small }) {
  const tint = nTint(c, n.tint);
  const on = tint === c.gold ? c.ink : '#fff';
  return (
    <div style={{ height: h, background: tint, color: on, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', padding: small ? 14 : 22 }}>
      <div style={{ position: 'absolute', right: -18, top: -12, opacity: 0.16 }}><window.KKBroom size={small ? 110 : h * 0.95} color={on} band={on} /></div>
      <div style={{ position: 'relative', fontFamily: "'Anton', sans-serif", fontSize: fs, lineHeight: 0.9, letterSpacing: 0.3 }}>{n.kat.toUpperCase()}</div>
    </div>
  );
}

function NewsKat({ c, n, size = 11 }) {
  const tint = nTint(c, n.tint);
  return <span style={{ display: 'inline-block', background: tint, color: tint === c.gold ? c.ink : '#fff', fontWeight: 900, fontSize: size, letterSpacing: 1.4, padding: '3px 9px' }}>{n.kat.toUpperCase()}</span>;
}

// editorial section header: red square + Anton label + hairline rule to edge
function NewsRule({ c, label, fg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
      <div style={{ width: 14, height: 14, background: c.red, flexShrink: 0 }} />
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, letterSpacing: 1, color: fg || c.ink, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 1.5, background: c.line }} />
    </div>
  );
}

function NewsShare({ c, small }) {
  const btn = (t, primary) => (
    <button key={t} style={{ border: `1.5px solid ${primary ? c.red : c.line}`, background: primary ? c.red : 'transparent', color: primary ? c.onRed : c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: small ? 12.5 : 13.5, padding: small ? '9px 14px' : '10px 18px', cursor: 'pointer' }}>{t}</button>
  );
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.4, color: c.sub, marginRight: 2 }}>TEILEN</span>
      {btn('WhatsApp', true)}{btn('Link kopieren')}
    </div>
  );
}

// ── DESKTOP · LISTE ─────────────────────────────────────────────────────
function NewsListDesktop({ c, go }) {
  const p = nPanel(c);
  const lead = NEWS[0], rest = NEWS.slice(1);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />

      {/* page head — small, typographic, no hero image */}
      <div style={{ padding: '46px 64px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 3, color: c.red }}>AUS DEM VEREIN · SESSION 2026/27</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 74, lineHeight: 0.88, letterSpacing: 0.4, margin: '14px 0 0' }}>NEUIGKEITEN</h1>
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: c.sub, margin: 0, maxWidth: 380, paddingBottom: 8 }}>
          Was im Verein passiert, steht hier. Kein Blog, keine tägliche Kolumne — nur das, was die Großbesenstadt wissen sollte.
        </p>
      </div>
      <div style={{ height: 3, background: c.ink, margin: '30px 64px 0' }} />

      {/* AUFMACHER — the one Plakat-shadow element on this screen */}
      <div style={{ padding: '38px 64px 0' }}>
        <button onClick={() => go(lead.id)} style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 0, width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `2px solid ${c.ink}`, background: c.paper, boxShadow: nHard(c, 12, c.red) }}>
          <div style={{ position: 'relative' }}>
            <window.KKPlh h={392} label="motto-56-session" c={c} tint={c.red} />
            <span style={{ position: 'absolute', top: 0, left: 0, background: c.red, color: c.onRed, fontFamily: "'Anton', sans-serif", fontSize: 15, letterSpacing: 1.6, padding: '7px 14px' }}>AUFMACHER</span>
          </div>
          <div style={{ padding: '34px 38px 32px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <NewsKat c={c} n={lead} />
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: 0.4, color: c.sub }}>{lead.datum}</span>
            </div>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 48, lineHeight: 0.94, letterSpacing: 0.3, margin: '18px 0 0' }}>{lead.titel}</h2>
            <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: c.sub, margin: '16px 0 0' }}>{lead.teaser}</p>
            <div style={{ marginTop: 'auto', paddingTop: 26, display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: c.red }}>Ganzen Beitrag lesen →</span>
              <span style={{ fontWeight: 600, fontSize: 12.5, color: c.sub }}>2 Min. Lesezeit</span>
            </div>
          </div>
        </button>
      </div>

      {/* LISTE — date rail + row, thumbnail only where a photo exists */}
      <div style={{ padding: '54px 64px 0' }}>
        <NewsRule c={c} label="WEITERE MELDUNGEN" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {rest.map((n, i) => (
            <button key={n.id} onClick={() => go(n.id)} style={{ display: 'grid', gridTemplateColumns: '92px 1fr 168px', gap: 26, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', background: 'transparent', border: 'none', borderTop: i ? `1.5px solid ${c.line}` : 'none', padding: '22px 4px' }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.9, color: c.red }}>{n.kurz}</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <NewsKat c={c} n={n} size={10} />
                  <span style={{ fontWeight: 700, fontSize: 12, color: c.sub }}>{n.datum}</span>
                </div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.96, letterSpacing: 0.2 }}>{n.titel}</div>
                <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.55, color: c.sub, marginTop: 7, maxWidth: 640 }}>{n.teaser}</div>
              </div>
              <div style={{ border: `1.5px solid ${c.line}`, overflow: 'hidden' }}>
                {n.img ? <window.KKPlh h={104} label="foto" c={c} tint={nTint(c, n.tint)} /> : <NewsPlakat c={c} n={n} h={104} fs={22} small />}
              </div>
            </button>
          ))}
        </div>
        <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.sub }}>Das war alles aus dieser Session. Ältere Meldungen liegen im Archiv.</span>
          <button style={{ border: `1.5px solid ${c.ink}`, background: 'transparent', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: '11px 20px', cursor: 'pointer' }}>Archiv 2025/26</button>
        </div>
      </div>

      {/* small ink band: news are not the calendar — send people to the real thing */}
      <div style={{ background: p.bg, color: p.fg, padding: '34px 64px', marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>NICHTS VERPASSEN</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.95, marginTop: 8 }}>ALLE TERMINE DER SESSION</div>
        </div>
        <button style={{ border: `2px solid ${p.fg}`, background: 'transparent', color: p.fg, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15, padding: '14px 26px', cursor: 'pointer' }}>Zum Programm →</button>
      </div>

      <window.KKFooter c={c} />
    </div>
  );
}

// ── DESKTOP · ARTIKEL ───────────────────────────────────────────────────
function NewsArticleDesktop({ c, n, go }) {
  const p = nPanel(c);
  const others = NEWS.filter((x) => x.id !== n.id).slice(0, 3);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '38px 64px 0' }}>
        <button onClick={() => go(null)} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: 0, cursor: 'pointer' }}>← Alle Neuigkeiten</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 24 }}>
          <NewsKat c={c} n={n} />
          <span style={{ fontWeight: 700, fontSize: 13, color: c.sub }}>{n.datum} · von {n.autor || 'Vorstand'}</span>
        </div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 62, lineHeight: 0.93, letterSpacing: 0.3, margin: '16px 0 0' }}>{n.titel}</h1>
        <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 25, lineHeight: 1.24, color: c.sub, margin: '20px 0 0' }}>{n.teaser}</p>
      </div>
      {/* hero: the one hard-shadow element */}
      <div style={{ maxWidth: 820, margin: '32px auto 0', padding: '0 64px' }}>
        <div style={{ border: `2px solid ${c.ink}`, boxShadow: nHard(c, 10, nTint(c, n.tint)), overflow: 'hidden' }}>
          {n.img ? <window.KKPlh h={368} label="motto-56-session" c={c} tint={nTint(c, n.tint)} /> : <NewsPlakat c={c} n={n} h={368} fs={54} />}
        </div>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.sub, marginTop: 9 }}>Foto: Vereinsarchiv · Platzhalter</div>
      </div>
      <div style={{ maxWidth: 820, margin: '0 auto', padding: '32px 64px 0' }}>
        {(n.body || [n.teaser]).map((t, i) => (
          <p key={i} style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.72, color: c.ink, margin: i ? '20px 0 0' : 0, textWrap: 'pretty' }} dangerouslySetInnerHTML={{ __html: t }} />
        ))}
        <div style={{ marginTop: 34, paddingTop: 24, borderTop: `1.5px solid ${c.line}` }}><NewsShare c={c} /></div>
      </div>

      <div style={{ padding: '54px 64px 0' }}>
        <NewsRule c={c} label="MEHR AUS DEM VEREIN" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {others.map((o) => (
            <button key={o.id} onClick={() => go(o.id)} style={{ textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `1.5px solid ${c.line}`, background: c.paper, overflow: 'hidden' }}>
              {o.img ? <window.KKPlh h={132} label="foto" c={c} tint={nTint(c, o.tint)} /> : <NewsPlakat c={c} n={o} h={132} fs={28} small />}
              <div style={{ padding: '16px 18px 18px' }}>
                <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.2, color: nTint(c, o.tint) === c.gold ? c.ink : nTint(c, o.tint) }}>{o.kat.toUpperCase()} · {o.kurz}</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 21, lineHeight: 1, marginTop: 7 }}>{o.titel}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ background: p.bg, color: p.fg, padding: '34px 64px', marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>MITMACHEN</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.95, marginTop: 8 }}>WERDE TEIL VON FURRIA</div>
        </div>
        <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15, padding: '15px 28px', cursor: 'pointer', boxShadow: nHard(c, 5, p.fg) }}>Mitglied werden →</button>
      </div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── MOBILE ──────────────────────────────────────────────────────────────
function NMobBar({ c, label = 'NEUIGKEITEN' }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 18px', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: c.sub, borderBottom: `1px solid ${c.line}` }}>
        <span>GROSSBESENSTADT · EST. 1971</span><span style={{ color: c.red }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '9px 18px 11px' }}>
        <div style={{ justifySelf: 'start', display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer' }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 2.4, background: c.ink, borderRadius: 2 }} />)}</div>
        <div style={{ textAlign: 'center', lineHeight: 0.9 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 27, letterSpacing: 1.5, color: c.ink }}>FURRIA</div>
          <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 2, color: c.sub, marginTop: 2 }}>Nº 128 · SESSION 2026</div>
        </div>
        <button style={{ justifySelf: 'end', border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, padding: '8px 14px', borderRadius: 40, cursor: 'pointer' }}>Tickets</button>
      </div>
    </div>
  );
}

function NewsListMobile({ c, go }) {
  const p = nPanel(c);
  const lead = NEWS[0], rest = NEWS.slice(1);
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={c.ink} />
      <NMobBar c={c} />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '22px 22px 0' }}>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: c.red }}>AUS DEM VEREIN</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 42, lineHeight: 0.9, margin: '8px 0 0' }}>NEUIGKEITEN</h1>
          <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '10px 0 0' }}>Was im Verein passiert, steht hier — kein Blog, nur das Wichtige.</p>
          <div style={{ height: 2.5, background: c.ink, marginTop: 18 }} />
        </div>

        <div style={{ padding: '20px 22px 0' }}>
          <button onClick={() => go(lead.id)} style={{ display: 'block', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `2px solid ${c.ink}`, background: c.paper, boxShadow: nHard(c, 8, c.red), overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <window.KKPlh h={172} label="motto-56-session" c={c} tint={c.red} />
              <span style={{ position: 'absolute', top: 0, left: 0, background: c.red, color: c.onRed, fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: 1.4, padding: '5px 10px' }}>AUFMACHER</span>
            </div>
            <div style={{ padding: '16px 18px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <NewsKat c={c} n={lead} size={9.5} />
                <span style={{ fontWeight: 700, fontSize: 11, color: c.sub }}>{lead.datum}</span>
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 0.96, marginTop: 12 }}>{lead.titel}</div>
              <div style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.55, color: c.sub, marginTop: 9 }}>{lead.teaser}</div>
              <div style={{ fontWeight: 900, fontSize: 13, color: c.red, marginTop: 14 }}>Ganzen Beitrag lesen →</div>
            </div>
          </button>
        </div>

        <div style={{ padding: '28px 22px 0' }}>
          <NewsRule c={c} label="WEITERE MELDUNGEN" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rest.map((n, i) => (
              <button key={n.id} onClick={() => go(n.id)} style={{ display: 'grid', gridTemplateColumns: '1fr 78px', gap: 14, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', background: 'transparent', border: 'none', borderTop: i ? `1.5px solid ${c.line}` : 'none', padding: '15px 2px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <NewsKat c={c} n={n} size={9} />
                    <span style={{ fontWeight: 700, fontSize: 10.5, color: c.sub }}>{n.kurz}</span>
                  </div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, lineHeight: 1 }}>{n.titel}</div>
                  <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.45, color: c.sub, marginTop: 5 }}>{n.teaser.slice(0, 72)}…</div>
                </div>
                <div style={{ border: `1.5px solid ${c.line}`, overflow: 'hidden' }}>
                  {n.img ? <window.KKPlh h={72} label="" c={c} tint={nTint(c, n.tint)} /> : <NewsPlakat c={c} n={n} h={72} fs={14} small />}
                </div>
              </button>
            ))}
          </div>
          <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 16, marginTop: 2 }}>
            <button style={{ width: '100%', border: `1.5px solid ${c.ink}`, background: 'transparent', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13.5, padding: '12px 18px', cursor: 'pointer' }}>Archiv 2025/26</button>
          </div>
        </div>

        <div style={{ background: p.bg, color: p.fg, padding: '24px 22px', marginTop: 26 }}>
          <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 2, color: c.red }}>NICHTS VERPASSEN</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 0.95, marginTop: 7 }}>ALLE TERMINE DER SESSION</div>
          <button style={{ marginTop: 14, border: `2px solid ${p.fg}`, background: 'transparent', color: p.fg, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13.5, padding: '12px 20px', cursor: 'pointer' }}>Zum Programm →</button>
        </div>
        <window.KKFooter c={c} />
      </div>
      <window.HomeIndicator color={c.ink} />
    </window.PhoneFrame>
  );
}

function NewsArticleMobile({ c, n, go }) {
  const others = NEWS.filter((x) => x.id !== n.id).slice(0, 2);
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={c.ink} />
      <NMobBar c={c} label="BEITRAG" />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '18px 22px 0' }}>
          <button onClick={() => go(null)} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12.5, padding: 0, cursor: 'pointer' }}>← Neuigkeiten</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 16 }}>
            <NewsKat c={c} n={n} size={9.5} />
            <span style={{ fontWeight: 700, fontSize: 11, color: c.sub }}>{n.datum}</span>
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.94, margin: '12px 0 0' }}>{n.titel}</h1>
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, lineHeight: 1.28, color: c.sub, margin: '12px 0 0' }}>{n.teaser}</p>
          <div style={{ border: `2px solid ${c.ink}`, boxShadow: nHard(c, 7, nTint(c, n.tint)), overflow: 'hidden', marginTop: 20 }}>
            {n.img ? <window.KKPlh h={200} label="motto-56-session" c={c} tint={nTint(c, n.tint)} /> : <NewsPlakat c={c} n={n} h={200} fs={34} />}
          </div>
          {(n.body || [n.teaser]).map((t, i) => (
            <p key={i} style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.7, color: c.ink, margin: i ? '14px 0 0' : '20px 0 0', textWrap: 'pretty' }} dangerouslySetInnerHTML={{ __html: t }} />
          ))}
          <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1.5px solid ${c.line}` }}><NewsShare c={c} small /></div>
        </div>
        <div style={{ padding: '26px 22px 0' }}>
          <NewsRule c={c} label="MEHR" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {others.map((o) => (
              <button key={o.id} onClick={() => go(o.id)} style={{ display: 'grid', gridTemplateColumns: '78px 1fr', gap: 14, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', background: c.paper, border: `1.5px solid ${c.line}`, padding: 10 }}>
                <div style={{ overflow: 'hidden' }}>{o.img ? <window.KKPlh h={62} label="" c={c} tint={nTint(c, o.tint)} /> : <NewsPlakat c={c} n={o} h={62} fs={13} small />}</div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 9, letterSpacing: 1.1, color: nTint(c, o.tint) === c.gold ? c.ink : nTint(c, o.tint) }}>{o.kat.toUpperCase()} · {o.kurz}</div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, lineHeight: 1, marginTop: 5 }}>{o.titel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <window.KKFooter c={c} />
      </div>
      <window.HomeIndicator color={c.ink} />
    </window.PhoneFrame>
  );
}

// ── landing-page teaser block (3 newest) ────────────────────────────────
function NewsTeaser({ mode = 'light', device = 'desktop' }) {
  const c = window.KK[mode];
  const three = NEWS.slice(0, 3);
  const small = device === 'mobile';
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', background: c.bg, color: c.ink, padding: small ? '26px 22px' : '52px 64px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: small ? 18 : 26 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 14, height: 14, background: c.red, flexShrink: 0 }} />
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 24 : 34, letterSpacing: 0.6 }}>AUS DEM VEREIN</div>
        </div>
        <span style={{ fontWeight: 900, fontSize: small ? 12 : 14, color: c.red, whiteSpace: 'nowrap' }}>Alle News →</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : 'repeat(3,1fr)', gap: small ? 12 : 20 }}>
        {three.map((n, i) => (
          <div key={n.id} style={{ background: c.paper, border: `1.5px solid ${c.line}`, overflow: 'hidden', boxShadow: i === 0 ? nHard(c, 6, c.red) : 'none', borderColor: i === 0 ? c.ink : c.line, borderWidth: i === 0 ? 2 : 1.5 }}>
            {n.img ? <window.KKPlh h={small ? 120 : 150} label="foto" c={c} tint={nTint(c, n.tint)} /> : <NewsPlakat c={c} n={n} h={small ? 120 : 150} fs={small ? 26 : 30} small={small} />}
            <div style={{ padding: small ? '14px 16px 16px' : '18px 20px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <NewsKat c={c} n={n} size={9.5} />
                <span style={{ fontWeight: 700, fontSize: 11, color: c.sub }}>{n.kurz}</span>
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 21 : 24, lineHeight: 1, marginTop: 10 }}>{n.titel}</div>
              <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.5, color: c.sub, marginTop: 7 }}>{n.teaser.slice(0, 90)}…</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// view: null|'list' → Liste · <id> → Artikel. Klicks wechseln intern (im echten
// Produkt sind das Routen /news und /news/:slug).
function NewsPage({ mode = 'light', device = 'desktop', view = null }) {
  const c = window.KK[mode];
  const [cur, setCur] = React.useState(view === 'list' ? null : view);
  const n = cur ? NEWS.find((x) => x.id === cur) : null;
  if (device === 'mobile') return n ? <NewsArticleMobile c={c} n={n} go={setCur} /> : <NewsListMobile c={c} go={setCur} />;
  return n ? <NewsArticleDesktop c={c} n={n} go={setCur} /> : <NewsListDesktop c={c} go={setCur} />;
}

Object.assign(window, { NewsPage, NewsTeaser, NEWS });
