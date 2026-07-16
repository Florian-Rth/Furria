// fcc-ds-mobile.jsx — mobile (phone) version of the Club-App.
// Sidebar → bottom tab bar (core 4 + Mehr sheet for Vorstand/extras).
// Reuses shell tokens (T, Ic, primitives). Exports MobileApp({ start, role }).

const { useState: useStateM } = React;
const TM = window.T, IcM = window.Ic, ChipM = window.Chip, AvatarM = window.Avatar,
  BtnM = window.Btn, ProgressM = window.Progress;

function MTitle({ children, size = 18, style }) { return <div style={{ fontFamily: TM.display, fontSize: size, letterSpacing: 0.5, color: TM.ink, lineHeight: 1, ...style }}>{children}</div>; }
function MEye({ children, color = TM.sub, style }) { return <div style={{ fontWeight: 800, fontSize: 10, letterSpacing: 1.4, color, textTransform: 'uppercase', ...style }}>{children}</div>; }
function MCard({ children, style, pad = 16, onClick }) { return <div onClick={onClick} style={{ background: TM.panel, border: `1.5px solid ${TM.line}`, borderRadius: 14, boxShadow: TM.shadow, padding: pad, ...style }}>{children}</div>; }
const TYPEM = { training: ['ink', 'Training'], auftritt: ['red', 'Auftritt'], sitzung: ['gold', 'Sitzung'], probe: ['blue', 'Probe'] };

// ── editorial section header (red square + label + rule to edge) ──────────
function MSec({ children, action, onAction, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11, ...style }}>
      <span style={{ width: 9, height: 9, background: TM.red, flexShrink: 0 }} />
      <MTitle size={15}>{children}</MTitle>
      <div style={{ flex: 1, height: 2, background: TM.line }} />
      {action && <span onClick={onAction} style={{ fontWeight: 800, fontSize: 12, color: TM.red, whiteSpace: 'nowrap', cursor: 'pointer' }}>{action} →</span>}
    </div>
  );
}

function MBell() {
  return <div style={{ position: 'relative', flexShrink: 0 }}><IcM name="bell" size={22} color={TM.ink} /><span style={{ position: 'absolute', top: -1, right: -1, width: 8, height: 8, borderRadius: 5, background: TM.red, border: `1.5px solid ${TM.panel}` }} /></div>;
}

// ── mobile header: warm home greeting, clean title elsewhere ──────────────
function MHeader({ page, title, sub, role, go }) {
  if (page === 'uebersicht') {
    return (
      <div style={{ flexShrink: 0, background: TM.panel, borderBottom: `1.5px solid ${TM.line}`, padding: '12px 18px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <window.KKBroom size={21} color={TM.red} band={TM.cream} />
            <span style={{ fontFamily: TM.display, fontSize: 19, letterSpacing: 1, color: TM.ink }}>FURRIA</span>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 1.4, color: TM.faint, border: `1px solid ${TM.line}`, padding: '2px 6px', borderRadius: 20 }}>CLUB-APP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <MBell />
            <div onClick={() => go('mehr')} style={{ cursor: 'pointer' }}><AvatarM initials="A" tone="gold" size={34} /></div>
          </div>
        </div>
        <div style={{ marginTop: 14 }}>
          <MTitle size={27}>Servus, Anna!</MTitle>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: TM.sub, marginTop: 5 }}>Dienstag, 10. Februar · noch <b style={{ color: TM.red }}>4 Tage</b> bis zur Prunksitzung</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ flexShrink: 0, background: TM.panel, borderBottom: `1.5px solid ${TM.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 18px 16px' }}>
      <div style={{ minWidth: 0 }}>
        <MTitle size={25}>{title}</MTitle>
        {sub && <div style={{ fontSize: 12, fontWeight: 600, color: TM.sub, marginTop: 3 }}>{sub}</div>}
      </div>
      <MBell />
    </div>
  );
}

// ── ÜBERSICHT ─────────────────────────────────────────────────────────────
function MUebersicht({ go }) {
  const qa = (icon, label, target) => (
    <button onClick={() => go(target)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7, alignItems: 'center', background: TM.panel, border: `1.5px solid ${TM.line}`, borderRadius: 12, padding: '13px 6px', cursor: 'pointer', fontFamily: TM.font }}>
      <IcM name={icon} size={21} color={TM.red} /><span style={{ fontWeight: 800, fontSize: 11, color: TM.ink, textAlign: 'center', lineHeight: 1.1 }}>{label}</span>
    </button>
  );
  const week = [['Di', '10.', '17:30', 'Tanzgarde · Training', 'training', true], ['Do', '12.', '19:00', 'Stellprobe', 'probe', true], ['Fr', '14.', '19:11', 'Große Prunksitzung', 'auftritt', true]];
  return (
    <div style={{ padding: '16px 16px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* signature next-duty banner */}
      <div style={{ position: 'relative', background: TM.red, borderRadius: 16, boxShadow: `4px 4px 0 ${TM.ink}`, padding: '18px 18px 16px', color: '#fff', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -12, bottom: -16, opacity: 0.14 }}><window.KKBroom size={120} color="#fff" band="#fff" /></div>
        <div style={{ position: 'relative' }}>
          <MEye color="rgba(255,255,255,0.9)">Dein nächster Einsatz · in 4 Tagen</MEye>
          <div style={{ fontFamily: TM.display, fontSize: 25, lineHeight: 0.98, margin: '6px 0 6px' }}>Auftritt: Große<br />Prunksitzung</div>
          <div style={{ fontWeight: 700, fontSize: 12.5, opacity: 0.95, marginBottom: 13 }}>Fr 14. Feb · Aufstellung 19:20 · Bühne 19:41</div>
          <button onClick={() => go('auftritte')} style={{ border: 'none', background: '#fff', color: TM.red, fontFamily: TM.font, fontWeight: 900, fontSize: 13.5, padding: '11px 18px', borderRadius: 40, cursor: 'pointer' }}>Aufstellung ansehen →</button>
        </div>
      </div>
      {/* two stat cards */}
      <div style={{ display: 'flex', gap: 12 }}>
        <MCard style={{ flex: 1 }} pad={14}><div style={{ fontFamily: TM.display, fontSize: 27, color: TM.red, lineHeight: 1 }}>−12,50 €</div><div style={{ fontWeight: 800, fontSize: 12, marginTop: 6 }}>Bier-Saldo</div><div style={{ fontSize: 11, fontWeight: 600, color: TM.sub }}>offen</div></MCard>
        <MCard style={{ flex: 1 }} pad={14}><div style={{ fontFamily: TM.display, fontSize: 27, color: TM.green, lineHeight: 1 }}>92 %</div><div style={{ fontWeight: 800, fontSize: 12, marginTop: 6 }}>Anwesenheit</div><div style={{ fontSize: 11, fontWeight: 600, color: TM.sub }}>Training</div></MCard>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>{qa('beer', 'Strich', 'bierliste')}{qa('upload', 'Foto', 'galerie')}{qa('calendar', 'Absage', 'spielplan')}{qa('clock', 'Plan', 'spielplan')}</div>
      <div>
        <MSec action="Alle" onAction={() => go('spielplan')}>DIESE WOCHE</MSec>
        <MCard pad={4}>
          {week.map(([d, dt, t, title, type, me], i) => { const [tone, tl] = TYPEM[type]; return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderTop: i ? `1px solid ${TM.line2}` : 'none' }}>
              <div style={{ textAlign: 'center', width: 28, flexShrink: 0 }}><div style={{ fontWeight: 800, fontSize: 10, color: TM.faint }}>{d}</div><div style={{ fontFamily: TM.display, fontSize: 18, lineHeight: 1 }}>{dt}</div></div>
              <div style={{ fontFamily: TM.display, fontSize: 15, width: 46, flexShrink: 0 }}>{t}</div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div></div>
              <ChipM tone={tone}>{tl}</ChipM>
            </div>
          ); })}
        </MCard>
      </div>
    </div>
  );
}

// ── BIERLISTE ───────────────────────────────────────────────────────────────
function MBierliste() {
  const rows = [['Anna Brunner', 'AB', 'gold', 25, -12.5, 'offen'], ['Markus Veit', 'MV', 'red', 41, 21.0, 'bezahlt'], ['Tobias Renz', 'TR', 'ink', 33, -16.5, 'offen'], ['Daniel Pfaff', 'DP', 'red', 52, -26.0, 'offen'], ['Jonas Bauer', 'JB', 'gold', 27, 34.5, 'bezahlt']];
  return (
    <div style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* bestand hero */}
      <MCard>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}><div style={{ fontFamily: TM.display, fontSize: 40, color: TM.ink, lineHeight: 1 }}>3,5</div><div style={{ fontWeight: 800, fontSize: 13, color: TM.sub }}>Kisten · ≈42 Fl.</div></div><ChipM tone="gold" dot>Knapp</ChipM></div>
        <div style={{ margin: '13px 0 7px' }}><ProgressM value={3.5} max={24} tone="gold" h={9} /></div>
        <div style={{ fontSize: 11.5, fontWeight: 700, color: TM.sub }}>von 24 Kisten zu Saisonstart · 15 % übrig</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(244,180,0,0.12)', border: '1.5px solid rgba(244,180,0,0.4)', borderRadius: 11, padding: '10px 12px', marginTop: 13 }}>
          <IcM name="bolt" size={17} color="#9a7200" fill="#9a7200" /><span style={{ fontWeight: 800, fontSize: 12, color: '#7c5c00' }}>Nur noch 3,5 Kisten — nachbestellen!</span>
        </div>
      </MCard>
      {/* my balance + primary action */}
      <MCard style={{ background: TM.ink, border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: 11.5, fontWeight: 700, color: 'rgba(251,244,230,0.6)' }}>Dein Saldo</div><div style={{ fontFamily: TM.display, fontSize: 28, color: '#fff' }}>−12,50 €</div></div>
          <button style={{ border: 'none', background: TM.red, color: '#fff', fontFamily: TM.font, fontWeight: 900, fontSize: 14, padding: '13px 20px', borderRadius: 40, display: 'inline-flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0 }}><IcM name="beer" size={18} color="#fff" sw={2} />Strich machen</button>
        </div>
      </MCard>
      <div>
        <MSec>STRICHLISTE</MSec>
        <MCard pad={4}>
          {rows.map(([name, ini, tone, striche, saldo, status], i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 12px', borderTop: i ? `1px solid ${TM.line2}` : 'none' }}>
              <AvatarM initials={ini} tone={tone} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div><div style={{ fontSize: 11.5, fontWeight: 600, color: TM.sub }}>{striche} Striche</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontFamily: TM.display, fontSize: 16, color: saldo < 0 ? TM.red : TM.green }}>{saldo < 0 ? '−' : '+'}{Math.abs(saldo).toFixed(2)}€</div><ChipM tone={status === 'bezahlt' ? 'green' : 'red'} dot style={{ marginTop: 2 }}>{status === 'bezahlt' ? 'Bezahlt' : 'Offen'}</ChipM></div>
            </div>
          ))}
        </MCard>
      </div>
    </div>
  );
}

// ── SPIELPLAN ───────────────────────────────────────────────────────────────
function MSpielplan({ role }) {
  const filters = ['Alle', 'Tanzgarde', 'Männerballett', 'Auftritte'];
  const strip = [['MO', '9', false], ['DI', '10', true, true], ['MI', '11', false], ['DO', '12', true], ['FR', '14', true], ['SA', '15', false], ['SO', '16', true]];
  const days = [
    ['DIENSTAG', '10. Feb', 'heute', [['17:30', 'Tanzgarde · Training', 'Sporthalle', 'training'], ['19:00', 'Männerballett · Training', 'Vereinsraum', 'training'], ['20:30', 'Elferrat-Probe', 'Vereinsraum', 'probe']]],
    ['DONNERSTAG', '12. Feb', null, [['18:00', 'Stellprobe (früher!)', 'Festhalle', 'probe'], ['20:00', 'Generalprobe', 'Festhalle', 'probe']]],
    ['FREITAG', '14. Feb', null, [['19:11', 'Große Prunksitzung', 'Festhalle · Bühne 19:41', 'auftritt']]],
    ['SONNTAG', '16. Feb', null, [['13:11', 'Rosenmontagsumzug', 'Dorfplatz', 'auftritt']]],
  ];
  return (
    <div style={{ padding: '0 0 26px' }}>
      <div style={{ background: TM.panel, borderBottom: `1.5px solid ${TM.line}`, padding: '12px 12px 14px' }}>
        <div style={{ display: 'flex', gap: 5, justifyContent: 'space-between' }}>
          {strip.map(([wd, dt, has, today], i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '7px 0 8px', borderRadius: 12, background: today ? TM.ink : 'transparent', cursor: 'pointer' }}>
              <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 0.5, color: today ? 'rgba(251,244,230,0.6)' : TM.faint }}>{wd}</span>
              <span style={{ fontFamily: TM.display, fontSize: 17, color: today ? TM.cream : TM.ink, lineHeight: 1 }}>{dt}</span>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: has ? (today ? TM.gold : TM.red) : 'transparent' }} />
            </div>
          ))}
        </div>
      </div>
      <div className="fcc-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 16px 14px' }}>{filters.map((f, i) => <button key={f} style={{ flexShrink: 0, border: `1.5px solid ${i === 0 ? TM.ink : TM.line}`, background: i === 0 ? TM.ink : 'transparent', color: i === 0 ? '#fff' : TM.ink, fontFamily: TM.font, fontWeight: 800, fontSize: 12.5, padding: '7px 14px', borderRadius: 30 }}>{f}</button>)}</div>
      <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {days.map(([day, date, tag, items]) => (
          <div key={day}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 8 }}><MTitle size={14}>{day}</MTitle><span style={{ fontSize: 12, fontWeight: 700, color: TM.sub }}>{date}</span>{tag && <ChipM tone="red">{tag}</ChipM>}</div>
            <MCard pad={4}>
              {items.map(([time, title, loc, type], i) => { const [tone, tl] = TYPEM[type]; const c = tone === 'red' ? TM.red : tone === 'gold' ? TM.gold : tone === 'blue' ? TM.blue : TM.ink; return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderTop: i ? `1px solid ${TM.line2}` : 'none' }}>
                  <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: c, flexShrink: 0 }} />
                  <div style={{ fontFamily: TM.display, fontSize: 17, width: 48, flexShrink: 0 }}>{time}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div><div style={{ fontSize: 11.5, fontWeight: 600, color: TM.sub }}>{loc}</div></div>
                  <ChipM tone={tone}>{tl}</ChipM>
                </div>
              ); })}
            </MCard>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── GALERIE ───────────────────────────────────────────────────────────────
function MGalerie() {
  const albums = [['Prunksitzung 2025', '318', 'red'], ['Rosenmontagsumzug', '204', 'gold'], ['Maskenball', '156', 'ink'], ['Kinderfasching', '98', 'red']];
  const c = window.KK.light;
  return (
    <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {albums.map(([t, n, tone], i) => (
        <MCard key={i} pad={0} style={{ overflow: 'hidden' }}>
          <window.KKPlh h={92} label={t.toLowerCase()} c={c} tint={tone === 'red' ? TM.red : tone === 'gold' ? TM.gold : TM.ink} />
          <div style={{ padding: '10px 11px' }}><div style={{ fontWeight: 800, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</div><div style={{ fontSize: 11, fontWeight: 600, color: TM.sub }}>{n} Fotos</div></div>
        </MCard>
      ))}
    </div>
  );
}

// ── LIVE-COCKPIT ─────────────────────────────────────────────────────────────
function MLiveLegacy() {
  const order = [['3', 'Tanzgarde · Gardetanz', '19:26', 'done'], ['4', 'Büttenrede', '19:38', 'done'], ['5', 'Männerballett · Schautanz', '19:48', 'live'], ['6', 'Tanzmariechen Solo', '20:02', 'next'], ['7', 'Gastverein Großbach', '20:14', 'wait']];
  const ST = { done: ['green', 'OK'], live: ['red', 'Läuft'], next: ['gold', 'Gleich'], wait: ['neutral', 'Wartet'] };
  return (
    <div style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: TM.ink, color: TM.cream, borderRadius: 16, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
        <MEye color={TM.red}>● Jetzt auf der Bühne · seit 3 Min</MEye>
        <div style={{ fontFamily: TM.display, fontSize: 32, lineHeight: 0.98, margin: '7px 0 5px' }}>Männerballett</div>
        <div style={{ fontWeight: 700, fontSize: 13, color: 'rgba(251,244,230,0.7)' }}>Punkt 5 von 8 · Schautanz „Bauarbeiter"</div>
      </div>
      <MCard style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div><MEye>Gleich · in 8 Min</MEye><div style={{ fontFamily: TM.display, fontSize: 20, margin: '4px 0 2px' }}>Tanzmariechen Solo</div><div style={{ fontSize: 12, fontWeight: 600, color: TM.sub }}>Bühne 20:02</div></div>
      </MCard>
      <BtnM primary icon="broadcast" style={{ justifyContent: 'center' }}>„In 10 Min auf die Bühne"</BtnM>
      <div>
        <MSec>ABLAUFPLAN</MSec>
        <MCard pad={4}>
          {order.map(([n, t, time, status], i) => { const [tone, lbl] = ST[status]; const active = status === 'live'; return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderTop: i ? `1px solid ${TM.line2}` : 'none', background: active ? 'rgba(225,29,42,0.05)' : 'transparent', borderRadius: active ? 9 : 0 }}>
              <div style={{ fontFamily: TM.display, fontSize: 15, color: TM.faint, width: 16 }}>{n}</div>
              <div style={{ fontFamily: TM.display, fontSize: 15, width: 46, flexShrink: 0 }}>{time}</div>
              <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 13.5, color: status === 'wait' ? TM.sub : TM.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t}</div>
              <ChipM tone={tone} dot={active}>{lbl}</ChipM>
            </div>
          ); })}
        </MCard>
      </div>
    </div>
  );
}

// ── COCKPIT (admin) ─────────────────────────────────────────────────────────
function MCockpit({ go }) {
  const kpi = (n, lbl, tone) => <MCard style={{ flex: 1 }} pad={13}><div style={{ fontFamily: TM.display, fontSize: 23, color: tone === 'red' ? TM.red : tone === 'green' ? TM.green : TM.ink, lineHeight: 1 }}>{n}</div><div style={{ fontWeight: 800, fontSize: 11, marginTop: 5 }}>{lbl}</div></MCard>;
  const tiles = [['users', 'Mitglieder', 'mitglieder'], ['star', 'Veranstaltung', 'veranstaltungen'], ['grid', 'Saalplan', 'einstellungen'], ['chart', 'Statistik', 'statistik'], ['key', 'Schlüssel', 'einstellungen'], ['settings', 'Einstellungen', 'einstellungen']];
  return (
    <div style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 11 }}>{kpi('184', 'Mitglieder', 'ink')}{kpi('1.240€', 'Offen', 'red')}{kpi('+184€', 'Bierkasse', 'green')}</div>
      <MSec>VERWALTUNG</MSec>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {tiles.map(([icon, t, target], i) => (
          <MCard key={i} onClick={() => go(target)} style={{ display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><IcM name={icon} size={19} color={TM.red} sw={2} /></div>
            <span style={{ fontWeight: 800, fontSize: 13.5 }}>{t}</span>
          </MCard>
        ))}
      </div>
    </div>
  );
}

// ── MEHR sheet ─────────────────────────────────────────────────────────────
function MMehr({ role, go, onRole }) {
  const items = [['galerie', 'image', 'Galerie'], ['shop', 'shirt', 'Klamotten-Shop'], ['auftritte', 'star', 'Meine Auftritte']];
  const admin = [['cockpit', 'grid', 'Cockpit'], ['mitglieder', 'users', 'Mitglieder'], ['gruppen', 'star', 'Gruppen'], ['roles', 'key', 'Ämter & Rechte'], ['veranstaltungen', 'calendar', 'Veranstaltungen'], ['getraenke', 'beer', 'Getränkekasse'], ['shop_manage', 'shirt', 'Shop-Verwaltung'], ['statistik', 'chart', 'Statistik'], ['einstellungen', 'settings', 'Einstellungen']];
  const Row = ([id, icon, label]) => (
    <div key={id} onClick={() => go(id)} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', borderTop: `1px solid ${TM.line2}`, cursor: 'pointer' }}>
      <IcM name={icon} size={20} color={TM.ink} /><span style={{ flex: 1, fontWeight: 800, fontSize: 14.5 }}>{label}</span><IcM name="chevron" size={16} color={TM.faint} />
    </div>
  );
  return (
    <div style={{ padding: '16px 16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <MCard style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        <AvatarM initials="A" tone="gold" size={46} />
        <div style={{ flex: 1 }}><div style={{ fontFamily: TM.display, fontSize: 18 }}>Anna Brunner</div><div style={{ fontSize: 12, fontWeight: 600, color: TM.sub }}>{role === 'vorstand' ? 'Vorstand · Schriftführerin' : 'Tanzgarde'}</div></div>
        <IcM name="logout" size={20} color={TM.sub} />
      </MCard>
      <div>
        <MEye style={{ marginBottom: 8 }}>Mein Bereich</MEye>
        <MCard pad={0} style={{ overflow: 'hidden' }}>{items.map((r, i) => i === 0 ? <div key={r[0]} onClick={() => go(r[0])} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', cursor: 'pointer' }}><IcM name={r[1]} size={20} color={TM.ink} /><span style={{ flex: 1, fontWeight: 800, fontSize: 14.5 }}>{r[2]}</span><IcM name="chevron" size={16} color={TM.faint} /></div> : Row(r))}</MCard>
      </div>
      {role === 'vorstand' && (
        <div>
          <MEye style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>Vorstand <IcM name="key" size={12} color="#9a7200" sw={2} /></MEye>
          <MCard pad={0} style={{ overflow: 'hidden' }}>{admin.map((r, i) => i === 0 ? <div key={r[0]} onClick={() => go(r[0])} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', cursor: 'pointer' }}><IcM name={r[1]} size={20} color={TM.ink} /><span style={{ flex: 1, fontWeight: 800, fontSize: 14.5 }}>{r[2]}</span><IcM name="chevron" size={16} color={TM.faint} /></div> : Row(r))}</MCard>
        </div>
      )}
      {/* demo role switch */}
      <div>
        <MEye style={{ marginBottom: 8 }}>Ansicht (Demo)</MEye>
        <div style={{ display: 'flex', background: 'rgba(26,20,17,0.06)', borderRadius: 10, padding: 4 }}>
          {[['mitglied', 'Mitglied'], ['vorstand', 'Vorstand']].map(([r, l]) => <button key={r} onClick={() => onRole(r)} style={{ flex: 1, border: 'none', cursor: 'pointer', background: role === r ? TM.panel : 'transparent', color: role === r ? TM.ink : TM.sub, fontFamily: TM.font, fontWeight: 800, fontSize: 13, padding: '9px 0', borderRadius: 8, boxShadow: role === r ? TM.shadow : 'none' }}>{l}</button>)}
        </div>
      </div>
    </div>
  );
}

const MOBILE_META = {
  uebersicht: ['Übersicht', null], bierliste: ['Bierliste', 'Meine Kisten & offener Betrag'],
  spielplan: ['Spielplan', 'Alle Gruppen'], galerie: ['Galerie', 'Alle Alben'],
  live: ['LIVE', 'Große Prunksitzung'], mehr: ['Mehr', null], cockpit: ['Cockpit', 'Vorstand'],
  mitglieder: ['Mitglieder', 'Verwaltung · 184'], auftritte: ['Meine Auftritte', null],
  gruppen: ['Gruppen', 'Verwaltung'],
  roles: ['Ämter & Rechte', 'nur Admin'],
  statistik: ['Statistik', null], veranstaltungen: ['Veranstaltungen', 'Saison 2026'], getraenke: ['Getränkekasse', 'Amt Getränkewart'], shop: ['Klamotten-Shop', 'Vereinskleidung'], shop_manage: ['Shop-Verwaltung', 'Amt Kleidung'], einstellungen: ['Einstellungen', null],
};

function MBody({ page, role, go, onRole, memberStart, eventStart }) {
  switch (page) {
    case 'uebersicht': return <MUebersicht go={go} />;
    case 'bierliste': return window.MDrinks ? <window.MDrinks /> : <MBierliste />;
    case 'spielplan': return <MSpielplan role={role} />;
    case 'galerie': return <MGalerie />;
    case 'live': return window.MLive ? <window.MLive /> : <MLiveLegacy />;
    case 'cockpit': return <MCockpit go={go} />;
    case 'mitglieder': return window.MMembersManage ? <window.MMembersManage start={memberStart} /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'gruppen': return window.MGroups ? <window.MGroups /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'veranstaltungen': return window.MEvents ? <window.MEvents start={eventStart} /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'getraenke': return window.MDrinksAdmin ? <window.MDrinksAdmin /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'shop': return window.MShop ? <window.MShop /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'shop_manage': return window.MShopManage ? <window.MShopManage /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'roles': return window.MRoles ? <window.MRoles /> : <MMehr role={role} go={go} onRole={onRole} />;
    case 'mehr': return <MMehr role={role} go={go} onRole={onRole} />;
    default: return (
      <div style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, marginTop: 30 }}>
        <div style={{ width: 56, height: 56, borderRadius: 15, background: 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IcM name="bolt" size={26} color={TM.faint} /></div>
        <MTitle size={19}>Bald verfügbar</MTitle>
        <p style={{ fontSize: 13, fontWeight: 600, color: TM.sub, lineHeight: 1.5 }}>Diese Seite ist im Prototyp als Platzhalter angelegt — Look & Layout-System stehen schon.</p>
      </div>
    );
  }
}

function MobileApp({ start = 'uebersicht', role: role0 = 'vorstand', memberStart, eventStart }) {
  const [page, setPage] = useStateM(start);
  const [role, setRole] = useStateM(role0);
  const onRole = (r) => { setRole(r); };
  const [title, sub] = MOBILE_META[page] || [page, null];
  const dests = [['uebersicht', 'home', 'Start'], ['spielplan', 'calendar', 'Plan'], ['bierliste', 'beer', 'Bier'], ['mehr', 'grid', 'Mehr']];
  const underMehr = ['galerie', 'shop', 'auftritte', 'cockpit', 'mitglieder', 'gruppen', 'roles', 'statistik', 'veranstaltungen', 'getraenke', 'shop_manage', 'einstellungen'];
  const activeId = underMehr.includes(page) ? 'mehr' : page;
  const showLive = page !== 'live';
  const NavCell = ([id, icon, label]) => {
    const on = id === activeId;
    const col = on ? TM.cream : 'rgba(251,244,230,0.5)';
    return (
      <div key={id} onClick={() => setPage(id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', position: 'relative', paddingTop: 11 }}>
        <span style={{ position: 'absolute', top: 0, width: 22, height: 3, borderRadius: 2, background: on ? TM.red : 'transparent' }} />
        <IcM name={icon} size={23} color={col} sw={on ? 2.2 : 1.85} />
        <span style={{ fontSize: 9.5, fontWeight: on ? 800 : 600, color: col, letterSpacing: 0.2 }}>{label}</span>
      </div>
    );
  };
  return (
    <window.PhoneFrame screenBg={TM.bg}>
      <window.StatusBar color={TM.ink} time="20:11" />
      <MHeader page={page} title={title} sub={sub} role={role} go={setPage} />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <MBody page={page} role={role} go={setPage} onRole={onRole} memberStart={memberStart} eventStart={eventStart} />
      </div>

      {/* contextual live strip — only while an event runs */}
      {showLive && (
        <div onClick={() => setPage('live')} style={{ flexShrink: 0, background: TM.red, color: '#fff', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 16px', cursor: 'pointer', position: 'relative', zIndex: 30 }}>
          <span className="fcc-live" style={{ width: 8, height: 8, borderRadius: 5, background: '#fff', flexShrink: 0 }} />
          <span style={{ fontWeight: 800, fontSize: 12, flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>LIVE · Männerballett auf der Bühne</span>
          <span style={{ fontWeight: 800, fontSize: 11.5, whiteSpace: 'nowrap' }}>Cockpit →</span>
        </div>
      )}

      {/* dark masthead bottom bar */}
      <div style={{ flexShrink: 0, background: TM.sideBg, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', padding: '0 10px' }}>
          {dests.map((d) => NavCell(d))}
        </div>
      </div>
      <window.HomeIndicator color={TM.cream} />
    </window.PhoneFrame>
  );
}

Object.assign(window, { MobileApp });
