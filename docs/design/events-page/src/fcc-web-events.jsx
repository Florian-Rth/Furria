// FCC Website — Termine & Karten (/events). Konfetti-Kinetik, öffentliche Seite.
// Nur öffentliche Veranstaltungen, ein Saal (Dorfgemeindehaus Großfurra), 12 € pro Karte.
// Teil 1: Daten, Bausteine, Spielplan (Liste + 2 Monate), Event-Detail incl. Foto-Theater.
// Teil 2 (fcc-web-tickets.jsx): Saalplan/Platzwahl, digitale Karte, Mobile, EventsPage-Router.

const evHard = (c, n = 8, col) => `${n}px ${n}px 0 ${col || c.ink}`;
const EV_CREAM = '#FBF4E6';
const EV_INK = '#1A1411';
const EV_ORT = 'Dorfgemeindehaus Großfurra';
const EV_PREIS = 12;
const evPanel = (c) => (c.bg === '#15110E' ? { bg: '#0C0806', fg: EV_CREAM, sub: 'rgba(251,244,230,0.62)' } : { bg: c.ink, fg: EV_CREAM, sub: 'rgba(251,244,230,0.62)' });

// ── DIE SECHS ÖFFENTLICHEN ABENDE ───────────────────────────────────────
// status: offen · knapp · ausverkauft · bald
const EV_EVENTS = [
  { id: 'prunk1', tag: 'Sa', d: '23.', m: 'JAN', mm: '01', y: '2027', datum: '23. Januar 2027', zeit: '19:11', einlass: '18:11', ende: 'ca. 2:00', programm: true, typ: 'Prunksitzung', titel: '1. Prunksitzung', unter: 'Vier Stunden Programm, elf Nummern, ein Männerballett, das keiner vergisst. Der Auftakt ist traditionell zuerst weg.', status: 'ausverkauft', kap: 288, frei: 0, dauer: '4 Std', alter: 'ab 12 empfohlen' },
  { id: 'prunk2', tag: 'Sa', d: '30.', m: 'JAN', mm: '01', y: '2027', datum: '30. Januar 2027', zeit: '19:11', einlass: '18:11', ende: 'ca. 2:00', typ: 'Prunksitzung', titel: '2. Prunksitzung', unter: 'Dasselbe Programm, zweiter Abend — und der letzte, für den es noch Karten gibt.', status: 'knapp', kap: 288, frei: 34, dauer: '4 Std', alter: 'ab 12 empfohlen' },
  { id: 'weiber', tag: 'Do', d: '04.', m: 'FEB', mm: '02', y: '2027', datum: '4. Februar 2027', zeit: '19:11', einlass: '18:30', ende: 'ca. 1:00', typ: 'Weiberfasching', titel: 'Weiberfasching', unter: 'Der Abend der Frauen. Kurzes Programm, lange Tanzfläche, und die Männer servieren.', status: 'offen', kap: 288, frei: 96, dauer: '3 Std', alter: 'ab 16', gruppe: { reihe: 12, name: 'Anne R.', offen: 4 } },
  { id: 'jugend', tag: 'Fr', d: '05.', m: 'FEB', mm: '02', y: '2027', datum: '5. Februar 2027', zeit: '18:11', einlass: '17:30', ende: 'ca. 23:00', typ: 'Jugendfasching', titel: 'Jugendfasching', unter: 'Für alle zwischen 14 und 18: eigene Musik, eigene Bühne, alkoholfreie Theke. Aufsicht vom Verein.', status: 'offen', kap: 288, frei: 228, dauer: '5 Std', alter: '14 bis 18' },
  { id: 'rentner', tag: 'Sa', d: '06.', m: 'FEB', mm: '02', y: '2027', datum: '6. Februar 2027', zeit: '14:11', einlass: '13:30', ende: 'ca. 18:00', typ: 'Rentnerfasching', titel: 'Rentnerfasching', unter: 'Kaffee, Kuchen und das komplette Programm bei Tageslicht. Ruhiger, gemütlicher, genauso lustig.', status: 'bald', vvk: '10.01.2027', kap: 288, frei: 288, dauer: '4 Std', alter: 'ohne Grenze' },
  { id: 'kinder', tag: 'So', d: '07.', m: 'FEB', mm: '02', y: '2027', datum: '7. Februar 2027', zeit: '14:11', einlass: '13:45', ende: 'ca. 17:30', typ: 'Kinderfasching', titel: 'Kinderfasching', unter: 'Kinderprinzenpaar, Kinderdisco, Krapfen und die Konfettikanone. Halbe Länge, doppelt so laut.', status: 'offen', kap: 288, frei: 168, dauer: '3 Std', alter: 'ab 3' },
];
const evById = (id) => EV_EVENTS.find((e) => e.id === id) || EV_EVENTS[1];

// eine einzige Formulierung für alle Zustände: „N von 288 frei“ — die Farbe trägt die Dringlichkeit.
const evStatus = (e) => {
  if (e.status === 'knapp') return { label: `${e.frei} von ${e.kap} frei`, cta: 'Platz wählen', kind: 'warn', bar: true };
  if (e.status === 'offen') return { label: `${e.frei} von ${e.kap} frei`, cta: 'Platz wählen', kind: 'go', bar: true };
  if (e.status === 'ausverkauft') return { label: 'Ausverkauft · 3 Plätze in der Börse', cta: 'Warteliste & Börse', kind: 'off' };
  return { label: `Vorverkauf ab ${e.vvk}`, cta: 'Erinnere mich', kind: 'soon' };
};
const evKind = (c, k) => (k === 'warn' ? c.gold : k === 'go' ? '#2E9E5B' : k === 'soon' ? '#2F6DA8' : c.sub);
const evShort = (e) => (e.status === 'knapp' ? `${e.frei} FREI` : e.status === 'ausverkauft' ? 'VOLL' : e.status === 'bald' ? `AB ${e.vvk.slice(0, 6)}` : `${e.frei} FREI`);

// ── DETAIL-INHALTE ──────────────────────────────────────────────────────
const EV_ABLAUF = [
  ['18:11', 'Saal öffnet', 'Tische sind numeriert, Theke ist auf.'],
  ['19:11', 'Einmarsch & Begrüßung', 'Elferrat, Prinzenpaar, Präsidentin Marlies Hoffmann.'],
  ['19:40', 'Kindergarde', 'Der Nachwuchs eröffnet — 22 Kinder.'],
  ['20:05', 'Bütt: „Was der Bürgermeister nicht liest“', 'Bernd Krause, seit 1994 gefürchtet.'],
  ['20:35', 'Tanzgarde · Schautanz', 'Diesmal mit Hebefigur. Angeblich.'],
  ['21:00', 'Pause', '25 Minuten. Bratwurst am Seiteneingang.'],
  ['21:25', 'Jugend-Sketch & Gastauftritt', 'CC Sondershausen ist zu Gast.'],
  ['22:10', 'Männerballett „Furria Girls“', 'Der Grund, warum manche nur deshalb kommen.'],
  ['22:45', 'Finale & Tanz', 'Alle Gruppen auf der Bühne, danach Musik bis 2:00.'],
];
const EV_GRUPPEN = ['Kindergarde', 'Jugendgarde', 'Tanzgarde', 'Männerballett', 'Elferrat', 'Bütt', 'Gastverein CC Sondershausen'];
const EV_FOTOS = [
  ['einmarsch-elferrat', 'Einmarsch des Elferrats', '54. Prunksitzung · 2026'],
  ['tanzgarde-schautanz', 'Tanzgarde, Schautanz', 'Kurz vor der Hebefigur'],
  ['buett-bernd-krause', 'Bernd Krause in der Bütt', '22 Minuten, kein Zettel'],
  ['maennerballett', 'Männerballett „Furria Girls“', 'Zugabe nach vier Minuten'],
  ['saal-finale', 'Finale, voller Saal', '288 Plätze, alle auf den Stühlen'],
];
const EV_WISSEN = [
  ['Einlass & Plätze', 'Der Saal öffnet 60 Minuten vor Beginn. Alle Plätze sind numeriert — dein Platz bleibt dein Platz, auch nach der dritten Runde.'],
  ['Was eine Karte kostet', '12 € pro Person, für jeden Abend gleich, für jeden Platz gleich. Kinder zahlen denselben Preis, weil sie denselben Stuhl belegen.'],
  ['Kostüm', 'Gern, kein Muss. Eine Kappe reicht, ein ganzes Kostüm freut uns.'],
  ['Kinder & Jugend', 'Kinderfasching ab 3 Jahren mit Begleitung, Jugendfasching für 14 bis 18 mit Aufsicht vom Verein. Bei den Prunksitzungen empfehlen wir ab 12.'],
  ['Essen & Trinken', 'Bier, Wein, Sekt, Softdrinks und Bratwurst vom Verein. Bezahlt wird am Stand in Bar.'],
  ['Bezahlen', 'Online mit Kreditkarte oder PayPal. Oder reservieren und bar im Vereinsraum zahlen.'],
  ['Barrierefrei', 'Der Saal ist ebenerdig, Rollstuhlplätze an Reihe 1. Ruf kurz an, wir stellen den Tisch um.'],
  ['Karte verlegt?', 'Kein Problem. Der QR-Code kommt per Mail, und in der Liste am Einlass stehst du sowieso.'],
];

// ── BAUSTEINE ───────────────────────────────────────────────────────────
function EvKeyframes() {
  return <style>{`@keyframes ev-marq{from{transform:translateX(0)}to{transform:translateX(-50%)}}@keyframes ev-blink{0%,55%{opacity:1}56%,100%{opacity:.25}}`}</style>;
}

function EvRule({ c, label, right, fg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ width: 13, height: 13, background: c.red, flexShrink: 0 }} />
      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 21, letterSpacing: 0.6, color: fg || c.ink, whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ flex: 1, height: 1.5, background: fg ? 'rgba(251,244,230,0.22)' : c.line }} />
      {right ? <span style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: fg ? 'rgba(251,244,230,0.6)' : c.sub, whiteSpace: 'nowrap' }}>{right}</span> : null}
    </div>
  );
}

function EvBtn({ c, children, ghost, onClick, fs = 15, shadow, block, tone }) {
  const bg = tone === 'ink' ? c.ink : c.red, fg = tone === 'ink' ? EV_CREAM : c.onRed;
  return <button onClick={onClick} style={{ border: ghost ? `2px solid ${c.ink}` : 'none', background: ghost ? 'transparent' : bg, color: ghost ? c.ink : fg, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: fs, padding: `${Math.round(fs * 0.85)}px ${Math.round(fs * 1.5)}px`, cursor: 'pointer', boxShadow: shadow ? evHard(c, 5) : 'none', width: block ? '100%' : 'auto', whiteSpace: 'nowrap' }}>{children}</button>;
}

function EvTag({ c, children, tint, small }) {
  const t = tint === 'red' ? c.red : tint === 'gold' ? c.gold : c.ink;
  const solid = tint === 'red' || tint === 'gold';
  return <span style={{ background: solid ? t : 'transparent', border: solid ? 'none' : `1.5px solid ${c.line}`, color: solid ? (tint === 'gold' ? EV_INK : c.onRed) : c.sub, fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.1, padding: small ? '4px 7px' : '5px 9px', whiteSpace: 'nowrap' }}>{children}</span>;
}

function EvBar({ c, frei, kap, h = 10, label = true, invert }) {
  const pct = Math.max(1.5, Math.round((frei / kap) * 100));
  const col = frei === 0 ? c.sub : pct <= 15 ? c.red : pct <= 45 ? c.gold : '#2E9E5B';
  return (
    <div>
      <div style={{ height: h, background: invert ? 'rgba(251,244,230,0.2)' : c.line, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: `0 ${100 - (frei === 0 ? 0 : pct)}% 0 0`, background: col }} />
      </div>
      {label ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontWeight: 900, fontSize: 10.5, letterSpacing: 1.1, color: invert ? 'rgba(251,244,230,0.66)' : c.sub }}>
          <span style={{ color: col }}>{frei === 0 ? 'AUSVERKAUFT' : `${frei} PLÄTZE FREI`}</span><span>VON {kap}</span>
        </div>
      ) : null}
    </div>
  );
}

function evCountdown(t) { const ms = t - Date.now(); if (ms <= 0) return null; const s = Math.floor(ms / 1000); return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 }; }
const evWhen = (e) => new Date(`${e.y}-${e.mm}-${e.d.replace('.', '')}T${e.zeit}:00`).getTime();

function EvCountdown({ c, when, invert, small }) {
  const [t, setT] = React.useState(() => evCountdown(when));
  React.useEffect(() => { const i = setInterval(() => setT(evCountdown(when)), 1000); return () => clearInterval(i); }, [when]);
  if (!t) return null;
  const sub = invert ? 'rgba(251,244,230,0.6)' : c.sub;
  // Sekunden erst, wenn sie etwas bedeuten — sonst ist der Zähler nur Theater.
  const units = t.d >= 2 ? [[t.d, 'TAGE'], [t.h, 'STD'], [t.m, 'MIN']] : [[t.d, 'TAGE'], [t.h, 'STD'], [t.m, 'MIN'], [t.s, 'SEK']];
  return (
    <div style={{ display: 'flex', gap: small ? 8 : 14 }}>
      {units.map(([n, l]) => (
        <div key={l} style={{ textAlign: 'center', minWidth: small ? 38 : 52 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 26 : 40, lineHeight: 0.9, color: invert ? EV_CREAM : c.ink, fontVariantNumeric: 'tabular-nums' }}>{String(n).padStart(2, '0')}</div>
          <div style={{ fontWeight: 900, fontSize: small ? 8 : 9.5, letterSpacing: 1.2, color: sub, marginTop: 3 }}>{l}</div>
        </div>
      ))}
    </div>
  );
}

function EvSubscribe({ c, kind, small, block }) {
  const [on, setOn] = React.useState(false);
  const txt = kind === 'wait' ? (on ? 'Auf der Warteliste · Platz 7' : 'Auf die Warteliste') : (on ? 'Erinnerung gesetzt ✓' : 'Erinnere mich');
  return <button onClick={() => setOn(!on)} style={{ border: `2px solid ${on ? c.red : c.ink}`, background: on ? c.red : 'transparent', color: on ? c.onRed : c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 12 : 14, padding: small ? '9px 12px' : '12px 18px', cursor: 'pointer', whiteSpace: 'nowrap', width: block ? '100%' : 'auto' }}>{txt}</button>;
}

// ── FOTO-THEATER: die Bilder vom selben Abend im Vorjahr ───────────────
// Später automatisch aus der Galerie gezogen. Stapel schiebt sich alle 3,4 s
// weiter, das vorderste Bild fliegt nach rechts raus und kommt hinten wieder.
function EvPhotoTheater({ c, small, h }) {
  const n = EV_FOTOS.length;
  const [i, setI] = React.useState(0);
  const [play, setPlay] = React.useState(true);
  React.useEffect(() => { if (!play) return; const t = setInterval(() => setI((x) => (x + 1) % n), 3400); return () => clearInterval(t); }, [play, n]);
  const H = h || (small ? 210 : 430);
  const rot = [-2.4, 1.9, -1.3, 2.6, -0.8];
  const cur = EV_FOTOS[i];
  return (
    <div style={{ display: small ? 'block' : 'grid', gridTemplateColumns: '1fr 280px', gap: 26, alignItems: 'stretch' }}>
      <div style={{ position: 'relative', height: H, overflow: 'hidden' }}>
        {EV_FOTOS.map((f, k) => {
          const depth = (k - i + n) % n, back = depth === n - 1;
          const dx = back ? (small ? 90 : 150) : depth * (small ? 9 : 16);
          const dy = back ? 0 : depth * (small ? 7 : 12);
          return (
            <div key={f[0]} style={{ position: 'absolute', inset: `0 ${small ? 34 : 60}px ${small ? 26 : 44}px 0`, transform: `translate(${dx}px, ${dy}px) rotate(${back ? 9 : rot[depth % rot.length]}deg) scale(${back ? 0.94 : 1 - depth * 0.028})`, opacity: back ? 0 : 1, zIndex: n - depth, transition: 'transform 700ms cubic-bezier(.22,.9,.25,1), opacity 520ms ease', border: `2px solid ${c.ink}`, background: c.paper, boxShadow: evHard(c, depth === 0 ? (small ? 7 : 12) : 4, depth === 0 ? c.red : c.ink), padding: small ? 6 : 9 }}>
              <window.KKPlh h="100%" label={f[0]} c={c} tint={depth % 2 ? c.gold : c.red} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', marginTop: small ? 14 : 0 }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.5, color: c.red, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span style={{ width: 7, height: 7, background: c.red, borderRadius: 9, animation: 'ev-blink 1.4s steps(1,end) infinite' }} />
          AUS DER GALERIE · AUTOMATISCH GEZOGEN
        </div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 22 : 27, lineHeight: 1.04, marginTop: 8 }}>{cur[1].toUpperCase()}</div>
        <div style={{ fontWeight: 700, fontSize: small ? 11.5 : 12.5, color: c.sub, marginTop: 5 }}>{cur[2]}</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 14 }}>
          {EV_FOTOS.map((f, k) => <button key={f[0]} onClick={() => { setI(k); setPlay(false); }} style={{ flex: 1, height: 5, border: 'none', padding: 0, cursor: 'pointer', background: k === i ? c.red : c.line }} />)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <button onClick={() => setPlay(!play)} style={{ border: `1.5px solid ${c.line}`, background: 'transparent', color: c.sub, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 10.5, letterSpacing: 1, padding: '7px 10px', cursor: 'pointer' }}>{play ? 'PAUSE' : 'WEITER'}</button>
          <a href="#" style={{ fontWeight: 900, fontSize: 12.5 }}>Alle 112 Fotos →</a>
        </div>
      </div>
    </div>
  );
}

// Ablauf: liegt meistens noch nicht vor — dann nur eine Zeile. Steht das Programm,
// klappt derselbe Block die Prognose aus.
function EvAblauf({ c, e, small }) {
  const [open, setOpen] = React.useState(true);
  if (!e.programm) {
    return (
      <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: small ? '13px 15px' : '15px 18px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.3, color: c.sub, whiteSpace: 'nowrap' }}>ABLAUF</span>
        <span style={{ fontWeight: 700, fontSize: small ? 11.5 : 12.5, color: c.sub, lineHeight: 1.45, flex: 1, minWidth: 180 }}>Die Reihenfolge der Nummern steht erst wenige Tage vorher — dann findest du sie hier. Einlass {e.einlass}, Beginn {e.zeit}, Ende etwa {e.ende.replace('ca. ', '')}.</span>
      </div>
    );
  }
  return (
    <div style={{ border: `1.5px solid ${c.line}`, background: c.paper }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', background: 'transparent', border: 'none', padding: small ? '13px 15px' : '15px 18px', cursor: 'pointer' }}>
        <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.3, color: c.red, whiteSpace: 'nowrap' }}>ABLAUF STEHT</span>
        <span style={{ fontWeight: 700, fontSize: small ? 11.5 : 12.5, color: c.sub, flex: 1, lineHeight: 1.4 }}>{EV_ABLAUF.length} Nummern, gerechnete Zeiten · rückt am Abend automatisch nach</span>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 17 : 19, color: c.red, flexShrink: 0 }}>{open ? '–' : '+'}</span>
      </button>
      {open ? (
        <div style={{ padding: small ? '0 15px 13px' : '0 18px 15px' }}>
          {EV_ABLAUF.map(([t, n, d], i) => (
            <div key={t} style={{ display: 'grid', gridTemplateColumns: small ? '50px 1fr' : '64px 1fr', gap: small ? 12 : 16, padding: small ? '9px 0' : '10px 0', borderTop: `1.5px solid ${c.line}` }}>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 15 : 18, color: i === 5 ? c.sub : c.red, lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{t}</span>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 15.5 : 18, lineHeight: 1.05 }}>{n}</div>
                <div style={{ fontWeight: 600, fontSize: small ? 11 : 12, color: c.sub, marginTop: 3, lineHeight: 1.4 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

// Endlos laufendes Filmband — dieselbe Quelle, nur als Rhythmus-Element.
function EvFilmstrip({ c, h = 96, speed = 46 }) {
  const items = [...EV_FOTOS, ...EV_FOTOS, ...EV_FOTOS, ...EV_FOTOS];
  return (
    <div style={{ overflow: 'hidden', borderTop: `1.5px solid ${c.line}`, borderBottom: `1.5px solid ${c.line}`, padding: '10px 0' }}>
      <div style={{ display: 'flex', gap: 10, width: 'max-content', animation: `ev-marq ${speed}s linear infinite` }}>
        {items.map((f, k) => <div key={k} style={{ width: h * 1.42, height: h, flexShrink: 0 }}><window.KKPlh h="100%" label={f[0]} c={c} tint={k % 3 === 1 ? c.gold : c.red} /></div>)}
      </div>
    </div>
  );
}

// ── SPIELPLAN-ZEILE ─────────────────────────────────────────────────────
function EvRow({ c, e, go, small }) {
  const s = evStatus(e), col = evKind(c, s.kind);
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={() => go && go('detail', e.id)} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ display: 'grid', gridTemplateColumns: small ? '52px 1fr auto' : '86px 1fr 232px', gap: small ? 12 : 24, alignItems: 'center', padding: small ? '12px 0' : '15px 12px', margin: small ? 0 : '0 -12px', borderTop: `1.5px solid ${c.line}`, cursor: 'pointer', background: hov && !small ? c.paper : 'transparent', boxShadow: hov && !small ? `inset 4px 0 0 ${c.red}` : 'none', transition: 'background 120ms ease' }}>
      <div style={{ textAlign: 'center', border: `1.5px solid ${c.line}`, background: c.paper, padding: small ? '5px 0' : '7px 0' }}>
        <div style={{ fontWeight: 900, fontSize: small ? 8.5 : 9.5, letterSpacing: 1.2, color: c.red }}>{e.tag.toUpperCase()}</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 18 : 28, lineHeight: 0.95 }}>{e.d}</div>
        <div style={{ fontWeight: 800, fontSize: small ? 8 : 9, letterSpacing: 1, color: c.sub }}>{e.m}</div>
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 19 : 29, lineHeight: 1 }}>{e.titel}</span>
          {!small ? <EvTag c={c} tint="line" small>{e.alter.toUpperCase()}</EvTag> : null}
        </div>
        <div style={{ fontWeight: 700, fontSize: small ? 10.5 : 12, color: c.sub, marginTop: 4 }}>Einlass {e.einlass} · Beginn {e.zeit} Uhr · {e.dauer}{small ? '' : ' · Ende ' + e.ende}</div>
        {!small ? <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 4, maxWidth: 640, lineHeight: 1.45, textWrap: 'pretty' }}>{e.unter}</div> : null}
      </div>
      {small ? (
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 0.6, color: col }}>{evShort(e)}</div>
          <div style={{ fontWeight: 900, fontSize: 12, color: c.red, marginTop: 3 }}>→</div>
        </div>
      ) : (
        <div style={{ flexShrink: 0 }}>
          {s.bar ? <EvBar c={c} frei={e.frei} kap={e.kap} h={7} label={false} /> : <div style={{ height: 7, border: `1.5px dashed ${c.line}`, boxSizing: 'border-box' }} />}
          <div style={{ fontWeight: 800, fontSize: 13, color: col, marginTop: 7, lineHeight: 1.3 }}>{s.label}</div>
          <div style={{ fontWeight: 900, fontSize: 14, color: c.red, marginTop: 4, textDecoration: hov ? 'underline' : 'none', textUnderlineOffset: 3 }}>{s.cta} →</div>
        </div>
      )}
    </div>
  );
}

// ── AUFMACHER ───────────────────────────────────────────────────────────
function EvHeroCard({ c, e, go, small }) {
  const s = evStatus(e);
  const voll = EV_EVENTS.find((x) => x.status === 'ausverkauft');
  return (
    <div style={{ background: c.paper, border: `2px solid ${c.ink}`, boxShadow: evHard(c, small ? 6 : 10), padding: small ? '16px 18px 18px' : '22px 26px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 11, letterSpacing: 1.8, color: c.red }}>NÄCHSTER ABEND MIT KARTEN</span>
        {e.status === 'knapp' ? <EvTag c={c} tint="red" small>FAST WEG</EvTag> : null}
      </div>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 33 : 46, lineHeight: 0.9, marginTop: small ? 9 : 12 }}>{e.titel.toUpperCase()}</div>
      <div style={{ fontWeight: 800, fontSize: small ? 11.5 : 13, color: c.sub, marginTop: 7 }}>{e.tag}, {e.datum} · Einlass {e.einlass} · Beginn {e.zeit} Uhr</div>
      <div style={{ marginTop: small ? 12 : 16, paddingTop: small ? 12 : 15, borderTop: `1.5px solid ${c.line}` }}><EvCountdown c={c} when={evWhen(e)} small={small} /></div>
      <div style={{ marginTop: small ? 12 : 16 }}>
        <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.5, color: c.sub, marginBottom: 7 }}>LIVE-KARTENSTAND · VOR 4 MIN AKTUALISIERT</div>
        <EvBar c={c} frei={e.frei} kap={e.kap} h={small ? 9 : 12} />
      </div>
      <div style={{ display: 'flex', gap: 9, marginTop: small ? 13 : 17, flexWrap: 'wrap' }}>
        <EvBtn c={c} fs={small ? 14 : 16} onClick={() => go('seats', e.id)}>Platz wählen · {EV_PREIS} €</EvBtn>
        <EvBtn c={c} ghost fs={small ? 14 : 16} onClick={() => go('detail', e.id)}>Zum Abend</EvBtn>
      </div>
      {voll ? (
        <button onClick={() => go('boerse')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', marginTop: small ? 12 : 15, paddingTop: small ? 11 : 13, border: 'none', borderTop: `1.5px solid ${c.line}`, background: 'transparent', font: 'inherit', color: 'inherit', textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ fontWeight: 600, fontSize: small ? 11 : 12, color: c.sub, lineHeight: 1.4 }}>{voll.titel} am {voll.d} {voll.m.charAt(0) + voll.m.slice(1).toLowerCase()} ist ausverkauft</span>
          <span style={{ fontWeight: 900, fontSize: small ? 11.5 : 12.5, color: c.red, whiteSpace: 'nowrap' }}>Warteliste & Börse →</span>
        </button>
      ) : null}
    </div>
  );
}

// ── ZWEI MONATE ─────────────────────────────────────────────────────────
const EV_MONTHS = [{ t: 'Januar 2027', first: 4, days: 31, key: 'JAN' }, { t: 'Februar 2027', first: 0, days: 28, key: 'FEB' }];
function EvMonth({ c, m, go, small }) {
  const evs = EV_EVENTS.filter((e) => e.m === m.key);
  const byDay = {};
  evs.forEach((e) => { byDay[parseInt(e.d, 10)] = e; });
  const cells = [];
  for (let i = 0; i < m.first; i++) cells.push(null);
  for (let d = 1; d <= m.days; d++) cells.push(d);
  return (
    <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: small ? '12px 12px 14px' : '18px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 20 : 27, lineHeight: 1 }}>{m.t}</span>
        <span style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.2, color: c.sub }}>{evs.length} {evs.length === 1 ? 'TERMIN' : 'TERMINE'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: small ? 3 : 5, marginTop: 12 }}>
        {['M', 'D', 'M', 'D', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontWeight: 900, fontSize: small ? 8.5 : 10, letterSpacing: 0.5, color: c.sub, paddingBottom: 3 }}>{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const e = byDay[d], full = e && e.status === 'ausverkauft';
          return (
            <div key={i} onClick={e ? () => go('detail', e.id) : undefined} title={e ? e.titel : ''} style={{ aspectRatio: '1 / 1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, background: e ? (full ? c.ink : c.red) : 'transparent', border: e ? 'none' : `1px solid ${c.line}`, color: e ? c.onRed : c.sub, cursor: e ? 'pointer' : 'default' }}>
              <span style={{ fontFamily: e ? "'Anton', sans-serif" : 'Archivo, sans-serif', fontSize: e ? (small ? 15 : 20) : small ? 10 : 12, fontWeight: e ? 400 : 600, lineHeight: 1 }}>{d}</span>
              {e ? <span style={{ fontWeight: 900, fontSize: small ? 6.5 : 8, letterSpacing: 0.3, lineHeight: 1 }}>{e.zeit}</span> : null}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, borderTop: `1.5px solid ${c.line}`, paddingTop: 10, display: 'flex', flexDirection: 'column' }}>
        {evs.map((e, i) => (
          <div key={e.id} onClick={() => go('detail', e.id)} style={{ display: 'grid', gridTemplateColumns: '34px 1fr auto', gap: 10, alignItems: 'baseline', cursor: 'pointer', padding: '7px 0', borderTop: i ? `1px solid ${c.line}` : 'none' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 14 : 17, color: c.red }}>{e.d}</span>
            <span style={{ fontWeight: 800, fontSize: small ? 11 : 13, lineHeight: 1.3 }}>{e.titel}</span>
            <span style={{ fontWeight: 900, fontSize: small ? 9 : 10, letterSpacing: 0.6, color: evKind(c, evStatus(e).kind) }}>{evShort(e)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KARTENBÖRSE ─────────────────────────────────────────────────────────
function EvBoerse({ c, small }) {
  const p = evPanel(c);
  return (
    <div style={{ background: c.paper, color: c.ink, borderTop: `1.5px solid ${c.line}`, borderBottom: `1.5px solid ${c.line}`, padding: small ? '20px 20px' : '30px 40px' }}>
      <div style={{ display: small ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: small ? 0 : 32, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 11, letterSpacing: 1.8, color: c.red }}>AUSVERKAUFT IST NICHT DAS ENDE</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 28 : 38, lineHeight: 0.95, marginTop: 7 }}>DIE KARTEN&shy;BÖRSE</div>
          <div style={{ fontWeight: 600, fontSize: small ? 12 : 13.5, color: c.sub, marginTop: 9, lineHeight: 1.5, textWrap: 'pretty' }}>Wer kurzfristig nicht kann, gibt die Karte im Konto zurück — sie geht automatisch an die Nächste auf der Warteliste. Kein Weiterverkauf, kein Aufpreis, keine leeren Stühle.</div>
        </div>
        {[['01', 'Karte zurückgeben', 'Ein Tipp in der Bestätigungs-Mail. Geld zurück, sobald die Karte weg ist.'], ['02', 'Warteliste rückt auf', 'Die Nächste bekommt 6 Stunden Vorkaufsrecht per SMS, dann die Übernächste.']].map(([n, t, d]) => (
          <div key={n} style={{ marginTop: small ? 16 : 0, paddingTop: small ? 13 : 0, borderTop: small ? `1.5px solid ${c.line}` : 'none' }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 26 : 32, color: c.red, lineHeight: 0.9 }}>{n}</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 19 : 22, marginTop: 7, lineHeight: 1 }}>{t}</div>
            <div style={{ fontWeight: 600, fontSize: small ? 11.5 : 12.5, color: c.sub, marginTop: 6, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: small ? 16 : 22, paddingTop: small ? 13 : 18, borderTop: `1.5px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 900, fontSize: small ? 12 : 14 }}>1. Prunksitzung 23.01. · ausverkauft · 7 auf der Warteliste</span>
        <EvSubscribe c={c} kind="wait" small={small} />
      </div>
    </div>
  );
}

// ── DER SAAL (ein Ort für alles) ─────────────────────────────────────────
function EvVenue({ c, small, go }) {
  const rows = [['Saal', '288 Sitzplätze an 24 Tischreihen, 62 Stehplätze an der Theke'], ['Adresse', 'Schulstraße 4, 99713 Großfurra — ebenerdig, Rollstuhlplätze an Reihe 1'], ['Parken', 'Schulhof und Feuerwehr, 4 Minuten zu Fuß, kostenlos'], ['Heimweg', 'Shuttle nach Sondershausen um 0:30 und 2:15 · 2 € an der Theke']];
  return (
    <div style={{ display: small ? 'block' : 'grid', gridTemplateColumns: '1.15fr 1fr', gap: small ? 14 : 26, alignItems: 'stretch' }}>
      <window.KKPlh h={small ? 160 : 300} label="dorfgemeindehaus-grossfurra" c={c} tint={c.red} />
      <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: small ? '16px 16px 18px' : '20px 24px 22px', marginTop: small ? 12 : 0 }}>
        <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.6, color: c.red }}>ALLE SECHS ABENDE, EIN SAAL</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 26 : 34, lineHeight: 0.96, marginTop: 7 }}>{EV_ORT.toUpperCase()}</div>
        {rows.map(([t, d], i) => (
          <div key={t} style={{ display: 'grid', gridTemplateColumns: small ? '72px 1fr' : '92px 1fr', gap: 12, padding: small ? '10px 0' : '11px 0', borderTop: `1.5px solid ${c.line}`, marginTop: i ? 0 : 12 }}>
            <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.2, color: c.sub, paddingTop: 2 }}>{t.toUpperCase()}</span>
            <span style={{ fontWeight: 700, fontSize: small ? 11.5 : 12.5, lineHeight: 1.45 }}>{d}</span>
          </div>
        ))}
        <div style={{ marginTop: 14 }}><EvBtn c={c} ghost fs={13} onClick={() => go('seats', 'prunk2')}>Saalplan ansehen →</EvBtn></div>
      </div>
    </div>
  );
}

// ── DESKTOP · SPIELPLAN ─────────────────────────────────────────────────
function EvIndexDesktop({ c, go, view }) {
  const cal = view === 'kalender';
  const [w, setW] = React.useState(-1);
  const auf = evById('prunk2');
  const frei = EV_EVENTS.reduce((a, e) => a + e.frei, 0);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <EvKeyframes />
      <window.KKMastheadBar c={c} />

      <div style={{ padding: '38px 56px 0', display: 'grid', gridTemplateColumns: '1fr 430px', gap: 46, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 12.5, letterSpacing: 3, color: c.red }}>TERMINE & KARTEN · 55. SESSION</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 82, lineHeight: 0.86, margin: '14px 0 0' }}>VERANSTALTUNGEN</h1>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '16px 0 0', maxWidth: 540, textWrap: 'pretty' }}>
            Sechs Abende im {EV_ORT}, vom 23. Januar bis zum 7. Februar 2027. Jeder Platz ist numeriert, und der Kartenstand hier kommt live aus dem Vorverkauf.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 20, flexWrap: 'wrap' }}>
            <EvBtn c={c} ghost fs={16}>Termine abonnieren</EvBtn>
            <span style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, maxWidth: 250, lineHeight: 1.4 }}>Ändert sich ein Termin, ändert er sich bei dir mit.</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,auto)', gap: 32, marginTop: 26, paddingTop: 18, borderTop: `1.5px solid ${c.line}`, justifyContent: 'start' }}>
            {[['6', 'Abende'], ['12 €', 'jede Karte'], ['288', 'Plätze pro Abend'], [String(frei), 'Karten noch frei']].map(([n, t]) => (
              <div key={t}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 36, lineHeight: 0.9 }}>{n}</div>
                <div style={{ fontWeight: 800, fontSize: 10.5, letterSpacing: 1.4, color: c.sub, marginTop: 4 }}>{t.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <EvHeroCard c={c} e={auf} go={go} />
      </div>

      <div style={{ padding: '34px 56px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <div style={{ width: 13, height: 13, background: c.red, flexShrink: 0 }} />
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 21, letterSpacing: 0.6, whiteSpace: 'nowrap' }}>DER SPIELPLAN</span>
          <div style={{ flex: 1, height: 1.5, background: c.line }} />
          <span style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.sub, whiteSpace: 'nowrap' }}>23.01. — 07.02.2027</span>
          <div style={{ display: 'flex', border: `1.5px solid ${c.line}`, marginLeft: 6 }}>
            {[['index', 'Liste'], ['kalender', 'Monate']].map(([v, t]) => {
              const on = (cal ? 'kalender' : 'index') === v;
              return <button key={v} onClick={() => go(v)} style={{ border: 'none', background: on ? c.ink : 'transparent', color: on ? EV_CREAM : c.sub, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 12, padding: '7px 14px', cursor: 'pointer' }}>{t}</button>;
            })}
          </div>
        </div>
        {cal ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {EV_MONTHS.map((m) => <EvMonth key={m.key} c={c} m={m} go={go} />)}
          </div>
        ) : (
          <div>
            {EV_EVENTS.map((e) => <EvRow key={e.id} c={c} e={e} go={go} />)}
            <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 12, fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.5 }}>
              Alle Abende im {EV_ORT}. Fragen zu einem Termin? <a href="#">Ruf an: 0170 55 44 21</a>.
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '34px 56px 0' }}><EvVenue c={c} go={go} /></div>

      <div style={{ marginTop: 34 }}><window.EvBoerseBand c={c} go={go} /></div>

      <div style={{ marginTop: 34 }}><EvFilmstrip c={c} h={104} /></div>

      <div style={{ padding: '34px 56px 0' }}>
        <EvRule c={c} label="ALLES, WAS DU WISSEN MUSST" right="OHNE NACHFRAGEN" />
        <div style={{ maxWidth: 600 }}>
          {EV_WISSEN.map(([t, d], i) => (
            <div key={t} style={{ borderTop: `1px solid ${c.line}`, borderBottom: i === EV_WISSEN.length - 1 ? `1px solid ${c.line}` : 'none' }}>
              <button onClick={() => setW(w === i ? -1 : i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '17px 4px', cursor: 'pointer', font: 'inherit', color: 'inherit' }}>
                <span style={{ fontWeight: 800, fontSize: 15, color: c.ink }}>{t}</span>
                <span style={{ fontSize: 13, color: c.red, flexShrink: 0, transform: w === i ? 'rotate(180deg)' : 'none' }}>⌄</span>
              </button>
              {w === i ? <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.65, color: c.sub, padding: '0 4px 18px', maxWidth: 520, textWrap: 'pretty' }}>{d}</div> : null}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '34px 56px 0' }}>
        <div style={{ border: `2px solid ${c.ink}`, background: c.bg, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.8, color: c.red }}>EINMAL EINTRAGEN, NIE WIEDER VERPASSEN</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 1, marginTop: 7 }}>SPIELPLAN IN DEINEN KALENDER</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: c.sub, marginTop: 7, maxWidth: 640, lineHeight: 1.5 }}>Ein Abo-Link für Apple, Google und Outlook. Ändert sich ein Termin, ändert er sich bei dir mit — und der Vorverkaufs-Start für den Rentnerfasching kommt als Erinnerung dazu.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <EvBtn c={c} fs={15}>Kalender abonnieren</EvBtn>
            <EvBtn c={c} ghost fs={15}>Spielplan als PDF</EvBtn>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 38 }}><window.KKFooter c={c} /></div>
    </div>
  );
}

// ── DESKTOP · DETAIL ────────────────────────────────────────────────────
function EvDetailDesktop({ c, go, id }) {
  const e = evById(id), p = evPanel(c), s = evStatus(e);
  const others = EV_EVENTS.filter((x) => x.id !== e.id).slice(0, 3);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <EvKeyframes />
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '20px 56px 0' }}>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, padding: 0, cursor: 'pointer' }}>← Alle Termine</button>
      </div>

      <div style={{ padding: '16px 56px 0', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 44, alignItems: 'start' }}>
        <div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
            <EvTag c={c} tint="red">{e.typ.toUpperCase()}</EvTag>
            <EvTag c={c} tint="line">55. SESSION</EvTag>
            <EvTag c={c} tint="line">{e.alter.toUpperCase()}</EvTag>
            <EvTag c={c} tint="line">{EV_ORT.toUpperCase()}</EvTag>
          </div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 74, lineHeight: 0.87, margin: '12px 0 0' }}>{e.titel.toUpperCase()}</h1>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '14px 0 0', maxWidth: 580, textWrap: 'pretty' }}>{e.unter}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,auto)', gap: 26, marginTop: 22, paddingTop: 16, borderTop: `1.5px solid ${c.line}`, justifyContent: 'start' }}>
            {[[e.d + e.mm + '.', e.tag + ', ' + e.datum.split(' ').slice(1).join(' ')], [e.einlass, 'Einlass'], [e.zeit, 'Beginn'], [e.ende.replace('ca. ', ''), 'Ende, etwa'], [EV_PREIS + ' €', 'pro Karte']].map(([n, t]) => (
              <div key={t}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, lineHeight: 0.9 }}>{n}</div>
                <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: 1.2, color: c.sub, marginTop: 4 }}>{t.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        {e.status === 'ausverkauft' ? <window.EvWaitPanel c={c} e={e} go={go} /> : (
        <div style={{ background: c.paper, border: `2px solid ${c.ink}`, boxShadow: evHard(c, 8), padding: '20px 22px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.6, color: c.red }}>KARTE</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 52, lineHeight: 0.88, marginTop: 4 }}>{EV_PREIS} €</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 11.5, color: c.sub, textAlign: 'right', lineHeight: 1.4, paddingBottom: 4 }}>pro Person<br />Sitzplatz am Tisch<br />Kinder gleich</div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${c.line}` }}>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.4, color: c.sub, marginBottom: 7 }}>LIVE-KARTENSTAND</div>
            <EvBar c={c} frei={e.status === 'bald' ? e.kap : e.frei} kap={e.kap} h={11} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
            {e.status === 'bald' ? <EvSubscribe c={c} block /> : <EvBtn c={c} block fs={16} onClick={() => go('seats', e.id)}>Platz im Saalplan wählen →</EvBtn>}
          </div>
          <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 12, lineHeight: 1.45 }}>{e.status === 'bald' ? `Vorverkauf startet am ${e.vvk}, online und im Vereinsraum. Wir erinnern dich am Morgen davor.` : 'Kreditkarte, PayPal — oder reservieren und bar im Vereinsraum zahlen. Karte kommt als QR per Mail, Rückgabe jederzeit über die Börse.'}</div>
          {e.gruppe ? (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1.5px solid ${c.line}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 9, height: 9, background: c.gold, flexShrink: 0 }} />
              <div style={{ fontWeight: 700, fontSize: 11.5, lineHeight: 1.4 }}><b style={{ fontWeight: 900 }}>{e.gruppe.name}</b> sammelt für Reihe {e.gruppe.reihe} — {e.gruppe.offen} Plätze offen. <a href="#" onClick={(ev) => { ev.preventDefault(); go('seats', e.id); }}>Dazusetzen</a></div>
            </div>
          ) : null}
        </div>
        )}
      </div>

      {/* FOTO-THEATER */}
      <div style={{ padding: '30px 56px 0' }}>
        <EvRule c={c} label="SO WAR ES LETZTES JAHR" right="54. SESSION · 112 FOTOS" />
        <EvPhotoTheater c={c} />
      </div>

      <div style={{ padding: '26px 56px 0', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 40, alignItems: 'start' }}>
        <div>
          <EvRule c={c} label="WER AUFTRITT" right={`${EV_GRUPPEN.length} GRUPPEN & GÄSTE`} />
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>{EV_GRUPPEN.map((g) => <EvTag c={c} key={g} tint="line">{g.toUpperCase()}</EvTag>)}</div>
          <div style={{ marginTop: 14 }}><EvAblauf c={c} e={e} /></div>
          <div style={{ marginTop: 14, fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.5, textWrap: 'pretty' }}>
            Der Verein baut die Reihenfolge kurz vor dem Abend zusammen — vor allem, damit niemand zweimal hintereinander auf die Bühne muss. Sobald sie steht, erscheint sie oben; am Abend selbst rücken die Zeiten automatisch nach.
          </div>
        </div>
        <div>
          <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '16px 18px 18px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.red }}>SO SITZT DER SAAL</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 23, lineHeight: 1.05, marginTop: 7 }}>24 TISCHREIHEN,<br />288 STÜHLE</div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 7, lineHeight: 1.5 }}>Lange Biertische quer zur Bühne, sechs Stühle je Seite. Reihe 1–3 stehen an der Bühne, 22–24 an der Theke — dort ist es lauter und lustiger.</div>
            <div style={{ marginTop: 12 }}><EvBtn c={c} ghost fs={13} onClick={() => go('seats', e.id)}>Saalplan ansehen →</EvBtn></div>
          </div>
          <div style={{ marginTop: 16, background: c.paper, color: c.ink, border: `1.5px solid ${c.line}`, padding: '16px 18px 18px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.red }}>AM ABEND SELBST</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 23, lineHeight: 1.05, marginTop: 7 }}>WELCHE NUMMER<br />GERADE LÄUFT</div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 7, lineHeight: 1.5 }}>Ab 19:11 wird aus der Prognose ein Live-Ablauf — praktisch, wenn man kurz raus an die frische Luft ist.</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '30px 56px 0' }}>
        <EvRule c={c} label="AUCH NOCH IN DIESER SESSION" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {others.map((o) => (
            <div key={o.id} onClick={() => go('detail', o.id)} style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '15px 17px 17px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.3, color: c.red }}>{o.tag.toUpperCase()} {o.d}{o.m}</span>
                <span style={{ fontWeight: 900, fontSize: 10, letterSpacing: 0.6, color: evKind(c, evStatus(o).kind) }}>{evShort(o)}</span>
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, lineHeight: 1.02, marginTop: 7 }}>{o.titel}</div>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: c.sub, marginTop: 5 }}>{o.zeit} Uhr · {EV_PREIS} € · {o.alter}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: c.paper, color: c.ink, borderTop: `1.5px solid ${c.line}`, borderBottom: `1.5px solid ${c.line}`, padding: '30px 56px', marginTop: 34, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 36, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>{s.label.toUpperCase()} · {e.datum.toUpperCase()}</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.95, marginTop: 7 }}>{e.titel.toUpperCase()}</div>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: c.sub, marginTop: 8, maxWidth: 640, lineHeight: 1.5 }}>Einlass {e.einlass} · {EV_ORT} · {EV_PREIS} € pro Karte · Kostüm gern, kein Muss.</div>
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexShrink: 0 }}>
          <EvCountdown c={c} when={evWhen(e)} small />
          {e.status === 'offen' || e.status === 'knapp' ? (
            <button onClick={() => go('seats', e.id)} style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 17, padding: '17px 26px', cursor: 'pointer', boxShadow: evHard(c, 6) }}>Platz wählen →</button>
          ) : e.status === 'ausverkauft' ? (
            <button onClick={() => go('boerse')} style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 17, padding: '17px 26px', cursor: 'pointer', boxShadow: evHard(c, 6) }}>Zur Kartenbörse →</button>
          ) : null}
        </div>
      </div>
      <window.KKFooter c={c} />
    </div>
  );
}

Object.assign(window, { EV_EVENTS, EV_ORT, EV_PREIS, evById, evStatus, evKind, evShort, evHard, evPanel, evWhen, EV_CREAM, EV_INK, EV_WISSEN, EV_FOTOS, EvKeyframes, EvRule, EvBtn, EvTag, EvBar, EvCountdown, EvSubscribe, EvRow, EvHeroCard, EvMonth, EV_MONTHS, EvBoerse, EvVenue, EvFilmstrip, EvPhotoTheater, EvAblauf, EvIndexDesktop, EvDetailDesktop, EV_ABLAUF, EV_GRUPPEN });
