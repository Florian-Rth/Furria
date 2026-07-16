// fcc-ds-fees.jsx — Zahlungen & Kasse (Part 1).
// ONE payment system across Beitrag · Klamotten · Getränkekasse · Tickets, settled
// via Stripe + PayPal. Two surfaces:
//  • PageFees (desktop, Amt Finanzen): controlling dashboard — income by category,
//    offene Posten, members by Mitgliedschaftsart, Kassenbericht CSV/PDF export.
//  • MPay (mobile, member): light "offen"-hint → focused one-tap pay flow.
// Composes the system shell + tokens. Exports window.PageFees (tabbed: Einnahmen-
// Übersicht + Ausgaben & Belege) + window.MPay (pay flow) + window.MBeleg (submit).

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Eyebrow, Avatar, Progress } = window;
  const { useState } = React;
  const MONO = 'ui-monospace, SFMono-Regular, monospace';
  const eur = (n) => n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  const eur0 = (n) => n.toLocaleString('de-DE') + ' €';

  // category palette + glyphs ---------------------------------------------------
  const CATS = {
    beitrag: { label: 'Beiträge', col: '#E11D2A' },
    tickets: { label: 'Ticket-Verkauf', col: '#C98A00' },
    klamotten: { label: 'Klamotten-Shop', col: '#2F6DA8' },
    getraenke: { label: 'Getränkekasse', col: '#2E9E5B' },
  };
  function Glyph({ name, size = 18, color }) {
    const p = { fill: 'none', stroke: color, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const G = {
      shirt: <path d="M8 3 4 6l2 3 2-1.5V21h8V7.5L18 9l2-3-4-3-2 2H10L8 3Z" {...p} />,
      camera: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.2-2h7.6L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5v-9Z" {...p} /><circle cx="12" cy="13" r="3.4" {...p} /></>,
      receipt: <><path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3Z" {...p} /><path d="M9 8h6M9 11.5h6M9 15h4" {...p} /></>,
      ticket: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v2a2 2 0 0 0 0 4v2a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 16.5v-2a2 2 0 0 0 0-4v-2Z" {...p} /><path d="M15 7v10" stroke={color} strokeWidth="1.9" strokeDasharray="2 2" /></>,
      card: <><rect x="3" y="5.5" width="18" height="13" rx="2.5" {...p} /><path d="M3 9.5h18" {...p} /><path d="M6.5 14.5h4" {...p} /></>,
      doc: <><path d="M6 3h8l4 4v14H6V3Z" {...p} /><path d="M14 3v4h4M9 12h6M9 15.5h6" {...p} /></>,
      download: <><path d="M12 4v11M8 11l4 4 4-4" {...p} /><path d="M5 19h14" {...p} /></>,
      paypal: <path d="M8 19l1.8-12h5.4c2.4 0 3.8 1.4 3.4 3.6-.5 2.7-2.4 3.9-5.2 3.9h-2L11 19H8Z" {...p} />,
      check: <path d="M5 12.5l4.5 4.5L19 6.5" {...p} />,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{G[name]}</svg>;
  }
  const catGlyph = (k) => ({ beitrag: 'card', tickets: 'ticket', klamotten: 'shirt', getraenke: 'beer' }[k]);

  function SecHead({ children, right, onRight, style }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14, ...style }}>
        <span style={{ width: 11, height: 11, background: T.red, flexShrink: 0 }} />
        <Title size={17} style={{ whiteSpace: 'nowrap' }}>{children}</Title>
        <div style={{ flex: 1, height: 2, background: T.line }} />
        {right && <span onClick={onRight} style={{ fontWeight: 800, fontSize: 13, color: T.red, cursor: 'pointer', whiteSpace: 'nowrap' }}>{right}</span>}
      </div>
    );
  }

  // ── DATA (Session 2025/26, believable FCC numbers) ──────────────────────────
  const INCOME = [
    ['beitrag', 4380, 660],   // [cat, eingenommen, offen]
    ['tickets', 3120, 0],
    ['klamotten', 1240, 120],
    ['getraenke', 980, 86],
  ];
  const TOTAL_IN = INCOME.reduce((a, r) => a + r[1], 0);
  const TOTAL_OPEN = INCOME.reduce((a, r) => a + r[2], 0);
  const MAXCAT = Math.max(...INCOME.map((r) => r[1]));

  const ARTEN = [
    ['Aktiv', 96, 30, 'red'],
    ['Passiv', 54, 20, 'ink'],
    ['Jugend / Kind', 28, 15, 'gold'],
    ['Ehrenmitglied', 6, 0, 'ink'],
  ];
  const MEMBERS_TOTAL = ARTEN.reduce((a, r) => a + r[1], 0);

  const OFFEN = [
    ['Markus Vogt', 'MV', 'red', 'beitrag', 'Jahresbeitrag 2026', 30, 41],
    ['Familie Schäfer', 'FS', 'ink', 'beitrag', '2× Jugend 2026', 30, 33],
    ['Nina Albrecht', 'NA', 'gold', 'klamotten', 'Trainingsjacke', 45, 12],
    ['Peter Lustig', 'PL', 'ink', 'beitrag', 'Jahresbeitrag 2026', 30, 9],
    ['Tom Berger', 'TB', 'red', 'getraenke', 'Getränkekasse Q4', 24, 6],
    ['Sandra Kühn', 'SK', 'gold', 'klamotten', 'Hoodie „FURRIA"', 35, 4],
  ];
  const RECENT = [
    ['Anna Brunner', 'beitrag', 'Jahresbeitrag 2026', 30, 'paypal', 'vor 2 Std'],
    ['Lukas Frei', 'tickets', '2× Prunksitzung', 20, 'card', 'vor 5 Std'],
    ['Jana Roth', 'klamotten', 'Hoodie „FURRIA"', 35, 'card', 'gestern'],
    ['Uwe Sänger', 'getraenke', 'Getränkekasse Q4', 24, 'paypal', 'gestern'],
    ['Klaus Reinhardt', 'beitrag', 'Jahresbeitrag 2026', 30, 'card', 'vor 2 Tagen'],
  ];

  // ── desktop KPI tile ─────────────────────────────────────────────────────────
  function Kpi({ value, label, tone = 'ink', sub, prog }) {
    const col = tone === 'red' ? T.red : tone === 'green' ? T.green : tone === 'gold' ? '#9a7200' : T.ink;
    return (
      <Card style={{ flex: 1, minWidth: 0 }} pad={17}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: T.display, fontSize: 32, color: col, lineHeight: 1, whiteSpace: 'nowrap' }}>{value}</span>
          {sub && <span style={{ fontWeight: 800, fontSize: 13, color: T.sub }}>{sub}</span>}
        </div>
        {prog && <div style={{ margin: '11px 0 2px' }}><Progress value={prog[0]} max={prog[1]} tone={prog[2]} h={7} /></div>}
        <div style={{ fontWeight: 800, fontSize: 12.5, color: T.ink, marginTop: prog ? 7 : 9 }}>{label}</div>
      </Card>
    );
  }

  function MethodTag({ m }) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 11, color: T.sub, background: T.panel2, border: `1px solid ${T.line}`, padding: '3px 8px', borderRadius: 7 }}>
        <Glyph name={m} size={13} color={m === 'paypal' ? '#2F6DA8' : T.ink} />{m === 'paypal' ? 'PayPal' : 'Karte'}
      </span>
    );
  }

  // ── DESKTOP · Finanzen controlling dashboard (Einnahmen-Übersicht) ───────────
  function FeesOverview() {
    return (
      <div style={{ padding: '16px 28px 28px', maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 15px', background: T.panel, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
            <Ic name="calendar" size={16} color={T.red} sw={2} />Session 2025/26<Ic name="chevdown" size={15} color={T.faint} />
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 12.5, fontWeight: 700, color: T.sub }}>
            <span style={{ width: 8, height: 8, borderRadius: 5, background: T.green }} />Zahlungen laufen über Stripe & PayPal
          </span>
          <div style={{ flex: 1 }} />
          <Btn ghost sm icon="upload">CSV</Btn>
          <Btn primary sm icon="upload">Kassenbericht (PDF)</Btn>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Kpi value={eur0(TOTAL_IN)} label="Einnahmen Session" tone="green" />
          <Kpi value={eur0(TOTAL_OPEN)} label="noch offen" tone="red" />
          <Kpi value={`${MEMBERS_TOTAL - 6}`} sub={`/ ${MEMBERS_TOTAL}`} label="Beiträge bezahlt" tone="ink" prog={[MEMBERS_TOTAL - 6, MEMBERS_TOTAL, 'green']} />
          <Kpi value="100 %" label="digital · kein Bargeld mehr" tone="gold" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 22, alignItems: 'start' }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <SecHead>Einnahmen nach Kategorie</SecHead>
              <Card pad={20}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {INCOME.map(([k, sum, open]) => {
                    const c = CATS[k];
                    return (
                      <div key={k}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, fontWeight: 800, fontSize: 13.5 }}>
                            <span style={{ width: 26, height: 26, borderRadius: 7, background: c.col + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Glyph name={catGlyph(k)} size={15} color={c.col} /></span>
                            {c.label}
                          </span>
                          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 9 }}>
                            {open > 0 && <span style={{ fontWeight: 800, fontSize: 11.5, color: T.red, whiteSpace: 'nowrap' }}>{eur0(open)} offen</span>}
                            <span style={{ fontFamily: T.display, fontSize: 19, whiteSpace: 'nowrap' }}>{eur0(sum)}</span>
                          </span>
                        </div>
                        <div style={{ height: 9, borderRadius: 6, background: T.panel2, overflow: 'hidden' }}><div style={{ width: (sum / MAXCAT * 100) + '%', height: '100%', background: c.col, borderRadius: 6 }} /></div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>

            <div>
              <SecHead right="alle anzeigen">Offene Posten</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.4fr 0.7fr 0.7fr', padding: '11px 18px', background: T.panel2, borderBottom: `1.5px solid ${T.line}`, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>
                  <div>Mitglied</div><div>Posten</div><div style={{ textAlign: 'right' }}>Betrag</div><div style={{ textAlign: 'right' }}>seit</div>
                </div>
                {OFFEN.map(([name, ini, tone, cat, posten, betrag, days], i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.4fr 0.7fr 0.7fr', alignItems: 'center', padding: '11px 18px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar initials={ini} tone={tone} size={30} /><span style={{ fontWeight: 800, fontSize: 13.5 }}>{name}</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: CATS[cat].col, flexShrink: 0 }} /><span style={{ fontWeight: 600, fontSize: 12.5, color: T.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{posten}</span></div>
                    <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5, color: T.red }}>{eur0(betrag)}</div>
                    <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 12, color: days > 30 ? T.red : T.sub }}>{days} T</div>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: `1.5px solid ${T.line}`, background: T.panel2 }}>
                  <Btn ghost sm icon="bell">Alle erinnern</Btn>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>Summe offen <span style={{ fontFamily: T.display, fontSize: 18, color: T.red, marginLeft: 6, whiteSpace: 'nowrap' }}>{eur0(OFFEN.reduce((a, r) => a + r[5], 0))}</span></span>
                </div>
              </Card>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <SecHead>Mitglieder & Beiträge</SecHead>
              <Card pad={18}>
                {ARTEN.map(([label, count, fee, tone], i) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontFamily: T.display, fontSize: 20, width: 34, color: T.ink }}>{count}</span>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13.5 }}>{label}</div>
                        <div style={{ fontWeight: 700, fontSize: 11.5, color: T.sub }}>{fee === 0 ? 'beitragsfrei' : eur0(fee) + ' / Jahr'}</div>
                      </div>
                    </div>
                    <span style={{ fontFamily: T.display, fontSize: 17, color: fee === 0 ? T.faint : T.ink, whiteSpace: 'nowrap' }}>{fee === 0 ? '—' : eur0(count * fee)}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0 2px', borderTop: `1.5px solid ${T.line}`, marginTop: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{MEMBERS_TOTAL} Mitglieder</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: T.sub }}>Soll <span style={{ fontFamily: T.display, fontSize: 18, color: T.ink, marginLeft: 5, whiteSpace: 'nowrap' }}>{eur0(ARTEN.reduce((a, r) => a + r[1] * r[2], 0))}</span></span>
                </div>
              </Card>
            </div>

            <div>
              <SecHead right="Ledger">Letzte Zahlungseingänge</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {RECENT.map(([name, cat, posten, betrag, method, when], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <span style={{ width: 30, height: 30, borderRadius: 8, background: CATS[cat].col + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Glyph name={catGlyph(cat)} size={15} color={CATS[cat].col} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                      <div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{posten} · {when}</div>
                    </div>
                    <MethodTag m={method} />
                    <span style={{ fontFamily: T.display, fontSize: 16, color: T.green, flexShrink: 0, whiteSpace: 'nowrap' }}>+{eur0(betrag)}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: 20, boxShadow: `6px 6px 0 ${T.red}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 9 }}>
                <Glyph name="doc" size={22} color="#F4B400" />
                <Title size={18} style={{ color: T.cream }}>Kassenbericht</Title>
              </div>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: 'rgba(251,244,230,0.8)', lineHeight: 1.5, marginBottom: 14 }}>Einnahmen & Ausgaben einer Periode auf Knopfdruck — fertig für Kassenprüfer & Finanzamt. Kein Zettelchaos mehr.</div>
              <div style={{ display: 'flex', gap: 9 }}>
                <button style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(251,244,230,0.1)', border: '1px solid rgba(251,244,230,0.25)', color: T.cream, fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '10px', borderRadius: 10, cursor: 'pointer' }}><Glyph name="download" size={15} color={T.cream} />PDF</button>
                <button style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7, background: 'rgba(251,244,230,0.1)', border: '1px solid rgba(251,244,230,0.25)', color: T.cream, fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '10px', borderRadius: 10, cursor: 'pointer' }}><Glyph name="download" size={15} color={T.cream} />CSV</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── MOBILE · member one-tap pay flow ─────────────────────────────────────────
  const MY_OPEN = [
    ['beitrag', 'Jahresbeitrag 2026', 'Mitgliedschaft Aktiv', 30],
    ['klamotten', 'Hoodie „FURRIA"', 'Größe L · Klamotten-Shop', 35],
    ['getraenke', 'Getränkekasse Q4', 'Okt – Dez 2025', 12],
  ];
  const MY_TOTAL = MY_OPEN.reduce((a, r) => a + r[3], 0);

  function OpenItem({ cat, title, sub, amount, paid }) {
    const c = CATS[cat];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 0' }}>
        <span style={{ width: 40, height: 40, borderRadius: 11, background: c.col + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Glyph name={catGlyph(cat)} size={20} color={c.col} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5 }}>{title}</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>{sub}</div>
        </div>
        {paid
          ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 12.5, color: T.green }}><Glyph name="check" size={16} color={T.green} />bezahlt</span>
          : <span style={{ fontFamily: T.display, fontSize: 19, whiteSpace: 'nowrap' }}>{eur0(amount)}</span>}
      </div>
    );
  }

  function MPay({ initial = 'open' }) {
    const [step, setStep] = useState(initial); // open | method | done
    const [method, setMethod] = useState('card');

    if (step === 'done') {
      return (
        <div style={{ padding: '14px 18px 26px', display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8 }}>
            <div style={{ width: 78, height: 78, borderRadius: 44, background: T.green, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, boxShadow: `0 8px 22px ${T.green}55` }}><Glyph name="check" size={42} color="#fff" /></div>
            <Title size={28}>Bezahlt!</Title>
            <div style={{ fontFamily: T.display, fontSize: 22, color: T.green, whiteSpace: 'nowrap' }}>{eur(MY_TOTAL)}</div>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: T.sub, maxWidth: 260, lineHeight: 1.5 }}>Beleg ist unterwegs per E-Mail. Deine Beiträge sind für die Session 2026 beglichen.</div>
            <div style={{ marginTop: 6 }}><MethodTag m={method} /></div>
          </div>
          <Btn ghost onClick={() => setStep('open')} style={{ width: '100%', justifyContent: 'center' }}>Fertig</Btn>
        </div>
      );
    }

    if (step === 'method') {
      const Opt = ({ id, label, sub, glyph }) => (
        <div onClick={() => setMethod(id)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '15px 16px', borderRadius: 14, border: `2px solid ${method === id ? T.ink : T.line}`, background: method === id ? T.panel2 : T.panel, cursor: 'pointer' }}>
          <span style={{ width: 44, height: 44, borderRadius: 11, background: id === 'paypal' ? '#2F6DA81a' : '#1A14110d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Glyph name={glyph} size={24} color={id === 'paypal' ? '#2F6DA8' : T.ink} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15 }}>{label}</div><div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>{sub}</div></div>
          <span style={{ width: 22, height: 22, borderRadius: 12, border: `2px solid ${method === id ? T.red : T.line}`, background: method === id ? T.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{method === id && <span style={{ width: 8, height: 8, borderRadius: 5, background: '#fff' }} />}</span>
        </div>
      );
      return (
        <div style={{ padding: '14px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
          <button onClick={() => setStep('open')} style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub, padding: 0 }}><span style={{ transform: 'rotate(180deg)', display: 'inline-flex' }}><Ic name="chevron" size={16} color={T.sub} /></span>Zurück</button>
          <Title size={24}>Bezahlmethode</Title>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <Opt id="card" label="Kreditkarte" sub="Visa · Mastercard · über Stripe" glyph="card" />
            <Opt id="paypal" label="PayPal" sub="mit PayPal-Konto bezahlen" glyph="paypal" />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontWeight: 700, fontSize: 11.5, color: T.faint }}><Glyph name="card" size={14} color={T.faint} />Sicher verschlüsselt · keine Bargeld-Übergabe</div>
          <Btn primary onClick={() => setStep('done')} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>{eur(MY_TOTAL)} bezahlen</Btn>
        </div>
      );
    }

    // step open
    return (
      <div style={{ padding: '14px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
        <div>
          <Eyebrow style={{ color: T.red }}>Aus deiner Übersicht</Eyebrow>
          <Title size={26} style={{ marginTop: 6 }}>Offene Beiträge</Title>
          <div style={{ fontWeight: 600, fontSize: 13.5, color: T.sub, marginTop: 5 }}>Alles an einem Ort — Beitrag, Shop & Getränkekasse.</div>
        </div>

        <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: '18px 20px', boxShadow: `5px 5px 0 ${T.red}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: 'rgba(251,244,230,0.7)' }}>Offener Betrag</div>
            <div style={{ fontFamily: T.display, fontSize: 38, lineHeight: 1, marginTop: 3, whiteSpace: 'nowrap' }}>{eur(MY_TOTAL)}</div>
          </div>
          <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 800, fontSize: 13 }}>{MY_OPEN.length} Posten</div><div style={{ fontWeight: 600, fontSize: 11.5, color: 'rgba(251,244,230,0.6)' }}>Session 2026</div></div>
        </div>

        <Card pad={0} style={{ padding: '2px 16px' }}>
          {MY_OPEN.map((r, i) => (
            <div key={i} style={{ borderTop: i ? `1px solid ${T.line2}` : 'none' }}><OpenItem cat={r[0]} title={r[1]} sub={r[2]} amount={r[3]} /></div>
          ))}
        </Card>

        <div style={{ flex: 1 }} />
        <Btn primary icon="bolt" onClick={() => setStep('method')} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>Jetzt bezahlen · {eur(MY_TOTAL)}</Btn>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontWeight: 700, fontSize: 11.5, color: T.faint }}><Glyph name="card" size={14} color={T.faint} />Kreditkarte oder PayPal · sicher</div>
      </div>
    );
  }

  // ── EXPENSES / Belege (the outflow side of the ledger) ──────────────────────
  const EXP_CATS = {
    lebensmittel: { label: 'Lebensmittel', col: '#2E9E5B' },
    material: { label: 'Material', col: '#2F6DA8' },
    deko: { label: 'Deko', col: '#C98A00' },
    werbung: { label: 'Werbung & Druck', col: '#E11D2A' },
    waren: { label: 'Wareneinkauf', col: '#7A6E63' },
  };
  // [who, ini, tone, betrag, cat, posten, event, when, status]  status: eingereicht | erstattet | gebucht
  const BELEGE = [
    ['Tom Berger', 'TB', 'red', 87.40, 'lebensmittel', 'Würstchen & Brötchen', 'Sommerfest 2026', 'vor 1 Tag', 'eingereicht'],
    ['Nina Albrecht', 'NA', 'gold', 34.90, 'deko', 'Deko & Luftballons', 'Kinderfasching', 'vor 2 Tagen', 'eingereicht'],
    ['Bernd Hofer', 'BH', 'ink', 62.00, 'werbung', 'Plakat-Druck A2', 'Prunksitzung', 'vor 3 Tagen', 'eingereicht'],
    ['Sandra Kühn', 'SK', 'gold', 156.00, 'material', 'Pokale & Orden', 'Prunksitzung', 'vor 5 Tagen', 'erstattet'],
    ['Verein (Einkauf)', 'FV', 'red', 480.00, 'waren', '2 Paletten Bier', 'Saison 2026', 'vor 1 Woche', 'gebucht'],
    ['Uwe Sänger', 'US', 'ink', 28.50, 'lebensmittel', 'Kaffee & Kuchen', 'Rentnerfasching', 'vor 1 Woche', 'erstattet'],
  ];
  const EXP_TOTAL = BELEGE.reduce((a, b) => a + b[3], 0);
  const EXP_OPEN = BELEGE.filter((b) => b[8] === 'eingereicht');
  const EXP_OPEN_SUM = EXP_OPEN.reduce((a, b) => a + b[3], 0);
  const EXP_BYCAT = Object.keys(EXP_CATS).map((k) => [k, BELEGE.filter((b) => b[4] === k).reduce((a, b) => a + b[3], 0)]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]);
  const EXP_MAX = Math.max(...EXP_BYCAT.map((r) => r[1]));
  const SALDO = TOTAL_IN - EXP_TOTAL;
  const ESTAT = { eingereicht: ['gold', 'Zu prüfen'], erstattet: ['green', 'Bar erstattet'], gebucht: ['green', 'Gebucht'] };

  // small tilted receipt thumbnail
  function BelegThumb({ col = T.ink, size = 52 }) {
    return (
      <div style={{ width: size, height: size * 1.16, background: '#fff', border: `1.5px solid ${col}55`, borderRadius: 4, transform: 'rotate(-3deg)', boxShadow: T.shadow, padding: '7px 6px 0', flexShrink: 0, position: 'relative' }}>
        <div style={{ height: 4, width: '70%', background: col + '40', borderRadius: 2, marginBottom: 4 }} />
        {[0.9, 0.6, 0.8, 0.5].map((w, i) => <div key={i} style={{ height: 2.5, width: `${w * 100}%`, background: T.line, borderRadius: 2, marginBottom: 3 }} />)}
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 5, background: `linear-gradient(135deg, transparent 33%, #fff 33%, #fff 66%, transparent 66%), linear-gradient(45deg, transparent 33%, ${col}22 33%)`, backgroundSize: '6px 6px' }} />
      </div>
    );
  }

  function BelegRow({ b, last, action }) {
    const [who, ini, tone, betrag, cat, posten, event, when, status] = b;
    const c = EXP_CATS[cat];
    const [stone, slabel] = ESTAT[status];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderTop: last ? 'none' : `1px solid ${T.line2}` }}>
        <BelegThumb col={c.col} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{posten}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 3 }}>
            <span style={{ width: 7, height: 7, borderRadius: 2, background: c.col, flexShrink: 0 }} />
            <span style={{ fontWeight: 600, fontSize: 12, color: T.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.label} · {event}</span>
          </div>
          <div style={{ fontWeight: 600, fontSize: 11.5, color: T.faint, marginTop: 2 }}>{who} · {when}</div>
        </div>
        <span style={{ fontFamily: T.display, fontSize: 19, whiteSpace: 'nowrap' }}>{eur0(betrag)}</span>
        {action
          ? <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}><Btn ghost sm>Ansehen</Btn><Btn primary sm tone="green" icon="check">Genehmigen</Btn></div>
          : <Chip tone={stone} dot>{slabel}</Chip>}
      </div>
    );
  }

  // ── DESKTOP · Ausgaben & Belege tab ──────────────────────────────────────────
  function FeesExpenses() {
    return (
      <div style={{ padding: '16px 28px 28px', maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 15px', background: T.panel, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
            <Ic name="calendar" size={16} color={T.red} sw={2} />Session 2025/26<Ic name="chevdown" size={15} color={T.faint} />
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: T.sub }}>Erstattung in bar — vom Finanzwart, hier dokumentiert</span>
          <div style={{ flex: 1 }} />
          <Btn primary sm icon="plus">Ausgabe erfassen</Btn>
        </div>

        <div style={{ display: 'flex', gap: 16 }}>
          <Kpi value={eur0(Math.round(EXP_TOTAL))} label="Ausgaben Session" tone="ink" />
          <Kpi value={`${EXP_OPEN.length}`} sub={`· ${eur0(Math.round(EXP_OPEN_SUM))}`} label="Belege zu prüfen" tone="gold" />
          <Kpi value={eur0(Math.round(EXP_TOTAL - EXP_OPEN_SUM))} label="bar erstattet & gebucht" tone="green" />
          <Kpi value={eur0(Math.round(SALDO))} label="Saldo (Einnahmen − Ausgaben)" tone="green" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 22, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <SecHead>Belege zur Genehmigung</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {EXP_OPEN.map((b, i) => <BelegRow key={i} b={b} last={i === EXP_OPEN.length - 1} action />)}
              </Card>
            </div>
            <div>
              <SecHead right="Ledger">Gebucht & erstattet</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {BELEGE.filter((b) => b[8] !== 'eingereicht').map((b, i, arr) => <BelegRow key={i} b={b} last={i === arr.length - 1} />)}
              </Card>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div>
              <SecHead>Saldo Session</SecHead>
              <Card pad={20}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}><span style={{ fontWeight: 700, fontSize: 13.5, color: T.sub }}>Einnahmen</span><span style={{ fontFamily: T.display, fontSize: 20, color: T.green, whiteSpace: 'nowrap' }}>+{eur0(TOTAL_IN)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '4px 0' }}><span style={{ fontWeight: 700, fontSize: 13.5, color: T.sub }}>Ausgaben</span><span style={{ fontFamily: T.display, fontSize: 20, color: T.red, whiteSpace: 'nowrap' }}>−{eur0(Math.round(EXP_TOTAL))}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '11px 0 2px', borderTop: `1.5px solid ${T.line}`, marginTop: 6 }}><span style={{ fontWeight: 800, fontSize: 14 }}>Saldo</span><span style={{ fontFamily: T.display, fontSize: 26, whiteSpace: 'nowrap' }}>{eur0(Math.round(SALDO))}</span></div>
              </Card>
            </div>
            <div>
              <SecHead>Ausgaben nach Kategorie</SecHead>
              <Card pad={20}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {EXP_BYCAT.map(([k, sum]) => {
                    const c = EXP_CATS[k];
                    return (
                      <div key={k}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: c.col }} />{c.label}</span>
                          <span style={{ fontFamily: T.display, fontSize: 17, whiteSpace: 'nowrap' }}>{eur0(Math.round(sum))}</span>
                        </div>
                        <div style={{ height: 8, borderRadius: 5, background: T.panel2, overflow: 'hidden' }}><div style={{ width: (sum / EXP_MAX * 100) + '%', height: '100%', background: c.col, borderRadius: 5 }} /></div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── PageFees: tabbed wrapper (Einnahmen-Übersicht ↔ Ausgaben & Belege) ────────
  function PageFees({ tab: tab0 = 'overview' }) {
    const [tab, setTab] = useState(tab0);
    const TABS = [['overview', 'Einnahmen & Übersicht'], ['expenses', 'Ausgaben & Belege']];
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 28px 0' }}>
          <div style={{ display: 'inline-flex', gap: 4, background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: 4 }}>
            {TABS.map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} style={{ border: 'none', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13.5, padding: '8px 16px', borderRadius: 9, background: tab === id ? T.ink : 'transparent', color: tab === id ? '#fff' : T.sub }}>{label}</button>
            ))}
          </div>
        </div>
        {tab === 'overview' ? <FeesOverview /> : <FeesExpenses />}
      </div>
    );
  }

  // ── MOBILE · member „Auslage einreichen" flow ────────────────────────────────
  const MY_AUSLAGEN = [
    ['Pokale & Orden', 'Prunksitzung', 156.00, 'erstattet'],
    ['Bastelmaterial', 'Kindergarde', 18.20, 'erstattet'],
  ];
  function MField({ label, value, glyph, col }) {
    return (
      <div>
        <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
        <div style={{ minHeight: 46, display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', borderRadius: 11, border: `1.5px solid ${T.line}`, background: T.panel, fontWeight: 700, fontSize: 14.5, color: T.ink }}>
          {glyph && <span style={{ width: 9, height: 9, borderRadius: 3, background: col || T.red, flexShrink: 0 }} />}{value}
        </div>
      </div>
    );
  }
  function MBeleg({ initial = 'form' }) {
    const [step, setStep] = useState(initial); // form | sent
    if (step === 'sent') {
      const TL = [['Eingereicht', 'done'], ['Wird vom Finanzwart geprüft', 'now'], ['Bar erstattet', 'next']];
      return (
        <div style={{ padding: '14px 18px 26px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <div style={{ width: 72, height: 72, borderRadius: 40, background: T.green, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 22px ${T.green}55` }}><Glyph name="check" size={40} color="#fff" /></div>
            <Title size={26} style={{ marginTop: 12 }}>Eingereicht!</Title>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: T.sub, maxWidth: 280, margin: '6px auto 0', lineHeight: 1.5 }}>Deine Auslage über <b style={{ color: T.ink }}>87,40 €</b> liegt beim Finanzwart zur Genehmigung. Du bekommst das Geld in bar zurück.</div>
          </div>
          <Card pad={16}>
            {TL.map(([t, s], i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '7px 0' }}>
                <span style={{ width: 22, height: 22, borderRadius: 12, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s === 'done' ? T.green : s === 'now' ? 'rgba(244,180,0,0.2)' : T.panel2, border: s === 'next' ? `2px solid ${T.line}` : 'none' }}>{s === 'done' ? <Glyph name="check" size={13} color="#fff" /> : s === 'now' ? <span style={{ width: 8, height: 8, borderRadius: 5, background: '#9a7200' }} /> : null}</span>
                <span style={{ fontWeight: s === 'next' ? 600 : 800, fontSize: 13.5, color: s === 'next' ? T.faint : T.ink }}>{t}</span>
              </div>
            ))}
          </Card>
          <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>Meine Auslagen</div>
          <Card pad={0} style={{ padding: '2px 16px' }}>
            {MY_AUSLAGEN.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                <div><div style={{ fontWeight: 800, fontSize: 13.5 }}>{r[0]}</div><div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>{r[1]}</div></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ fontFamily: T.display, fontSize: 16, whiteSpace: 'nowrap' }}>{eur0(r[2])}</span><Chip tone="green" dot>Erstattet</Chip></div>
              </div>
            ))}
          </Card>
          <div style={{ flex: 1 }} />
          <Btn ghost onClick={() => setStep('form')} style={{ width: '100%', justifyContent: 'center' }}>Fertig</Btn>
        </div>
      );
    }
    return (
      <div style={{ padding: '14px 18px 26px', display: 'flex', flexDirection: 'column', gap: 15, height: '100%', boxSizing: 'border-box', overflowY: 'auto' }}>
        <div>
          <Eyebrow style={{ color: T.red }}>Auslage einreichen</Eyebrow>
          <Title size={25} style={{ marginTop: 6 }}>Geld zurückholen</Title>
          <div style={{ fontWeight: 600, fontSize: 13, color: T.sub, marginTop: 5 }}>Etwas für den Verein ausgelegt? Beleg fotografieren — der Finanzwart erstattet bar.</div>
        </div>
        {/* attached receipt */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 14, borderRadius: 14, border: `1.5px solid ${T.line}`, background: T.panel2 }}>
          <BelegThumb col={T.green} size={56} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Beleg angehängt</div>
            <div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>EDEKA · 12.06.2026 · Foto</div>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 12.5, color: T.red }}><Glyph name="camera" size={16} color={T.red} />ändern</span>
        </div>
        <MField label="Betrag" value="87,40 €" />
        <MField label="Kategorie" value="Lebensmittel" glyph col={EXP_CATS.lebensmittel.col} />
        <MField label="Veranstaltung" value="Sommerfest 2026" />
        <MField label="Notiz" value="Würstchen & Brötchen" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', borderRadius: 10, background: 'rgba(46,158,91,0.1)' }}>
          <Glyph name="check" size={15} color={T.green} />
          <span style={{ fontWeight: 700, fontSize: 12, color: '#1f7a44', lineHeight: 1.4 }}>Erstattung erfolgt in bar vom Finanzwart — wird hier dokumentiert & verbucht.</span>
        </div>
        <Btn primary icon="upload" onClick={() => setStep('sent')} style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px' }}>Auslage einreichen</Btn>
      </div>
    );
  }

  window.PageFees = PageFees;
  window.MPay = MPay;
  window.MBeleg = MBeleg;
})();
