// fcc-ds-shop.jsx — Vereins-Klamotten-Shop · Mitglied (/shop).
// Model: Dauer-Sortiment (immer bestellbar) + saisonale SAMMELBESTELLUNG (Frist →
// Sammel-Order beim Lieferanten → Lieferung → Ausgabe). Bezahlung: direkt über das
// eine Zahlsystem (Stripe/PayPal) ODER bar (Amt bestätigt) — wie die Bierliste.
// Shared data lives on window.SHOP (Amt-Datei liest es). Exports PageShop + MShop.

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Eyebrow, Avatar } = window;
  const { useState } = React;
  const eur = (n) => n.toLocaleString('de-DE') + ' €';
  function Shirt({ size = 22, color, sw = 1.8 }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3 4 6l2 3 2-1.5V21h8V7.5L18 9l2-3-4-3-2 2H10L8 3Z" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" /></svg>;
  }

  // ── shared catalogue / data ──────────────────────────────────────────────────
  const SIZES_H = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const SIZES_D = ['XS', 'S', 'M', 'L', 'XL'];
  // [id, name, price, kind('dauer'|'runde'), fit('hd'|'uni'), tint]
  const PRODUCTS = [
    ['softshell', 'Softshell-Jacke', 49, 'runde', 'hd', '#E11D2A'],
    ['fleece', 'Fleece-Jacke', 39, 'runde', 'hd', '#1A1411'],
    ['polo', 'Polo-Shirt', 24, 'runde', 'hd', '#2F6DA8'],
    ['schal', 'FURRIA-Schal', 14, 'dauer', 'uni', '#F4B400'],
    ['muetze', 'Beanie-Mütze', 12, 'dauer', 'uni', '#1A1411'],
    ['kappe', 'Narrenkappe', 22, 'dauer', 'uni', '#E11D2A'],
  ];
  const P = (id) => PRODUCTS.find((p) => p[0] === id);
  const RUNDE = { name: 'Frühjahr 2026', deadline: '15.03.', closeIn: 9, delivery: '~4 Wochen', orders: 22, items: 53 };

  // member "me" = Markus Vogt — Meine Bestellungen
  // [productId, variant, price, pay('paid'|'open'), status]
  const MY_ORDERS = [
    ['softshell', 'Herren · L', 49, 'paid', 'lieferant'],
    ['polo', 'Herren · M', 24, 'open', 'wartet'],
    ['schal', 'Einheitsgröße', 14, 'paid', 'abgeholt'],
  ];
  const STATUS = {
    wartet: ['gold', 'Zahlung offen'],
    bestellt: ['blue', 'Bestellt'],
    lieferant: ['blue', 'Beim Lieferanten'],
    da: ['green', 'Da – bitte abholen'],
    abgeholt: ['neutral', 'Abgeholt'],
  };

  // consolidated supplier list for the Sammelbestellung (Amt side reads this)
  const CONSOLIDATED = [
    ['softshell', [['H·M', 3], ['H·L', 7], ['H·XL', 4], ['H·XXL', 1], ['D·S', 2], ['D·M', 4], ['D·L', 2]]],
    ['fleece', [['H·M', 2], ['H·L', 5], ['H·XL', 2], ['D·S', 1], ['D·M', 3]]],
    ['polo', [['H·M', 4], ['H·L', 6], ['H·XL', 2], ['D·S', 3], ['D·M', 2]]],
  ];
  // Amt: members in the current Sammelbestellung — [name, ini, tone, itemCount, openEur, handed]
  const SHOP_ORDERS = [
    ['Tom Berger', 'TB', 'red', 2, 0, false],
    ['Markus Vogt', 'MV', 'gold', 2, 24, false],
    ['Bernd Hofer', 'BH', 'ink', 1, 0, true],
    ['Uwe Sänger', 'US', 'gold', 3, 39, false],
    ['Klaus Reinhardt', 'KR', 'ink', 1, 0, true],
    ['Jens Adam', 'JA', 'ink', 2, 24, false],
    ['Sandra Kühn', 'SK', 'gold', 1, 0, true],
    ['Peter Lustig', 'PL', 'red', 1, 14, false],
  ];
  window.SHOP = { eur, SIZES_H, SIZES_D, PRODUCTS, P, RUNDE, STATUS, CONSOLIDATED, SHOP_ORDERS };

  // ── shared bits ───────────────────────────────────────────────────────────────
  function Plh({ tint, label, h, radius = 12, style }) {
    return (
      <div style={{ height: h, borderRadius: radius, background: `repeating-linear-gradient(135deg, ${tint}26, ${tint}26 8px, ${tint}12 8px, ${tint}12 16px)`, border: `1.5px solid ${tint}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
        <Shirt size={Math.min(40, h * 0.34)} color={tint} />
      </div>
    );
  }
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
  function RundeBanner({ compact }) {
    return (
      <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: compact ? '14px 16px' : '16px 20px', boxShadow: `${compact ? 5 : 6}px ${compact ? 5 : 6}px 0 ${T.red}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(244,180,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name="calendar" size={22} color="#F4B400" sw={2} /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: compact ? 14 : 15 }}>Sammelbestellung {RUNDE.name}</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: 'rgba(251,244,230,0.75)' }}>offen bis {RUNDE.deadline} · Lieferung {RUNDE.delivery}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: T.display, fontSize: compact ? 22 : 26, color: '#fff', lineHeight: 1 }}>{RUNDE.closeIn}</div>
          <div style={{ fontWeight: 700, fontSize: 10.5, color: 'rgba(251,244,230,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>Tage</div>
        </div>
      </div>
    );
  }
  function Badge({ kind }) {
    return kind === 'runde'
      ? <Chip tone="gold" dot>Sammelbestellung</Chip>
      : <Chip tone="neutral">Dauer-Sortiment</Chip>;
  }
  function OrderRow({ o, last }) {
    const p = P(o[0]); const [stone, slabel] = STATUS[o[4]];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 0', borderTop: last ? 'none' : `1px solid ${T.line2}` }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: p[5] + '1a', border: `1.5px solid ${p[5]}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Shirt size={22} color={p[5]} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{p[1]}</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>{o[1]} · {eur(o[2])}{o[3] === 'open' ? ' · bar offen' : ''}</div>
        </div>
        <Chip tone={stone} dot={o[4] === 'da' || o[4] === 'wartet'}>{slabel}</Chip>
      </div>
    );
  }

  // ── product order sheet (size + qty + pay) ───────────────────────────────────
  function OrderSheet({ pid, onClose }) {
    const p = P(pid);
    const [gender, setGender] = useState('H');
    const [size, setSize] = useState('L');
    const [qty, setQty] = useState(1);
    const [step, setStep] = useState('config'); // config | done
    const [pay, setPay] = useState(null); // 'direct' | 'cash'
    const uni = p[4] === 'uni';
    const sizes = gender === 'H' ? SIZES_H : SIZES_D;
    const variant = uni ? 'Einheitsgröße' : `${gender === 'H' ? 'Herren' : 'Damen'} · ${size}`;
    const total = p[2] * qty;

    if (step === 'done') {
      return (
        <div style={{ padding: '8px 4px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 9 }}>
          <div style={{ width: 70, height: 70, borderRadius: 40, background: pay === 'direct' ? T.green : 'rgba(244,180,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic name="check" size={36} color={pay === 'direct' ? '#fff' : '#9a7200'} sw={2.4} /></div>
          <Title size={23}>Bestellt!</Title>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: T.sub }}>{qty}× {p[1]} · {variant}</div>
          {pay === 'direct'
            ? <Chip tone="green" dot>{eur(total)} bezahlt</Chip>
            : <Chip tone="gold" dot>{eur(total)} bar · {WART_HINT}</Chip>}
          <div style={{ fontWeight: 600, fontSize: 12.5, color: T.sub, maxWidth: 280, lineHeight: 1.5, marginTop: 2 }}>{p[3] === 'runde' ? `Teil der Sammelbestellung ${RUNDE.name} — du wirst benachrichtigt, sobald die Ware da ist.` : 'Liegt zur Abholung beim Kleidung-Amt bereit.'}</div>
        </div>
      );
    }
    return (
      <>
        <Plh tint={p[5]} h={120} />
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div><Title size={22}>{p[1]}</Title><div style={{ marginTop: 5 }}><Badge kind={p[3]} /></div></div>
          <span style={{ fontFamily: T.display, fontSize: 28, color: T.ink, whiteSpace: 'nowrap' }}>{eur(p[2])}</span>
        </div>
        {!uni && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[['H', 'Herren'], ['D', 'Damen']].map(([g, l]) => (
                <button key={g} onClick={() => setGender(g)} style={{ flex: 1, padding: '9px', borderRadius: 10, border: `2px solid ${gender === g ? T.ink : T.line}`, background: gender === g ? T.ink : T.panel, color: gender === g ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>{l}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              {sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} style={{ minWidth: 46, padding: '9px 12px', borderRadius: 10, border: `2px solid ${size === s ? T.red : T.line}`, background: size === s ? 'rgba(225,29,42,0.08)' : T.panel, color: size === s ? T.red : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>{s}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 13, color: T.sub, textTransform: 'uppercase', letterSpacing: 0.5 }}>Menge</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.display, fontSize: 20, cursor: 'pointer' }}>–</button>
            <span style={{ fontFamily: T.display, fontSize: 26, minWidth: 30, textAlign: 'center' }}>{qty}</span>
            <button onClick={() => setQty(qty + 1)} style={{ width: 38, height: 38, borderRadius: 10, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.display, fontSize: 20, cursor: 'pointer' }}>+</button>
          </div>
        </div>
        <div style={{ height: 1, background: T.line2 }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 800, fontSize: 14 }}>Gesamt</span>
          <span style={{ fontFamily: T.display, fontSize: 28, color: T.red }}>{eur(total)}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <button onClick={() => { setPay('direct'); setStep('done'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', background: T.red, border: 'none', borderRadius: 13, color: '#fff', fontFamily: T.font, fontWeight: 800, fontSize: 15.5, padding: '14px', cursor: 'pointer' }}><Ic name="euro" size={19} color="#fff" sw={2.2} />Direkt zahlen · Karte / PayPal</button>
          <button onClick={() => { setPay('cash'); setStep('done'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', background: T.panel, border: `1.5px solid ${T.line}`, borderRadius: 13, color: T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 15.5, padding: '13px', cursor: 'pointer' }}>Bar zahlen · Amt bestätigt</button>
        </div>
      </>
    );
  }
  const WART_HINT = 'Amt bestätigt';

  // ── MEMBER · mobile ───────────────────────────────────────────────────────────
  function MShop({ initial = 'shop', openProduct = null }) {
    const [tab, setTab] = useState(initial); // shop | orders
    const [sel, setSel] = useState(openProduct);
    const myOpen = MY_ORDERS.filter((o) => o[3] === 'open').reduce((a, o) => a + o[2], 0);

    const catalog = (
      <div style={{ padding: '14px 16px 26px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        <RundeBanner compact />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {PRODUCTS.map((p) => (
            <div key={p[0]} onClick={() => setSel(p[0])} style={{ cursor: 'pointer' }}>
              <Plh tint={p[5]} h={108} />
              <div style={{ marginTop: 8 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, lineHeight: 1.2 }}>{p[1]}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontFamily: T.display, fontSize: 18, color: T.red }}>{eur(p[2])}</span>
                  <span style={{ fontWeight: 700, fontSize: 10.5, color: T.faint }}>{p[4] === 'uni' ? 'Einheitsgr.' : 'H · D'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );

    const orders = (
      <div style={{ padding: '14px 16px 26px', display: 'flex', flexDirection: 'column', gap: 15 }}>
        {myOpen > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 15px', borderRadius: 14, background: 'rgba(244,180,0,0.14)', border: '1.5px solid rgba(244,180,0,0.4)' }}>
            <Ic name="euro" size={20} color="#9a7200" sw={2.2} />
            <span style={{ flex: 1, fontWeight: 800, fontSize: 13.5, color: '#9a7200' }}>{eur(myOpen)} bar offen — beim Amt zahlen</span>
          </div>
        )}
        <Card pad={0} style={{ padding: '2px 16px' }}>
          {MY_ORDERS.map((o, i) => <OrderRow key={i} o={o} last={i === MY_ORDERS.length - 1} />)}
        </Card>
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 11.5, color: T.faint }}>Sammelbestellungen werden ausgeliefert, sobald die Frist endet.</div>
      </div>
    );

    return (
      <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'inline-flex', gap: 4, background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: 11, padding: 3, width: '100%' }}>
            {[['shop', 'Shop'], ['orders', 'Meine Bestellungen']].map(([id, l]) => (
              <button key={id} onClick={() => setTab(id)} style={{ flex: 1, border: 'none', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '8px', borderRadius: 8, background: tab === id ? T.ink : 'transparent', color: tab === id ? '#fff' : T.sub }}>{l}</button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>{tab === 'shop' ? catalog : orders}</div>
        {sel && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,17,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div style={{ background: T.bg, borderRadius: '22px 22px 0 0', padding: '14px 18px 20px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '92%', overflow: 'auto', boxShadow: '0 -8px 30px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'center' }}><span style={{ width: 42, height: 5, borderRadius: 3, background: T.line }} /></div>
              <OrderSheet pid={sel} onClose={() => setSel(null)} />
              <button onClick={() => setSel(null)} style={{ border: 'none', background: 'transparent', fontFamily: T.font, fontWeight: 800, fontSize: 14, color: T.sub, cursor: 'pointer' }}>Schließen</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── MEMBER · desktop ──────────────────────────────────────────────────────────
  function PageShop({ openProduct = null }) {
    const [sel, setSel] = useState(openProduct);
    const myOpen = MY_ORDERS.filter((o) => o[3] === 'open').reduce((a, o) => a + o[2], 0);
    return (
      <div style={{ position: 'relative', padding: 28, maxWidth: 1240 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <RundeBanner />
            <div>
              <SecHead>Sortiment</SecHead>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
                {PRODUCTS.map((p) => (
                  <Card key={p[0]} pad={14} onClick={() => setSel(p[0])} style={{ cursor: 'pointer' }}>
                    <Plh tint={p[5]} h={130} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 11 }}>
                      <span style={{ fontWeight: 800, fontSize: 14.5 }}>{p[1]}</span>
                      <span style={{ fontFamily: T.display, fontSize: 19, color: T.red }}>{eur(p[2])}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <Badge kind={p[3]} />
                      <span style={{ fontWeight: 700, fontSize: 11, color: T.faint }}>{p[4] === 'uni' ? 'Einheitsgröße' : 'Herren · Damen'}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <div>
            <SecHead>Meine Bestellungen</SecHead>
            {myOpen > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 15px', borderRadius: 12, background: 'rgba(244,180,0,0.14)', border: '1.5px solid rgba(244,180,0,0.4)', marginBottom: 14 }}>
                <Ic name="euro" size={19} color="#9a7200" sw={2.2} /><span style={{ fontWeight: 800, fontSize: 13.5, color: '#9a7200' }}>{eur(myOpen)} bar offen — beim Amt zahlen</span>
              </div>
            )}
            <Card pad={0} style={{ padding: '2px 18px' }}>
              {MY_ORDERS.map((o, i) => <OrderRow key={i} o={o} last={i === MY_ORDERS.length - 1} />)}
            </Card>
          </div>
        </div>
        {sel && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,17,0.45)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{ width: 420, background: T.bg, borderRadius: T.radius, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 15, boxShadow: '0 18px 50px rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><span onClick={() => setSel(null)} style={{ cursor: 'pointer', fontWeight: 800, color: T.sub, fontSize: 18 }}>✕</span></div>
              <OrderSheet pid={sel} onClose={() => setSel(null)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  window.PageShop = PageShop;
  window.MShop = MShop;
})();
