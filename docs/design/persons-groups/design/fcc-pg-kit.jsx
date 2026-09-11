// fcc-pg-kit.jsx — Kit für den Block „Personen & Gruppen“.
// Sprache = Layout D aus „FCC Club-App - Mocks“: helle Bühne, Sahne-Karten,
// Haarlinien, Anton-Displays, rot nur für Handlung. Plus ein paar Konfetti-Gimmicks.

const KT = window.T;

const PGP = {
  bg: '#FDFCFA', stage: '#FFFFFF', card: '#FBF4E6', cardLine: 'rgba(26,20,17,0.08)',
  ink: KT.ink, sub: KT.sub, faint: KT.faint, line: 'rgba(26,20,17,0.12)', line2: 'rgba(26,20,17,0.07)',
  red: KT.red, gold: KT.gold, green: KT.green, blue: KT.blue, cream: '#FBF4E6',
  stageBg: 'linear-gradient(168deg, #FFFFFF 0%, #FFFDF8 46%, #FDF6E9 100%)',
  stageLift: '0 10px 26px rgba(26,20,17,0.07)',
  glow: 'rgba(225,29,42,0.10)', glow2: 'rgba(244,180,0,0.16)',
  font: KT.font, display: KT.display,
};

// ── Bausteine ─────────────────────────────────────────────────────────────
function PgRow({ children, style, onClick }) { return <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>{children}</div>; }
function PgEyeb({ children, c = PGP.faint, style }) { return <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.8, color: c, textTransform: 'uppercase', ...style }}>{children}</div>; }
function PgDisp({ children, size = 22, c = PGP.ink, style }) { return <div style={{ fontFamily: PGP.display, fontSize: size, lineHeight: 1, color: c, letterSpacing: 0.4, ...style }}>{children}</div>; }
function PgBody({ children, size = 13.5, c = PGP.sub, w = 600, style }) { return <div style={{ fontSize: size, fontWeight: w, color: c, lineHeight: 1.45, ...style }}>{children}</div>; }

function PgSec({ children, right, style }) {
  return (
    <PgRow style={{ gap: 9, marginBottom: 12, ...style }}>
      <span style={{ width: 9, height: 9, background: PGP.red, flexShrink: 0 }} />
      <span style={{ fontFamily: PGP.display, fontSize: 13, letterSpacing: 1.6, color: PGP.ink, whiteSpace: 'nowrap' }}>{children}</span>
      <span style={{ flex: 1, height: 1.5, background: PGP.line2 }} />
      {right}
    </PgRow>
  );
}

function PgCd({ children, style, pad = '4px 16px', onClick }) {
  return <div onClick={onClick} style={{ background: PGP.card, border: `1.5px solid ${PGP.cardLine}`, borderRadius: 16, padding: pad, ...style }}>{children}</div>;
}

// Konfetti-Schnipsel: sparsam, nur in Bühnenköpfen
const FLECK = [[6, 12, -18, PGP.red], [26, 74, 24, PGP.gold], [12, 88, 8, PGP.blue], [54, 34, -34, PGP.gold], [70, 92, 16, PGP.red]];
function PgFlecks({ o = 0.5 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {FLECK.map(([t, l, r, col], i) => (
        <span key={i} className="fcc-floaty" style={{ position: 'absolute', top: t + '%', left: l + '%', width: 7, height: 9, background: col, opacity: o, rotate: r + 'deg', animationDelay: (i * 0.7) + 's' }} />
      ))}
    </div>
  );
}

function PgAv({ name, size = 38, tone }) {
  const ini = PgIni(name);
  if (tone === 'gold') return <div style={{ width: size, height: size, borderRadius: size, background: PGP.gold, color: PGP.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PGP.display, fontSize: size * 0.42, flexShrink: 0 }}>{ini}</div>;
  return <div style={{ width: size, height: size, borderRadius: size, background: '#F3EADA', border: '1.5px solid rgba(26,20,17,0.10)', color: PGP.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: PGP.display, fontSize: size * 0.4, flexShrink: 0 }}>{ini}</div>;
}
function PgIni(n) { return n.split(' ').map(w => w[0]).slice(0, 2).join(''); }

// Ehrenmitglied-Marke: kleines goldenes Siegel
function PgSeal({ size = 18, label }) {
  return (
    <PgRow style={{ gap: 6 }}>
      <span style={{ width: size, height: size, borderRadius: size, background: PGP.gold, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <window.Ic name="star" size={size * 0.62} color={PGP.ink} fill={PGP.ink} sw={1.4} />
      </span>
      {label && <span style={{ fontWeight: 900, fontSize: 11, color: '#8a6600', letterSpacing: 0.2 }}>{label}</span>}
    </PgRow>
  );
}

// Schlüssel-Marke (kommt später, Platz ist reserviert)
function PgKey({ size = 15 }) {
  return <span title="hat Schlüssel" style={{ width: size + 9, height: size + 9, borderRadius: 20, background: 'rgba(47,109,168,0.12)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Ic name="key" size={size} color={PGP.blue} sw={2} /></span>;
}

const PG_STATE = { aktiv: ['green', 'aktiv'], ruht: ['gold', 'ruht'], beendet: ['neutral', 'beendet'], kein: ['neutral', 'kein Mitglied'] };
function PgState({ s, sm }) {
  const [tone, label] = PG_STATE[s] || PG_STATE.kein;
  return <window.Chip tone={tone} dot={s === 'aktiv' || s === 'ruht'} style={sm ? { fontSize: 10, padding: '3px 8px' } : null}>{label}</window.Chip>;
}

function PgSw({ on }) {
  return (
    <span style={{ width: 46, height: 27, borderRadius: 20, background: on ? PGP.green : 'rgba(26,20,17,0.16)', display: 'inline-flex', alignItems: 'center', padding: 3, flexShrink: 0, transition: 'background .2s' }}>
      <span style={{ width: 21, height: 21, borderRadius: 20, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.25)', marginLeft: on ? 19 : 0 }} />
    </span>
  );
}

function PgSearch({ ph = 'Name, Gruppe oder Amt', w }) {
  return (
    <PgRow style={{ background: '#fff', border: `1.5px solid ${PGP.line}`, borderRadius: 30, padding: '10px 16px', gap: 10, width: w }}>
      <window.Ic name="search" size={17} color={PGP.faint} sw={2} />
      <span style={{ fontSize: 13.5, fontWeight: 600, color: PGP.faint }}>{ph}</span>
    </PgRow>
  );
}

function PgFilters({ items, active = 0, style }) {
  return (
    <div className="fcc-scroll" style={{ display: 'flex', gap: 7, overflow: 'hidden', ...style }}>
      {items.map((t, i) => (
        <span key={t} style={{ background: i === active ? PGP.ink : 'transparent', color: i === active ? PGP.cream : PGP.sub, border: `1.5px solid ${i === active ? PGP.ink : PGP.line}`, fontWeight: 800, fontSize: 12, padding: '6px 12px', borderRadius: 30, whiteSpace: 'nowrap', cursor: 'pointer' }}>{t}</span>
      ))}
    </div>
  );
}

function PgStat({ label, value, sub, style }) {
  return (
    <div style={{ flex: 1, minWidth: 0, ...style }}>
      <PgEyeb>{label}</PgEyeb>
      <PgDisp size={26} style={{ marginTop: 7 }}>{value}</PgDisp>
      {sub && <PgBody size={11.5} c={PGP.faint} style={{ marginTop: 5 }}>{sub}</PgBody>}
    </div>
  );
}

// ── Zustände ──────────────────────────────────────────────────────────────
function PgSkel({ w = '100%', h = 12, r = 6, style }) {
  return <span style={{ display: 'block', width: w, height: h, borderRadius: r, background: 'linear-gradient(90deg, rgba(26,20,17,0.07) 0%, rgba(26,20,17,0.12) 50%, rgba(26,20,17,0.07) 100%)', backgroundSize: '200% 100%', animation: 'pg-shim 1.4s linear infinite', ...style }} />;
}
function PgSkelRow({ avatar = true }) {
  return (
    <PgRow style={{ padding: '13px 0', borderTop: `1.5px solid ${PGP.line2}`, gap: 12 }}>
      {avatar && <PgSkel w={38} h={38} r={38} />}
      <div style={{ flex: 1 }}><PgSkel w="52%" h={13} /><PgSkel w="34%" h={10} style={{ marginTop: 8 }} /></div>
      <PgSkel w={54} h={20} r={20} />
    </PgRow>
  );
}
function PgEmpty({ icon = 'users', title, text, action }) {
  return (
    <div style={{ padding: '34px 22px', textAlign: 'center' }}>
      <div style={{ width: 52, height: 52, borderRadius: 30, background: 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
        <window.Ic name={icon} size={24} color={PGP.faint} sw={1.9} />
      </div>
      <PgDisp size={19}>{title}</PgDisp>
      <PgBody size={13} c={PGP.sub} style={{ marginTop: 9, maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>{text}</PgBody>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  );
}

// Modaler Rahmen: Dialog (Desktop) oder Blatt von unten (Mobile)
function PgModal({ children, mode = 'sheet', w = 520 }) {
  if (mode === 'dialog') return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,17,0.42)', backdropFilter: 'blur(1.5px)', zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: w, maxWidth: '100%' }}>{children}</div>
    </div>
  );
  return <div style={{ position: 'absolute', inset: 0, background: 'rgba(26,20,17,0.34)', zIndex: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>{children}</div>;
}

// Bestätigung für zerstörende Enden — immer modal
function PgConfirm({ eyebrow, title, text, rows, danger = 'Beenden', cancel = 'Abbrechen', mode = 'sheet' }) {
  const sheet = mode !== 'dialog';
  const body = (
    <div style={{ background: '#fff', borderRadius: sheet ? '22px 22px 0 0' : 20, padding: sheet ? '22px 20px 20px' : '26px 26px 22px', boxShadow: sheet ? '0 -10px 40px rgba(26,20,17,0.18)' : '0 30px 80px rgba(26,20,17,0.34)' }}>
      <PgRow style={{ gap: 11, marginBottom: 14 }}>
        <span style={{ width: 34, height: 34, borderRadius: 20, background: 'rgba(225,29,42,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Ic name="bolt" size={18} color={PGP.red} sw={2} /></span>
        <div><PgEyeb c={PGP.red}>{eyebrow}</PgEyeb><PgDisp size={20} style={{ marginTop: 5 }}>{title}</PgDisp></div>
      </PgRow>
      <PgBody size={13} c={PGP.sub}>{text}</PgBody>
      {rows && <div style={{ marginTop: 14, background: PGP.card, border: `1.5px solid ${PGP.cardLine}`, borderRadius: 14, padding: '4px 14px' }}>
        {rows.map(([k, v], i) => (
          <PgRow key={k} style={{ padding: '10px 0', borderTop: i ? `1.5px solid ${PGP.cardLine}` : 'none' }}>
            <PgBody size={12.5} c={PGP.faint} style={{ flex: 1 }}>{k}</PgBody>
            <PgBody size={12.5} w={800} c={PGP.ink}>{v}</PgBody>
          </PgRow>
        ))}
      </div>}
      <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: sheet ? 'stretch' : 'flex-end' }}>
        <window.Btn ghost style={sheet ? { flex: 1, justifyContent: 'center' } : null}>{cancel}</window.Btn>
        <window.Btn primary style={sheet ? { flex: 1, justifyContent: 'center' } : null}>{danger}</window.Btn>
      </div>
    </div>
  );
  return <PgModal mode={mode}>{body}</PgModal>;
}

// ── Mobile-Hülle ──────────────────────────────────────────────────────────
function PgPill({ label = 'Mitglieder' }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 14, paddingTop: 26, display: 'flex', justifyContent: 'center', pointerEvents: 'none', background: `linear-gradient(to top, ${PGP.bg} 46%, rgba(253,252,250,0))`, zIndex: 20 }}>
      <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 12, background: PGP.ink, color: PGP.cream, padding: '13px 20px 13px 17px', borderRadius: 40, boxShadow: '0 8px 22px rgba(26,20,17,0.26)', cursor: 'pointer' }}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          <span style={{ width: 17, height: 2.4, background: PGP.red }} />
          <span style={{ width: 17, height: 2.4, background: PGP.cream }} />
          <span style={{ width: 17, height: 2.4, background: PGP.cream }} />
        </span>
        <span style={{ fontFamily: PGP.display, fontSize: 15, letterSpacing: 1.4 }}>{label.toUpperCase()}</span>
        <span style={{ width: 6, height: 6, borderRadius: 5, background: PGP.red }} />
      </div>
    </div>
  );
}

function PgBack() {
  return <div style={{ width: 32, height: 32, borderRadius: 20, border: `1.5px solid ${PGP.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }}>
    <svg width="14" height="14" viewBox="0 0 24 24" stroke={PGP.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M15 5l-7 7 7 7" /></svg>
  </div>;
}

function PgMob({ kicker, title, back, right, head, children, pill, sheet, pad = '16px 18px 84px', gap = 16 }) {
  return (
    <window.PhoneFrame screenBg="#FFFFFF">
      <div style={{ position: 'relative', zIndex: 40 }}><window.StatusBar color={PGP.ink} time="9:41" /></div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: PGP.bg, overflow: 'hidden', fontFamily: PGP.font }}>
        <div style={{ padding: '4px 18px 18px', background: PGP.stageBg, boxShadow: PGP.stageLift, position: 'relative', zIndex: 6 }}>
          <div style={{ position: 'absolute', top: -120, right: -70, width: 320, height: 300, background: `radial-gradient(closest-side, ${PGP.glow}, rgba(225,29,42,0))` }} />
          <PgFlecks o={0.42} />
          <PgRow style={{ position: 'relative', minHeight: 32 }}>
            {back !== false && <PgBack />}
            <PgEyeb c={PGP.faint} style={{ flex: 1 }}>{kicker}</PgEyeb>
            {right}
          </PgRow>
          {title && <PgDisp size={32} style={{ marginTop: 16, position: 'relative' }}>{title}</PgDisp>}
          {head}
        </div>
        <div className="fcc-scroll" style={{ flex: 1, padding: pad, display: 'flex', flexDirection: 'column', gap, overflow: 'hidden' }}>{children}</div>
        {pill && <PgPill label={pill} />}
        {sheet}
      </div>
      <window.HomeIndicator color="rgba(26,20,17,0.7)" />
    </window.PhoneFrame>
  );
}

// ── Desktop-Hülle: Vorhang als feste Schiene ──────────────────────────────
const PG_NAV = [
  ['MEIN BEREICH', [['Übersicht', 'home'], ['Meine Auftritte', 'star'], ['Mein Profil', 'settings']]],
  ['VEREIN', [['Spielplan', 'clock'], ['Mitglieder', 'users'], ['Gruppen', 'grid'], ['Galerie', 'image'], ['Bierliste', 'beer']]],
  ['MEINE GRUPPEN', [['Tanzgarde', 'star'], ['Showtanz', 'star']]],
  ['VERWALTUNG', [['Personenverwaltung', 'users'], ['Gruppenverwaltung', 'grid'], ['Ämter & Rechte', 'key'], ['Beiträge & Kasse', 'euro']]],
];

function PgRail({ active, me = 'Anna Brunner', meSub = 'Tanzgarde · Aktiv' }) {
  return (
    <div style={{ flex: '0 0 292px', background: '#FFFFFF', borderRight: `1.5px solid ${PGP.line}`, display: 'flex', flexDirection: 'column', padding: '24px 22px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -70, left: '50%', transform: 'translateX(-50%)', width: 420, height: 340, background: `radial-gradient(closest-side, ${PGP.glow2}, rgba(244,180,0,0))` }} />
      <div style={{ position: 'relative', lineHeight: 0.9, marginBottom: 22 }}>
        <div style={{ fontFamily: PGP.display, fontSize: 26, letterSpacing: 1.2, color: PGP.ink }}>FURRIA</div>
        <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 2.2, color: PGP.faint, marginTop: 5 }}>CLUB-APP · SESSION 2025/26</div>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {PG_NAV.map(([grp, items]) => (
          <div key={grp}>
            <PgEyeb c={PGP.faint} style={{ fontSize: 9, letterSpacing: 2, marginBottom: 6 }}>{grp}</PgEyeb>
            {items.map(([l, ic]) => {
              const on = l === active;
              return (
                <PgRow key={l} style={{ padding: '5px 0', gap: 10, cursor: 'pointer' }}>
                  <window.Ic name={ic} size={16} color={on ? PGP.red : PGP.faint} sw={2} />
                  <div style={{ fontFamily: PGP.display, fontSize: 17, letterSpacing: 0.5, color: on ? PGP.ink : PGP.sub }}>{l.toUpperCase()}</div>
                </PgRow>
              );
            })}
          </div>
        ))}
      </div>
      <PgRow style={{ position: 'relative', gap: 11, borderTop: `1px solid ${PGP.line}`, paddingTop: 14, marginTop: 12 }}>
        <PgAv name={me} tone="gold" size={34} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13, color: PGP.ink }}>{me}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: PGP.faint }}>{meSub}</div>
        </div>
        <window.Ic name="logout" size={17} color={PGP.faint} />
      </PgRow>
    </div>
  );
}

function PgDesk({ active, kicker, title, sub, actions, children, pad = '28px 36px', me, meSub, banner, dialog }) {
  return (
    <div style={{ height: '100%', display: 'flex', fontFamily: PGP.font, background: PGP.bg, overflow: 'hidden', position: 'relative' }}>
      <PgRail active={active} me={me} meSub={meSub} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: PGP.stageBg, padding: '24px 36px 24px', position: 'relative', overflow: 'hidden', boxShadow: PGP.stageLift, zIndex: 6 }}>
          <div style={{ position: 'absolute', top: -170, right: -40, width: 520, height: 440, background: `radial-gradient(closest-side, ${PGP.glow}, rgba(225,29,42,0))` }} />
          <PgFlecks o={0.4} />
          <PgRow style={{ position: 'relative', alignItems: 'flex-end', gap: 26 }}>
            <div style={{ minWidth: 0 }}>
              {kicker && <PgEyeb c={PGP.faint}>{kicker}</PgEyeb>}
              <PgDisp size={40} style={{ marginTop: 10 }}>{title}</PgDisp>
              {sub && <PgBody size={14} c={PGP.sub} style={{ marginTop: 10 }}>{sub}</PgBody>}
            </div>
            <div style={{ flex: 1 }} />
            {actions}
          </PgRow>
          {banner}
        </div>
        <div className="fcc-scroll" style={{ flex: 1, padding: pad, overflow: 'hidden' }}>{children}</div>
      </div>
      {dialog}
    </div>
  );
}

// ══ Daten ════════════════════════════════════════════════════════════════
const GROUPS = [
  { id: 'tanzgarde', n: 'Tanzgarde', d: 'Marschtanz mit Gardeuniform, jede Session eine neue Choreografie. Training donnerstags in der Sporthalle.', c: 18, open: true, since: '1974' },
  { id: 'elferrat', n: 'Elferrat', d: 'Elf Leute, ein Auftrag: die Sitzung zusammenhalten und den Abend moderieren.', c: 11, open: false, since: '1968' },
  { id: 'maennerballett', n: 'Männerballett', d: 'Was uns an Eleganz fehlt, machen wir mit Einsatz wieder gut.', c: 14, open: true, since: '1996' },
  { id: 'kindergarde', n: 'Kindergarde', d: 'Unsere Kleinsten von 5 bis 11. Training samstags, Eltern gern dabei.', c: 22, open: true, since: '1989' },
  { id: 'showtanz', n: 'Showtanz', d: 'Eine große Nummer pro Session — mit Kulisse, Requisiten und zwei Kostümwechseln.', c: 12, open: false, since: '2004' },
  { id: 'technik', n: 'Technik & Bühne', d: 'Licht, Ton, Vorhang und alles, was hinten dran hängt. Auch ohne Bühnenerfahrung.', c: 7, open: true, since: '2011' },
  { id: 'kapelle', n: 'Musik & Kapelle', d: 'Live-Musik zum Einmarsch, zwischen den Nummern und bis in die Nacht.', c: 9, open: false, since: '1972' },
  { id: 'funken', n: 'Funkenmariechen', d: 'Solotanz-Gruppe. Seit 2019 keine Tänzerinnen mehr — archiviert.', c: 0, open: false, since: '1981', archived: true, ended: '2019' },
];

const PERSONS = [
  { n: 'Anna Brunner', s: 'aktiv', art: 'Aktiv', seit: '2014', g: [['Tanzgarde', '2014'], ['Showtanz', '2021']], a: [['Trainerin · Tanzgarde', '2019']], c: true, tel: '0170 44 21 883', mail: 'anna.brunner@web.de', adr: 'Am Anger 7, 99713 Großfurra', geb: '12.03.1996' },
  { n: 'Bernd Kastner', s: 'aktiv', art: 'Aktiv', seit: '2003', g: [['Elferrat', '2005']], a: [['Präsident', '2016']], k: true, c: true, tel: '0160 21 90 447', mail: 'praesident@furria.de', adr: 'Kirchgasse 2, 99713 Großfurra', geb: '04.09.1971' },
  { n: 'Christa Vogel', s: 'aktiv', art: 'Aktiv', seit: '1989', ehren: '2018/19', g: [], a: [['Finanzen', '2011']], k: true, c: false, tel: '0151 33 22 110', mail: 'kasse@furria.de', adr: 'Bahnhofstraße 19, 99706 Sondershausen', geb: '22.01.1962' },
  { n: 'Dieter Hanf', s: 'ruht', art: 'Passiv', seit: '2008', g: [['Männerballett', '2010']], a: [], c: false, tel: '0176 88 41 200', mail: 'd.hanf@gmx.de', adr: 'Lindenweg 4, 99713 Großfurra', geb: '17.06.1984' },
  { n: 'Elif Kaya', s: 'kein', seit: null, g: [['Kindergarde', '2023']], a: [['Trainerin · Kindergarde', '2023']], c: true, tel: '0177 55 08 913', mail: 'elif.kaya@posteo.de', adr: 'Schulstraße 11, 99706 Sondershausen', geb: '30.11.1991' },
  { n: 'Frank Öhler', s: 'aktiv', art: 'Aktiv', seit: '2017', g: [['Technik & Bühne', '2017']], a: [['Getränkewart', '2022']], k: true, c: false, tel: '0152 77 63 004', mail: 'f.oehler@t-online.de', adr: 'Talstraße 8, 99713 Großfurra', geb: '02.05.1988' },
  { n: 'Greta Simon', s: 'aktiv', art: 'Jugend', seit: '2019', g: [['Kindergarde', '2019']], a: [], c: false, tel: '— (Eltern: 0170 90 11 226)', mail: 'familie-simon@web.de', adr: 'Am Anger 22, 99713 Großfurra', geb: '08.07.2016' },
  { n: 'Hendrik Loos', s: 'beendet', art: 'Aktiv', seit: '2009', bis: '2024', g: [], a: [], c: false, tel: '0163 41 55 090', mail: 'h.loos@web.de', adr: 'Erfurter Str. 3, 99084 Erfurt', geb: '15.02.1979' },
  { n: 'Ilka Reineke', s: 'aktiv', art: 'Aktiv', seit: '2018', g: [['Tanzgarde', '2018']], a: [['Schriftführerin', '2021']], c: true, tel: '0176 20 44 781', mail: 'schriftfuehrung@furria.de', adr: 'Mühlweg 5, 99713 Großfurra', geb: '19.10.1993' },
  { n: 'Jonas Weber', s: 'aktiv', art: 'Aktiv', seit: '2016', g: [['Männerballett', '2016'], ['Musik & Kapelle', '2019']], a: [], c: true, tel: '0170 61 23 447', mail: 'jonas.weber@gmail.com', adr: 'Hauptstraße 40, 99713 Großfurra', geb: '27.08.1995' },
  { n: 'Katrin Möller', s: 'aktiv', art: 'Aktiv', seit: '2012', g: [['Showtanz', '2012']], a: [['Präsidentin', '2022']], k: true, c: true, tel: '0171 80 55 312', mail: 'praesidentin@furria.de', adr: 'Feldstraße 1, 99713 Großfurra', geb: '11.04.1987' },
  { n: 'Lena Sommer', s: 'aktiv', art: 'Aktiv', seit: '2016', g: [['Tanzgarde', '2016']], a: [['Kommandantin · Tanzgarde', '2022']], c: false, tel: '0159 04 77 210', mail: 'lena.sommer@web.de', adr: 'Am Anger 15, 99713 Großfurra', geb: '05.12.1998' },
  { n: 'Mario Pfeil', s: 'aktiv', art: 'Ehren', seit: '1976', ehren: '2009/10', g: [], a: [], c: false, tel: '03632 66 41 8', mail: '—', adr: 'Kirchgasse 9, 99713 Großfurra', geb: '14.03.1953' },
  { n: 'Nadine Gerlach', s: 'aktiv', art: 'Passiv', seit: '2021', g: [], a: [['Fotografin', '2023']], c: true, tel: '0157 33 90 118', mail: 'fotos@furria.de', adr: 'Gartenstraße 6, 99706 Sondershausen', geb: '23.09.1990' },
  { n: 'Ole Krumbein', s: 'aktiv', art: 'Jugend', seit: '2022', g: [['Kindergarde', '2022']], a: [['Kinderpräsident', '2025']], c: false, tel: '— (Eltern: 0175 22 66 401)', mail: 'krumbein.fam@web.de', adr: 'Talstraße 21, 99713 Großfurra', geb: '19.05.2014' },
  { n: 'Paula Dietz', s: 'ruht', art: 'Aktiv', seit: '2017', g: [['Tanzgarde', '2017']], a: [], c: true, tel: '0176 55 01 229', mail: 'paula.dietz@uni-jena.de', adr: 'Wagnergasse 12, 07743 Jena', geb: '03.02.2003' },
];

// ── Rechte-Katalog: eine wachsende Liste, logisch gruppiert ──────────────
// Ein Recht = eine Sache, die man tun darf. Beschreibung gehört dazu.
const RIGHTGROUPS = [
  { id: 'personen', label: 'Personen & Mitgliedschaft', icon: 'users', hint: 'Das Register und alles, was daran datiert hängt', rights: [
    { id: 'p_view', label: 'Verzeichnis sehen', desc: 'Namen, Status, Gruppen und Rollen aller verbundenen Personen.', base: true },
    { id: 'p_detail', label: 'Kontaktdaten aller Personen sehen', desc: 'Telefon, E-Mail und Adresse — auch wenn die Person sie für Mitglieder nicht freigegeben hat.', sens: true },
    { id: 'p_edit', label: 'Personen anlegen und Stammdaten ändern', desc: 'Name, Geburtsdatum, Anschrift, Kontakt.' },
    { id: 'p_member', label: 'Mitgliedschaften pflegen', desc: 'Zeiträume, Ruhezeiten und Beitragsermäßigungen anlegen und beenden.' },
    { id: 'p_ehren', label: 'Ehrenmitgliedschaft verleihen', desc: 'Wird in einer Session verliehen und läuft dann dauerhaft mit.' },
    { id: 'p_del', label: 'Person löschen', desc: 'Nur möglich, solange keine Mitgliedschaft, Zahlung oder Zugehörigkeit dranhängt.', danger: true },
  ] },
  { id: 'gruppen', label: 'Gruppen', icon: 'grid', hint: 'Die höhere Instanz über den Gruppen-Admins', rights: [
    { id: 'g_manage', label: 'Gruppen anlegen, bearbeiten, archivieren', desc: 'Name, Beschreibung, „sucht Verstärkung“, Archiv.' },
    { id: 'g_members', label: 'Zugehörigkeiten überschreiben', desc: 'Personen in jede Gruppe aufnehmen oder herausnehmen, auch ohne dort Admin zu sein.' },
    { id: 'g_admins', label: 'Gruppen-Admins ernennen und beenden', desc: 'Inklusive der Funktions-Bezeichnung (Trainerin, Sprecher …).' },
  ] },
  { id: 'rollen', label: 'Rollen & Rechte', icon: 'key', hint: 'Wer darf bestimmen, wer was darf', rights: [
    { id: 'r_manage', label: 'Rollen anlegen und umbenennen', desc: 'Neue Rollen entstehen im Verein, nicht im Code.' },
    { id: 'r_rights', label: 'Rechte einer Rolle ändern', desc: 'Das mächtigste Recht im Verein — wer es hat, kann sich alles andere selbst geben.', sens: true },
    { id: 'r_assign', label: 'Rollen an Personen vergeben', desc: 'Inhaber hinzufügen und beenden, mit Datum.' },
  ] },
  { id: 'geld', label: 'Beiträge & Kasse', icon: 'euro', hint: 'Zahlen sehen ist etwas anderes als Zahlen buchen', rights: [
    { id: 'm_view', label: 'Beitragsstände aller Mitglieder sehen', desc: 'Offen, bezahlt, Mahnstand — personenbezogen.', sens: true },
    { id: 'm_book', label: 'Zahlungen buchen und Beiträge stellen', desc: 'Bar-Eingänge buchen, Jahresbeiträge stellen, Buchungen korrigieren.' },
    { id: 'm_expense', label: 'Auslagen genehmigen und erstatten', desc: 'Belege prüfen, „bar erstattet“ markieren.' },
    { id: 'm_drinks', label: 'Getränkekasse führen', desc: 'Bestand, Strichliste, Geld-erhalten-Abgleich.' },
  ] },
  { id: 'events', label: 'Veranstaltungen', icon: 'star', hint: 'Von den Eckdaten bis zum Abend selbst', rights: [
    { id: 'e_manage', label: 'Veranstaltungen anlegen und planen', desc: 'Eckdaten, Aufgaben, Werbung.' },
    { id: 'e_program', label: 'Programm und Reihenfolge bearbeiten', desc: 'Auftritte, Auto-Reihenfolge, Sperren.' },
    { id: 'e_seating', label: 'Saalplan bearbeiten', desc: 'Tischreihen, Bühne, Kapazität.' },
    { id: 'e_live', label: 'Live-Regie führen', desc: 'Den Abend live weiterschalten und Pushes an die Gruppen senden.' },
    { id: 'e_tickets', label: 'Vorverkauf und Karten verwalten', desc: 'Kontingente, Preise, Vorbestellungen, Kartenbörse.' },
  ] },
  { id: 'inhalte', label: 'Inhalte & Außenauftritt', icon: 'image', hint: 'Was der Verein nach außen zeigt', rights: [
    { id: 'c_gallery', label: 'Galerie pflegen', desc: 'Bilder hochladen, sortieren, löschen — Fotofreigaben werden dabei beachtet.' },
    { id: 'c_news', label: 'News auf der Website veröffentlichen', desc: 'Beiträge schreiben und freigeben.' },
    { id: 'c_shop', label: 'Klamotten-Shop verwalten', desc: 'Sortiment, Sammelbestellung, Ausgabe abhaken.' },
  ] },
  { id: 'verein', label: 'Verein', icon: 'settings', hint: 'Der Rest, der irgendwem gehören muss', rights: [
    { id: 'k_keys', label: 'Schlüssel-Register pflegen', desc: 'Schlüsselarten anlegen und eintragen, wer welchen hat.' },
    { id: 's_settings', label: 'Vereins-Einstellungen ändern', desc: 'Session, Beitragssätze, Zahlungsanbieter, Texte.', sens: true },
  ] },
];
const RIGHT_BY = {};
RIGHTGROUPS.forEach(g => g.rights.forEach(r => { RIGHT_BY[r.id] = { ...r, group: g.label, groupId: g.id }; }));
const RIGHT_COUNT = RIGHTGROUPS.reduce((n, g) => n + g.rights.length, 0);

// ── Rollen: Name, Kurzbeschreibung, Rechte, Inhaber mit „seit“ ──────────
const ROLES = [
  { id: 'mitglied', n: 'Mitglied', kind: 'basis', desc: 'Die Grundrolle. Hat jede Person mit App-Zugang automatisch — nur lesend.', r: ['p_view'], h: [], count: 152, locked: true },
  { id: 'praesidentin', n: 'Präsidentin', kind: 'gewählt', unique: true, desc: 'Führt den Verein, vertritt ihn nach außen und darf im Zweifel alles außer Geld buchen.', r: ['p_view', 'p_detail', 'p_edit', 'p_member', 'p_ehren', 'g_manage', 'g_members', 'g_admins', 'r_assign', 'm_view', 'e_manage', 'e_program', 'e_seating', 'e_live', 'c_news', 'k_keys'], h: [['Katrin Möller', '2022']] },
  { id: 'praesident', n: 'Präsident', kind: 'gewählt', unique: true, desc: 'Gleiche Rechte wie die Präsidentin — der Verein hat beide Ämter besetzt.', r: ['p_view', 'p_detail', 'p_edit', 'p_member', 'p_ehren', 'g_manage', 'g_members', 'g_admins', 'r_assign', 'm_view', 'e_manage', 'e_program', 'e_seating', 'e_live', 'c_news', 'k_keys'], h: [['Bernd Kastner', '2016']] },
  { id: 'kinderpraesident', n: 'Kinderpräsident', kind: 'gewählt', unique: true, desc: 'Repräsentativ. Bewusst ohne Verwaltungsrechte.', r: ['p_view'], h: [['Ole Krumbein', '2025']] },
  { id: 'gf', n: 'Geschäftsführer', kind: 'gewählt', desc: 'Das Tagesgeschäft: Register, Gruppen, Einladungen, Vorverkauf.', r: ['p_view', 'p_detail', 'p_edit', 'p_member', 'g_manage', 'g_members', 'g_admins', 'r_assign', 'm_view', 'm_book', 'e_manage', 'e_tickets', 'k_keys'], h: [] },
  { id: 'schrift', n: 'Schriftführerin', kind: 'gewählt', desc: 'Pflegt Stammdaten und die datierten Fakten am Register.', r: ['p_view', 'p_detail', 'p_edit', 'p_member'], h: [['Ilka Reineke', '2021']] },
  { id: 'finanzen', n: 'Finanzen', kind: 'gewählt', desc: 'Beiträge, Zahlungen, Belege, Kassenbericht.', r: ['p_view', 'p_detail', 'm_view', 'm_book', 'm_expense'], h: [['Christa Vogel', '2011']] },
  { id: 'getraenke', n: 'Getränkewart', kind: 'ernannt', desc: 'Eine Kasse, ein Bestand, eine Strichliste.', r: ['p_view', 'm_drinks'], h: [['Frank Öhler', '2022']] },
  { id: 'foto', n: 'Fotografin', kind: 'ernannt', multi: true, desc: 'Pflegt die Galerie. Sieht keine Personendaten.', r: ['p_view', 'c_gallery'], h: [['Nadine Gerlach', '2023']] },
  { id: 'kleidung', n: 'Kleidung', kind: 'ernannt', multi: true, desc: 'Sortiment und Sammelbestellungen im Klamotten-Shop.', r: ['p_view', 'c_shop'], h: [] },
  { id: 'technik', n: 'Bühnentechnik', kind: 'ernannt', multi: true, desc: 'Programm und Live-Regie am Abend, ohne Verwaltung.', r: ['p_view', 'e_program', 'e_live'], h: [['Frank Öhler', '2023']] },
  { id: 'admin', n: 'Admin', kind: 'technisch', desc: 'Technische Rolle. Trägt alle Rechte und kann sich selbst keins entziehen.', r: 'all', h: [['Frank Öhler', '2024']] },
];
const roleRights = (ro) => ro.r === 'all' ? Object.keys(RIGHT_BY) : ro.r;
const rightHolders = (rid) => ROLES.filter(ro => roleRights(ro).includes(rid) && !ro.locked).length;

const RIGHTS = [
  { id: 'personen', label: 'Personen verwalten', hint: 'Personen anlegen, Stammdaten und datierte Fakten ändern' },
  { id: 'details', label: 'Personendetails sehen', hint: 'Kontaktdaten aller Personen sehen, auch ohne Freigabe' },
  { id: 'gruppen', label: 'Gruppen verwalten', hint: 'Gruppen anlegen, bearbeiten, archivieren, Zugehörigkeiten überschreiben' },
  { id: 'aemter', label: 'Ämter & Rechte verwalten', hint: 'Ämter anlegen und Rechte zuordnen' },
];

const AEMTER = [
  { n: 'Präsident', r: ['personen', 'details', 'gruppen'], h: [['Bernd Kastner', '2016']] },
  { n: 'Präsidentin', r: ['personen', 'details', 'gruppen'], h: [['Katrin Möller', '2022']] },
  { n: 'Kinderpräsident', r: [], h: [['Ole Krumbein', '2025']] },
  { n: 'Geschäftsführer', r: ['personen', 'details', 'gruppen'], h: [] },
  { n: 'Schriftführerin', r: ['personen', 'details'], h: [['Ilka Reineke', '2021']] },
  { n: 'Finanzen', r: ['details'], h: [['Christa Vogel', '2011']] },
  { n: 'Getränkewart', r: [], h: [['Frank Öhler', '2022']] },
  { n: 'Fotografin', r: [], h: [['Nadine Gerlach', '2023']] },
  { n: 'Kleidung', r: ['details'], h: [] },
  { n: 'Admin', r: ['personen', 'details', 'gruppen', 'aemter'], h: [['Frank Öhler', '2024']] },
];

const PG = { GROUPS, PERSONS, RIGHTS, AEMTER, RIGHTGROUPS, RIGHT_BY, RIGHT_COUNT, ROLES, roleRights, rightHolders };
Object.assign(window, { PGP, PG, PgModal, PgRow, PgEyeb, PgDisp, PgBody, PgSec, PgCd, PgFlecks, PgAv, PgIni, PgSeal, PgKey, PgState, PgSw, PgSearch, PgFilters, PgStat, PgSkel, PgSkelRow, PgEmpty, PgConfirm, PgMob, PgDesk, PgRail, PgPill, PgBack });
