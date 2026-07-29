// fcc-ds-gallery.jsx — public "Galerie" page. Deliberately SMALL & curated:
// ONE featured album (Plakat-shadow hero) + the current session's albums + older
// sessions collapsed to slim year rows. No videos, no download, no infinite feed.
// Photos come from the internal app gallery via a "für Website freigeben" flag —
// the website only ever shows a hand-picked ~12 per album.
// Konfetti-Kinetik only (window.KK tokens, Anton/Archivo, ONE hard shadow/screen).
// Exports GalleryPage({ mode, device, view }).

const gHard = (c, n = 8, col) => `${n}px ${n}px 0 ${col || c.ink}`;
const G_CREAM = '#FBF4E6';
const gPanel = (c) => (c.bg === '#15110E'
  ? { bg: '#0C0806', fg: G_CREAM, sub: 'rgba(251,244,230,0.62)' }
  : { bg: c.ink, fg: G_CREAM, sub: 'rgba(251,244,230,0.62)' });
const gTint = (c, k) => (k === 'red' ? c.red : k === 'gold' ? c.gold : c.ink);

// ── content ─────────────────────────────────────────────────────────────
const S = (cap, h) => ({ cap, h });
const ALBEN = [
  {
    id: 'prunksitzung-26', titel: 'Prunksitzung', datum: '21. Februar 2026', kurz: '21.02.26',
    ort: 'Sporthalle Groß Furra', tint: 'red', by: 'Anja Weber',
    intro: 'Vier Stunden Programm, 14 Auftritte, ein ausverkaufter Saal — die zwölf Bilder, die den Abend am besten erzählen.',
    shots: [
      S('Einmarsch des Elferrats', 330), S('Marlies eröffnet die Sitzung', 250), S('Tanzgarde, erste Formation', 300),
      S('Blick von der Empore in den Saal', 240), S('Büttenrede: Uwe rechnet ab', 320), S('Kindergarde hinter dem Vorhang', 270),
      S('Männerballett, Finalpose', 300), S('Ordensverleihung an die Ehrengäste', 250), S('Schunkeln in Reihe 4', 320),
      S('Showtanz: Groß Furria hebt ab', 280), S('Technik-Crew am Mischpult', 240), S('Letzter Applaus, 23:40 Uhr', 330),
    ],
  },
  {
    id: 'umzug-26', titel: 'Rosenmontagsumzug', datum: '16. Februar 2026', kurz: '16.02.26',
    ort: 'Groß Furra, Hauptstraße', tint: 'gold', by: 'Uwe Krämer',
    intro: 'Der Wagen hat gehalten, das Wetter auch. Elf Bilder vom Zug durch die Großbesenstadt.',
    shots: [
      S('Der Wagen verlässt die Halle', 300), S('Aufstellung an der Schule', 260), S('Kamelle für die erste Reihe', 320),
      S('Fußgruppe Kostümwerkstatt', 250), S('Musikzug an der Kirche', 290), S('Konfetti über der Hauptstraße', 330),
      S('Kinder auf dem Wagen', 260), S('Pause am Marktplatz', 300), S('Die Garde tanzt auf der Straße', 270),
      S('Zieleinlauf am Vereinsheim', 310), S('Aufräumen bei Sonnenuntergang', 240),
    ],
  },
  {
    id: 'kindersitzung-26', titel: 'Kindersitzung', datum: '15. Februar 2026', kurz: '15.02.26',
    ort: 'Sporthalle Groß Furra', tint: 'ink', by: 'Anja Weber',
    intro: 'Der Nachmittag der Kleinsten — mit Kinderprinzenpaar, Kindergarde und sehr viel Zuckerwatte.',
    shots: [
      S('Das Kinderprinzenpaar', 310), S('Kindergarde, 24 Kinder', 260), S('Publikum in der ersten Reihe', 290),
      S('Sketch der Jugendgruppe', 250), S('Polonaise durch den Saal', 320), S('Zuckerwatte-Schlange', 270),
      S('Kinderpräsidentin am Mikrofon', 300), S('Abschlussbild auf der Bühne', 280),
    ],
  },
  {
    id: 'eroeffnung-2511', titel: 'Sessionseröffnung 11.11.', datum: '11. November 2025', kurz: '11.11.25',
    ort: 'Marktplatz & Vereinsheim', tint: 'ink', by: 'Tobias Reuter',
    intro: 'Punkt 19:11 Uhr wurde die fünfte Jahreszeit geweckt — mit Besen, Fackeln und dem neuen Motto.',
    shots: [
      S('19:11 Uhr auf dem Marktplatz', 300), S('Das Motto fällt', 270), S('Fackelzug zum Vereinsheim', 320),
      S('Der Elferrat 2026/27', 250), S('Erster Tanz der Session', 290), S('Volles Vereinsheim', 310),
      S('Besenübergabe', 240),
    ],
  },
];
const ARCHIV = [
  { jahr: '2025/26', n: 5, alben: ['Prunksitzung', 'Umzug', 'Kindersitzung', 'Sommerfest', 'Jubiläumsball'] },
  { jahr: '2024/25', n: 4, alben: ['Prunksitzung', 'Umzug', 'Kindersitzung', 'Ordensfest'] },
  { jahr: '2023/24', n: 3, alben: ['Prunksitzung', 'Umzug', 'Kindersitzung'] },
  { jahr: 'Vereinsarchiv 1971–2023', n: 9, alben: ['50 Jahre FCC', 'Schwarz-Weiß 1971–1985', 'Wagenbau früher'] },
];

// editorial section header: red square + Anton label + hairline rule to edge
function GRule({ c, label, fg, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
      <div style={{ width: 14, height: 14, background: c.red, flexShrink: 0 }} />
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, letterSpacing: 1, color: fg || c.ink, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 1.5, background: c.line }} />
      {right ? <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 1.4, color: c.sub, flexShrink: 0 }}>{right}</div> : null}
    </div>
  );
}

function GMeta({ c, a, size = 12 }) {
  return <span style={{ fontWeight: 700, fontSize: size, letterSpacing: 0.3, color: c.sub }}>{a.datum} · {a.shots.length} Fotos</span>;
}

// ── LIGHTBOX (fills its frame) ──────────────────────────────────────────
function GLightbox({ c, a, i, go, close, small }) {
  const s = a.shots[i], last = a.shots.length - 1;
  const nav = (d) => go((i + d + a.shots.length) % a.shots.length);
  const arrow = (dir) => (
    <button onClick={() => nav(dir === 'l' ? -1 : 1)} aria-label={dir === 'l' ? 'Zurück' : 'Weiter'} style={{ width: small ? 46 : 54, height: small ? 46 : 54, borderRadius: '50%', border: `1.5px solid rgba(251,244,230,0.34)`, background: 'rgba(12,8,6,0.5)', color: G_CREAM, fontSize: small ? 16 : 20, fontWeight: 800, cursor: 'pointer', flexShrink: 0, display: 'grid', placeItems: 'center' }}>{dir === 'l' ? '‹' : '›'}</button>
  );
  return (
    <div style={{ background: '#0C0806', color: G_CREAM, ...(small ? { flex: 1, minHeight: 0 } : { height: '100%', minHeight: 640 }), display: 'flex', flexDirection: 'column', fontFamily: 'Archivo, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: small ? '12px 16px' : '18px 26px', borderBottom: '1px solid rgba(251,244,230,0.14)', flexShrink: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 900, fontSize: small ? 9 : 10.5, letterSpacing: 1.6, color: c.red }}>{a.titel.toUpperCase()}</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 17 : 22, lineHeight: 1.05, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.cap}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: small ? 10 : 16, flexShrink: 0 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 15 : 19, letterSpacing: 1 }}>{i + 1}<span style={{ opacity: 0.5 }}> / {a.shots.length}</span></span>
          <button onClick={close} aria-label="Schließen" style={{ width: small ? 32 : 38, height: small ? 32 : 38, border: '1.5px solid rgba(251,244,230,0.34)', background: 'transparent', color: G_CREAM, fontSize: small ? 15 : 18, fontWeight: 700, cursor: 'pointer', display: 'grid', placeItems: 'center' }}>✕</button>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', alignItems: 'center', gap: small ? 8 : 18, padding: small ? '14px 12px' : '26px 26px' }}>
        {small ? null : arrow('l')}
        <div style={{ flex: 1, minWidth: 0, minHeight: 0, maxHeight: '100%', overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
          <window.KKPlh h={small ? 300 : 480} label={`${a.id}-${String(i + 1).padStart(2, '0')}`} c={c} tint={gTint(c, a.tint)} style={{ width: '100%' }} />
        </div>
        {small ? null : arrow('r')}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: small ? '0 16px 14px' : '0 26px 22px', flexShrink: 0 }}>
        <div style={{ fontSize: small ? 11.5 : 13, fontWeight: 600, color: 'rgba(251,244,230,0.62)' }}>Foto: {a.by} · {a.ort}</div>
        {small
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{arrow('l')}{arrow('r')}</div>
          : <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(251,244,230,0.42)' }}>{i === last ? 'Letztes Bild' : 'Pfeiltasten oder wischen'}</div>}
      </div>
    </div>
  );
}

// ── DESKTOP · ÜBERSICHT ─────────────────────────────────────────────────
function GalleryIndexDesktop({ c, go }) {
  const p = gPanel(c);
  const [open, setOpen] = React.useState(null);
  const hero = ALBEN[0], rest = ALBEN.slice(1);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '46px 64px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 3, color: c.red }}>SESSION 2026/27 · GROSS FURRIA HEBT AB</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 74, lineHeight: 0.88, letterSpacing: 0.4, margin: '14px 0 0' }}>GALERIE</h1>
        </div>
        <p style={{ fontSize: 16, fontWeight: 500, lineHeight: 1.55, color: c.sub, margin: 0, maxWidth: 400, paddingBottom: 8, textWrap: 'pretty' }}>
          Kein Foto-Archiv, sondern eine Auswahl: pro Anlass rund ein Dutzend Bilder, von unseren Fotografen selbst ausgesucht.
        </p>
      </div>
      <div style={{ height: 3, background: c.ink, margin: '30px 64px 0' }} />

      {/* HERO — newest album, the one Plakat-shadow element on this screen */}
      <div style={{ padding: '38px 64px 0' }}>
        <button onClick={() => go(hero.id)} style={{ display: 'block', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `2px solid ${c.ink}`, background: c.paper, boxShadow: gHard(c, 12, c.red) }}>
          <div style={{ position: 'relative' }}>
            <window.KKPlh h={452} label={`${hero.id}-cover`} c={c} tint={c.red} />
            <span style={{ position: 'absolute', top: 0, left: 0, background: c.red, color: c.onRed, fontFamily: "'Anton', sans-serif", fontSize: 15, letterSpacing: 1.6, padding: '7px 14px' }}>NEUESTES ALBUM</span>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '58px 34px 26px', background: 'linear-gradient(rgba(12,8,6,0) 0%, rgba(12,8,6,0.86) 62%)', color: G_CREAM, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30 }}>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 0.94, letterSpacing: 0.3 }}>{hero.titel.toUpperCase()}</div>
                <div style={{ fontWeight: 700, fontSize: 14, marginTop: 10, color: 'rgba(251,244,230,0.78)' }}>{hero.datum} · {hero.ort} · {hero.shots.length} Fotos · Foto: {hero.by}</div>
              </div>
              <span style={{ fontWeight: 900, fontSize: 15, color: G_CREAM, whiteSpace: 'nowrap', borderBottom: `2px solid ${c.red}`, paddingBottom: 3 }}>Album ansehen →</span>
            </div>
          </div>
        </button>
      </div>

      {/* current session albums */}
      <div style={{ padding: '54px 64px 0' }}>
        <GRule c={c} label="DIESE SESSION" right={`${ALBEN.length} ALBEN`} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24 }}>
          {rest.map((a) => (
            <button key={a.id} onClick={() => go(a.id)} style={{ textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `1.5px solid ${c.line}`, background: c.paper, overflow: 'hidden' }}>
              <div style={{ position: 'relative' }}>
                <window.KKPlh h={196} label={`${a.id}-cover`} c={c} tint={gTint(c, a.tint)} />
                <span style={{ position: 'absolute', right: 0, bottom: 0, background: c.ink, color: G_CREAM, fontFamily: "'Anton', sans-serif", fontSize: 14, letterSpacing: 0.8, padding: '4px 10px' }}>{a.shots.length}</span>
              </div>
              <div style={{ padding: '18px 20px 20px' }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, lineHeight: 1 }}>{a.titel}</div>
                <div style={{ marginTop: 8 }}><GMeta c={c} a={a} /></div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* older sessions — slim expandable year rows */}
      <div style={{ padding: '52px 64px 0' }}>
        <GRule c={c} label="FRÜHERE SESSIONEN" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {ARCHIV.map((y, i) => {
            const on = open === y.jahr;
            return (
              <div key={y.jahr} style={{ borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                <button onClick={() => setOpen(on ? null : y.jahr)} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 22, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', background: 'transparent', border: 'none', padding: '18px 4px' }}>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, letterSpacing: 0.4 }}>{y.jahr}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: c.sub }}>{y.n} Alben</span>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: c.red, width: 22, textAlign: 'center' }}>{on ? '–' : '+'}</span>
                </button>
                {on ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, padding: '0 4px 20px' }}>
                    {y.alben.map((t) => (
                      <span key={t} style={{ border: `1.5px solid ${c.line}`, background: c.paper, fontWeight: 800, fontSize: 13, padding: '9px 14px', cursor: 'pointer' }}>{t} {y.jahr.length > 7 ? '' : y.jahr.slice(0, 4)} →</span>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 22, fontSize: 12.5, fontWeight: 600, color: c.sub, maxWidth: 720, textWrap: 'pretty' }}>
          Alle Bilder © Furrscher Carnevals Club e.V. und die genannten Fotografen. Du bist auf einem Foto und möchtest es hier nicht sehen? Eine kurze Mail genügt — wir nehmen es raus.
        </div>
      </div>

      {/* one small band: Instagram für den Alltag, Tickets für den nächsten Anlass */}
      <div style={{ background: p.bg, color: p.fg, padding: '34px 64px', marginTop: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>ZWISCHEN DEN ANLÄSSEN</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.95, marginTop: 8 }}>MEHR GIBT’S AUF INSTAGRAM</div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: p.sub, marginTop: 8 }}>@furria_grossfurra — Proben, Wagenbau, Kulissen.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <button style={{ border: `2px solid ${p.fg}`, background: 'transparent', color: p.fg, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15, padding: '14px 24px', cursor: 'pointer' }}>Instagram →</button>
          <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15, padding: '15px 26px', cursor: 'pointer' }}>Tickets 2027 →</button>
        </div>
      </div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── DESKTOP · ALBUM ─────────────────────────────────────────────────────
function GalleryAlbumDesktop({ c, a, go, open }) {
  const p = gPanel(c);
  const next = ALBEN[(ALBEN.indexOf(a) + 1) % ALBEN.length];
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '34px 64px 0' }}>
        <button onClick={() => go(null)} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: 0, cursor: 'pointer' }}>← Alle Alben</button>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginTop: 22 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 2.4, color: c.red }}>{a.datum.toUpperCase()} · {a.ort.toUpperCase()}</div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 62, lineHeight: 0.92, letterSpacing: 0.3, margin: '12px 0 0' }}>{a.titel.toUpperCase()}</h1>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingBottom: 6 }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.9, color: c.red }}>{a.shots.length}</div>
            <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 1.4, color: c.sub, marginTop: 4 }}>AUSGEWÄHLTE FOTOS</div>
          </div>
        </div>
        <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.6, color: c.sub, margin: '16px 0 0', maxWidth: 680, textWrap: 'pretty' }}>{a.intro}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18, paddingTop: 16, borderTop: `1.5px solid ${c.line}` }}>
          <span style={{ background: gTint(c, a.tint), color: gTint(c, a.tint) === c.gold ? c.ink : '#fff', fontWeight: 900, fontSize: 11, letterSpacing: 1.4, padding: '4px 10px' }}>FOTOS: {a.by.toUpperCase()}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: c.sub }}>Bild anklicken für die große Ansicht</span>
        </div>
      </div>

      {/* masonry — varied heights, three columns */}
      <div style={{ padding: '30px 64px 0' }}>
        <div style={{ columnCount: 3, columnGap: 18 }}>
          {a.shots.map((s, i) => (
            <button key={i} onClick={() => open(i)} style={{ display: 'block', width: '100%', marginBottom: 18, padding: 0, border: `1.5px solid ${c.line}`, background: c.paper, textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', breakInside: 'avoid' }}>
              <window.KKPlh h={s.h} label={`${a.id}-${String(i + 1).padStart(2, '0')}`} c={c} tint={gTint(c, a.tint)} />
              <div style={{ padding: '10px 12px 12px', fontSize: 12.5, fontWeight: 600, color: c.sub, lineHeight: 1.4 }}>{s.cap}</div>
            </button>
          ))}
        </div>
      </div>

      {/* next album */}
      <div style={{ padding: '20px 64px 0' }}>
        <GRule c={c} label="NÄCHSTES ALBUM" />
        <button onClick={() => go(next.id)} style={{ display: 'grid', gridTemplateColumns: '260px 1fr auto', gap: 26, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${c.line}`, background: c.paper, padding: 0 }}>
          <window.KKPlh h={140} label={`${next.id}-cover`} c={c} tint={gTint(c, next.tint)} />
          <div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 1 }}>{next.titel}</div>
            <div style={{ marginTop: 7 }}><GMeta c={c} a={next} size={13} /></div>
          </div>
          <span style={{ fontWeight: 900, fontSize: 15, color: c.red, paddingRight: 26 }}>Ansehen →</span>
        </button>
      </div>

      <div style={{ background: p.bg, color: p.fg, padding: '34px 64px', marginTop: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>NÄCHSTES JAHR SELBST DABEI</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.95, marginTop: 8 }}>TERMINE &amp; TICKETS DER SESSION</div>
        </div>
        <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15, padding: '15px 28px', cursor: 'pointer', boxShadow: gHard(c, 5, p.fg) }}>Zum Programm →</button>
      </div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── MOBILE ──────────────────────────────────────────────────────────────
function GMobBar({ c, label = 'GALERIE' }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 18px', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: c.sub, borderBottom: `1px solid ${c.line}` }}>
        <span>GROSSBESENSTADT · EST. 1971</span><span style={{ color: c.red }}>{label}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '9px 18px 11px' }}>
        <div style={{ justifySelf: 'start', display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer' }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 2.4, background: c.ink, borderRadius: 2 }} />)}</div>
        <div style={{ textAlign: 'center', lineHeight: 0.9 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 27, letterSpacing: 1.5, color: c.ink }}>FURRIA</div>
          <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 2, color: c.sub, marginTop: 2 }}>SESSION 2026/27</div>
        </div>
        <button style={{ justifySelf: 'end', border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, padding: '8px 14px', borderRadius: 40, cursor: 'pointer' }}>Tickets</button>
      </div>
    </div>
  );
}

function GalleryIndexMobile({ c, go }) {
  const p = gPanel(c);
  const [open, setOpen] = React.useState(null);
  const hero = ALBEN[0], rest = ALBEN.slice(1);
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={c.ink} />
      <GMobBar c={c} />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '22px 22px 0' }}>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: c.red }}>SESSION 2026/27</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 44, lineHeight: 0.9, margin: '8px 0 0' }}>GALERIE</h1>
          <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '10px 0 0' }}>Keine Foto-Halde: pro Anlass rund ein Dutzend ausgesuchte Bilder.</p>
          <div style={{ height: 2.5, background: c.ink, marginTop: 18 }} />
        </div>

        <div style={{ padding: '20px 22px 0' }}>
          <button onClick={() => go(hero.id)} style={{ display: 'block', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `2px solid ${c.ink}`, background: c.paper, boxShadow: gHard(c, 8, c.red), overflow: 'hidden' }}>
            <div style={{ position: 'relative' }}>
              <window.KKPlh h={218} label={`${hero.id}-cover`} c={c} tint={c.red} />
              <span style={{ position: 'absolute', top: 0, left: 0, background: c.red, color: c.onRed, fontFamily: "'Anton', sans-serif", fontSize: 11, letterSpacing: 1.4, padding: '5px 10px' }}>NEUESTES ALBUM</span>
              <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '40px 16px 14px', background: 'linear-gradient(rgba(12,8,6,0) 0%, rgba(12,8,6,0.88) 66%)', color: G_CREAM }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.96 }}>{hero.titel.toUpperCase()}</div>
                <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 6, color: 'rgba(251,244,230,0.8)' }}>{hero.datum} · {hero.shots.length} Fotos</div>
              </div>
            </div>
          </button>
        </div>

        <div style={{ padding: '26px 22px 0' }}>
          <GRule c={c} label="DIESE SESSION" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {rest.map((a) => (
              <button key={a.id} onClick={() => go(a.id)} style={{ textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', padding: 0, border: `1.5px solid ${c.line}`, background: c.paper, overflow: 'hidden' }}>
                <div style={{ position: 'relative' }}>
                  <window.KKPlh h={104} label="" c={c} tint={gTint(c, a.tint)} />
                  <span style={{ position: 'absolute', right: 0, bottom: 0, background: c.ink, color: G_CREAM, fontFamily: "'Anton', sans-serif", fontSize: 11, padding: '2px 7px' }}>{a.shots.length}</span>
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, lineHeight: 1 }}>{a.titel}</div>
                  <div style={{ fontWeight: 700, fontSize: 10.5, color: c.sub, marginTop: 5 }}>{a.kurz}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ padding: '26px 22px 0' }}>
          <GRule c={c} label="FRÜHER" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ARCHIV.map((y, i) => {
              const on = open === y.jahr;
              return (
                <div key={y.jahr} style={{ borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                  <button onClick={() => setOpen(on ? null : y.jahr)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', background: 'transparent', border: 'none', padding: '14px 2px' }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, lineHeight: 1 }}>{y.jahr}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 700, fontSize: 11, color: c.sub }}>{y.n} Alben</span>
                      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, color: c.red, width: 14, textAlign: 'center' }}>{on ? '–' : '+'}</span>
                    </span>
                  </button>
                  {on ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '0 2px 14px' }}>
                      {y.alben.map((t) => <span key={t} style={{ border: `1.5px solid ${c.line}`, background: c.paper, fontWeight: 800, fontSize: 11.5, padding: '7px 11px' }}>{t} →</span>)}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 14, fontSize: 11, fontWeight: 600, color: c.sub, lineHeight: 1.5, textWrap: 'pretty' }}>
            Alle Bilder © FCC e.V. &amp; die genannten Fotografen. Du möchtest ein Bild von dir hier nicht sehen? Kurze Mail genügt.
          </div>
        </div>

        <div style={{ background: p.bg, color: p.fg, padding: '24px 22px', marginTop: 24 }}>
          <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 2, color: c.red }}>ZWISCHEN DEN ANLÄSSEN</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 0.95, marginTop: 7 }}>MEHR AUF INSTAGRAM</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: p.sub, marginTop: 7 }}>@furria_grossfurra</div>
          <button style={{ marginTop: 14, border: `2px solid ${p.fg}`, background: 'transparent', color: p.fg, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13.5, padding: '12px 20px', cursor: 'pointer' }}>Instagram →</button>
        </div>
        <window.KKFooter c={c} />
      </div>
      <window.HomeIndicator color={c.ink} />
    </window.PhoneFrame>
  );
}

function GalleryAlbumMobile({ c, a, go, open }) {
  const next = ALBEN[(ALBEN.indexOf(a) + 1) % ALBEN.length];
  const cols = [a.shots.filter((_, i) => i % 2 === 0), a.shots.filter((_, i) => i % 2 === 1)];
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={c.ink} />
      <GMobBar c={c} label="ALBUM" />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{ padding: '18px 22px 0' }}>
          <button onClick={() => go(null)} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12.5, padding: 0, cursor: 'pointer' }}>← Alle Alben</button>
          <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.8, color: c.red, marginTop: 16 }}>{a.datum.toUpperCase()}</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 36, lineHeight: 0.94, margin: '8px 0 0' }}>{a.titel.toUpperCase()}</h1>
          <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.55, color: c.sub, margin: '10px 0 0' }}>{a.intro}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1.5px solid ${c.line}`, flexWrap: 'wrap' }}>
            <span style={{ background: gTint(c, a.tint), color: gTint(c, a.tint) === c.gold ? c.ink : '#fff', fontWeight: 900, fontSize: 9.5, letterSpacing: 1.2, padding: '4px 9px' }}>FOTOS: {a.by.toUpperCase()}</span>
            <span style={{ fontWeight: 700, fontSize: 11, color: c.sub }}>{a.shots.length} Bilder · antippen für Vollbild</span>
          </div>
        </div>
        <div style={{ padding: '18px 22px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, alignItems: 'start' }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.map((s) => {
                const i = a.shots.indexOf(s);
                return (
                  <button key={i} onClick={() => open(i)} style={{ display: 'block', width: '100%', padding: 0, border: `1.5px solid ${c.line}`, background: c.paper, cursor: 'pointer' }}>
                    <window.KKPlh h={Math.round(s.h * 0.52)} label="" c={c} tint={gTint(c, a.tint)} />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div style={{ padding: '24px 22px 0' }}>
          <GRule c={c} label="NÄCHSTES ALBUM" />
          <button onClick={() => go(next.id)} style={{ display: 'grid', gridTemplateColumns: '96px 1fr', gap: 14, alignItems: 'center', width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', border: `1.5px solid ${c.line}`, background: c.paper, padding: 10 }}>
            <window.KKPlh h={64} label="" c={c} tint={gTint(c, next.tint)} />
            <div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, lineHeight: 1 }}>{next.titel}</div>
              <div style={{ fontWeight: 700, fontSize: 10.5, color: c.sub, marginTop: 5 }}>{next.kurz} · {next.shots.length} Fotos</div>
            </div>
          </button>
        </div>
        <window.KKFooter c={c} />
      </div>
      <window.HomeIndicator color={c.ink} />
    </window.PhoneFrame>
  );
}

function GalleryLightboxMobile({ c, a, i, go, close }) {
  return (
    <window.PhoneFrame screenBg="#0C0806">
      <window.StatusBar color={G_CREAM} />
      <GLightbox c={c} a={a} i={i} go={go} close={close} small />
      <window.HomeIndicator color={G_CREAM} />
    </window.PhoneFrame>
  );
}

// view: null|'index' → Übersicht · '<albumId>' → Album · '<albumId>:<n>' → Lightbox
function GalleryPage({ mode = 'light', device = 'desktop', view = null }) {
  const c = window.KK[mode];
  const init = view && view !== 'index' ? view : null;
  const [cur, setCur] = React.useState(init ? init.split(':')[0] : null);
  const [shot, setShot] = React.useState(init && init.includes(':') ? Number(init.split(':')[1]) : null);
  const a = cur ? ALBEN.find((x) => x.id === cur) : null;
  const goAlbum = (id) => { setCur(id); setShot(null); };
  if (device === 'mobile') {
    if (a && shot !== null) return <GalleryLightboxMobile c={c} a={a} i={shot} go={setShot} close={() => setShot(null)} />;
    return a ? <GalleryAlbumMobile c={c} a={a} go={goAlbum} open={setShot} /> : <GalleryIndexMobile c={c} go={goAlbum} />;
  }
  if (a && shot !== null) return <GLightbox c={c} a={a} i={shot} go={setShot} close={() => setShot(null)} />;
  return a ? <GalleryAlbumDesktop c={c} a={a} go={goAlbum} open={setShot} /> : <GalleryIndexDesktop c={c} go={goAlbum} />;
}

Object.assign(window, { GalleryPage, ALBEN });
