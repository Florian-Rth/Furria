// fcc-ds-club-v2.jsx — public "Verein" page, ALTERNATE DIRECTION.
// Concept "Plakat-Kapitel": a bold broadsheet feature — numbered full-bleed chapters
// alternating ink/cream/red, the HARD offset-shadow "Plakat" elevation as the leading
// language, the 11.11 KKSeal + diagonal KKTicker (both unused in v1), Gruppen as a
// numbered magazine index (not a card grid), Vorstand as a portrait wall.
// Konfetti-Kinetik system only. Exports ClubV2({ mode, device }).

// hard offset-shadow (Plakat) — the bold elevation language
const v2Hard = (c, n = 8, col) => `${n}px ${n}px 0 ${col || c.ink}`;
const V2_CREAM = '#FBF4E6';
const { useState } = React;
// theme-correct dark panel — keeps dark mode dark instead of flipping to ink=cream
const v2Panel = (c) => (c.bg === '#15110E'
  ? { bg: '#0C0806', fg: V2_CREAM, sub: 'rgba(251,244,230,0.62)' }
  : { bg: c.bg, fg: c.ink, sub: c.sub });

function V2Btn({ c, children, primary, ghostOn, fs = 17 }) {
  if (primary) return (
    <button style={{ border: `2px solid ${c.ink}`, background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: fs, padding: `${fs - 1}px ${fs * 1.7}px`, borderRadius: 0, cursor: 'pointer', boxShadow: v2Hard(c, 6) }}>{children}</button>
  );
  const line = ghostOn || c.ink;
  return (
    <button style={{ border: `2px solid ${line}`, background: 'transparent', color: line, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: fs - 1, padding: `${fs - 1}px ${fs * 1.55}px`, borderRadius: 0, cursor: 'pointer' }}>{children}</button>
  );
}

// giant chapter marker: "KAPITEL" + big numeral + title, hairline rule to edge
function V2Chapter({ c, num, kicker, title, on = 'light', fs = 62 }) {
  const ink = c.ink;
  const dim = c.sub;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 22, marginBottom: 34 }}>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 132, lineHeight: 0.74, color: c.red, flexShrink: 0 }}>{num}</div>
      <div style={{ flexShrink: 0, paddingBottom: 6 }}>
        <div style={{ fontWeight: 900, fontSize: 12.5, letterSpacing: 3, color: dim, marginBottom: 8 }}>{kicker}</div>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: fs, lineHeight: 0.9, letterSpacing: 0.4, margin: 0, color: ink }}>{title}</h2>
      </div>
      <div style={{ flex: 1, height: 3, background: c.ink, marginBottom: 18 }} />
    </div>
  );
}

// ── content ─────────────────────────────────────────────────────────────
const V2_MILESTONES = [
  ['1971', 'Der erste Besen', 'Ein Häuflein Narren bindet den ersten Besen — der FCC ist geboren.'],
  ['1979', 'Die erste Garde', 'Die Funkengarde tanzt zur ersten Prunksitzung auf.'],
  ['1988', 'Ein eigenes Heim', 'Endlich eine feste Heimat für Proben, Feste und die Session.'],
  ['2004', 'Der große Umzug', 'Erstmals zieht FURRIA mit eigenem Wagen durch die Großbesenstadt.'],
  ['2021', '50 Jahre FURRIA', 'Ein halbes Jahrhundert Groß Furria — gefeiert wie noch nie.'],
];
const V2_SEASON = [
  ['11.11.', 'Die Eröffnung', 'Um 19:11 Uhr wecken wir die fünfte Jahreszeit.'],
  ['Advent', 'Proben & Aufbau', 'Garden proben, Wagen entstehen, Kostüme werden genäht.'],
  ['Februar', 'Prunksitzungen', 'Bütt, Tanz und Show — die großen Abende in der Festhalle.'],
  ['Rosenmo.', 'Der Umzug', 'Die ganze Großbesenstadt am Straßenrand.'],
  ['Aschermi.', 'Der Ausklang', 'Mit dem Heringsessen endet die Session.'],
];
const V2_GROUPS = [
  ['Tanzgarde', 'Funkenmariechen & Gardetanz.', '18 Aktive', 'red', 'Die Tanzgarde ist das tänzerische Herz jeder Prunksitzung: Gardetanz, Schautanz und die Funkenmariechen-Soli. Trainiert wird das ganze Jahr über für den großen Auftritt zur Session.', 'Sabine Wirbel', 'Dienstags · 19:00 Uhr · Turnhalle'],
  ['Männerballett', 'Zwölf Männer, ein Tutu-Traum.', '12 Aktive', 'ink', 'Die Lachnummer der Session: zwölf mutige Männer, ein Tutu-Traum. Mehr Mut als Technik — und genau deshalb lieben es alle.', 'Uwe Fass', 'Mittwochs · 20:00 Uhr · Vereinsheim'],
  ['Elferrat', 'Der närrische Rat auf der Bühne.', '11 Räte', 'gold', 'Tradition, Orden und gute Laune: der Elferrat sitzt bei jeder Sitzung auf der Bühne und sorgt für den roten Faden durchs Programm.', 'Franz-Josef Besen', 'Nach Bedarf · Vereinsheim'],
  ['Spielmannszug', 'Trommeln & Flöten für den Umzug.', '22 Aktive', 'ink', 'Trommeln und Flöten, die dem Umzug den Takt geben — von der Eröffnung bis zum letzten Wagen am Rosenmontag.', 'Bernd Groß', 'Donnerstags · 19:30 Uhr · Musikraum'],
  ['Kindergarde', 'Die Kleinsten ganz groß.', '24 Kinder', 'red', 'Der Nachwuchs von 5 bis 12 Jahren — mit eigenem Auftritt beim Kinderfasching und großen Vorbildern in der Tanzgarde.', 'Lena Kehr', 'Freitags · 17:00 Uhr · Turnhalle'],
  ['Organisation', 'Getränke, Kasse & Küche.', 'Alle Hände', 'gold', 'Bühne, Technik, Getränke, Kasse — die Crew, ohne die kein Fest stattfindet. Hier ist für jede Fähigkeit ein Platz.', 'Uwe Fass', 'Nach Bedarf'],
];
const V2_VORSTAND = [
  ['Präsident', 'Franz-Josef Besen', 'red'],
  ['Präsidentin', 'Marlies Furrmann', 'gold'],
  ['Kinderpräsidentin', 'Lena Kehr', 'ink'],
  ['Geschäftsführer', 'Bernd Groß', 'gold'],
  ['Getränkewart', 'Uwe Fass', 'ink'],
  ['Trainerin', 'Sabine Wirbel', 'red'],
];
const v2Tint = (c, k) => (k === 'red' ? c.red : k === 'gold' ? c.gold : c.ink);
const PAD = '0 64px';

// compact clickable tile — opens the shared modal; scales to any number of groups via auto-fill grid
function V2GroupTile({ c, g, i, onOpen }) {
  const [t, short, meta, tk] = g;
  const tint = v2Tint(c, tk);
  return (
    <button onClick={() => onOpen(i)} style={{ textAlign: 'left', cursor: 'pointer', border: `2px solid ${c.ink}`, background: c.paper, boxShadow: v2Hard(c, 5, tint), padding: 0, overflow: 'hidden', font: 'inherit', color: 'inherit', display: 'block' }}>
      <div style={{ position: 'relative' }}>
        <window.KKPlh h={96} label={t.toLowerCase()} c={c} tint={tint} />
        <span style={{ position: 'absolute', top: 8, left: 8, fontFamily: "'Anton', sans-serif", fontSize: 13, color: tint === c.gold ? c.ink : '#fff', background: tint, padding: '2px 8px' }}>{String(i + 1).padStart(2, '0')}</span>
      </div>
      <div style={{ padding: '12px 14px 14px' }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, lineHeight: 1, color: c.ink }}>{t}</div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: c.sub, marginTop: 5, lineHeight: 1.35 }}>{short}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
          <span style={{ fontWeight: 900, fontSize: 10, letterSpacing: 0.5, color: tint === c.gold ? c.ink : tint }}>{meta.toUpperCase()}</span>
          <span style={{ fontWeight: 800, fontSize: 12, color: c.red }}>Mehr →</span>
        </div>
      </div>
    </button>
  );
}

// shared detail modal — position:absolute on a relative root so it stays scoped to the artboard
function V2GroupModal({ c, g, onClose, small }) {
  if (!g) return null;
  const [t, short, meta, tk, full, leiter, treffen] = g;
  const tint = v2Tint(c, tk);
  return (
    <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(10,7,5,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 90, padding: small ? 18 : 40 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: c.paper, border: `2px solid ${c.ink}`, boxShadow: v2Hard(c, small ? 6 : 10, tint), maxWidth: small ? '100%' : 560, width: '100%', overflow: 'hidden' }}>
        <div style={{ position: 'relative' }}>
          <window.KKPlh h={small ? 150 : 220} label={t.toLowerCase()} c={c} tint={tint} />
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, border: `2px solid ${c.ink}`, background: c.paper, fontWeight: 900, fontSize: 15, cursor: 'pointer', boxShadow: v2Hard(c, 3) }}>✕</button>
        </div>
        <div style={{ padding: small ? '20px 22px 24px' : '26px 30px 30px' }}>
          <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.5, color: tint === c.gold ? c.ink : tint }}>{meta.toUpperCase()}</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 30 : 38, lineHeight: 0.95, color: c.ink, marginTop: 6 }}>{t}</div>
          <p style={{ fontSize: small ? 14 : 15.5, fontWeight: 500, lineHeight: 1.6, color: c.sub, marginTop: 14 }}>{full}</p>
          <div style={{ display: 'flex', gap: 24, marginTop: 20, paddingTop: 18, borderTop: `1px solid ${c.line}` }}>
            <div><div style={{ fontWeight: 800, fontSize: 10.5, letterSpacing: 0.5, color: c.red }}>LEITUNG</div><div style={{ fontWeight: 700, fontSize: small ? 13.5 : 15, color: c.ink, marginTop: 3 }}>{leiter}</div></div>
            <div><div style={{ fontWeight: 800, fontSize: 10.5, letterSpacing: 0.5, color: c.red }}>TREFFEN</div><div style={{ fontWeight: 700, fontSize: small ? 13.5 : 15, color: c.ink, marginTop: 3 }}>{treffen}</div></div>
          </div>
          <button style={{ marginTop: 22, border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 13.5 : 15, padding: small ? '11px 20px' : '13px 24px', cursor: 'pointer', boxShadow: v2Hard(c, 4) }}>Mitglied werden →</button>
        </div>
      </div>
    </div>
  );
}

// ── DESKTOP ─────────────────────────────────────────────────────────────
function ClubV2Desktop({ c }) {
  const p = v2Panel(c);
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%', position: 'relative' }}>
      <window.KKMastheadBar c={c} />

      {/* HERO — session numeral as the graphic anchor, ribbon banner, photo tucked into the corner */}
      <div style={{ position: 'relative', background: p.bg, color: p.fg, padding: '58px 64px 0', minHeight: 620, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3, pointerEvents: 'none' }}><window.KKConfetti c={c} n={14} seed={4} /></div>
        <div style={{ position: 'absolute', right: 40, top: -55, fontFamily: "'Anton', sans-serif", fontSize: 380, lineHeight: 0.8, letterSpacing: -4, WebkitTextStroke: `2px ${c.red}`, color: 'transparent', opacity: 0.85, pointerEvents: 'none', userSelect: 'none', zIndex: 1 }}>55</div>
        <div style={{ position: 'absolute', top: 38, left: -58, background: c.red, color: c.onRed, fontFamily: "'Anton', sans-serif", fontSize: 17, letterSpacing: 2, padding: '9px 72px', transform: 'rotate(-8deg)', boxShadow: v2Hard(c, 5), zIndex: 2, whiteSpace: 'nowrap' }}>SEIT 1971 · GROSSBESENSTADT</div>
        <div style={{ position: 'relative', zIndex: 3, maxWidth: 680, marginTop: 46 }}>
          <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 3, color: c.red }}>FURRSCHER CARNEVALS CLUB e.V. · 55. SESSION</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 82, lineHeight: 0.88, letterSpacing: 0.4, margin: '16px 0 0', color: p.fg }}>
            DIE FÜNFTE<br />JAHRESZEIT<br /><span style={{ color: c.red }}>HAT EIN ZUHAUSE.</span>
          </h1>
          <p style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.55, color: p.sub, margin: '20px 0 0', maxWidth: 560 }}>
            Vier Generationen, ein Dutzend Gruppen und eine ganze Stadt in Feierlaune — willkommen bei FURRIA, dem Karnevalsverein der Großbesenstadt.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 30 }}>
            <V2Btn c={c} primary>Mitglied werden →</V2Btn>
            <V2Btn c={c} ghostOn={p.fg}>Zum Programm</V2Btn>
          </div>
        </div>
        <div style={{ position: 'absolute', right: 64, bottom: 40, width: 380, zIndex: 4 }}>
          <div style={{ border: `2px solid ${c.red}`, boxShadow: v2Hard(c, 12, c.red), overflow: 'hidden' }}><window.KKPlh h={260} label="session-buehne-2026" c={c} tint={c.red} /></div>
          <div className="fcc-floaty" style={{ position: 'absolute', top: -32, right: -28 }}><window.KKSeal c={c} size={110} rot={-9} /></div>
        </div>
      </div>


      {/* KAPITEL 01 — Wer wir sind */}
      <div style={{ padding: '78px 64px 0' }}>
        <V2Chapter c={c} num="01" kicker="DAS SIND WIR" title="EIN VEREIN MIT HERZ" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
          <div style={{ border: `2px solid ${c.ink}`, boxShadow: v2Hard(c, 12, c.red), overflow: 'hidden' }}><window.KKPlh h={380} label="vereinsfoto-2026" c={c} tint={c.red} /></div>
          <div>
            <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 1.06, letterSpacing: 0.2, color: c.ink, margin: 0 }}>
              Bei uns tanzt das Enkelkind neben der Oma, der Nachbar wird zum Elferrat — und niemand fragt, ob man „das kann“. Man macht einfach mit.
            </p>
            <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.65, color: c.sub, margin: '20px 0 0' }}>
              FURRIA lebt vom Ehrenamt: von Händen, die Wagen bauen, Kostüme nähen, Getränke schleppen und die Bühne aufbauen, lange bevor der erste Gast kommt. Was uns zusammenhält, ist keine Satzung — es ist die Freude, der Großbesenstadt einmal im Jahr das Schönste zu schenken: sich selbst, in Feierlaune. <b style={{ color: c.ink, fontWeight: 700 }}>Placeholder — die echte Vereinsgeschichte ergänzen wir gemeinsam.</b>
            </p>
            <div style={{ display: 'flex', gap: 0, marginTop: 26 }}>
              {[['1971', 'gegründet'], ['≈180', 'Mitglieder'], ['6', 'Gruppen'], ['55.', 'Session']].map(([n, l], i) => (
                <div key={i} style={{ flex: 1, borderLeft: i ? `2px solid ${c.line}` : 'none', paddingLeft: i ? 18 : 0 }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.85, color: c.ink }}>{n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5, color: c.sub, marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* NARRENRUF — red full-bleed editorial (distinct from v1's centered ink block) */}
      <div style={{ margin: '78px 0 0', background: c.red, color: '#fff', padding: '58px 64px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -30, top: '50%', transform: 'translateY(-50%) rotate(-8deg)', opacity: 0.12 }}><window.KKBroom size={340} color="#fff" band="#fff" /></div>
        <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '0.8fr 1.2fr', gap: 44, alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 3, opacity: 0.85 }}>UNSER NARRENRUF — UND NUR DIESER</div>
            <p style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.5, margin: '16px 0 0', color: 'rgba(255,255,255,0.95)' }}>
              Kein „Helau“. Kein „Alaaf“. Wer bei FURRIA feiert, ruft <b style={{ fontWeight: 900 }}>Groß</b> — und die ganze Halle antwortet.
            </p>
          </div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 130, lineHeight: 0.82, letterSpacing: 1, textAlign: 'right', color: '#fff' }}>
            GROSS<br /><span style={{ WebkitTextStroke: '2px #fff', color: 'transparent' }}>FURRIA!</span>
          </div>
        </div>
      </div>

      {/* KAPITEL 02 — Chronik: vertical spine timeline, ink */}
      <div style={{ background: p.bg, color: p.fg, padding: '78px 64px' }}>
        <V2Chapter c={c} num="02" kicker="SEIT 1971" title="DIE CHRONIK" on="ink" />
        <div style={{ position: 'relative', paddingLeft: 8 }}>
          <div style={{ position: 'absolute', left: 20, top: 10, bottom: 10, width: 3, background: c.line }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {V2_MILESTONES.map(([y, t, d], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, position: 'relative' }}>
                <div style={{ width: 20, height: 20, borderRadius: 12, background: i === 0 ? c.red : c.gold, border: `3px solid ${c.ink}`, flexShrink: 0, zIndex: 2, marginLeft: 11 }} />
                <div style={{ background: c.paper, color: c.ink, border: `2px solid ${i === 0 ? c.red : c.ink}`, boxShadow: v2Hard(c, 6, i === 0 ? c.red : c.gold), padding: '18px 26px', display: 'flex', alignItems: 'center', gap: 28, flex: 1 }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 0.85, color: i === 0 ? c.red : c.ink, minWidth: 118 }}>{y}</div>
                  <div><div style={{ fontWeight: 800, fontSize: 20 }}>{t}</div><div style={{ fontSize: 15, fontWeight: 500, color: c.sub, marginTop: 3 }}>{d}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KAPITEL 03 — Die fünfte Jahreszeit, cream filmstrip */}
      <div style={{ padding: '78px 64px 0' }}>
        <V2Chapter c={c} num="03" kicker="DIE FÜNFTE JAHRESZEIT" title="EINE SESSION" fs={56} />
        <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.6, color: c.sub, maxWidth: 700, margin: '0 0 32px' }}>
          Eine Session läuft vom <b style={{ color: c.ink, fontWeight: 700 }}>11.11.</b> bis Aschermittwoch. Dazwischen: das ganze Jahr an Arbeit — und die schönsten Wochen der Großbesenstadt.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14 }}>
          {V2_SEASON.map(([tag, t, d], i) => (
            <div key={i} style={{ background: i === 0 ? c.red : c.paper, color: i === 0 ? '#fff' : c.ink, border: `2px solid ${c.ink}`, boxShadow: v2Hard(c, 6, i === 0 ? c.red : c.ink), padding: '20px 20px 22px' }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.85, color: i === 0 ? c.gold : c.red }}>{tag}</div>
              <div style={{ fontWeight: 800, fontSize: 17, marginTop: 12 }}>{t}</div>
              <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.45, color: i === 0 ? 'rgba(255,255,255,0.82)' : c.sub, marginTop: 6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KAPITEL 04 — Gruppen: compact, click-to-expand tiles that scale to any group count */}
      <div style={{ padding: '78px 64px 0' }}>
        <V2Chapter c={c} num="04" kicker="WO DU HINGEHÖRST" title="UNSERE GRUPPEN" />
        <p style={{ fontSize: 15, fontWeight: 600, color: c.sub, margin: '-14px 0 26px' }}>Aktuell 6 Gruppen — die Liste wächst mit dem Verein. Auf eine Kachel tippen für mehr.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 18 }}>
          {V2_GROUPS.map((g, i) => <V2GroupTile key={i} c={c} g={g} i={i} onOpen={setOpenIdx} />)}
        </div>
      </div>

      {/* KAPITEL 05 — Menschen: portrait wall, ink */}
      <div style={{ background: p.bg, color: p.fg, padding: '78px 64px', marginTop: 78 }}>
        <V2Chapter c={c} num="05" kicker="DIE GESICHTER" title="MENSCHEN, DIE FURRIA SIND" on="ink" fs={54} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16 }}>
          {V2_VORSTAND.map(([role, name, tk], i) => (
            <div key={i}>
              <div style={{ border: `2px solid ${v2Tint(c, tk)}`, boxShadow: v2Hard(c, 5, v2Tint(c, tk)), overflow: 'hidden' }}><window.KKPlh h={180} label="portrait" c={c} tint={v2Tint(c, tk)} /></div>
              <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 0.8, color: c.red, marginTop: 12 }}>{role.toUpperCase()}</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 21, lineHeight: 0.95, color: p.fg, marginTop: 4 }}>{name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RECRUIT finale — red poster */}
      <div style={{ position: 'relative', background: c.red, color: '#fff', padding: '70px 64px', overflow: 'hidden', textAlign: 'center' }}>
        <div style={{ position: 'absolute', left: 40, top: '50%', transform: 'translateY(-50%) rotate(8deg)', opacity: 0.12 }}><window.KKBroom size={280} color="#fff" band="#fff" /></div>
        <div style={{ position: 'absolute', right: 40, top: '50%', transform: 'translateY(-50%) rotate(-8deg)', opacity: 0.12 }}><window.KKBroom size={280} color="#fff" band="#fff" /></div>
        <div style={{ position: 'relative' }}>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 2.5, opacity: 0.88 }}>MITMACHEN · AB 30 € IM JAHR · KINDER 15 €</div>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 84, lineHeight: 0.88, letterSpacing: 0.5, margin: '14px 0 0' }}>WERDE TEIL VON FURRIA</h2>
          <p style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.5, margin: '16px auto 0', maxWidth: 620, color: 'rgba(255,255,255,0.92)' }}>
            Ob tanzen, trommeln, organisieren oder einfach dabei sein — bei uns ist Platz für dich. Komm zu einer Probe, feier eine Session mit, werde Narr für immer.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 30 }}>
            <button style={{ border: `2px solid ${c.ink}`, background: '#fff', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 17, padding: '16px 32px', cursor: 'pointer', boxShadow: `6px 6px 0 ${c.ink}` }}>Mitglied werden →</button>
            <button style={{ border: '2px solid #fff', background: 'transparent', color: '#fff', fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16, padding: '16px 32px', cursor: 'pointer' }}>Tickets & Programm</button>
          </div>
        </div>
      </div>

      <window.KKFooter c={c} />
      <V2GroupModal c={c} g={openIdx != null ? V2_GROUPS[openIdx] : null} onClose={() => setOpenIdx(null)} />
    </div>
  );
}

// ── MOBILE ──────────────────────────────────────────────────────────────
function V2MobBar({ c }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 18px', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: c.sub, borderBottom: `1px solid ${c.line}` }}>
        <span>GROSSBESENSTADT · EST. 1971</span><span style={{ color: c.red }}>VEREIN</span>
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

function V2MChapter({ c, num, kicker, title, on = 'light' }) {
  const ink = c.ink;
  const dim = c.sub;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 18 }}>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 62, lineHeight: 0.72, color: c.red, flexShrink: 0 }}>{num}</div>
      <div style={{ flex: 1, minWidth: 0, paddingBottom: 3 }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: dim, marginBottom: 4 }}>{kicker}</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 27, lineHeight: 0.88, color: ink }}>{title}</div>
      </div>
    </div>
  );
}

function ClubV2Mobile({ c }) {
  const p = v2Panel(c);
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={c.ink} />
      <V2MobBar c={c} />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* hero — session numeral anchor, ribbon banner, photo below */}
        <div style={{ position: 'relative', background: p.bg, color: p.fg, padding: '48px 20px 26px', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 0.28, pointerEvents: 'none' }}><window.KKConfetti c={c} n={8} seed={4} /></div>
          <div style={{ position: 'absolute', right: -26, top: -34, fontFamily: "'Anton', sans-serif", fontSize: 210, lineHeight: 0.8, letterSpacing: -3, WebkitTextStroke: `1.5px ${c.red}`, color: 'transparent', opacity: 0.85, pointerEvents: 'none' }}>55</div>
          <div style={{ position: 'absolute', top: 20, left: -42, background: c.red, color: c.onRed, fontFamily: "'Anton', sans-serif", fontSize: 10.5, letterSpacing: 1.5, padding: '5px 42px', transform: 'rotate(-8deg)', boxShadow: v2Hard(c, 3), zIndex: 2, whiteSpace: 'nowrap' }}>SEIT 1971 · GROSSBESENSTADT</div>
          <div style={{ position: 'relative', zIndex: 3, marginTop: 18 }}>
            <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: c.red }}>FCC e.V. · 55. SESSION</div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.92, margin: '8px 0 0' }}>DIE FÜNFTE JAHRESZEIT<br /><span style={{ color: c.red }}>HAT EIN ZUHAUSE.</span></h1>
            <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, color: p.sub, margin: '10px 0 0' }}>Willkommen bei FURRIA — dem Karnevalsverein der Großbesenstadt.</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}><V2Btn c={c} primary fs={14}>Mitglied werden →</V2Btn><V2Btn c={c} ghostOn={p.fg} fs={13}>Programm</V2Btn></div>
          </div>
          <div style={{ position: 'relative', marginTop: 22, zIndex: 3 }}>
            <div style={{ border: `2px solid ${c.red}`, boxShadow: v2Hard(c, 8, c.red), overflow: 'hidden' }}><window.KKPlh h={190} label="session-buehne-2026" c={c} tint={c.red} /></div>
            <div className="fcc-floaty" style={{ position: 'absolute', top: -16, right: 4 }}><window.KKSeal c={c} size={80} rot={-9} /></div>
          </div>
        </div>

        {/* 01 wer wir sind */}
        <div style={{ padding: '28px 22px 0' }}>
          <V2MChapter c={c} num="01" kicker="DAS SIND WIR" title="EIN VEREIN MIT HERZ" />
          <div style={{ border: `2px solid ${c.ink}`, boxShadow: v2Hard(c, 8, c.red), overflow: 'hidden' }}><window.KKPlh h={190} label="vereinsfoto-2026" c={c} tint={c.red} /></div>
          <p style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, lineHeight: 1.1, color: c.ink, margin: '18px 0 0' }}>Bei uns tanzt das Enkelkind neben der Oma — und niemand fragt, ob man „das kann“. Man macht mit.</p>
          <p style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.6, color: c.sub, margin: '12px 0 0' }}>FURRIA lebt vom Ehrenamt — Hände, die Wagen bauen und die Bühne aufbauen, lange bevor der erste Gast kommt. (Placeholder — echte Geschichte folgt.)</p>
          <div style={{ display: 'flex', marginTop: 18 }}>
            {[['1971', 'gegründet'], ['≈180', 'Mitglieder'], ['6', 'Gruppen'], ['55.', 'Session']].map(([n, l], i) => (
              <div key={i} style={{ flex: 1, borderLeft: i ? `2px solid ${c.line}` : 'none', paddingLeft: i ? 10 : 0 }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, lineHeight: 0.85, color: c.ink }}>{n}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: c.sub, marginTop: 3 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* narrenruf red */}
        <div style={{ margin: '28px 0 0', background: c.red, color: '#fff', padding: '26px 22px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -24, bottom: -20, opacity: 0.13 }}><window.KKBroom size={150} color="#fff" band="#fff" /></div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, opacity: 0.85 }}>UNSER NARRENRUF</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 0.82, margin: '8px 0 0' }}>GROSS<br /><span style={{ WebkitTextStroke: '1.5px #fff', color: 'transparent' }}>FURRIA!</span></div>
            <p style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, margin: '10px 0 0', color: 'rgba(255,255,255,0.95)' }}>Kein „Helau“, kein „Alaaf“ — wer bei uns feiert, ruft Groß, die Halle antwortet.</p>
          </div>
        </div>

        {/* 02 chronik ink */}
        <div style={{ background: p.bg, color: p.fg, padding: '28px 22px' }}>
          <V2MChapter c={c} num="02" kicker="SEIT 1971" title="DIE CHRONIK" on="ink" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {V2_MILESTONES.slice(0, 4).map(([y, t, d], i) => (
              <div key={i} style={{ background: c.paper, color: c.ink, border: `2px solid ${i === 0 ? c.red : c.ink}`, boxShadow: v2Hard(c, 5, i === 0 ? c.red : c.gold), padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'center' }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.85, color: i === 0 ? c.red : c.ink, minWidth: 64 }}>{y}</div>
                <div><div style={{ fontWeight: 800, fontSize: 15 }}>{t}</div><div style={{ fontSize: 12.5, fontWeight: 500, color: c.sub, marginTop: 2 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* 03 session */}
        <div style={{ padding: '28px 22px 0' }}>
          <V2MChapter c={c} num="03" kicker="DIE FÜNFTE JAHRESZEIT" title="EINE SESSION" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {V2_SEASON.map(([tag, t, d], i) => (
              <div key={i} style={{ background: i === 0 ? c.red : c.paper, color: i === 0 ? '#fff' : c.ink, border: `2px solid ${c.ink}`, boxShadow: v2Hard(c, 5, i === 0 ? c.red : c.ink), padding: '13px 16px', display: 'flex', gap: 14, alignItems: 'baseline' }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: i === 0 ? c.gold : c.red, minWidth: 78 }}>{tag}</div>
                <div><div style={{ fontWeight: 800, fontSize: 15 }}>{t}</div><div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.4, color: i === 0 ? 'rgba(255,255,255,0.82)' : c.sub, marginTop: 2 }}>{d}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* 04 gruppen — compact click-to-expand tiles */}
        <div style={{ padding: '28px 22px 0' }}>
          <V2MChapter c={c} num="04" kicker="WO DU HINGEHÖRST" title="GRUPPEN" />
          <p style={{ fontSize: 12.5, fontWeight: 600, color: c.sub, margin: '-8px 0 14px' }}>Aktuell 6 Gruppen — die Liste wächst mit dem Verein.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {V2_GROUPS.map((g, i) => <V2GroupTile key={i} c={c} g={g} i={i} onOpen={setOpenIdx} />)}
          </div>
        </div>

        {/* 05 menschen ink */}
        <div style={{ background: p.bg, color: p.fg, padding: '28px 22px', marginTop: 28 }}>
          <V2MChapter c={c} num="05" kicker="DIE GESICHTER" title="MENSCHEN" on="ink" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
            {V2_VORSTAND.slice(0, 4).map(([role, name, tk], i) => (
              <div key={i}>
                <div style={{ border: `2px solid ${v2Tint(c, tk)}`, boxShadow: v2Hard(c, 5, v2Tint(c, tk)), overflow: 'hidden' }}><window.KKPlh h={140} label="portrait" c={c} tint={v2Tint(c, tk)} /></div>
                <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 0.6, color: c.red, marginTop: 9 }}>{role.toUpperCase()}</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, lineHeight: 0.95, color: p.fg, marginTop: 3 }}>{name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* recruit */}
        <div style={{ position: 'relative', background: c.red, color: '#fff', padding: '30px 22px 34px', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', right: -24, top: 10, opacity: 0.12 }}><window.KKBroom size={150} color="#fff" band="#fff" /></div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.5, opacity: 0.88 }}>AB 30 € / JAHR · KINDER 15 €</div>
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.88, margin: '8px 0 0' }}>WERDE TEIL VON FURRIA</h2>
            <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.45, margin: '10px 0 16px', color: 'rgba(255,255,255,0.92)' }}>Tanzen, trommeln, organisieren — oder einfach dabei sein. Komm zu einer Probe.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button style={{ border: `2px solid ${c.ink}`, background: '#fff', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 14, padding: '13px 24px', cursor: 'pointer', boxShadow: `5px 5px 0 ${c.ink}` }}>Mitglied werden →</button>
              <button style={{ border: '2px solid #fff', background: 'transparent', color: '#fff', fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13.5, padding: '12px 24px', cursor: 'pointer' }}>Tickets & Programm</button>
            </div>
          </div>
        </div>

        <window.KKFooter c={c} />
      </div>
      <V2GroupModal c={c} g={openIdx != null ? V2_GROUPS[openIdx] : null} onClose={() => setOpenIdx(null)} small />
      <window.HomeIndicator color={c.ink} />
    </window.PhoneFrame>
  );
}

function ClubV2({ mode = 'light', device = 'desktop' }) {
  const c = window.KK[mode];
  return device === 'mobile' ? <ClubV2Mobile c={c} /> : <ClubV2Desktop c={c} />;
}

Object.assign(window, { ClubV2 });
