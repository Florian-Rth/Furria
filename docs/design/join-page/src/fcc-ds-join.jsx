// fcc-ds-join.jsx — public "Mitglied werden" page (/join). The membership funnel.
// Premise: joining a Karnevalsverein is intimidating. The page removes fear first,
// then offers ONE concrete next step (beim Training vorbeikommen), then the digital Antrag.
// Invented features: Findomat (3-question group matcher) · Vereins-Ticket (alles auf
// einer Eintrittskarte) · Beitrags-Rechner · „Ehrlich gesagt“-FAQ · Antrag + Danke-Screen.
// Konfetti-Kinetik only (window.KK tokens, Anton/Archivo, ONE hard shadow per screen).
// Exports JoinPage({ mode, device, view }) — view: 'index' | 'antrag' | 'fertig'.

const jHard = (c, n = 8, col) => `${n}px ${n}px 0 ${col || c.ink}`;
const J_CREAM = '#FBF4E6';
const jPanel = (c) => (c.bg === '#15110E'
  ? { bg: '#0C0806', fg: J_CREAM, sub: 'rgba(251,244,230,0.62)' }
  : { bg: c.ink, fg: J_CREAM, sub: 'rgba(251,244,230,0.62)' });
const jTint = (c, k) => (k === 'red' ? c.red : k === 'gold' ? c.gold : c.ink);
const J_INK = '#1A1411'; // literal ink — for text ON gold/cream in both modes

// ── content ─────────────────────────────────────────────────────────────
const JGRUPPEN = {
  kindergarde: { name: 'Kindergarde', alter: '6–11 Jahre', zeit: 'Freitag 16:00–17:15', ort: 'Sporthalle', frei: '4 Plätze frei', ansprech: 'Katrin Roth', tint: 'gold' },
  jugendgarde: { name: 'Jugendgarde', alter: '12–17 Jahre', zeit: 'Freitag 17:30–19:00', ort: 'Sporthalle', frei: '3 Plätze frei', ansprech: 'Katrin Roth', tint: 'red' },
  tanzgarde: { name: 'Tanzgarde', alter: 'ab 16 Jahre', zeit: 'Dienstag 19:30–21:00', ort: 'Sporthalle', frei: '2 Plätze frei', ansprech: 'Nadine Kühn', tint: 'red' },
  showtanz: { name: 'Showtanz Groß Furria', alter: 'ab 14 Jahre', zeit: 'Montag 19:00–20:30', ort: 'Sporthalle', frei: 'Warteliste – aber vorbeikommen geht', ansprech: 'Nadine Kühn', tint: 'ink' },
  ballett: { name: 'Männerballett „Die Besen“', alter: 'ab 18 Jahre', zeit: 'Donnerstag 20:00–21:30', ort: 'Sporthalle', frei: 'Immer Platz', ansprech: 'Uwe Krämer', tint: 'ink' },
  elferrat: { name: 'Elferrat & Bütt', alter: 'ab 18 Jahre', zeit: 'nach Absprache, ab September', ort: 'Vereinsraum', frei: '2 Plätze frei', ansprech: 'Marlies Hoffmann', tint: 'gold' },
  werkstatt: { name: 'Kostüm- & Wagenbau', alter: 'ab 16 Jahre', zeit: 'Samstag 10:00–14:00', ort: 'Lagerhalle Feldweg', frei: 'Immer Platz', ansprech: 'Sven Bauer', tint: 'ink' },
  technik: { name: 'Technik & Foto', alter: 'ab 16 Jahre', zeit: 'nach Absprache', ort: 'Sporthalle', frei: '1 Platz frei', ansprech: 'Tobias Reuter', tint: 'red' },
};
const JTERMINE = [
  { tag: 'Di', d: '04.', m: 'AUG', g: 'tanzgarde', frei: 2 },
  { tag: 'Do', d: '06.', m: 'AUG', g: 'ballett', frei: 6 },
  { tag: 'Fr', d: '07.', m: 'AUG', g: 'kindergarde', frei: 4 },
  { tag: 'Sa', d: '08.', m: 'AUG', g: 'werkstatt', frei: 9 },
];
const JARTEN = [
  { t: 'Aktiv', p: '30 €', s: 'im Jahr, ab 18', d: 'Die normale Mitgliedschaft. Ob du auf der Bühne stehst, den Wagen baust oder im Elferrat sitzt — gleicher Beitrag. Training, Kostüm-Zuschuss und Ordensfest sind drin.', tint: 'red' },
  { t: 'Kind & Jugend', p: '15 €', s: 'im Jahr, bis 17', d: 'Kindergarde, Jugendgarde, Jugend-Sketch. Eltern zahlen nur diesen Beitrag — Kostüme stellt der Verein.', tint: 'gold' },
];
const JWEG = [
  { n: '01', t: 'Vorbeikommen', d: 'Beim Training auftauchen und mitmachen. Ohne Anmeldung, ohne Beitrag, so oft du magst.', z: 'diese Woche' },
  { n: '02', t: 'Antrag stellen', d: 'Ein Formular, zwei Minuten, online. Kein PDF ausdrucken, keine Unterschrift per Post.', z: '2 Minuten' },
  { n: '03', t: 'Vorstand nimmt auf', d: 'Wir bestätigen deine Aufnahme in der nächsten Vorstandssitzung — du bekommst eine Mail.', z: 'nächste Sitzung' },
  { n: '04', t: 'Willkommen', d: 'Zugang zur Club-App (Termine, Beitrag, Bierliste) und dein Orden beim nächsten Ordensfest.', z: 'sofort danach' },
];
const JFAQ = [
  { q: 'Muss ich tanzen können?', a: 'Nein. In der Hälfte unserer Gruppen tanzt nie jemand — Wagenbau, Kostümwerkstatt, Technik & Foto, Elferrat. Und in der Garde fängt jede bei null an; die Choreo lernst du in acht Wochen.' },
  { q: 'Ich habe kaum Zeit.', a: 'Dann Werkstatt, Technik oder Elferrat. Der Wagenbau läuft samstags, du kommst wann du kannst. Nur die Auftrittsgruppen brauchen die wöchentliche Probe von September bis Februar.' },
  { q: 'Ich bin nicht aus Groß Furra.', a: 'Egal. Rund ein Drittel unserer Mitglieder wohnt in den Nachbardörfern oder in Sondershausen. Wohnort steht in keiner Satzung.' },
  { q: 'Was kostet mich das wirklich?', a: '30 € im Jahr für Erwachsene, 15 € bis 17 Jahre. Keine Aufnahmegebühr, keine Umlage, Kostüme stellt oder bezuschusst der Verein. Wer knapp bei Kasse ist, spricht mit dem Vorstand — wir finden eine Lösung, und das bleibt unter uns.' },
  { q: 'Kann mein Kind allein kommen?', a: 'Ab 12 ja. Beim ersten Mal bleibt bei den Kleinen gern ein Elternteil dabei — die meisten bleiben danach sowieso hängen und helfen mit.' },
  { q: 'Ein Jahr keine Zeit — muss ich kündigen?', a: 'Nein. Dann lässt du die Mitgliedschaft ruhen: du bleibst Mitglied, machst eine Session Pause und steigst danach wieder ein. Ein Satz an den Vorstand genügt.' },
  { q: 'Und wenn es mir nicht gefällt?', a: 'Dann war es ein netter Abend. Vorbeikommen verpflichtet zu nichts, und die Mitgliedschaft kannst du zum Ende der Session kündigen.' },
];
const JKONTAKT = [
  { n: 'Marlies Hoffmann', r: 'Präsidentin', k: '0170 55 44 21', tint: 'red' },
  { n: 'Katrin Roth', r: 'Trainerin Garden & Kinder', k: '0151 22 88 09', tint: 'gold' },
  { n: 'Sven Bauer', r: 'Geschäftsführer', k: 'sven@furria-grossfurra.de', tint: 'ink' },
];
const JSTATS = [['184', 'Mitglieder'], ['8', 'Gruppen'], ['55.', 'Session'], ['14', 'Neue 2026/27']];

// ── Findomat matching ───────────────────────────────────────────────────
const F_WER = [{ k: 'kind', t: 'Mein Kind', s: '6–11 Jahre' }, { k: 'jugend', t: 'Ein Jugendlicher', s: '12–17 Jahre' }, { k: 'ich', t: 'Ich selbst', s: 'ab 18 Jahre' }];
const F_LUST = [{ k: 'buehne', t: 'Auf die Bühne', s: 'Tanzen, Show, Auftritt' }, { k: 'buett', t: 'Ans Mikrofon', s: 'Bütt, Moderation, Elferrat' }, { k: 'werkstatt', t: 'Hinter die Kulissen', s: 'Bauen, Nähen, Technik' }, { k: 'dabei', t: 'Einfach dabei sein', s: 'Feiern, helfen, unterstützen' }];
const F_ZEIT = [{ k: 'woche', t: 'Jede Woche', s: 'Probe ist drin' }, { k: 'monat', t: 'Ab und zu', s: 'ein paar Termine im Monat' }, { k: 'session', t: 'Nur zur Session', s: 'November bis Februar' }];

function jMatch(wer, lust, zeit) {
  let prim, alt, art = wer === 'ich' ? 'Aktiv' : wer === 'jugend' ? 'Jugend' : 'Kind';
  if (wer === 'kind') { prim = 'kindergarde'; alt = lust === 'werkstatt' ? 'werkstatt' : 'jugendgarde'; }
  else if (wer === 'jugend') { prim = lust === 'werkstatt' ? 'technik' : 'jugendgarde'; alt = lust === 'werkstatt' ? 'werkstatt' : 'showtanz'; }
  else if (lust === 'buehne') { prim = 'tanzgarde'; alt = 'ballett'; }
  else if (lust === 'buett') { prim = 'elferrat'; alt = 'showtanz'; }
  else if (lust === 'werkstatt') { prim = 'werkstatt'; alt = 'technik'; }
  else { prim = 'werkstatt'; alt = 'elferrat'; }
  if (wer === 'ich' && zeit === 'session' && lust !== 'dabei') alt = 'werkstatt';
  const hint = zeit === 'woche'
    ? 'Wöchentlich? Perfekt — genau so läuft die Probe.'
    : zeit === 'monat'
      ? 'Ab und zu geht: hier bindet dich niemand an jeden Dienstag.'
      : 'Nur zur Session ist völlig okay — im Sommer ist bei uns eh Ruhe.';
  return { prim, alt, art, hint };
}

// ── shared bits ─────────────────────────────────────────────────────────
function JRule({ c, label, right, fg }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
      <div style={{ width: 14, height: 14, background: c.red, flexShrink: 0 }} />
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, letterSpacing: 1, color: fg || c.ink, flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1, height: 1.5, background: c.line }} />
      {right ? <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 1.4, color: fg ? 'rgba(251,244,230,0.62)' : c.sub, flexShrink: 0 }}>{right}</div> : null}
    </div>
  );
}

function JChip({ c, on, onClick, title, sub, small }) {
  return (
    <button onClick={onClick} style={{ textAlign: 'left', font: 'inherit', cursor: 'pointer', padding: small ? '9px 11px' : '12px 14px', border: on ? `2px solid ${c.red}` : `1.5px solid ${c.line}`, background: on ? c.red : c.paper, color: on ? c.onRed : c.ink, display: 'block', width: '100%' }}>
      <div style={{ fontWeight: 900, fontSize: small ? 12.5 : 14.5, lineHeight: 1.15 }}>{title}</div>
      {sub ? <div style={{ fontWeight: 600, fontSize: small ? 10.5 : 11.5, marginTop: 3, color: on ? 'rgba(255,255,255,0.8)' : c.sub }}>{sub}</div> : null}
    </button>
  );
}

function JBtn({ c, children, ghost, onClick, fs = 15, shadow }) {
  return (
    <button onClick={onClick} style={{ border: ghost ? `2px solid ${c.ink}` : 'none', background: ghost ? 'transparent' : c.red, color: ghost ? c.ink : c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: fs, padding: `${Math.round(fs * 0.95)}px ${Math.round(fs * 1.7)}px`, cursor: 'pointer', boxShadow: shadow ? jHard(c, 5, c.ink) : 'none' }}>{children}</button>
  );
}

// ── FINDOMAT ────────────────────────────────────────────────────────────
function Findomat({ c, small, go, hero }) {
  const [wer, setWer] = React.useState(null), [lust, setLust] = React.useState(null), [zeit, setZeit] = React.useState(null);
  const step = !wer ? 0 : !lust ? 1 : !zeit ? 2 : 3;
  const res = step === 3 ? jMatch(wer, lust, zeit) : null;
  const g = res ? JGRUPPEN[res.prim] : null, ga = res ? JGRUPPEN[res.alt] : null;
  const term = res ? (JTERMINE.find((t) => t.g === res.prim) || JTERMINE[0]) : null;
  const opts = step === 0 ? F_WER : step === 1 ? F_LUST : F_ZEIT;
  const frage = step === 0 ? 'Wer möchte mitmachen?' : step === 1 ? 'Was reizt dich am meisten?' : 'Wie viel Zeit hast du?';
  const set = step === 0 ? setWer : step === 1 ? setLust : setZeit;
  const pad = small ? 16 : 26;
  const p = jPanel(c);
  return (
    <div style={{ border: `2px solid ${c.ink}`, background: c.paper, boxShadow: hero ? jHard(c, small ? 8 : 12, c.red) : 'none' }}>
      <div style={{ background: p.bg, color: p.fg, padding: `${small ? 11 : 14}px ${pad}px`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: small ? 9 : 10.5, letterSpacing: 1.8, color: c.red }}>FINDOMAT</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 19 : 24, lineHeight: 1.05, marginTop: 2 }}>WO PASSE ICH HIN?</div>
        </div>
        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: small ? 22 : 30, height: 5, background: i < step ? c.red : 'rgba(251,244,230,0.28)' }} />)}
        </div>
      </div>
      {step < 3 ? (
        <div style={{ padding: pad }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 15 : 18, color: c.red }}>{step + 1}/3</span>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 20 : 27, lineHeight: 1.05 }}>{frage}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr 1fr' : (opts.length === 4 ? '1fr 1fr' : '1fr 1fr 1fr'), gap: 10, marginTop: small ? 14 : 18 }}>
            {opts.map((o) => <JChip key={o.k} c={c} title={o.t} sub={o.s} small={small} onClick={() => set(o.k)} />)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: small ? 12 : 16, paddingTop: small ? 10 : 14, borderTop: `1.5px solid ${c.line}` }}>
            <span style={{ fontWeight: 600, fontSize: small ? 10.5 : 12, color: c.sub }}>Drei Fragen, kein Formular, keine Mail-Adresse.</span>
            {step > 0 ? <button onClick={() => (step === 1 ? setWer(null) : setLust(null))} style={{ border: 'none', background: 'transparent', color: c.red, fontWeight: 800, fontSize: small ? 11.5 : 13, cursor: 'pointer', padding: 0 }}>← zurück</button> : null}
          </div>
        </div>
      ) : (
        <div style={{ padding: pad }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: c.red, color: c.onRed, fontWeight: 900, fontSize: small ? 9.5 : 11, letterSpacing: 1.4, padding: '5px 10px' }}>DEIN PLATZ</span>
            <span style={{ fontWeight: 700, fontSize: small ? 11 : 12.5, color: c.sub }}>Empfehlung · Mitgliedschaft {res.art}</span>
          </div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 28 : 40, lineHeight: 0.98, margin: small ? '10px 0 0' : '12px 0 0' }}>{g.name.toUpperCase()}</div>
          <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 1fr', gap: small ? 6 : 10, marginTop: 12, paddingTop: 12, borderTop: `1.5px solid ${c.line}` }}>
            {[['Alter', g.alter], ['Probe', g.zeit], ['Ort', g.ort], ['Ansprechpartnerin', g.ansprech]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
                <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.2, color: c.sub, minWidth: small ? 96 : 118, flexShrink: 0 }}>{k.toUpperCase()}</span>
                <span style={{ fontWeight: 700, fontSize: small ? 12.5 : 14 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: c.bg, border: `1.5px solid ${c.line}`, padding: small ? '10px 12px' : '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 16 : 19, color: c.red }}>{term.tag} {term.d} {term.m}</span>
            <span style={{ fontWeight: 700, fontSize: small ? 11.5 : 13 }}>nächster offener Termin · {g.frei}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: small ? 11.5 : 13, color: c.sub, marginTop: 10, lineHeight: 1.5 }}>{res.hint} Zweite Möglichkeit: <b style={{ color: c.ink }}>{ga.name}</b> ({ga.zeit}).</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <JBtn c={c} fs={small ? 13 : 15} onClick={() => go && go('antrag')}>Antrag stellen →</JBtn>
            <JBtn c={c} ghost fs={small ? 13 : 15}>Termin merken</JBtn>
            <button onClick={() => { setWer(null); setLust(null); setZeit(null); }} style={{ border: 'none', background: 'transparent', color: c.sub, fontWeight: 800, fontSize: small ? 11.5 : 13, cursor: 'pointer' }}>nochmal</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── BEITRAGS-RECHNER ────────────────────────────────────────────────────
function Rechner({ c, small }) {
  const [erw, setErw] = React.useState(1), [kin, setKin] = React.useState(0);
  const total = erw * 30 + kin * 15;
  const p = jPanel(c);
  const step = (label, v, set, sub) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: small ? '10px 0' : '12px 0', borderBottom: `1.5px solid ${c.line}` }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: small ? 13 : 14.5 }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: small ? 10.5 : 11.5, color: c.sub, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <button onClick={() => set(Math.max(0, v - 1))} style={{ width: 34, height: 34, border: `1.5px solid ${c.line}`, background: c.paper, color: c.ink, fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>–</button>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, minWidth: 22, textAlign: 'center' }}>{v}</span>
        <button onClick={() => set(v + 1)} style={{ width: 34, height: 34, border: `1.5px solid ${c.line}`, background: c.paper, color: c.ink, fontSize: 18, fontWeight: 900, cursor: 'pointer' }}>+</button>
      </div>
    </div>
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 340px', gap: small ? 16 : 26, alignItems: 'start' }}>
      <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: small ? '4px 16px 16px' : '6px 22px 20px' }}>
        {step('Erwachsene', erw, setErw, '30 € im Jahr, ab 18')}
        {step('Kinder & Jugendliche', kin, setKin, '15 € im Jahr, bis 17')}
        <div style={{ paddingTop: small ? 12 : 14, fontWeight: 600, fontSize: small ? 11.5 : 12.5, color: c.sub, lineHeight: 1.5 }}>Ein Beitrag pro Person, unabhängig davon, in wie vielen Gruppen du mitmachst. Wer eine Session Pause braucht, lässt die Mitgliedschaft ruhen.</div>
      </div>
      <div style={{ background: p.bg, color: p.fg, padding: small ? '18px 16px' : '22px 24px' }}>
        <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.8, color: c.red }}>EUER BEITRAG</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 52 : 62, lineHeight: 0.9 }}>{total} €</span>
          <span style={{ fontWeight: 800, fontSize: 13, color: 'rgba(251,244,230,0.62)' }}>/ Jahr</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(251,244,230,0.72)', marginTop: 6 }}>das sind {(total / 12).toFixed(2).replace('.', ',')} € im Monat</div>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(251,244,230,0.18)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {['Keine Aufnahmegebühr', 'Training & Trainer inklusive', 'Kostüme gestellt oder bezuschusst', 'Zahlung später in der Club-App'].map((t) => (
            <div key={t} style={{ display: 'flex', gap: 8, alignItems: 'baseline', fontWeight: 700, fontSize: 12.5 }}><span style={{ color: c.red }}>✓</span>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── VEREINS-TICKET: everything you need to decide, on one ticket ────────
// The one bold Plakat object in its section. Stub carries the joke, body the facts.
function JTicket({ c, small, go }) {
  const bars = Array.from({ length: 26 }).map((_, i) => (i * 7 % 5 < 2 ? 4 : i % 3 === 0 ? 3 : 1.5));
  const zeile = (k, v, strong) => (
    <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: small ? '7px 0' : '8px 0', borderTop: `1px solid rgba(26,20,17,0.22)` }}>
      <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.2, minWidth: small ? 104 : 132, flexShrink: 0, color: 'rgba(26,20,17,0.66)' }}>{k}</span>
      <span style={{ fontWeight: strong ? 900 : 700, fontSize: strong ? (small ? 15 : 17) : (small ? 12 : 13.5), lineHeight: 1.4 }}>{v}</span>
    </div>
  );
  return (
    <div style={{ border: `2px solid ${J_INK}`, background: c.gold, color: J_INK, boxShadow: jHard(c, small ? 7 : 10, c.ink), display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 196px', position: 'relative' }}>
      <div style={{ padding: small ? '16px 16px 18px' : '22px 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 11, letterSpacing: 1.8 }}>EINTRITTSKARTE · SESSION 2026/27</div>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.2, color: 'rgba(26,20,17,0.6)' }}>NR. 185</div>
        </div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 30 : 40, lineHeight: 0.95, marginTop: 8 }}>DEIN TICKET<br />IN DEN FCC</div>
        <div style={{ fontWeight: 700, fontSize: small ? 12 : 13.5, marginTop: 9, lineHeight: 1.5, maxWidth: 430 }}>Eine Karte, alles drauf: was es kostet, was du bekommst, was wir von dir erwarten. Mehr Kleingedrucktes gibt es nicht.</div>
        <div style={{ marginTop: small ? 12 : 16 }}>
          {zeile('BEITRAG', '30 € im Jahr · bis 17 Jahre 15 €', true)}
          {zeile('DRIN', 'Training bei allen Trainern · Kostüm gestellt oder bezuschusst · Ordensfest & Orden · Club-App mit Terminen, Beitrag und Fotos')}
          {zeile('ERWARTET', 'Probe von September bis Februar (nur Auftrittsgruppen) · beim Aufbau mit anfassen · gute Laune')}
          {zeile('AUSSTIEG', 'Kündigung zum Ende der Session. Ein Jahr keine Zeit? Mitgliedschaft ruht, statt zu kündigen.')}
        </div>
        <div style={{ marginTop: small ? 12 : 14, paddingTop: small ? 10 : 12, borderTop: `2px dashed rgba(26,20,17,0.3)`, display: 'flex', flexWrap: 'wrap', gap: small ? 8 : 12 }}>
          {['Keine Aufnahmegebühr', 'Keine Mindestlaufzeit', 'Kein Vorsingen'].map((t) => (
            <span key={t} style={{ fontWeight: 900, fontSize: small ? 10.5 : 11.5, letterSpacing: 0.4, border: `1.5px solid rgba(26,20,17,0.35)`, padding: small ? '5px 8px' : '6px 10px' }}>{t}</span>
          ))}
        </div>
      </div>
      <div style={{ borderLeft: small ? 'none' : `2px dashed ${J_INK}`, borderTop: small ? `2px dashed ${J_INK}` : 'none', background: 'rgba(26,20,17,0.06)', padding: small ? '14px 16px 16px' : '20px 18px 20px', display: 'flex', flexDirection: 'column', gap: small ? 12 : 14, justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.8, color: 'rgba(26,20,17,0.6)' }}>ABRISS</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 30 : 34, lineHeight: 0.92, marginTop: 4 }}>FURRIA</div>
          <div style={{ display: 'flex', flexDirection: small ? 'row' : 'column', gap: small ? 18 : 9, marginTop: small ? 10 : 14, flexWrap: 'wrap' }}>
            {[['REIHE', 'MITTENDRIN'], ['PLATZ', 'DEINER'], ['GÜLTIG', 'LEBENSLANG']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontWeight: 900, fontSize: 8.5, letterSpacing: 1.4, color: 'rgba(26,20,17,0.6)' }}>{k}</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 15 : 17, lineHeight: 1, marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: small ? 32 : 38 }}>
            {bars.map((w, i) => <div key={i} style={{ width: w, height: '100%', background: J_INK }} />)}
          </div>
          <div style={{ fontWeight: 900, fontSize: 9, letterSpacing: 1.2, marginTop: 6, color: 'rgba(26,20,17,0.66)' }}>MITGLIED NR. 185</div>
          <button onClick={() => go && go('antrag')} style={{ width: '100%', marginTop: 12, border: 'none', background: J_INK, color: J_CREAM, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 13 : 14, padding: '13px 14px', cursor: 'pointer' }}>Einlösen →</button>
        </div>
      </div>
    </div>
  );
}

// ── DESKTOP · INDEX ─────────────────────────────────────────────────────
function JoinIndexDesktop({ c, go }) {
  const p = jPanel(c);
  const [faq, setFaq] = React.useState(0);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />

      {/* HERO — fear removal left, Findomat right (the one hard-shadow object) */}
      <div style={{ padding: '46px 64px 0', display: 'grid', gridTemplateColumns: '1fr 486px', gap: 54, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 3, color: c.red }}>MITGLIED WERDEN · SESSION 2026/27</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 86, lineHeight: 0.86, letterSpacing: 0.4, margin: '16px 0 0' }}>DU MUSST NICHT<br />TANZEN KÖNNEN.</h1>
          <p style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.55, color: c.sub, margin: '20px 0 0', maxWidth: 540, textWrap: 'pretty' }}>
            Nur Lust haben. Bei uns tanzen 61 Leute, und 123 tun etwas völlig anderes: Wagen bauen, nähen, Licht fahren, Bier zapfen, im Elferrat sitzen. Für fast jede Lust gibt es einen Platz — und der erste Schritt kostet nichts.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 26, flexWrap: 'wrap' }}>
            <JBtn c={c} fs={17} onClick={() => go('antrag')} shadow>Antrag stellen · 2 Minuten</JBtn>
            <JBtn c={c} ghost fs={17}>Erst mal vorbeikommen</JBtn>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,auto)', gap: 34, marginTop: 40, paddingTop: 22, borderTop: `1.5px solid ${c.line}`, justifyContent: 'start' }}>
            {JSTATS.map(([n, t]) => (
              <div key={t}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 0.9 }}>{n}</div>
                <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1.4, color: c.sub, marginTop: 5 }}>{t.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <Findomat c={c} go={go} hero />
      </div>

      {/* VORBEIKOMMEN */}
      <div style={{ padding: '64px 64px 0' }}>
        <JRule c={c} label="ERST VORBEIKOMMEN, DANN ENTSCHEIDEN" right="NÄCHSTE OFFENE TERMINE" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {JTERMINE.map((t, i) => {
              const g = JGRUPPEN[t.g];
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '76px 1fr auto', gap: 18, alignItems: 'center', padding: '16px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                  <div style={{ textAlign: 'center', border: `1.5px solid ${c.line}`, background: c.paper, padding: '8px 0' }}>
                    <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.2, color: c.red }}>{t.tag.toUpperCase()}</div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, lineHeight: 0.95 }}>{t.d}</div>
                    <div style={{ fontWeight: 800, fontSize: 9.5, letterSpacing: 1, color: c.sub }}>{t.m}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, lineHeight: 1 }}>{g.name}</div>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: c.sub, marginTop: 5 }}>{g.zeit} · {g.ort} · {g.alter} · {g.ansprech}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    <span style={{ background: c.bg, border: `1.5px solid ${c.line}`, fontWeight: 900, fontSize: 11, letterSpacing: 0.6, padding: '6px 10px', color: c.sub }}>{t.frei} PLÄTZE</span>
                    <span style={{ fontWeight: 900, fontSize: 14, color: c.red }}>Mitmachen →</span>
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 16, fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.55, textWrap: 'pretty' }}>
              Anmeldung ist nett, aber nicht nötig — Trainingskleidung reicht. Alle Gruppen und Zeiten stehen unter <a href="#">Verein → Gruppen</a>.
            </div>
          </div>
          <JTicket c={c} go={go} />
        </div>
      </div>

      {/* WEG */}
      <div style={{ padding: '64px 64px 0' }}>
        <JRule c={c} label="SO WIRD MAN MITGLIED" right="VIER SCHRITTE" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: `1.5px solid ${c.line}`, background: c.paper }}>
          {JWEG.map((s, i) => (
            <div key={s.n} style={{ padding: '24px 22px 26px', borderLeft: i ? `1.5px solid ${c.line}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.9, color: c.red }}>{s.n}</span>
                <span style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.2, color: c.sub }}>{s.z.toUpperCase()}</span>
              </div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 25, lineHeight: 1, marginTop: 14 }}>{s.t}</div>
              <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.55, color: c.sub, marginTop: 9, textWrap: 'pretty' }}>{s.d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KOSTEN */}
      <div style={{ padding: '64px 64px 0' }}>
        <JRule c={c} label="WAS ES KOSTET" right="ZWEI BEITRÄGE, SONST NICHTS" />
        <Rechner c={c} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 26 }}>
          {JARTEN.map((a) => (
            <div key={a.t} style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '18px 18px 20px' }}>
              <div style={{ height: 5, background: jTint(c, a.tint), marginBottom: 14 }} />
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 23, lineHeight: 1 }}>{a.t}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, color: c.red, lineHeight: 0.9 }}>{a.p}</span>
                <span style={{ fontWeight: 800, fontSize: 11.5, color: c.sub }}>{a.s}</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.55, color: c.sub, marginTop: 10, textWrap: 'pretty' }}>{a.d}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, borderTop: `1.5px solid ${c.line}`, paddingTop: 16, fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.55, maxWidth: 860, textWrap: 'pretty' }}>
          Die Ehrenmitgliedschaft verleiht die Mitgliederversammlung — dafür bewirbt man sich nicht. Und wer eine Session Pause braucht, lässt die Mitgliedschaft ruhen, statt zu kündigen.
        </div>
      </div>

      {/* FAQ */}
      <div style={{ padding: '64px 64px 0' }}>
        <JRule c={c} label="EHRLICH GESAGT" right="DIE FRAGEN, DIE KEINER STELLT" />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 34, alignItems: 'start' }}>
          <div>
            {JFAQ.map((f, i) => (
              <div key={i} style={{ borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                <button onClick={() => setFaq(faq === i ? -1 : i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', background: 'transparent', border: 'none', padding: '16px 2px', cursor: 'pointer' }}>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, lineHeight: 1.1 }}>{f.q}</span>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: c.red, width: 18, textAlign: 'center', flexShrink: 0 }}>{faq === i ? '–' : '+'}</span>
                </button>
                {faq === i ? <div style={{ fontWeight: 600, fontSize: 14.5, lineHeight: 1.6, color: c.sub, padding: '0 2px 18px', maxWidth: 520, textWrap: 'pretty' }}>{f.a}</div> : null}
              </div>
            ))}
          </div>
          <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '22px 24px 24px' }}>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.8, color: c.red }}>LIEBER KURZ FRAGEN?</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 1, marginTop: 8 }}>DIE DREI SAGEN DIR ALLES</div>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: 16 }}>
              {JKONTAKT.map((k, i) => (
                <div key={k.n} style={{ display: 'grid', gridTemplateColumns: '58px 1fr auto', gap: 14, alignItems: 'center', padding: '13px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                  <window.KKPlh h={58} label="" c={c} tint={jTint(c, k.tint)} />
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 14.5 }}>{k.n}</div>
                    <div style={{ fontWeight: 700, fontSize: 11.5, color: c.sub, marginTop: 2 }}>{k.r}</div>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 12.5, color: c.red, whiteSpace: 'nowrap' }}>{k.k}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: `1.5px solid ${c.line}`, marginTop: 6, paddingTop: 14, fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.5 }}>WhatsApp geht auch. Wir antworten meistens am selben Abend — nach dem Training.</div>
          </div>
        </div>
      </div>

      {/* HELFEN statt Mitglied */}
      <div style={{ padding: '56px 64px 0' }}>
        <div style={{ border: `2px solid ${c.ink}`, background: c.bg, padding: '26px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.8, color: c.red }}>KEINE MITGLIEDSCHAFT, TROTZDEM DABEI</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, lineHeight: 1, marginTop: 8 }}>NUR HELFEN GEHT AUCH</div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: c.sub, marginTop: 8, maxWidth: 620, lineHeight: 1.55 }}>Theke, Einlass, Aufbau, Wagenbau-Wochenende: trag dich in die Helfer-Liste ein, wir melden uns nur, wenn es passt. Kein Beitrag, keine Verpflichtung.</div>
          </div>
          <JBtn c={c} ghost fs={15}>Helfer-Liste →</JBtn>
        </div>
      </div>

      {/* SCHLUSS-BAND */}
      <div style={{ background: p.bg, color: p.fg, padding: '44px 64px', marginTop: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>ZWEI MINUTEN, DANN IST ES ERLEDIGT</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 44, lineHeight: 0.95, marginTop: 8 }}>WERDE MITGLIED IM FCC</div>
          <div style={{ fontWeight: 600, fontSize: 14, color: p.sub, marginTop: 10, maxWidth: 620, lineHeight: 1.55 }}>Der Antrag geht direkt an den Vorstand. Nichts wird abgebucht, nichts ist bindend, bis wir dich aufgenommen haben.</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <button onClick={() => go('antrag')} style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 17, padding: '18px 30px', cursor: 'pointer', boxShadow: jHard(c, 6, p.fg) }}>Antrag stellen →</button>
        </div>
      </div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── ANTRAG (form) ───────────────────────────────────────────────────────
function JField({ c, label, value, set, ph, small, wide }) {
  return (
    <label style={{ display: 'block', gridColumn: wide ? '1 / -1' : 'auto' }}>
      <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.3, color: c.sub }}>{label.toUpperCase()}</div>
      <input value={value} placeholder={ph} onChange={(e) => set(e.target.value)} style={{ width: '100%', marginTop: 6, border: `1.5px solid ${c.line}`, background: c.paper, color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: small ? 14 : 15, padding: small ? '11px 12px' : '13px 14px', outline: 'none' }} />
    </label>
  );
}

function useAntrag() {
  const [f, setF] = React.useState({ vor: 'Lena', nach: 'Brandt', geb: '14.03.1994', ort: 'Groß Furra', mail: 'lena.brandt@web.de', tel: '0170 88 21 04', art: 'Aktiv', gruppe: 'tanzgarde', ok: true, elt: '', eltTel: '' });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  return [f, set, setF];
}

function AntragForm({ c, f, set, setF, small }) {
  const minor = f.art === 'Jugend' || f.art === 'Kind';
  const grpKeys = Object.keys(JGRUPPEN);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: small ? 22 : 30 }}>
      <div>
        <JRule c={c} label="01 · WER BIST DU" />
        <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 1fr', gap: 14 }}>
          <JField c={c} small={small} label="Vorname" value={f.vor} set={set('vor')} />
          <JField c={c} small={small} label="Nachname" value={f.nach} set={set('nach')} />
          <JField c={c} small={small} label="Geburtsdatum" value={f.geb} set={set('geb')} ph="TT.MM.JJJJ" />
          <JField c={c} small={small} label="Wohnort" value={f.ort} set={set('ort')} />
          <JField c={c} small={small} label="E-Mail" value={f.mail} set={set('mail')} />
          <JField c={c} small={small} label="Handy (für Gruppen-Chat)" value={f.tel} set={set('tel')} />
        </div>
        <div style={{ fontWeight: 600, fontSize: small ? 11 : 12.5, color: c.sub, marginTop: 10, lineHeight: 1.5 }}>Keine E-Mail? Kein Problem — Handynummer genügt, den Zugang zur Club-App bekommst du dann als Zettel mit Code.</div>
      </div>

      <div>
        <JRule c={c} label="02 · WELCHE MITGLIEDSCHAFT" />
        <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : 'repeat(3,1fr)', gap: 10 }}>
          {['Aktiv', 'Jugend', 'Kind'].map((a) => (
            <JChip key={a} c={c} small={small} on={f.art === a} onClick={() => set('art')(a)} title={a === 'Aktiv' ? 'Aktiv' : a === 'Jugend' ? 'Jugend' : 'Kind'} sub={a === 'Aktiv' ? '30 € im Jahr · ab 18' : a === 'Jugend' ? '15 € im Jahr · 12–17' : '15 € im Jahr · 6–11'} />
          ))}
        </div>
        <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.3, color: c.sub, margin: '18px 0 8px' }}>GEWÜNSCHTE GRUPPE · AUS DEM FINDOMAT ÜBERNOMMEN</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {grpKeys.map((k) => {
            const on = f.gruppe === k;
            return <button key={k} onClick={() => set('gruppe')(k)} style={{ border: on ? `2px solid ${c.red}` : `1.5px solid ${c.line}`, background: on ? c.red : c.paper, color: on ? c.onRed : c.ink, fontWeight: 800, fontSize: small ? 11.5 : 13, padding: small ? '8px 11px' : '10px 13px', cursor: 'pointer' }}>{JGRUPPEN[k].name}</button>;
          })}
        </div>
        <div style={{ fontWeight: 600, fontSize: small ? 11 : 12.5, color: c.sub, marginTop: 10, lineHeight: 1.5 }}>Noch unsicher? Lass es leer — der Vorstand ruft an und sortiert das mit dir.</div>
      </div>

      {minor ? (
        <div style={{ border: `2px solid ${c.gold}`, background: c.paper, padding: small ? 16 : 20 }}>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.4, color: c.ink }}>03 · WEIL DAS MITGLIED UNTER 18 IST</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 20 : 24, lineHeight: 1.05, marginTop: 6 }}>EIN ELTERNTEIL MUSS ZUSTIMMEN</div>
          <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 1fr', gap: 14, marginTop: 14 }}>
            <JField c={c} small={small} label="Name Mutter / Vater" value={f.elt} set={set('elt')} ph="Vor- und Nachname" />
            <JField c={c} small={small} label="Handy der Eltern" value={f.eltTel} set={set('eltTel')} ph="für die Bestätigung" />
          </div>
          <div style={{ fontWeight: 600, fontSize: small ? 11 : 12.5, color: c.sub, marginTop: 10, lineHeight: 1.5 }}>Ihr bekommt eine SMS mit einem Bestätigungs-Link — ein Tipp, fertig. Kein Ausdruck, keine Unterschrift.</div>
        </div>
      ) : null}

      <div>
        <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
          <span onClick={() => setF((s) => ({ ...s, ok: !s.ok }))} style={{ width: 24, height: 24, border: `2px solid ${f.ok ? c.red : c.line}`, background: f.ok ? c.red : c.paper, color: c.onRed, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 14, flexShrink: 0, marginTop: 2 }}>{f.ok ? '✓' : ''}</span>
          <span style={{ fontWeight: 600, fontSize: small ? 12 : 13.5, lineHeight: 1.55, color: c.sub }}>Ich habe <a href="#">Satzung</a> und <a href="#">Datenschutzhinweise</a> gelesen und bin damit einverstanden — darin steht auch, dass bei Auftritten und Umzügen fotografiert wird und ausgewählte Bilder auf der Website, auf Instagram und in der Club-App erscheinen. Der Beitrag wird jährlich fällig, bezahlt wird in der Club-App per Karte, PayPal oder bar bei der Finanzwartin. <b style={{ color: c.ink }}>Jetzt wird nichts abgebucht.</b></span>
        </label>
      </div>
    </div>
  );
}

function AntragSummary({ c, f, go, small }) {
  const preis = f.art === 'Aktiv' ? '30 €' : '15 €';
  const g = JGRUPPEN[f.gruppe];
  const p = jPanel(c);
  const row = (k, v) => (
    <div key={k} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '9px 0', borderTop: '1px solid rgba(251,244,230,0.16)' }}>
      <span style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.2, color: 'rgba(251,244,230,0.6)', minWidth: 92, flexShrink: 0 }}>{k}</span>
      <span style={{ fontWeight: 800, fontSize: 13.5, color: J_CREAM }}>{v}</span>
    </div>
  );
  return (
    <div style={{ background: p.bg, color: p.fg, padding: small ? '18px 16px 20px' : '24px 24px 26px' }}>
      <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.8, color: c.red }}>DEIN ANTRAG</div>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 30 : 36, lineHeight: 0.98, marginTop: 8 }}>{(f.vor + ' ' + f.nach).toUpperCase() || 'NOCH LEER'}</div>
      <div style={{ marginTop: 14 }}>
        {row('MITGLIEDSCHAFT', f.art)}
        {row('GRUPPE', g ? g.name : 'offen')}
        {row('BEITRAG', preis + ' im Jahr')}
        {row('FÄLLIG JETZT', '0 €')}
      </div>
      <button onClick={() => go('fertig')} style={{ width: '100%', marginTop: 18, border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 15 : 16.5, padding: '16px 20px', cursor: 'pointer', opacity: f.ok ? 1 : 0.45 }}>Antrag absenden →</button>
      <div style={{ fontWeight: 600, fontSize: 11.5, color: 'rgba(251,244,230,0.62)', marginTop: 12, lineHeight: 1.5 }}>Geht direkt an den Vorstand. Du bekommst eine Kopie per Mail.</div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(251,244,230,0.16)', fontWeight: 700, fontSize: 12, color: 'rgba(251,244,230,0.72)' }}>Lieber auf Papier? <a href="#" style={{ color: c.red }}>Antrag als PDF drucken</a> und beim Training abgeben.</div>
    </div>
  );
}

function JoinAntragDesktop({ c, go }) {
  const [f, set, setF] = useAntrag();
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '34px 64px 0' }}>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: 0, cursor: 'pointer' }}>← Mitglied werden</button>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, marginTop: 20 }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 2.4, color: c.red }}>BEITRITTSANTRAG · SESSION 2026/27</div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 66, lineHeight: 0.9, margin: '12px 0 0' }}>ZWEI MINUTEN,<br />DANN GEHÖRST DU DAZU</h1>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0, paddingBottom: 6 }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.9, color: c.red }}>0 €</div>
            <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 1.4, color: c.sub, marginTop: 4 }}>JETZT FÄLLIG</div>
          </div>
        </div>
        <div style={{ height: 3, background: c.ink, margin: '24px 0 0' }} />
      </div>
      <div style={{ padding: '32px 64px 0', display: 'grid', gridTemplateColumns: '1fr 400px', gap: 44, alignItems: 'start' }}>
        <AntragForm c={c} f={f} set={set} setF={setF} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <AntragSummary c={c} f={f} go={go} />
          <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '18px 20px 20px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.6, color: c.red }}>WAS DANACH PASSIERT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              {[['Heute', 'Bestätigung per Mail, Vorstand bekommt den Antrag.'], ['3. September', 'Aufnahme in der Vorstandssitzung.'], ['Danach', 'Einladung in die Club-App + erster Beitrag.']].map(([a, b]) => (
                <div key={a} style={{ display: 'grid', gridTemplateColumns: '92px 1fr', gap: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: 11.5, color: c.ink }}>{a}</span>
                  <span style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.45 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: '46px 64px 0' }}><div style={{ height: 1.5, background: c.line }} /></div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── FERTIG (danke) ──────────────────────────────────────────────────────
function JoinFertigDesktop({ c, go }) {
  const p = jPanel(c);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '52px 64px 0', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 50, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 3, color: c.red }}>ANTRAG IST DA · 29. JULI 2026, 20:14 UHR</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 82, lineHeight: 0.88, margin: '16px 0 0' }}>WILLKOMMEN,<br />LENA.</h1>
          <p style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.55, color: c.sub, margin: '20px 0 0', maxWidth: 620, textWrap: 'pretty' }}>
            Dein Antrag liegt beim Vorstand. Bis zur Aufnahme musst du nichts tun — zum Training darfst du trotzdem schon kommen, und zwar so oft du magst.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0, border: `1.5px solid ${c.line}`, background: c.paper, marginTop: 30 }}>
            {[['01', 'Bestätigung unterwegs', 'Eine Mail an lena.brandt@web.de ist raus — mit deinem Antrag als PDF.'], ['02', 'Vorstandssitzung 3. September', 'Wir nehmen dich auf und melden uns am Tag danach.'], ['03', 'Club-App', 'Dann kommt dein Einladungslink: Termine, Beitrag, Bierliste, Fotos.']].map(([n, t, d], i) => (
              <div key={n} style={{ padding: '22px 20px 24px', borderLeft: i ? `1.5px solid ${c.line}` : 'none' }}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, color: c.red, lineHeight: 0.9 }}>{n}</div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, lineHeight: 1.05, marginTop: 12 }}>{t}</div>
                <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.55, color: c.sub, marginTop: 8, textWrap: 'pretty' }}>{d}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 30 }}>
            <JRule c={c} label="BIS DAHIN: KOMM EINFACH VORBEI" right="DEINE GRUPPE" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center', border: `2px solid ${c.ink}`, background: c.paper, padding: '20px 22px', boxShadow: jHard(c, 8, c.red) }}>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, lineHeight: 1 }}>TANZGARDE · DI 19:30</div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: c.sub, marginTop: 7 }}>Sporthalle Groß Furra · Nadine Kühn erwartet dich am Eingang · Turnschuhe reichen</div>
              </div>
              <JBtn c={c} fs={15}>Zum Kalender →</JBtn>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <window.KKSeal c={c} size={230} rot={-7} />
          <div style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '18px 18px 20px', marginTop: 14 }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.6, color: c.red }}>SCHON MAL VORMERKEN</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {[['11.11.', 'Sessionseröffnung, 19:11 Uhr'], ['05.12.', 'Ordensfest'], ['20.02.', 'Prunksitzung']].map(([d, t]) => (
                <div key={d} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10, alignItems: 'baseline' }}>
                  <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, color: c.red }}>{d}</span>
                  <span style={{ fontWeight: 700, fontSize: 12.5, lineHeight: 1.4 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: p.bg, color: p.fg, padding: '34px 64px', marginTop: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>ETWAS FALSCH EINGETRAGEN?</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, lineHeight: 0.95, marginTop: 8 }}>SCHREIB SVEN, DAS IST SCHNELL GEÄNDERT</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
          <button onClick={() => go('index')} style={{ border: `2px solid ${p.fg}`, background: 'transparent', color: p.fg, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15, padding: '14px 24px', cursor: 'pointer' }}>Zur Startseite</button>
          <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15, padding: '15px 26px', cursor: 'pointer' }}>sven@furria… →</button>
        </div>
      </div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── MOBILE ──────────────────────────────────────────────────────────────
function JMobBar({ c, label = 'MITMACHEN' }) {
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

function JMobShell({ c, label, children, cta, go, dark }) {
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={dark ? J_CREAM : c.ink} />
      <JMobBar c={c} label={label} />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', color: c.ink, fontFamily: 'Archivo, sans-serif' }}>{children}</div>
      {cta ? (
        <div style={{ flexShrink: 0, borderTop: `1.5px solid ${c.line}`, background: c.paper, color: c.ink, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cta.t}</div>
            <div style={{ fontWeight: 600, fontSize: 10.5, color: c.sub }}>{cta.s}</div>
          </div>
          <button onClick={cta.onClick} style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13.5, padding: '13px 18px', cursor: 'pointer', flexShrink: 0 }}>{cta.b}</button>
        </div>
      ) : null}
      <window.HomeIndicator color={dark ? J_CREAM : c.ink} />
    </window.PhoneFrame>
  );
}

function JoinIndexMobile({ c, go }) {
  const p = jPanel(c);
  const [faq, setFaq] = React.useState(0);
  return (
    <JMobShell c={c} label="MITMACHEN" cta={{ t: 'Beitrittsantrag', s: '2 Minuten · 0 € jetzt fällig', b: 'Antrag →', onClick: () => go('antrag') }}>
      <div style={{ padding: '20px 20px 0' }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: c.red }}>MITGLIED WERDEN · 2026/27</div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 42, lineHeight: 0.88, margin: '9px 0 0' }}>DU MUSST NICHT TANZEN KÖNNEN.</h1>
        <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '10px 0 0' }}>Bei uns tanzen 61 Leute — und 123 tun etwas anderes: bauen, nähen, Licht fahren, im Elferrat sitzen.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, marginTop: 16, paddingTop: 14, borderTop: `1.5px solid ${c.line}` }}>
          {JSTATS.map(([n, t]) => (
            <div key={t}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, lineHeight: 0.9 }}>{n}</div>
              <div style={{ fontWeight: 800, fontSize: 8.5, letterSpacing: 0.8, color: c.sub, marginTop: 4 }}>{t.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 20px 0' }}><Findomat c={c} small go={go} hero /></div>
      <div style={{ padding: '26px 20px 0' }}>
        <JRule c={c} label="ERST VORBEIKOMMEN" right="DIESE WOCHE" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {JTERMINE.map((t, i) => {
            const g = JGRUPPEN[t.g];
            return (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto', gap: 12, alignItems: 'center', padding: '12px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                <div style={{ textAlign: 'center', border: `1.5px solid ${c.line}`, background: c.paper, padding: '5px 0' }}>
                  <div style={{ fontWeight: 900, fontSize: 8.5, color: c.red }}>{t.tag.toUpperCase()}</div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, lineHeight: 1 }}>{t.d}</div>
                  <div style={{ fontWeight: 800, fontSize: 8, color: c.sub }}>{t.m}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, lineHeight: 1 }}>{g.name}</div>
                  <div style={{ fontWeight: 700, fontSize: 10.5, color: c.sub, marginTop: 4 }}>{g.zeit.split('–')[0]} · {g.alter}</div>
                </div>
                <span style={{ fontWeight: 900, fontSize: 12, color: c.red, flexShrink: 0 }}>{t.frei} frei →</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ padding: '22px 20px 0' }}><JTicket c={c} small go={go} /></div>
      <div style={{ padding: '26px 20px 0' }}>
        <JRule c={c} label="SO WIRD MAN MITGLIED" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {JWEG.map((s, i) => (
            <div key={s.n} style={{ display: 'grid', gridTemplateColumns: '40px 1fr', gap: 12, padding: '13px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, color: c.red, lineHeight: 0.9 }}>{s.n}</span>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, lineHeight: 1 }}>{s.t}</div>
                <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 5, lineHeight: 1.5 }}>{s.d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '26px 20px 0' }}>
        <JRule c={c} label="WAS ES KOSTET" />
        <Rechner c={c} small />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          {JARTEN.map((a) => (
            <div key={a.t} style={{ border: `1.5px solid ${c.line}`, background: c.paper, padding: '12px 12px 14px' }}>
              <div style={{ height: 4, background: jTint(c, a.tint), marginBottom: 10 }} />
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, lineHeight: 1 }}>{a.t}</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, color: c.red, marginTop: 5 }}>{a.p}</div>
              <div style={{ fontWeight: 700, fontSize: 9.5, color: c.sub }}>{a.s}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, fontWeight: 600, fontSize: 11, color: c.sub, lineHeight: 1.5 }}>Eine Session Pause? Dann ruht die Mitgliedschaft, statt zu kündigen. Die Ehrenmitgliedschaft verleiht die Mitgliederversammlung.</div>
      </div>
      <div style={{ padding: '26px 20px 0' }}>
        <JRule c={c} label="EHRLICH GESAGT" />
        {JFAQ.map((f, i) => (
          <div key={i} style={{ borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
            <button onClick={() => setFaq(faq === i ? -1 : i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', background: 'transparent', border: 'none', padding: '13px 2px', cursor: 'pointer' }}>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 16, lineHeight: 1.1 }}>{f.q}</span>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 17, color: c.red, flexShrink: 0 }}>{faq === i ? '–' : '+'}</span>
            </button>
            {faq === i ? <div style={{ fontWeight: 600, fontSize: 12.5, lineHeight: 1.6, color: c.sub, padding: '0 2px 14px' }}>{f.a}</div> : null}
          </div>
        ))}
      </div>
      <div style={{ padding: '24px 20px 0' }}>
        <JRule c={c} label="LIEBER KURZ FRAGEN?" />
        {JKONTAKT.map((k, i) => (
          <div key={k.n} style={{ display: 'grid', gridTemplateColumns: '46px 1fr auto', gap: 12, alignItems: 'center', padding: '11px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
            <window.KKPlh h={46} label="" c={c} tint={jTint(c, k.tint)} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 900, fontSize: 13 }}>{k.n}</div>
              <div style={{ fontWeight: 700, fontSize: 10.5, color: c.sub, marginTop: 2 }}>{k.r}</div>
            </div>
            <span style={{ fontWeight: 800, fontSize: 11, color: c.red, flexShrink: 0 }}>{k.k.includes('@') ? 'Mail' : 'Anrufen'}</span>
          </div>
        ))}
      </div>
      <div style={{ background: p.bg, color: p.fg, padding: '22px 20px', marginTop: 24 }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.8, color: c.red }}>OHNE MITGLIEDSCHAFT</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, lineHeight: 0.98, marginTop: 7 }}>NUR HELFEN GEHT AUCH</div>
        <div style={{ fontWeight: 600, fontSize: 12, color: p.sub, marginTop: 7, lineHeight: 1.5 }}>Theke, Einlass, Wagenbau — Helfer-Liste ohne Beitrag und ohne Verpflichtung.</div>
        <button style={{ marginTop: 12, border: `2px solid ${p.fg}`, background: 'transparent', color: p.fg, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13, padding: '11px 18px', cursor: 'pointer' }}>Helfer-Liste →</button>
      </div>
      <window.KKFooter c={c} />
    </JMobShell>
  );
}

function JoinAntragMobile({ c, go }) {
  const [f, set, setF] = useAntrag();
  return (
    <JMobShell c={c} label="ANTRAG" cta={{ t: 'Antrag absenden', s: `${f.art} · ${f.art === 'Aktiv' ? '30' : '15'} € im Jahr · jetzt 0 €`, b: 'Absenden', onClick: () => go('fertig') }}>
      <div style={{ padding: '18px 20px 0' }}>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontWeight: 800, fontSize: 12.5, padding: 0, cursor: 'pointer' }}>← zurück</button>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.8, color: c.red, marginTop: 14 }}>BEITRITTSANTRAG</div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.92, margin: '7px 0 0' }}>ZWEI MINUTEN,<br />DANN GEHÖRST DU DAZU</h1>
        <div style={{ height: 2.5, background: c.ink, marginTop: 14 }} />
      </div>
      <div style={{ padding: '18px 20px 0' }}><AntragForm c={c} f={f} set={set} setF={setF} small /></div>
      <div style={{ padding: '22px 20px 0' }}><AntragSummary c={c} f={f} go={go} small /></div>
      <window.KKFooter c={c} />
    </JMobShell>
  );
}

function JoinFertigMobile({ c, go }) {
  return (
    <JMobShell c={c} label="WILLKOMMEN" cta={{ t: 'Tanzgarde · Di 19:30', s: 'Sporthalle · Turnschuhe reichen', b: 'Kalender', onClick: () => go('index') }}>
      <div style={{ padding: '22px 20px 0' }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.8, color: c.red }}>ANTRAG IST DA · 20:14 UHR</div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 44, lineHeight: 0.88, margin: '9px 0 0' }}>WILLKOMMEN,<br />LENA.</h1>
        <p style={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.55, color: c.sub, margin: '10px 0 0' }}>Dein Antrag liegt beim Vorstand. Bis zur Aufnahme musst du nichts tun — zum Training darfst du trotzdem schon kommen.</p>
      </div>
      <div style={{ padding: '18px 20px 0', display: 'grid', placeItems: 'center' }}><window.KKSeal c={c} size={186} rot={-7} /></div>
      <div style={{ padding: '18px 20px 0' }}>
        <JRule c={c} label="WAS DANACH PASSIERT" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {[['01', 'Bestätigung unterwegs', 'Mail an lena.brandt@web.de, Antrag als PDF dabei.'], ['02', 'Vorstandssitzung 3. Sept.', 'Wir nehmen dich auf und melden uns am Tag danach.'], ['03', 'Club-App', 'Dein Einladungslink: Termine, Beitrag, Bierliste, Fotos.']].map(([n, t, d], i) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12, padding: '13px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
              <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, color: c.red, lineHeight: 0.9 }}>{n}</span>
              <div>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, lineHeight: 1 }}>{t}</div>
                <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '20px 20px 0' }}>
        <JRule c={c} label="SCHON MAL VORMERKEN" />
        {[['11.11.', 'Sessionseröffnung, 19:11 Uhr'], ['05.12.', 'Ordensfest'], ['20.02.', 'Prunksitzung']].map(([d, t], i) => (
          <div key={d} style={{ display: 'grid', gridTemplateColumns: '54px 1fr', gap: 10, alignItems: 'baseline', padding: '11px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 18, color: c.red }}>{d}</span>
            <span style={{ fontWeight: 700, fontSize: 12.5 }}>{t}</span>
          </div>
        ))}
      </div>
      <window.KKFooter c={c} />
    </JMobShell>
  );
}

function JoinPage({ mode = 'light', device = 'desktop', view = 'index' }) {
  const c = window.KK[mode];
  const [v, setV] = React.useState(view);
  React.useEffect(() => setV(view), [view]);
  if (device === 'mobile') {
    if (v === 'antrag') return <JoinAntragMobile c={c} go={setV} />;
    if (v === 'fertig') return <JoinFertigMobile c={c} go={setV} />;
    return <JoinIndexMobile c={c} go={setV} />;
  }
  if (v === 'antrag') return <JoinAntragDesktop c={c} go={setV} />;
  if (v === 'fertig') return <JoinFertigDesktop c={c} go={setV} />;
  return <JoinIndexDesktop c={c} go={setV} />;
}

Object.assign(window, { JoinPage, Findomat, JTicket, JGRUPPEN });
