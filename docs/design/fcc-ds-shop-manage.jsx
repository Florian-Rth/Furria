// fcc-ds-shop-manage.jsx — Klamotten-Shop · Kleidung-Amt (/shop/manage).
// The magic: a Sammelbestellung auto-consolidates every member order into ONE
// supplier list (X× Gr. L …) to export, then Ausgabe-Tracking (abhaken wer seins
// hat) + wer bar offen ist. Reads window.SHOP. Exports PageShopManage + MShopManage.

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Eyebrow, Avatar } = window;
  const { useState } = React;
  const S = window.SHOP;
  const { eur, PRODUCTS, P, RUNDE, CONSOLIDATED, SHOP_ORDERS } = S;

  function Shirt({ size = 22, color, sw = 1.8 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3 4 6l2 3 2-1.5V21h8V7.5L18 9l2-3-4-3-2 2H10L8 3Z" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }
  const TOTAL_ITEMS = CONSOLIDATED.reduce((a, [, v]) => a + v.reduce((b, x) => b + x[1], 0), 0);
  const TOTAL_VALUE = CONSOLIDATED.reduce((a, [id, v]) => a + v.reduce((b, x) => b + x[1], 0) * P(id)[2], 0);
  const OPEN_SUM = SHOP_ORDERS.reduce((a, o) => a + o[4], 0);
  const OPEN_N = SHOP_ORDERS.filter((o) => o[4] > 0).length;
  const HANDED = SHOP_ORDERS.filter((o) => o[5]).length;

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
  function Kpi({ value, sub, label, tone = 'ink', warn }) {
    const col = tone === 'red' ? T.red : tone === 'green' ? T.green : tone === 'gold' ? '#9a7200' : T.ink;
    return (
      <Card style={{ flex: 1, minWidth: 0 }} pad={16}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: T.display, fontSize: 30, color: col, lineHeight: 1, whiteSpace: 'nowrap' }}>{value}</span>
          {sub && <span style={{ fontWeight: 800, fontSize: 12.5, color: T.sub }}>{sub}</span>}
        </div>
        <div style={{ fontWeight: 800, fontSize: 12, color: T.ink, marginTop: 8 }}>{label}</div>
        {warn && <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 11, color: '#9a7200', marginTop: 4 }}><Ic name="clock" size={13} color="#9a7200" sw={2.2} />{warn}</div>}
      </Card>
    );
  }

  // ── consolidated supplier list ────────────────────────────────────────────────
  function ConsolidationCard({ id, variants, mobile }) {
    const p = P(id);
    const n = variants.reduce((a, x) => a + x[1], 0);
    return (
      <Card pad={mobile ? 14 : 17}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: p[5] + '1a', border: `1.5px solid ${p[5]}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shirt size={22} color={p[5]} /></div>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14.5 }}>{p[1]}</div><div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>{eur(p[2])} / Stück</div></div>
          <div style={{ textAlign: 'right' }}><div style={{ fontFamily: T.display, fontSize: 24, color: T.ink }}>{n}</div><div style={{ fontWeight: 700, fontSize: 10.5, color: T.faint, textTransform: 'uppercase', letterSpacing: 0.5 }}>Stück</div></div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {variants.map(([v, q]) => (
            <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 11px', borderRadius: 9, background: T.panel2, border: `1.5px solid ${T.line}`, fontWeight: 800, fontSize: 12.5 }}>
              <span style={{ color: T.sub }}>{v}</span><span style={{ fontFamily: T.display, fontSize: 15, color: T.ink }}>{q}×</span>
            </span>
          ))}
        </div>
      </Card>
    );
  }

  // ── Ausgabe checklist row ─────────────────────────────────────────────────────
  function AusgabeRow({ o, last, handed, toggle }) {
    const [name, ini, tone, items, open] = o;
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderTop: last ? 'none' : `1px solid ${T.line2}`, opacity: handed ? 0.6 : 1 }}>
        <Avatar initials={ini} tone={tone} size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14, textDecoration: handed ? 'line-through' : 'none' }}>{name}</div>
          <div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>{items} {items === 1 ? 'Artikel' : 'Artikel'}</div>
        </div>
        {open > 0 ? <Chip tone="gold" dot>{eur(open)} bar</Chip> : <Chip tone="green" dot>bezahlt</Chip>}
        <button onClick={toggle} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1.5px solid ${handed ? T.green : T.line}`, background: handed ? T.green : T.panel, color: handed ? '#fff' : T.sub, borderRadius: 9, padding: '7px 12px', fontFamily: T.font, fontWeight: 800, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${handed ? '#fff' : T.line}`, background: handed ? 'rgba(255,255,255,0.25)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{handed && <Ic name="check" size={11} color="#fff" sw={3} />}</span>
          {handed ? 'ausgegeben' : 'ausgeben'}
        </button>
      </div>
    );
  }

  // ── DESKTOP ───────────────────────────────────────────────────────────────────
  function PageShopManage({ tab: tab0 = 'bestellung' }) {
    const [tab, setTab] = useState(tab0);
    const [handed, setHanded] = useState(() => SHOP_ORDERS.map((o) => o[5]));
    const handedN = handed.filter(Boolean).length;
    const TABS = [['bestellung', 'Sammelbestellung'], ['ausgabe', 'Ausgabe & Zahlung'], ['sortiment', 'Sortiment']];

    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '18px 28px 0' }}>
          <div style={{ display: 'inline-flex', gap: 4, background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: 4 }}>
            {TABS.map(([id, l]) => <button key={id} onClick={() => setTab(id)} style={{ border: 'none', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13.5, padding: '8px 16px', borderRadius: 9, background: tab === id ? T.ink : 'transparent', color: tab === id ? '#fff' : T.sub }}>{l}</button>)}
          </div>
        </div>

        <div style={{ padding: '20px 28px 28px', maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', gap: 16 }}>
            <Kpi value={`${TOTAL_ITEMS}`} sub={`· ${RUNDE.orders} Best.`} label="Artikel in der Sammelbestellung" tone="ink" />
            <Kpi value={eur(TOTAL_VALUE)} label="Bestellwert" tone="green" />
            <Kpi value={eur(OPEN_SUM)} sub={`· ${OPEN_N} Pers.`} label="bar offen" tone="gold" />
            <Kpi value={`${RUNDE.closeIn}`} sub="Tage" label={`offen bis ${RUNDE.deadline}`} tone="red" warn="dann Bestellung raus" />
          </div>

          {tab === 'bestellung' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.5fr) minmax(0,1fr)', gap: 22, alignItems: 'start' }}>
              <div>
                <SecHead right="als CSV exportieren">Lieferanten-Liste · automatisch zusammengefasst</SecHead>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {CONSOLIDATED.map(([id, v]) => <ConsolidationCard key={id} id={id} variants={v} />)}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: 22, boxShadow: `6px 6px 0 ${T.red}` }}>
                  <Eyebrow style={{ color: 'rgba(251,244,230,0.6)' }}>Sammelbestellung {RUNDE.name}</Eyebrow>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '8px 0 4px' }}><span style={{ fontFamily: T.display, fontSize: 44, lineHeight: 1 }}>{TOTAL_ITEMS}</span><span style={{ fontWeight: 800, fontSize: 15, color: 'rgba(251,244,230,0.8)' }}>Artikel</span></div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: 'rgba(251,244,230,0.8)', lineHeight: 1.5, marginBottom: 16 }}>aus {RUNDE.orders} Mitglieder-Bestellungen · Frist {RUNDE.deadline} · Lieferung {RUNDE.delivery}</div>
                  <button style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: T.red, border: 'none', color: '#fff', fontFamily: T.font, fontWeight: 800, fontSize: 15, padding: '13px', borderRadius: 12, cursor: 'pointer' }}><Ic name="upload" size={18} color="#fff" sw={2.2} />Bestellung an Lieferant senden</button>
                  <div style={{ display: 'flex', gap: 9, marginTop: 9 }}>
                    <button style={{ flex: 1, background: 'rgba(251,244,230,0.1)', border: '1px solid rgba(251,244,230,0.25)', color: T.cream, fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '10px', borderRadius: 10, cursor: 'pointer' }}>CSV</button>
                    <button style={{ flex: 1, background: 'rgba(251,244,230,0.1)', border: '1px solid rgba(251,244,230,0.25)', color: T.cream, fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '10px', borderRadius: 10, cursor: 'pointer' }}>PDF</button>
                  </div>
                </div>
                <Card pad={16} style={{ display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                  <Ic name="bell" size={18} color={T.red} sw={2} />
                  <span style={{ fontWeight: 700, fontSize: 12.5, color: T.sub, lineHeight: 1.45 }}>Kein Abtippen mehr: jede Bestellung fließt automatisch in diese Liste. Größen sind schon gezählt.</span>
                </Card>
              </div>
            </div>
          )}

          {tab === 'ausgabe' && (
            <div>
              <SecHead right={`${handedN}/${SHOP_ORDERS.length} ausgegeben`}>Ausgabe & Zahlung</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {SHOP_ORDERS.map((o, i) => <AusgabeRow key={o[0]} o={o} last={i === SHOP_ORDERS.length - 1} handed={handed[i]} toggle={() => setHanded((h) => h.map((x, j) => (j === i ? !x : x)))} />)}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: T.panel2, borderTop: `1.5px solid ${T.line}` }}>
                  <span style={{ fontWeight: 800, fontSize: 13 }}>{handedN} / {SHOP_ORDERS.length} ausgegeben</span>
                  <span style={{ fontWeight: 800, fontSize: 13, color: T.sub }}>{eur(OPEN_SUM)} bar offen</span>
                </div>
              </Card>
            </div>
          )}

          {tab === 'sortiment' && (
            <div>
              <SecHead right="Artikel hinzufügen">Sortiment pflegen</SecHead>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {PRODUCTS.map((p, i) => (
                  <div key={p[0]} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: p[5] + '1a', border: `1.5px solid ${p[5]}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shirt size={22} color={p[5]} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14 }}>{p[1]}</div><div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>{p[3] === 'runde' ? 'Sammelbestellung' : 'Dauer-Sortiment'} · {p[4] === 'uni' ? 'Einheitsgröße' : 'Herren · Damen'}</div></div>
                    <span style={{ fontFamily: T.display, fontSize: 18, marginRight: 4 }}>{eur(p[2])}</span>
                    <span style={{ width: 42, height: 24, borderRadius: 20, background: T.green, position: 'relative', flexShrink: 0 }}><span style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 12, background: '#fff' }} /></span>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MOBILE ──────────────────────────────────────────────────────────────────
  function MShopManage({ initial = 'bestellung' }) {
    const [tab, setTab] = useState(initial);
    const [handed, setHanded] = useState(() => SHOP_ORDERS.map((o) => o[5]));
    const handedN = handed.filter(Boolean).length;
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: 11, padding: 3, width: '100%' }}>
            {[['bestellung', 'Sammelbestellung'], ['ausgabe', 'Ausgabe']].map(([id, l]) => <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '8px', borderRadius: 8, background: tab === id ? T.ink : 'transparent', color: tab === id ? '#fff' : T.sub }}>{l}</button>)}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {tab === 'bestellung' ? (
            <div style={{ padding: '14px 16px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: '16px 18px', boxShadow: `5px 5px 0 ${T.red}`, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div><div style={{ fontWeight: 700, fontSize: 12, color: 'rgba(251,244,230,0.7)' }}>{RUNDE.name} · bis {RUNDE.deadline}</div><div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}><span style={{ fontFamily: T.display, fontSize: 34, lineHeight: 1 }}>{TOTAL_ITEMS}</span><span style={{ fontWeight: 800, fontSize: 13, color: 'rgba(251,244,230,0.8)' }}>Artikel</span></div></div>
                <div style={{ flex: 1 }} />
                <span style={{ fontFamily: T.display, fontSize: 20, color: '#F4B400' }}>{eur(TOTAL_VALUE)}</span>
              </div>
              {CONSOLIDATED.map(([id, v]) => <ConsolidationCard key={id} id={id} variants={v} mobile />)}
              <Btn primary icon="upload" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px' }}>An Lieferant senden</Btn>
            </div>
          ) : (
            <div style={{ padding: '14px 16px 26px', display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: 13.5 }}>{handedN} / {SHOP_ORDERS.length} ausgegeben</span>
                <span style={{ fontWeight: 800, fontSize: 13, color: '#9a7200' }}>{eur(OPEN_SUM)} bar offen</span>
              </div>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {SHOP_ORDERS.map((o, i) => <AusgabeRow key={o[0]} o={o} last={i === SHOP_ORDERS.length - 1} handed={handed[i]} toggle={() => setHanded((h) => h.map((x, j) => (j === i ? !x : x)))} />)}
              </Card>
            </div>
          )}
        </div>
      </div>
    );
  }

  window.PageShopManage = PageShopManage;
  window.MShopManage = MShopManage;
})();
