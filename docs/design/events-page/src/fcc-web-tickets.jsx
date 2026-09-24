// FCC Website — Events & Tickets, Part 2: hall plan/seat picker, digital ticket,
// all mobile views and the EventsPage router. One hall, 12 € per seat.

const evH = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 100000) / 100000; };
const EV_RANKS = 8, EV_BLOCKS = 3, EV_SEATS = 12; // 24 table rows × 12 seats = 288 seats
const evReihe = (rank, blk) => rank * EV_BLOCKS + blk + 1;
const evKey = (rank, blk, seat) => `${rank}-${blk}-${seat}`;
const evReiheOf = (n) => ({ r: Math.floor((n - 1) / EV_BLOCKS), b: (n - 1) % EV_BLOCKS });

// occupy deterministically — the front fills up first (that's how a hall really sells)
function evTakenSet(seed, count) {
  const arr = [];
  for (let r = 0; r < EV_RANKS; r++) for (let b = 0; b < EV_BLOCKS; b++) for (let s = 1; s <= EV_SEATS; s++) {
    const k = evKey(r, b, s);
    arr.push([k, evH(seed + k) * (1 + r * 0.55)]);
  }
  arr.sort((a, b) => a[1] - b[1]);
  return new Set(arr.slice(0, count).map((x) => x[0]));
}

// ── SAALPLAN ────────────────────────────────────────────────────────────
function EvSeat({ c, sz, state, title, onClick }) {
  const bg = state === 'sel' ? c.red : state === 'freed' ? c.gold : state === 'gruppe' ? c.gold : state === 'taken' ? (c.bg === '#15110E' ? 'rgba(251,244,230,0.15)' : 'rgba(26,20,17,0.16)') : c.paper;
  return <div onClick={onClick} title={title} style={{ width: sz, height: sz, background: bg, border: state === 'free' ? `1px solid ${c.line}` : 'none', outline: state === 'freed' ? `1.5px solid ${c.red}` : 'none', outlineOffset: -1.5, cursor: state === 'taken' ? 'default' : 'pointer', flexShrink: 0 }} />;
}

function EvSaal({ c, taken, sel, setSel, gruppe, freed, small, max = 10 }) {
  const sz = small ? 9 : 17, gap = small ? 2 : 4, tabH = small ? 11 : 17;
  const g = gruppe ? evReiheOf(gruppe.reihe) : null;
  const click = (k) => { if (taken.has(k)) return; setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k].slice(-max)); };
  const seatRow = (r, b, from) => (
    <div style={{ display: 'flex', gap, justifyContent: 'center' }}>
      {Array.from({ length: 6 }, (_, i) => from + i).map((s) => {
        const k = evKey(r, b, s), isG = g && g.r === r && g.b === b && !taken.has(k), isF = freed && freed.has(k);
        const st = sel.includes(k) ? 'sel' : taken.has(k) ? 'taken' : isF ? 'freed' : isG ? 'gruppe' : 'free';
        return <EvSeat key={k} c={c} sz={sz} state={st} title={`Reihe ${evReihe(r, b)} · Platz ${s}${taken.has(k) ? ' · belegt' : isF ? ' · gerade zurückgegeben' : isG ? ' · Gruppenbestellung' : ''}`} onClick={() => click(k)} />;
      })}
    </div>
  );
  return (
    <div style={{ border: `1.5px solid ${c.line}`, background: c.bg, padding: small ? '12px 10px 14px' : '20px 24px 24px' }}>
      <div style={{ background: c.ink, color: window.EV_CREAM, textAlign: 'center', padding: small ? '7px 0' : '10px 0', margin: small ? '0 8% 12px' : '0 16% 18px' }}>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 13 : 19, letterSpacing: 3 }}>BÜHNE</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,auto)', gap: small ? 10 : 28, justifyContent: 'center' }}>
        {[0, 1, 2].map((b) => (
          <div key={b} style={{ display: 'flex', flexDirection: 'column', gap: small ? 5 : 8 }}>
            {Array.from({ length: EV_RANKS }, (_, r) => {
              const n = evReihe(r, b), isG = g && g.r === r && g.b === b;
              return (
                <div key={n}>
                  {seatRow(r, b, 1)}
                  <div style={{ height: tabH, margin: `${gap}px 0`, background: isG ? c.gold : c.paper, border: `1.5px solid ${isG ? c.gold : c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 7.5 : 10, letterSpacing: 0.5, color: isG ? window.EV_INK : c.sub, lineHeight: 1 }}>{small ? n : `REIHE ${n}`}</span>
                  </div>
                  {seatRow(r, b, 7)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: small ? 8 : 14, marginTop: small ? 12 : 18, justifyContent: 'center' }}>
        {[['THEKE & STEHPLÄTZE', 2], ['EINGANG', 1]].map(([t, f]) => (
          <div key={t} style={{ flex: f, border: `1.5px dashed ${c.line}`, textAlign: 'center', padding: small ? '6px 0' : '8px 0', fontWeight: 900, fontSize: small ? 7.5 : 10, letterSpacing: 1.4, color: c.sub }}>{t}</div>
        ))}
      </div>
    </div>
  );
}

function EvLegend({ c, small, gruppe, freed }) {
  const item = (label, bg, border) => (
    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: small ? 10 : 13, height: small ? 10 : 13, background: bg, border: border || 'none', flexShrink: 0 }} />
      <span style={{ fontWeight: 800, fontSize: small ? 9.5 : 11, letterSpacing: 0.6, color: c.sub, whiteSpace: 'nowrap' }}>{label}</span>
    </div>
  );
  return (
    <div style={{ display: 'flex', gap: small ? 12 : 18, flexWrap: 'wrap' }}>
      {item('frei', c.paper, `1px solid ${c.line}`)}
      {item('belegt', c.bg === '#15110E' ? 'rgba(251,244,230,0.15)' : 'rgba(26,20,17,0.16)')}
      {item('dein Platz', c.red)}
      {freed ? item('gerade zurückgegeben', c.gold, `1.5px solid ${c.red}`) : null}
      {gruppe ? item(`Gruppe ${gruppe.name}`, c.gold) : null}
    </div>
  );
}

function EvHold({ c, small }) {
  const [s, setS] = React.useState(9 * 60 + 41);
  React.useEffect(() => { const i = setInterval(() => setS((x) => (x > 0 ? x - 1 : 0)), 1000); return () => clearInterval(i); }, []);
  return <span style={{ fontWeight: 900, fontSize: small ? 10.5 : 12, letterSpacing: 0.6, color: c.sub, fontVariantNumeric: 'tabular-nums' }}>Plätze für dich reserviert · <span style={{ color: c.red }}>{Math.floor(s / 60)}:{String(s % 60).padStart(2, '0')}</span></span>;
}

// Auswahl-Liste — alle Karten kosten gleich, also nur Platz + Lage + entfernen.
function EvPick({ c, sel, setSel, go, id, small }) {
  const parse = (k) => { const [r, b, s] = k.split('-').map(Number); return { n: evReihe(r, b), s }; };
  const sum = sel.length * window.EV_PREIS;
  return (
    <div>
      {sel.length === 0 ? <div style={{ fontWeight: 600, fontSize: small ? 12 : 13, color: c.sub, lineHeight: 1.45, padding: '8px 0' }}>Noch kein Platz gewählt. Tippe im Saalplan auf einen freien Stuhl — mehrere gehen auch.</div> : null}
      {sel.map((k, i) => {
        const p = parse(k);
        return (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10, alignItems: 'center', padding: small ? '8px 0' : '10px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
            <div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 17 : 19, lineHeight: 1 }}>REIHE {p.n} · PLATZ {p.s}</div>
              <div style={{ fontWeight: 700, fontSize: small ? 10 : 11, color: c.sub, marginTop: 3 }}>{p.n <= 6 ? 'Nah an der Bühne' : p.n >= 19 ? 'Nah an der Theke' : 'Mitte, guter Blick'}</div>
            </div>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 17 : 19, color: c.sub }}>{window.EV_PREIS} €</span>
            <button onClick={() => setSel(sel.filter((x) => x !== k))} style={{ border: 'none', background: 'transparent', color: c.sub, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 15, cursor: 'pointer', padding: 4 }}>✕</button>
          </div>
        );
      })}
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginTop: 12, paddingTop: 12, borderTop: `2.5px solid ${c.ink}` }}>
        <span style={{ fontWeight: 900, fontSize: small ? 12 : 13, letterSpacing: 1 }}>{sel.length} × {window.EV_PREIS} €</span>
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 30 : 38, color: c.red, lineHeight: 0.9 }}>{sum} €</span>
      </div>
      <div style={{ marginTop: 11 }}><window.EvBtn c={c} block fs={small ? 15 : 16} onClick={() => sel.length && go('karte', id)}>Weiter zur Bezahlung →</window.EvBtn></div>
      <div style={{ fontWeight: 600, fontSize: small ? 11 : 12, color: c.sub, marginTop: 10, lineHeight: 1.45 }}>Kreditkarte · PayPal · oder reservieren und bar im Vereinsraum zahlen. Rückgabe bis zum Vortag über die Kartenbörse.</div>
    </div>
  );
}

// ── DESKTOP · PLATZWAHL ─────────────────────────────────────────────────
function EvSeatsDesktop({ c, go, id }) {
  const e = window.evById(id);
  const freed = React.useMemo(() => new Set(window.evReturnsFor(e.id, 'offen').map((r) => { const p = evReiheOf(r.reihe); return evKey(p.r, p.b, r.platz); })), [e.id]);
  const taken = React.useMemo(() => { const t = evTakenSet(e.id, e.kap - e.frei); freed.forEach((k) => t.delete(k)); return t; }, [e.id, e.kap, e.frei, freed]);
  const voll = e.status === 'ausverkauft';
  const firstFree = React.useMemo(() => { if (voll) return [...freed].slice(0, 1); const out = []; for (let r = 4; r < EV_RANKS && out.length < 2; r++) for (let b = 0; b < EV_BLOCKS && out.length < 2; b++) for (let s = 1; s <= EV_SEATS && out.length < 2; s++) { const k = evKey(r, b, s); if (!taken.has(k)) out.push(k); } return out; }, [taken, voll, freed]);
  const [sel, setSel] = React.useState(firstFree);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.EvKeyframes />
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '20px 56px 0' }}>
        <button onClick={() => go('detail', id)} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, padding: 0, cursor: 'pointer' }}>← {e.titel}</button>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 30, marginTop: 12, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 11.5, letterSpacing: 2, color: c.red }}>{voll ? 'AUS DER KARTENBÖRSE' : 'PLATZWAHL'} · {e.tag}, {e.datum.toUpperCase()} · {e.zeit} UHR · {window.EV_ORT.toUpperCase()}</div>
            <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 58, lineHeight: 0.9, margin: '9px 0 0' }}>{voll ? `ZURÜCK IM VERKAUF: ${freed.size} PLÄTZE.` : e.status === 'knapp' ? `DIE LETZTEN ${e.frei} PLÄTZE.` : 'SETZ DICH, WOHIN DU WILLST.'}</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.sub, marginBottom: 7 }}>LIVE-KARTENSTAND</div>
            <div style={{ width: 280 }}><window.EvBar c={c} frei={voll ? freed.size : e.frei} kap={e.kap} h={11} /></div>
            <div style={{ fontWeight: 700, fontSize: 11.5, color: c.sub, marginTop: 5 }}>{voll ? `Der Abend ist voll — diese ${freed.size} Plätze sind zurückgegeben worden.` : `${window.EV_PREIS} € pro Platz · Kinder gleich · 62 Stehplätze an der Theke`}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '22px 56px 0', display: 'grid', gridTemplateColumns: '1fr 330px', gap: 32, alignItems: 'start' }}>
        <div>
          <div style={{ marginBottom: 10 }}><EvLegend c={c} gruppe={e.gruppe} freed={freed.size > 0} /></div>
          <EvSaal c={c} taken={taken} sel={sel} setSel={setSel} gruppe={e.gruppe} freed={freed} />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, marginTop: 12, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.5, maxWidth: 560, textWrap: 'pretty' }}>
              Das ist der echte Saal: 24 Biertisch-Reihen quer zur Bühne, sechs Stühle je Seite. Reihe 1–3 stehen an der Bühne, 22–24 an der Theke. Rollstuhlplätze richten wir an Reihe 1 ein — <a href="#">kurz anrufen</a>.
            </div>
            <EvHold c={c} />
          </div>
        </div>

        <div>
          <div style={{ background: c.paper, border: `2px solid ${c.ink}`, boxShadow: window.evHard(c, 8), padding: '18px 20px 20px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.6, color: c.red }}>DEINE AUSWAHL</div>
            <div style={{ marginTop: 8 }}><EvPick c={c} sel={sel} setSel={setSel} go={go} id={id} /></div>
          </div>
          {voll ? (
            <div style={{ marginTop: 16, border: `1.5px solid ${c.red}`, background: c.paper, padding: '14px 16px 16px' }}>
              <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.3, color: c.red }}>KARTENBÖRSE</div>
              <div style={{ fontWeight: 700, fontSize: 12.5, marginTop: 7, lineHeight: 1.45 }}>Die gelb umrandeten Stühle hat jemand zurückgegeben und die Warteliste nicht genommen — sie sind für niemanden reserviert. Wer zuerst klickt, sitzt.</div>
              <div style={{ marginTop: 11 }}><window.EvBtn c={c} ghost fs={13} onClick={() => go('boerse')}>Warteliste & Börse →</window.EvBtn></div>
            </div>
          ) : e.gruppe ? (
            <div style={{ marginTop: 16, border: `1.5px solid ${c.gold}`, background: c.paper, padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 9, height: 9, background: c.gold, flexShrink: 0 }} />
                <span style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.3, color: c.sub }}>GRUPPENBESTELLUNG</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: 12.5, marginTop: 8, lineHeight: 1.45 }}><b style={{ fontWeight: 900 }}>{e.gruppe.name}</b> sammelt Reihe {e.gruppe.reihe} — {e.gruppe.offen} Plätze sind noch offen. Wähl einen gelben Stuhl, dann sitzt du bei ihnen.</div>
            </div>
          ) : (
            <div style={{ marginTop: 16, borderTop: `1.5px solid ${c.line}`, paddingTop: 12, fontWeight: 600, fontSize: 12, color: c.sub, lineHeight: 1.5 }}>
              Kommt ihr zu mehreren? Wähl einfach mehrere Stühle in derselben Reihe — bis zu zehn auf einmal.
            </div>
          )}
        </div>
      </div>
      <div style={{ marginTop: 36 }}><window.KKFooter c={c} /></div>
    </div>
  );
}

// ── DIE KARTE ───────────────────────────────────────────────────────────
function EvQR({ c, cell = 5 }) {
  const n = 21, cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x > n - 8 && y < 7) || (x < 7 && y > n - 8);
    const ring = finder && (x === 0 || y === 0 || x === n - 1 || y === n - 1 || (x >= 2 && x <= 4 && y >= 2 && y <= 4) || (x >= n - 5 && x <= n - 3 && y >= 2 && y <= 4) || (x >= 2 && x <= 4 && y >= n - 5 && y <= n - 3) || (x === 6 && y < 7) || (y === 6 && x < 7) || (x === n - 7 && y < 7) || (y === 6 && x > n - 8) || (x === 6 && y > n - 8) || (y === n - 7 && x < 7));
    const on = finder ? ring : evH(`${x}:${y}`) > 0.52;
    cells.push(<div key={`${x}-${y}`} style={{ width: cell, height: cell, background: on ? window.EV_INK : 'transparent' }} />);
  }
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, ${cell}px)`, background: window.EV_CREAM, padding: cell * 2 }}>{cells}</div>;
}

function EvTicket({ c, small, e, plaetze = ['Reihe 20 · Platz 3', 'Reihe 20 · Platz 4'] }) {
  const ev = e || window.evById('prunk2');
  const CR = window.EV_CREAM, IK = window.EV_INK;
  return (
    <div style={{ background: CR, color: IK, border: `2px solid ${IK}`, boxShadow: `${small ? 6 : 10}px ${small ? 6 : 10}px 0 ${c.red}`, display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 200px' }}>
      <div style={{ padding: small ? '16px 18px 18px' : '22px 26px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 22 : 27, letterSpacing: 2 }}>FURRIA</span>
          <span style={{ fontWeight: 900, fontSize: small ? 9 : 10, letterSpacing: 1.4, color: 'rgba(26,20,17,0.6)' }}>EINTRITTSKARTE · Nº 2027-0317</span>
        </div>
        <div style={{ height: 2.5, background: IK, margin: small ? '11px 0 13px' : '14px 0 16px' }} />
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 29 : 40, lineHeight: 0.92 }}>{ev.titel.toUpperCase()}</div>
        <div style={{ fontWeight: 800, fontSize: small ? 11.5 : 12.5, color: 'rgba(26,20,17,0.66)', marginTop: 7 }}>{ev.tag}, {ev.datum} · Einlass {ev.einlass} · Beginn {ev.zeit} · {window.EV_ORT}</div>
        <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr 1fr' : 'repeat(3,1fr)', gap: small ? 12 : 18, marginTop: small ? 14 : 18, paddingTop: small ? 12 : 15, borderTop: '1.5px solid rgba(26,20,17,0.2)' }}>
          {[['PLÄTZE', plaetze.join('\n')], ['KARTEN', `2 × ${window.EV_PREIS} €`], ['BEZAHLT', `${2 * window.EV_PREIS} € · PayPal`]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontWeight: 900, fontSize: small ? 8.5 : 9.5, letterSpacing: 1.3, color: 'rgba(26,20,17,0.55)' }}>{l}</div>
              <div style={{ fontWeight: 900, fontSize: small ? 13 : 14.5, marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.35 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ borderLeft: small ? 'none' : '2px dashed rgba(26,20,17,0.3)', borderTop: small ? '2px dashed rgba(26,20,17,0.3)' : 'none', padding: small ? '14px 18px 16px' : '22px 18px', display: 'flex', flexDirection: small ? 'row' : 'column', alignItems: 'center', justifyContent: 'center', gap: small ? 16 : 11 }}>
        <EvQR c={c} cell={small ? 4 : 5} />
        <div style={{ textAlign: small ? 'left' : 'center' }}>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10, letterSpacing: 1.2, color: 'rgba(26,20,17,0.6)' }}>AM EINLASS ZEIGEN</div>
          <div style={{ fontWeight: 700, fontSize: small ? 10.5 : 11, color: 'rgba(26,20,17,0.6)', marginTop: 4, lineHeight: 1.4 }}>Handy oder Ausdruck.<br />Beides geht.</div>
        </div>
      </div>
    </div>
  );
}

function EvKarteDesktop({ c, go, id }) {
  const e = window.evById(id), p = window.evPanel(c);
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.EvKeyframes />
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '34px 56px 0', display: 'grid', gridTemplateColumns: '1fr 420px', gap: 46, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 2.4, color: c.red }}>BEZAHLT · 20:14 UHR · MAIL IST UNTERWEGS</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 74, lineHeight: 0.87, margin: '12px 0 0' }}>ZWEI PLÄTZE,<br />REIHE 20.</h1>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '14px 0 0', maxWidth: 540, textWrap: 'pretty' }}>Das war's. Kein Ausdrucken, keine Abholung, keine Warteschlange am Abend — wir haken dich am Einlass in der Liste ab.</p>
          <div style={{ display: 'flex', gap: 9, marginTop: 18, flexWrap: 'wrap' }}>
            <window.EvBtn c={c} fs={15}>In Wallet legen</window.EvBtn>
            <window.EvBtn c={c} ghost fs={15}>Als PDF</window.EvBtn>
            <window.EvBtn c={c} ghost fs={15}>In den Kalender</window.EvBtn>
          </div>
          <div style={{ marginTop: 30 }}>
            <window.EvRule c={c} label="WAS JETZT PASSIERT" />
            {[['01', 'Bestätigung per Mail', 'Mit QR-Code und Karte als PDF. Kommt an lena.brandt@web.de.'], ['02', 'Zwei Tage vorher', 'Eine Erinnerung mit Einlasszeit, Parkplatz-Tipp und Shuttle-Zeiten.'], ['03', 'Am Abend selbst', 'Hier im Browser läuft der echte Ablauf mit — du siehst, welche Nummer gerade dran ist.']].map(([n, t, d], i) => (
              <div key={n} style={{ display: 'grid', gridTemplateColumns: '52px 1fr', gap: 16, padding: '12px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, color: c.red, lineHeight: 0.9 }}>{n}</span>
                <div>
                  <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, lineHeight: 1 }}>{t}</div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 5, lineHeight: 1.5 }}>{d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <EvTicket c={c} e={e} />
          <div style={{ marginTop: 26, border: `2px solid ${c.ink}`, background: c.bg, padding: '16px 18px 18px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.red }}>DOCH WAS DAZWISCHEN?</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 23, lineHeight: 1.05, marginTop: 7 }}>KARTE ZURÜCKGEBEN</div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 7, lineHeight: 1.5 }}>Ein Klick in der Mail. Deine Karte geht in die Börse: erst an die Warteliste (aktuell 7 Leute), danach an alle. Das Geld kommt zurück, sobald der Platz weg ist — oder du buchst kostenlos auf einen anderen Abend um.</div>
            <div style={{ marginTop: 11 }}><window.EvBtn c={c} ghost fs={13} onClick={() => go('boerse')}>Zur Kartenbörse →</window.EvBtn></div>
          </div>
          <div style={{ marginTop: 16, background: c.paper, color: c.ink, border: `1.5px solid ${c.line}`, padding: '16px 18px 18px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.red }}>NOCH EIN ABEND FREI</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 23, lineHeight: 1.05, marginTop: 7 }}>WEIBERFASCHING<br />04.02. · 96 PLÄTZE</div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 7, lineHeight: 1.5 }}>Kurzes Programm, lange Tanzfläche. Auch 12 €, gleicher Saal.</div>
            <button onClick={() => go('detail', 'weiber')} style={{ marginTop: 11, border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, padding: '11px 15px', cursor: 'pointer' }}>Ansehen →</button>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 34 }}><window.EvFilmstrip c={c} h={92} speed={54} /></div>
      <div style={{ padding: '18px 56px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: c.sub, maxWidth: 620, lineHeight: 1.5 }}>Fotos von deinem Abend landen ein paar Tage später in der Galerie — und im nächsten Jahr auf dieser Seite.</div>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 14, cursor: 'pointer', padding: 0 }}>Alle Termine ansehen →</button>
      </div>
      <div style={{ marginTop: 32 }}><window.KKFooter c={c} /></div>
    </div>
  );
}

// ── MOBILE ──────────────────────────────────────────────────────────────
function EvMobBar({ c, label = 'TERMINE' }) {
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
        <button style={{ justifySelf: 'end', border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, padding: '8px 14px', borderRadius: 40, cursor: 'pointer' }}>Karten</button>
      </div>
    </div>
  );
}

function EvMobShell({ c, label, children, cta, dark }) {
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.EvKeyframes />
      <window.StatusBar color={dark ? window.EV_CREAM : c.ink} />
      <EvMobBar c={c} label={label} />
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
      <window.HomeIndicator color={dark ? window.EV_CREAM : c.ink} />
    </window.PhoneFrame>
  );
}

function EvIndexMobile({ c, go }) {
  const [w, setW] = React.useState(-1);
  const auf = window.evById('prunk2');
  return (
    <EvMobShell c={c} label="TERMINE" dark={c.bg === '#15110E'} cta={{ t: '2. Prunksitzung · 30.01.', s: 'Nur noch 34 Plätze · 12 €', b: 'Platz wählen', onClick: () => go('seats', 'prunk2') }}>
      <div style={{ padding: '18px 20px 0' }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: c.red }}>TERMINE & KARTEN · 55. SESSION</div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 40, lineHeight: 0.88, margin: '8px 0 0' }}>VERANSTALTUNGEN</h1>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45, color: c.sub, margin: '9px 0 0' }}>23. Januar bis 7. Februar 2027 im {window.EV_ORT}. Jede Karte 12 €, jeder Platz numeriert.</p>
      </div>
      <div style={{ padding: '14px 20px 0' }}><window.EvHeroCard c={c} e={auf} go={go} small /></div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="DER SPIELPLAN" right="23.01. — 07.02." />
        {window.EV_EVENTS.map((e) => <window.EvRow key={e.id} c={c} e={e} go={go} small />)}
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="ZWEI MONATE" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {window.EV_MONTHS.map((m) => <window.EvMonth key={m.key} c={c} m={m} go={go} small />)}
        </div>
      </div>
      <div style={{ marginTop: 20 }}><window.EvFilmstrip c={c} h={78} speed={38} /></div>
      <div style={{ padding: '20px 20px 0' }}>
        <window.EvRule c={c} label="WO" />
        <window.EvVenue c={c} go={go} small />
      </div>
      <div style={{ marginTop: 20 }}><window.EvBoerseBand c={c} go={go} small /></div>
      <div style={{ padding: '20px 20px 0' }}>
        <window.EvRule c={c} label="GUT ZU WISSEN" />
        {window.EV_WISSEN.map(([t, d], i) => (
          <div key={t} style={{ borderTop: `1px solid ${c.line}`, borderBottom: i === window.EV_WISSEN.length - 1 ? `1px solid ${c.line}` : 'none' }}>
            <button onClick={() => setW(w === i ? -1 : i)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, width: '100%', textAlign: 'left', font: 'inherit', color: 'inherit', background: 'transparent', border: 'none', padding: '14px 2px', cursor: 'pointer' }}>
              <span style={{ fontWeight: 800, fontSize: 13.5, color: c.ink }}>{t}</span>
              <span style={{ fontSize: 12, color: c.red, flexShrink: 0, transform: w === i ? 'rotate(180deg)' : 'none' }}>⌄</span>
            </button>
            {w === i ? <div style={{ fontWeight: 500, fontSize: 12, lineHeight: 1.65, color: c.sub, padding: '0 2px 14px', textWrap: 'pretty' }}>{d}</div> : null}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 20 }}><window.KKFooter c={c} /></div>
    </EvMobShell>
  );
}

function EvDetailMobile({ c, go, id }) {
  const e = window.evById(id), p = window.evPanel(c);
  const s = window.evStatus(e);
  return (
    <EvMobShell c={c} label="ABEND" cta={{ t: `${window.EV_PREIS} € · Sitzplatz am Tisch`, s: e.status === 'bald' ? `Vorverkauf ab ${e.vvk}` : e.status === 'ausverkauft' ? 'Ausverkauft · Warteliste offen' : `${e.frei} von ${e.kap} frei`, b: e.status === 'offen' || e.status === 'knapp' ? 'Platz wählen' : 'Merken', onClick: () => go('seats', id) }}>
      <div style={{ padding: '14px 20px 0' }}>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontWeight: 900, fontSize: 12, padding: 0, cursor: 'pointer' }}>← Alle Termine</button>
        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
          <window.EvTag c={c} tint="red" small>{e.typ.toUpperCase()}</window.EvTag>
          <window.EvTag c={c} tint="line" small>{e.alter.toUpperCase()}</window.EvTag>
        </div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 0.9, margin: '9px 0 0' }}>{e.titel.toUpperCase()}</h1>
        <div style={{ fontWeight: 800, fontSize: 11.5, color: c.sub, marginTop: 7 }}>{e.tag}, {e.datum} · Einlass {e.einlass} · Beginn {e.zeit}<br />{window.EV_ORT}</div>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45, color: c.sub, margin: '10px 0 0' }}>{e.unter}</p>
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ background: c.paper, border: `2px solid ${c.ink}`, boxShadow: window.evHard(c, 6), padding: '14px 16px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.5, color: c.red }}>KARTE</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 42, lineHeight: 0.88, marginTop: 3 }}>{window.EV_PREIS} €</div>
            </div>
            <div style={{ fontWeight: 700, fontSize: 10.5, color: c.sub, textAlign: 'right', lineHeight: 1.4, paddingBottom: 3 }}>pro Person<br />Kinder gleich</div>
          </div>
          <div style={{ marginTop: 12, paddingTop: 11, borderTop: `1.5px solid ${c.line}` }}>
            <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.4, color: c.sub, marginBottom: 6 }}>LIVE-KARTENSTAND</div>
            <window.EvBar c={c} frei={e.status === 'bald' ? e.kap : e.frei} kap={e.kap} h={10} />
          </div>
          <div style={{ marginTop: 12 }}>
            {e.status === 'ausverkauft' ? <window.EvWaitPanel c={c} e={e} small compact go={go} /> : e.status === 'bald' ? <window.EvSubscribe c={c} block small /> : <window.EvBtn c={c} block fs={14} onClick={() => go('seats', id)}>Platz im Saalplan wählen →</window.EvBtn>}
          </div>
          {e.gruppe ? (
            <div style={{ marginTop: 11, paddingTop: 10, borderTop: `1.5px solid ${c.line}`, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <div style={{ width: 8, height: 8, background: c.gold, flexShrink: 0, marginTop: 4 }} />
              <div style={{ fontWeight: 700, fontSize: 11, lineHeight: 1.4 }}><b style={{ fontWeight: 900 }}>{e.gruppe.name}</b> sammelt für Reihe {e.gruppe.reihe} — {e.gruppe.offen} Plätze offen.</div>
            </div>
          ) : null}
        </div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="LETZTES JAHR" right="112 FOTOS" />
        <window.EvPhotoTheater c={c} small />
      </div>
      <div style={{ padding: '16px 20px 0' }}>
        <window.EvRule c={c} label="WER AUFTRITT" />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{window.EV_GRUPPEN.map((g) => <window.EvTag c={c} key={g} tint="line" small>{g.toUpperCase()}</window.EvTag>)}</div>
        <div style={{ marginTop: 12 }}><window.EvAblauf c={c} e={e} small /></div>
      </div>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ background: c.paper, color: c.ink, border: `1.5px solid ${c.line}`, padding: '14px 16px 16px' }}>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.5, color: c.red }}>AM ABEND SELBST</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 21, lineHeight: 1.05, marginTop: 6 }}>WELCHE NUMMER GERADE LÄUFT</div>
          <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 6, lineHeight: 1.45 }}>Ab {e.zeit} wird aus dem Ablauf ein Live-Stand. Praktisch, wenn man kurz draußen ist.</div>
        </div>
      </div>
      <div style={{ padding: '16px 20px 0', fontWeight: 900, fontSize: 11, letterSpacing: 1.2, color: window.evKind(c, s.kind) }}>{s.label.toUpperCase()}</div>
      <div style={{ marginTop: 18 }}><window.KKFooter c={c} /></div>
    </EvMobShell>
  );
}

function EvSeatsMobile({ c, go, id }) {
  const e = window.evById(id);
  const freed = React.useMemo(() => new Set(window.evReturnsFor(e.id, 'offen').map((r) => { const p = evReiheOf(r.reihe); return evKey(p.r, p.b, r.platz); })), [e.id]);
  const taken = React.useMemo(() => { const t = evTakenSet(e.id, e.kap - e.frei); freed.forEach((k) => t.delete(k)); return t; }, [e.id, e.kap, e.frei, freed]);
  const voll = e.status === 'ausverkauft';
  const firstFree = React.useMemo(() => { if (voll) return [...freed].slice(0, 1); const out = []; for (let r = 4; r < EV_RANKS && out.length < 2; r++) for (let b = 0; b < EV_BLOCKS && out.length < 2; b++) for (let s = 1; s <= EV_SEATS && out.length < 2; s++) { const k = evKey(r, b, s); if (!taken.has(k)) out.push(k); } return out; }, [taken, voll, freed]);
  const [sel, setSel] = React.useState(firstFree);
  const sum = sel.length * window.EV_PREIS;
  return (
    <EvMobShell c={c} label="PLATZWAHL" cta={{ t: `${sel.length} × ${window.EV_PREIS} € · ${sum} €`, s: 'Plätze 9 Min für dich reserviert', b: 'Bezahlen', onClick: () => sel.length && go('karte', id) }}>
      <div style={{ padding: '14px 20px 0' }}>
        <button onClick={() => go('detail', id)} style={{ border: 'none', background: 'transparent', color: c.red, fontWeight: 900, fontSize: 12, padding: 0, cursor: 'pointer' }}>← {e.titel}</button>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 0.92, margin: '9px 0 0' }}>{voll ? `ZURÜCK IM VERKAUF: ${freed.size} PLÄTZE.` : e.status === 'knapp' ? `DIE LETZTEN ${e.frei} PLÄTZE.` : 'SETZ DICH, WOHIN DU WILLST.'}</h1>
        <div style={{ marginTop: 10 }}><window.EvBar c={c} frei={voll ? freed.size : e.frei} kap={e.kap} h={9} /></div>
      </div>
      <div style={{ padding: '12px 16px 0' }}>
        <div style={{ marginBottom: 9 }}><EvLegend c={c} small gruppe={e.gruppe} freed={freed.size > 0} /></div>
        <EvSaal c={c} taken={taken} sel={sel} setSel={setSel} gruppe={e.gruppe} freed={freed} small />
        <div style={{ marginTop: 9, fontWeight: 600, fontSize: 11, color: c.sub, lineHeight: 1.45 }}>24 Biertisch-Reihen quer zur Bühne, sechs Stühle je Seite. Tippe auf einen freien Stuhl — bis zu zehn.</div>
      </div>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ border: `2px solid ${c.ink}`, background: c.paper, padding: '14px 16px 16px' }}>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.5, color: c.red }}>DEINE AUSWAHL</div>
          <div style={{ marginTop: 8 }}><EvPick c={c} sel={sel} setSel={setSel} go={go} id={id} small /></div>
        </div>
        {voll ? (
          <div style={{ marginTop: 12, border: `1.5px solid ${c.red}`, padding: '12px 14px 14px' }}>
            <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.3, color: c.red }}>KARTENBÖRSE</div>
            <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 6, lineHeight: 1.45 }}>Gelb umrandet = zurückgegeben und für niemanden reserviert. Wer zuerst klickt, sitzt.</div>
            <div style={{ marginTop: 10 }}><window.EvBtn c={c} ghost fs={12.5} onClick={() => go('boerse')}>Warteliste & Börse →</window.EvBtn></div>
          </div>
        ) : e.gruppe ? (
          <div style={{ marginTop: 12, border: `1.5px solid ${c.gold}`, padding: '12px 14px 14px' }}>
            <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.3, color: c.sub }}>GRUPPENBESTELLUNG</div>
            <div style={{ fontWeight: 700, fontSize: 11.5, marginTop: 6, lineHeight: 1.45 }}><b style={{ fontWeight: 900 }}>{e.gruppe.name}</b> sammelt Reihe {e.gruppe.reihe} — {e.gruppe.offen} Plätze offen. Gelber Stuhl = du sitzt bei ihnen.</div>
          </div>
        ) : null}
      </div>
      <div style={{ padding: '14px 20px 0', display: 'flex', justifyContent: 'center' }}><EvHold c={c} small /></div>
      <div style={{ marginTop: 18 }}><window.KKFooter c={c} /></div>
    </EvMobShell>
  );
}

function EvKarteMobile({ c, go, id }) {
  const e = window.evById(id);
  return (
    <EvMobShell c={c} label="DEINE KARTE" cta={{ t: 'In Wallet legen', s: 'Oder als PDF speichern', b: 'Wallet', onClick: () => go('index') }}>
      <div style={{ padding: '16px 20px 0' }}>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.8, color: c.red }}>BEZAHLT · 20:14 UHR</div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 0.88, margin: '8px 0 0' }}>ZWEI PLÄTZE,<br />REIHE 20.</h1>
        <p style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.45, color: c.sub, margin: '9px 0 0' }}>Kein Ausdrucken, keine Abholung. Wir haken dich am Einlass in der Liste ab.</p>
      </div>
      <div style={{ padding: '14px 20px 0' }}><EvTicket c={c} e={e} small /></div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="WAS JETZT PASSIERT" />
        {[['01', 'Bestätigung per Mail', 'Mit QR-Code und PDF.'], ['02', 'Zwei Tage vorher', 'Erinnerung mit Einlasszeit und Shuttle-Zeiten.'], ['03', 'Am Abend', 'Hier läuft der echte Ablauf mit.']].map(([n, t, d], i) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, padding: '10px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 21, color: c.red, lineHeight: 0.9 }}>{n}</span>
            <div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16.5, lineHeight: 1 }}>{t}</div>
              <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 3, lineHeight: 1.4 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding: '14px 20px 0' }}>
        <div style={{ border: `2px solid ${c.ink}`, padding: '13px 15px 15px' }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, lineHeight: 1.05 }}>KARTE ZURÜCKGEBEN</div>
          <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 6, lineHeight: 1.45 }}>Ein Klick, deine Karte geht in die Börse — erst an die Warteliste (7 Leute), dann an alle. Geld zurück, sobald sie weg ist.</div>
          <div style={{ marginTop: 10 }}><window.EvBtn c={c} ghost fs={12.5} onClick={() => go('boerse')}>Zur Kartenbörse →</window.EvBtn></div>
        </div>
      </div>
      <div style={{ marginTop: 16 }}><window.EvFilmstrip c={c} h={70} speed={34} /></div>
      <div style={{ marginTop: 16 }}><window.KKFooter c={c} /></div>
    </EvMobShell>
  );
}

// ── ROUTER ──────────────────────────────────────────────────────────────
function EventsPage({ mode = 'light', device = 'desktop', view = 'index', id = 'prunk2' }) {
  const c = window.KK[mode];
  const [v, setV] = React.useState(view);
  const [cur, setCur] = React.useState(id);
  React.useEffect(() => { setV(view); setCur(id); }, [view, id]);
  const go = (nv, nid) => { setV(nv); if (nid) setCur(nid); };
  if (device === 'mobile') {
    if (v === 'detail') return <EvDetailMobile c={c} go={go} id={cur} />;
    if (v === 'seats') return <EvSeatsMobile c={c} go={go} id={cur} />;
    if (v === 'karte') return <EvKarteMobile c={c} go={go} id={cur} />;
    if (v === 'boerse') return <window.EvBoerseMobile c={c} go={go} />;
    return <EvIndexMobile c={c} go={go} />;
  }
  if (v === 'detail') return <window.EvDetailDesktop c={c} go={go} id={cur} />;
  if (v === 'seats') return <EvSeatsDesktop c={c} go={go} id={cur} />;
  if (v === 'karte') return <EvKarteDesktop c={c} go={go} id={cur} />;
  if (v === 'boerse') return <window.EvBoerseDesktop c={c} go={go} />;
  return <window.EvIndexDesktop c={c} go={go} view={v} />;
}

Object.assign(window, { EventsPage, EvSaal, EvSeatsDesktop, EvKarteDesktop, EvTicket, EvQR, EvLegend, EvPick, EvIndexMobile, EvDetailMobile, EvSeatsMobile, EvKarteMobile, EvMobShell, evTakenSet });
