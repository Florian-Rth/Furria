// fcc-ds-drinks.jsx — Bierliste & Getränkekasse (/drinks + /drinks/inventory).
// Two surfaces:
//  • MEMBER (Biertrinker): meine Kisten · offener Betrag → PayPal des Getränkewarts ·
//    "Kiste kaufen"-Dialog · Sponsoren-Scoreboard (Top 3 + eigener Rang).
//  • GETRÄNKEWART: Kasse/Bestand/offen-Stats · "Geld erhalten" (Person + Kisten →
//    automatischer Abgleich offener Käufe) · Teilnehmerliste · PALETTENABGLEICH
//    (App sagt exakt, wie viele Kisten auf die bezahlte Seite zu rücken sind).
// Zahlung wird IMMER vom Getränkewart bestätigt (PayPal ODER bar).
// Composes the system shell + tokens. Exports PageDrinks, MDrinks, PageDrinksAdmin, MDrinksReceive.

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Eyebrow, Avatar } = window;
  const { useState } = React;
  const PRICE = 12;
  const eur = (n) => n.toLocaleString('de-DE') + ' €';
  const kn = (n) => (n === 1 ? 'Kiste' : 'Kisten');
  const WART = { name: 'Stefan Krause', short: 'Stefan', pp: 'paypal.me/fccgetraenke' };

  // [name, initials, tone, cratesSeason, openCrates]
  const PEOPLE = [
    ['Tom Berger', 'TB', 'red', 14, 0],
    ['Bernd Hofer', 'BH', 'ink', 12, 0],
    ['Uwe Sänger', 'US', 'gold', 11, 1],
    ['Klaus Reinhardt', 'KR', 'ink', 9, 0],
    ['Markus Vogt', 'MV', 'gold', 7, 2],   // ← "me"
    ['Jens Adam', 'JA', 'ink', 6, 3],
    ['Peter Lustig', 'PL', 'red', 5, 1],
    ['Dirk Mohn', 'DM', 'ink', 4, 1],
    ['Olaf Renz', 'OR', 'gold', 3, 0],
    ['Frank Weber', 'FW', 'red', 2, 0],
  ];
  const ME = PEOPLE[4];
  const RANKED = [...PEOPLE].sort((a, b) => b[3] - a[3]);
  const MY_RANK = RANKED.findIndex((p) => p[0] === ME[0]) + 1;
  const OPEN_PEOPLE = PEOPLE.filter((p) => p[4] > 0);
  const OPEN_CRATES = PEOPLE.reduce((a, p) => a + p[4], 0);
  const PAID_CRATES = PEOPLE.reduce((a, p) => a + (p[3] - p[4]), 0);
  // stock / pallet
  const SEASON = 80, STOCK = 17, LOW = 20;          // 17 left → low-stock warning
  const PALLET = { unpaid: 6, paid: 11, toMove: 3 }; // physical sides of the current stock

  // ── shared bits ─────────────────────────────────────────────────────────────
  function SecHead({ children, right, onRight, style }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 13, ...style }}>
        <span style={{ width: 11, height: 11, background: T.red, flexShrink: 0 }} />
        <Title size={16} style={{ whiteSpace: 'nowrap' }}>{children}</Title>
        <div style={{ flex: 1, height: 2, background: T.line }} />
        {right && <span onClick={onRight} style={{ fontWeight: 800, fontSize: 13, color: T.red, cursor: 'pointer', whiteSpace: 'nowrap' }}>{right}</span>}
      </div>
    );
  }
  function BackBtn({ children, onClick }) {
    return (
      <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub, padding: 0 }}>
        <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span>{children}
      </button>
    );
  }
  function PayPalMark({ size = 18, color = '#fff' }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M8 19l1.8-12h5.4c2.4 0 3.8 1.4 3.4 3.6-.5 2.7-2.4 3.9-5.2 3.9h-2L11 19H8Z" fill="none" stroke={color} strokeWidth="1.9" strokeLinejoin="round" /></svg>;
  }
  // a little stack of crate squares
  function Crates({ n, kind = 'paid', move = 0 }) {
    const items = [];
    for (let i = 0; i < n; i++) {
      const isMove = kind === 'unpaid' && i >= n - move;
      const bg = kind === 'paid' ? T.red : isMove ? 'rgba(244,180,0,0.3)' : 'transparent';
      const bd = kind === 'paid' ? T.red : isMove ? '#9a7200' : T.line;
      items.push(<span key={i} style={{ width: 17, height: 17, borderRadius: 4, background: bg, border: `1.5px solid ${bd}` }} />);
    }
    return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, maxWidth: 124 }}>{items}</div>;
  }
  function Stepper({ value, set }) {
    const Btn2 = ({ d, children }) => <button onClick={() => set(Math.max(1, value + d))} style={{ width: 40, height: 40, borderRadius: 11, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.display, fontSize: 22, color: T.ink, cursor: 'pointer', lineHeight: 1 }}>{children}</button>;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Btn2 d={-1}>–</Btn2>
        <div style={{ fontFamily: T.display, fontSize: 40, minWidth: 52, textAlign: 'center', lineHeight: 1 }}>{value}</div>
        <Btn2 d={1}>+</Btn2>
      </div>
    );
  }
  function Chips({ value, set, opts }) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {opts.map((o) => (
          <button key={o} onClick={() => set(o)} style={{ minWidth: 46, padding: '9px 14px', borderRadius: 30, border: `2px solid ${value === o ? T.ink : T.line}`, background: value === o ? T.ink : T.panel, color: value === o ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{o}</button>
        ))}
      </div>
    );
  }

  // ── MEMBER · scoreboard (Top 3 + eigener Rang, ohne Mengen) ──────────────────
  function Scoreboard({ compact }) {
    const medal = ['#F4B400', '#B8B8C0', '#C8895A'];
    return (
      <Card pad={compact ? 15 : 18}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 13 }}>
          <Ic name="star" size={17} color={T.red} sw={2} />
          <span style={{ fontWeight: 900, fontSize: 12.5, letterSpacing: 0.5, textTransform: 'uppercase' }}>Top-Spender der Saison</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {RANKED.slice(0, 3).map((p, i) => (
            <div key={p[0]} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ width: 26, height: 26, borderRadius: 14, background: medal[i], color: i === 0 ? T.ink : '#fff', fontFamily: T.display, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
              <Avatar initials={p[1]} tone={p[2]} size={32} />
              <span style={{ fontWeight: 800, fontSize: 14.5, flex: 1 }}>{p[0]}</span>
              {i === 0 && <Ic name="beer" size={18} color={T.gold} sw={2} />}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12, paddingTop: 12, borderTop: `1.5px solid ${T.line}` }}>
          <span style={{ width: 26, height: 26, borderRadius: 14, border: `1.5px solid ${T.line}`, color: T.sub, fontFamily: T.display, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{MY_RANK}</span>
          <Avatar initials={ME[1]} tone={ME[2]} size={32} />
          <span style={{ fontWeight: 800, fontSize: 14.5, flex: 1 }}>{ME[0]} <span style={{ color: T.sub, fontWeight: 700 }}>· Du</span></span>
        </div>
      </Card>
    );
  }

  // ── MEMBER · mobile (Übersicht + Sheets) ─────────────────────────────────────
  function MDrinks({ initial = null }) {
    const [sheet, setSheet] = useState(initial); // null | buy | pay | sent
    const [qty, setQty] = useState(2);
    const myOpen = ME[4];

    const overview = (
      <div style={{ padding: '14px 18px 26px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Ic name="beer" size={22} color={T.red} sw={2} />
          <div><Title size={22}>Bierliste</Title><div style={{ fontWeight: 700, fontSize: 11.5, color: T.sub }}>Session 2026 · {WART.short} ist Getränkewart</div></div>
        </div>

        {/* my season */}
        <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: '18px 20px', boxShadow: `5px 5px 0 ${T.red}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -10, bottom: -16, opacity: 0.12 }}><Ic name="beer" size={120} color="#fff" sw={1.5} /></div>
          <div style={{ position: 'relative' }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: 'rgba(251,244,230,0.7)' }}>Meine Kisten diese Saison</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <span style={{ fontFamily: T.display, fontSize: 46, lineHeight: 1 }}>{ME[3]}</span>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'rgba(251,244,230,0.8)' }}>Kisten spendiert</span>
            </div>
          </div>
        </div>

        {/* open hint or all-clear */}
        {myOpen > 0 ? (
          <div onClick={() => setSheet('pay')} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 14, background: 'rgba(225,29,42,0.08)', border: `1.5px solid ${T.red}55`, cursor: 'pointer' }}>
            <span style={{ width: 42, height: 42, borderRadius: 11, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name="euro" size={22} color="#fff" sw={2.2} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: 15, color: T.red }}>{eur(myOpen * PRICE)} offen</div>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: T.sub }}>{myOpen} Kisten · jetzt an {WART.short} zahlen</div>
            </div>
            <Ic name="chevron" size={18} color={T.red} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '13px 16px', borderRadius: 14, background: 'rgba(46,158,91,0.1)' }}>
            <Ic name="check" size={19} color={T.green} sw={2.4} /><span style={{ fontWeight: 800, fontSize: 14, color: '#1f7a44' }}>Alles bezahlt — Prost!</span>
          </div>
        )}

        <Btn primary icon="plus" onClick={() => { setQty(1); setSheet('buy'); }} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>Kiste kaufen</Btn>

        <Scoreboard compact />
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 11.5, color: T.faint }}>Eine Kiste = {eur(PRICE)} · du spendierst sie der ganzen Runde</div>
      </div>
    );

    // sheet bodies
    let sheetBody = null;
    if (sheet === 'buy') {
      sheetBody = (
        <>
          <div style={{ textAlign: 'center' }}>
            <Eyebrow style={{ color: T.red }}>Für die Runde</Eyebrow>
            <Title size={24} style={{ marginTop: 6 }}>Kisten kaufen</Title>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}><Stepper value={qty} set={setQty} /></div>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Chips value={qty} set={setQty} opts={[1, 2, 3, 5, 10]} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: T.panel2, border: `1.5px solid ${T.line}` }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{qty} × {eur(PRICE)}</span>
            <span style={{ fontFamily: T.display, fontSize: 26, color: T.red }}>{eur(qty * PRICE)}</span>
          </div>
          <Btn primary icon="beer" onClick={() => setSheet('pay')} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>{qty} {qty === 1 ? 'Kiste' : 'Kisten'} kaufen</Btn>
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 11.5, color: T.faint }}>Wird auf deine offene Summe gebucht — {WART.short} bestätigt den Eingang.</div>
        </>
      );
    } else if (sheet === 'pay') {
      const amount = (myOpen || qty) * PRICE;
      sheetBody = (
        <>
          <div style={{ textAlign: 'center' }}>
            <Eyebrow style={{ color: T.red }}>Offen begleichen</Eyebrow>
            <div style={{ fontFamily: T.display, fontSize: 44, color: T.ink, marginTop: 6, lineHeight: 1 }}>{eur(amount)}</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: T.sub, marginTop: 4 }}>{myOpen || qty} Kisten · an {WART.name}</div>
          </div>
          <button onClick={() => setSheet('sent')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', background: '#0070BA', border: 'none', borderRadius: 14, color: '#fff', fontFamily: T.font, fontWeight: 800, fontSize: 16, padding: '15px', cursor: 'pointer' }}>
            <PayPalMark size={22} />Mit PayPal zahlen
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', fontWeight: 600, fontSize: 12, color: T.sub }}><Ic name="pin" size={14} color={T.faint} sw={2} />{WART.pp} · {eur(amount)} vorausgefüllt</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 12, background: T.panel2, border: `1.5px solid ${T.line}` }}>
            <Ic name="euro" size={18} color={T.sub} sw={2} />
            <span style={{ fontWeight: 700, fontSize: 12.5, color: T.sub, lineHeight: 1.4 }}>Lieber bar? Gib {WART.short} das Geld — er bestätigt es genauso in der App.</span>
          </div>
        </>
      );
    } else if (sheet === 'sent') {
      sheetBody = (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '14px 0' }}>
          <div style={{ width: 70, height: 70, borderRadius: 40, background: 'rgba(244,180,0,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic name="check" size={36} color="#9a7200" sw={2.4} /></div>
          <Title size={24}>Zahlung gemeldet</Title>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: T.sub, maxWidth: 270, lineHeight: 1.5 }}>Sobald <b style={{ color: T.ink }}>{WART.short}</b> den Eingang bestätigt, gilt deine Summe als bezahlt.</div>
          <Chip tone="gold" dot>Wartet auf Bestätigung</Chip>
        </div>
      );
    }

    return (
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ height: '100%', overflow: 'auto' }}>{overview}</div>
        {sheet && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,17,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ background: T.bg, borderRadius: '22px 22px 0 0', padding: '16px 18px 22px', display: 'flex', flexDirection: 'column', gap: 15, boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 42, height: 5, borderRadius: 3, background: T.line }} /></div>
              {sheetBody}
              <button onClick={() => setSheet(null)} style={{ border: 'none', background: 'transparent', fontFamily: T.font, fontWeight: 800, fontSize: 14, color: T.sub, cursor: 'pointer' }}>{sheet === 'sent' ? 'Fertig' : 'Abbrechen'}</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── MEMBER · desktop (kompakte Übersicht) ────────────────────────────────────
  function PageDrinks() {
    const myOpen = ME[4];
    return (
      <div style={{ padding: 28, maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: '24px 28px', boxShadow: `8px 8px 0 ${T.red}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -14, bottom: -22, opacity: 0.1 }}><Ic name="beer" size={170} color="#fff" sw={1.5} /></div>
              <div style={{ position: 'relative' }}>
                <Eyebrow style={{ color: 'rgba(251,244,230,0.6)' }}>Meine Kisten diese Saison</Eyebrow>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 6 }}>
                  <span style={{ fontFamily: T.display, fontSize: 64, lineHeight: 0.9 }}>{ME[3]}</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: 'rgba(251,244,230,0.8)' }}>Kisten für die Runde</span>
                </div>
              </div>
            </div>
            {myOpen > 0 ? (
              <Card pad={18} style={{ borderColor: T.red + '55' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ width: 46, height: 46, borderRadius: 12, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name="euro" size={24} color="#fff" sw={2.2} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: T.display, fontSize: 26, color: T.red }}>{eur(myOpen * PRICE)} offen</div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>{myOpen} Kisten · an {WART.name} ({WART.pp})</div>
                  </div>
                  <Btn primary icon="euro">Mit PayPal zahlen</Btn>
                </div>
              </Card>
            ) : (
              <Card pad={16} style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Ic name="check" size={20} color={T.green} sw={2.4} /><span style={{ fontWeight: 800, fontSize: 15, color: '#1f7a44' }}>Alles bezahlt — Prost!</span></Card>
            )}
            <Btn primary icon="plus" style={{ alignSelf: 'flex-start', fontSize: 15, padding: '13px 22px' }}>Kiste kaufen</Btn>
          </div>
          <Scoreboard />
        </div>
      </div>
    );
  }

  // ── GETRÄNKEWART · Palettenabgleich card (the B mechanic) ─────────────────────
  function PalettenCard({ mobile }) {
    const [moved, setMoved] = useState(false);
    const paid = moved ? PALLET.paid + PALLET.toMove : PALLET.paid;
    const unpaid = moved ? PALLET.unpaid - PALLET.toMove : PALLET.unpaid;
    return (
      <Card pad={mobile ? 16 : 20} style={{ borderColor: moved ? 'rgba(46,158,91,0.4)' : T.red + '55', background: moved ? 'rgba(46,158,91,0.05)' : T.panel }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
          <Ic name="grid" size={18} color={moved ? T.green : T.red} sw={2} />
          <span style={{ fontWeight: 900, fontSize: 13, letterSpacing: 0.5, textTransform: 'uppercase' }}>Palettenabgleich</span>
          {moved ? <Chip tone="green" dot>Im Gleichgewicht</Chip> : <Chip tone="red" dot>{PALLET.toMove} zu rücken</Chip>}
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 11.5, color: T.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Linke Seite · unbezahlt</div>
            <Crates n={unpaid} kind="unpaid" move={moved ? 0 : PALLET.toMove} />
            <div style={{ fontFamily: T.display, fontSize: 22, marginTop: 8 }}>{unpaid} <span style={{ fontSize: 13, color: T.sub, fontFamily: T.font, fontWeight: 700 }}>Kisten</span></div>
          </div>
          <div style={{ alignSelf: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, color: moved ? T.green : T.red }}>
            <Ic name="chevron" size={26} color={moved ? T.green : T.red} sw={2.4} />
            {!moved && <span style={{ fontFamily: T.display, fontSize: 18 }}>{PALLET.toMove}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 11.5, color: T.sub, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Rechte Seite · bezahlt</div>
            <Crates n={paid} kind="paid" />
            <div style={{ fontFamily: T.display, fontSize: 22, marginTop: 8 }}>{paid} <span style={{ fontSize: 13, color: T.sub, fontFamily: T.font, fontWeight: 700 }}>Kisten</span></div>
          </div>
        </div>
        <div style={{ height: 1, background: T.line2, margin: '14px 0' }} />
        {moved ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontWeight: 700, fontSize: 13, color: '#1f7a44' }}><Ic name="check" size={17} color={T.green} sw={2.4} />Physische Palette stimmt mit der Kasse überein.</div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: T.sub, lineHeight: 1.4 }}>Es wurde bezahlt — <b style={{ color: T.ink }}>{PALLET.toMove} Kisten</b> nach rechts rücken.</span>
            <Btn primary sm icon="check" onClick={() => setMoved(true)}>Gerückt</Btn>
          </div>
        )}
      </Card>
    );
  }

  // ── GETRÄNKEWART · KPI tile ───────────────────────────────────────────────────
  function Kpi({ value, sub, label, tone = 'ink', warn }) {
    const col = tone === 'red' ? T.red : tone === 'green' ? T.green : tone === 'gold' ? '#9a7200' : T.ink;
    return (
      <Card style={{ flex: 1, minWidth: 0 }} pad={16}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: T.display, fontSize: 30, color: col, lineHeight: 1, whiteSpace: 'nowrap' }}>{value}</span>
          {sub && <span style={{ fontWeight: 800, fontSize: 12.5, color: T.sub }}>{sub}</span>}
        </div>
        <div style={{ fontWeight: 800, fontSize: 12, color: T.ink, marginTop: 8 }}>{label}</div>
        {warn && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 11, color: T.red, marginTop: 4 }}><Ic name="bell" size={13} color={T.red} sw={2.2} />{warn}</div>}
      </Card>
    );
  }

  // ── GETRÄNKEWART · desktop dashboard ─────────────────────────────────────────
  function PageDrinksAdmin() {
    return (
      <div style={{ padding: 28, maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 15px', background: T.panel, fontWeight: 800, fontSize: 13.5 }}>
            <Ic name="beer" size={16} color={T.red} sw={2} />Session 2026 · {OPEN_CRATES + PAID_CRATES} Kisten gesponsert
          </div>
          <div style={{ flex: 1 }} />
          <Btn ghost sm icon="plus">Bestand nachbuchen</Btn>
          <Btn primary sm icon="euro">Geld erhalten</Btn>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Kpi value={eur(PAID_CRATES * PRICE)} label="Kassenstand" tone="green" />
          <Kpi value={eur(OPEN_CRATES * PRICE)} sub={`· ${OPEN_PEOPLE.length} Pers.`} label="offen" tone="red" />
          <Kpi value={`${STOCK}`} sub={`/ ${SEASON}`} label="Kisten im Lager" tone="gold" warn={STOCK < LOW ? 'Bald nachbestellen' : null} />
          <Kpi value={`${OPEN_CRATES + PAID_CRATES}`} label="Kisten diese Saison" tone="ink" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 22, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <PalettenCard />
            <div>
              <SecHead right="alle">Bierliste · Teilnehmer</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.9fr 0.5fr', padding: '11px 18px', background: T.panel2, borderBottom: `1.5px solid ${T.line}`, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>
                  <div>Name</div><div style={{ textAlign: 'right' }}>Kisten</div><div style={{ textAlign: 'right' }}>offen</div><div></div>
                </div>
                {PEOPLE.map((p, i) => (
                  <div key={p[0]} style={{ display: 'grid', gridTemplateColumns: '1.6fr 0.8fr 0.9fr 0.5fr', alignItems: 'center', padding: '10px 18px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar initials={p[1]} tone={p[2]} size={30} /><span style={{ fontWeight: 800, fontSize: 13.5 }}>{p[0]}</span></div>
                    <div style={{ textAlign: 'right', fontFamily: T.display, fontSize: 17 }}>{p[3]}</div>
                    <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5, color: p[4] ? T.red : T.faint }}>{p[4] ? eur(p[4] * PRICE) : '—'}</div>
                    <div style={{ textAlign: 'right' }}>{p[4] ? <Chip tone="red" dot>offen</Chip> : <Ic name="check" size={16} color={T.green} sw={2.4} />}</div>
                  </div>
                ))}
              </Card>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            {/* Geld erhalten CTA */}
            <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: 20, boxShadow: `6px 6px 0 ${T.red}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}><Ic name="euro" size={22} color="#F4B400" sw={2} /><Title size={18} style={{ color: T.cream }}>Geld erhalten</Title></div>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: 'rgba(251,244,230,0.8)', lineHeight: 1.5, marginBottom: 14 }}>Person & Anzahl Kisten wählen — die App gleicht offene Käufe automatisch ab und bucht den Rest.</div>
              <button style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: T.red, border: 'none', color: '#fff', fontFamily: T.font, fontWeight: 800, fontSize: 15, padding: '13px', borderRadius: 12, cursor: 'pointer' }}><Ic name="plus" size={18} color="#fff" sw={2.4} />Zahlung erfassen</button>
            </div>
            {/* offene Posten quick-settle */}
            <div>
              <SecHead>Offene Posten</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {OPEN_PEOPLE.map((p, i) => (
                  <div key={p[0]} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <Avatar initials={p[1]} tone={p[2]} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{p[0]}</div><div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>{p[4]} {kn(p[4])} offen</div></div>
                    <span style={{ fontFamily: T.display, fontSize: 17, color: T.red }}>{eur(p[4] * PRICE)}</span>
                    <Btn ghost sm icon="check">bezahlt</Btn>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: T.panel2, borderTop: `1.5px solid ${T.line}` }}>
                  <Btn ghost sm icon="bell">Alle erinnern</Btn>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{eur(OPEN_CRATES * PRICE)} offen</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── GETRÄNKEWART · mobile "Geld erhalten" reconcile flow ──────────────────────
  function MDrinksReceive({ initial = 'who', onClose }) {
    const [step, setStep] = useState(initial); // who | count | done
    const [person, setPerson] = useState(PEOPLE[4]); // Markus (2 offen)
    const [qty, setQty] = useState(2);
    const reconcile = () => {
      const settled = Math.min(qty, person[4]);
      const extra = Math.max(0, qty - person[4]);
      return { settled, extra };
    };

    if (step === 'who') {
      return (
        <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 14, height: '100%', boxSizing: 'border-box' }}>
          {onClose && <BackBtn onClick={onClose}>Übersicht</BackBtn>}
          <div><Eyebrow style={{ color: T.red }}>Geld erhalten</Eyebrow><Title size={24} style={{ marginTop: 6 }}>Von wem?</Title></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '11px 14px', borderRadius: 12, border: `1.5px solid ${T.line}`, background: T.panel2 }}><Ic name="search" size={17} color={T.faint} /><span style={{ fontWeight: 600, fontSize: 14, color: T.faint }}>Mitglied suchen …</span></div>
          <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>Mit offenem Betrag</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
            {OPEN_PEOPLE.map((p) => (
              <div key={p[0]} onClick={() => { setPerson(p); setQty(p[4]); setStep('count'); }} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 13, border: `2px solid ${person[0] === p[0] ? T.ink : T.line}`, background: T.panel, cursor: 'pointer' }}>
                <Avatar initials={p[1]} tone={p[2]} size={38} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14.5 }}>{p[0]}</div><div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>{p[4]} {kn(p[4])} offen</div></div>
                <span style={{ fontFamily: T.display, fontSize: 18, color: T.red }}>{eur(p[4] * PRICE)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    if (step === 'count') {
      return (
        <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
          <BackBtn onClick={() => setStep('who')}>Zurück</BackBtn>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><Avatar initials={person[1]} tone={person[2]} size={44} /><div><Title size={20}>{person[0]}</Title><div style={{ fontWeight: 700, fontSize: 12.5, color: T.sub }}>{person[4]} {kn(person[4])} offen · {eur(person[4] * PRICE)}</div></div></div>
          <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>Wie viele Kisten bezahlt?</div>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}><Stepper value={qty} set={setQty} /></div>
          <div style={{ display: 'flex', justifyContent: 'center' }}><Chips value={qty} set={setQty} opts={[1, 2, 3, 5]} /></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 14, background: T.panel2, border: `1.5px solid ${T.line}` }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>{qty} × {eur(PRICE)}</span>
            <span style={{ fontFamily: T.display, fontSize: 26, color: T.green }}>{eur(qty * PRICE)}</span>
          </div>
          <div style={{ flex: 1 }} />
          <Btn primary icon="check" onClick={() => setStep('done')} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>{eur(qty * PRICE)} erhalten</Btn>
        </div>
      );
    }
    // done — auto reconcile result
    const { settled, extra } = reconcile();
    return (
      <div style={{ padding: '14px 18px 24px', display: 'flex', flexDirection: 'column', gap: 15, height: '100%', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginTop: 6 }}>
          <div style={{ width: 70, height: 70, borderRadius: 40, background: T.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 22px ${T.green}55` }}><Ic name="check" size={38} color="#fff" sw={2.4} /></div>
          <Title size={24} style={{ marginTop: 12 }}>{eur(qty * PRICE)} verbucht</Title>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: T.sub, marginTop: 4 }}>von {person[0]}</div>
        </div>
        <Card pad={16} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>Automatisch abgeglichen</div>
          {settled > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Ic name="check" size={17} color={T.green} sw={2.4} /><span style={{ fontWeight: 700, fontSize: 13.5 }}><b>{settled}</b> offene {settled === 1 ? 'Kiste' : 'Kisten'} als bezahlt markiert</span></div>
          )}
          {extra > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Ic name="plus" size={17} color={T.blue} sw={2.4} /><span style={{ fontWeight: 700, fontSize: 13.5 }}><b>{extra}</b> neue {extra === 1 ? 'Kiste' : 'Kisten'} im Voraus verbucht</span></div>
          )}
        </Card>
        {/* the pallet nudge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 14, background: 'rgba(225,29,42,0.07)', border: `1.5px solid ${T.red}55` }}>
          <span style={{ width: 42, height: 42, borderRadius: 11, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name="grid" size={22} color="#fff" sw={2} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14.5, color: T.red }}>{qty} Kisten nach rechts rücken</div><div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>auf die bezahlte Seite der Palette</div></div>
        </div>
        <div style={{ flex: 1 }} />
        <Btn primary icon="check" onClick={() => (onClose ? onClose() : setStep('who'))} style={{ width: '100%', justifyContent: 'center' }}>Gerückt & fertig</Btn>
      </div>
    );
  }

  // ── GETRÄNKEWART · mobile dashboard ──────────────────────────────────────────
  function MDrinksAdmin({ initial = 'dash' }) {
    const [view, setView] = useState(initial);
    if (view === 'receive') return <MDrinksReceive onClose={() => setView('dash')} />;
    return (
      <div style={{ height: '100%', overflow: 'auto' }}>
        <div style={{ padding: '14px 16px 26px', display: 'flex', flexDirection: 'column', gap: 15 }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: 8, height: 32, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 13px', background: T.panel, fontWeight: 800, fontSize: 12.5 }}>
            <Ic name="beer" size={15} color={T.red} sw={2} />Session 2026 · {OPEN_CRATES + PAID_CRATES} Kisten
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            <Kpi value={eur(PAID_CRATES * PRICE)} label="Kassenstand" tone="green" />
            <Kpi value={eur(OPEN_CRATES * PRICE)} sub={`· ${OPEN_PEOPLE.length}`} label="offen" tone="red" />
            <Kpi value={`${STOCK}`} sub={`/ ${SEASON}`} label="Kisten im Lager" tone="gold" warn={STOCK < LOW ? 'Bald nachbestellen' : null} />
            <Kpi value={`${OPEN_CRATES + PAID_CRATES}`} label="Kisten diese Saison" tone="ink" />
          </div>

          <Btn primary icon="euro" onClick={() => setView('receive')} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>Geld erhalten</Btn>

          <PalettenCard mobile />

          <div>
            <SecHead>Offene Posten</SecHead>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {OPEN_PEOPLE.map((p, i) => (
                <div key={p[0]} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <Avatar initials={p[1]} tone={p[2]} size={34} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{p[0]}</div><div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>{p[4]} {kn(p[4])} offen</div></div>
                  <span style={{ fontFamily: T.display, fontSize: 17, color: T.red }}>{eur(p[4] * PRICE)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', background: T.panel2, borderTop: `1.5px solid ${T.line}` }}>
                <span style={{ fontWeight: 700, fontSize: 12.5, color: T.sub }}>{OPEN_PEOPLE.length} Personen</span>
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{eur(OPEN_CRATES * PRICE)} offen</span>
              </div>
            </Card>
          </div>

          <div>
            <SecHead right="alle">Teilnehmer</SecHead>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              {RANKED.map((p, i) => (
                <div key={p[0]} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 14px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <Avatar initials={p[1]} tone={p[2]} size={30} />
                  <span style={{ flex: 1, fontWeight: 800, fontSize: 13.5 }}>{p[0]}</span>
                  <span style={{ fontFamily: T.display, fontSize: 16, color: T.faint }}>{p[3]}</span>
                  {p[4] ? <Chip tone="red" dot>{eur(p[4] * PRICE)}</Chip> : <Ic name="check" size={16} color={T.green} sw={2.4} />}
                </div>
              ))}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  window.PageDrinks = PageDrinks;
  window.MDrinks = MDrinks;
  window.PageDrinksAdmin = PageDrinksAdmin;
  window.MDrinksReceive = MDrinksReceive;
  window.MDrinksAdmin = MDrinksAdmin;
})();
