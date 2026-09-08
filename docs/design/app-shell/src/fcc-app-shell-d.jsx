// fcc-app-shell-d.jsx — Layout D „Destillat": personenzentrierte Bühne +
// Vorhang-Navigation. Mobile & Desktop, konsequent hell ODER dunkel.

const D = window.T;
const DME = { name: 'Anna Brunner', first: 'Anna', short: 'AB', group: 'Tanzgarde' };

// Zwei Paletten, gleiche Struktur. Hell = kein Schwarz, auch nicht in Bühne/Vorhang.
function dpal(dark) {
  return dark ? {
    dark: true,
    stage: '#0E0B0A', bg: '#161110', panel: '#1E1817', rail: '#0E0B0A',
    ink: '#FBF4E6', sub: 'rgba(251,244,230,0.58)', faint: 'rgba(251,244,230,0.40)',
    line: 'rgba(251,244,230,0.14)', line2: 'rgba(251,244,230,0.08)',
    sInk: '#FBF4E6', sSub: 'rgba(251,244,230,0.55)', sFaint: 'rgba(251,244,230,0.40)',
    sLine: 'rgba(251,244,230,0.11)', sCard: 'rgba(251,244,230,0.05)', sCardLine: 'rgba(251,244,230,0.12)',
    glow: 'rgba(225,29,42,0.26)', glow2: 'rgba(244,180,0,0.14)',
    stageBg: 'linear-gradient(168deg, #17100E 0%, #0E0B0A 58%)',
    stageLift: '0 12px 30px rgba(0,0,0,0.45)',
    ghostBg: 'rgba(251,244,230,0.14)', ghostFg: '#FBF4E6',
    badge: '#FFD36B', okBg: 'rgba(46,158,91,0.22)', okFg: '#5FD08D',
    pill: '#2A2220', pillLine: '1px solid rgba(251,244,230,0.16)', pillFg: '#FBF4E6',
    sheetShadow: '0 -10px 30px rgba(0,0,0,0.5)', sheetRadius: '22px 22px 0 0', card: '#1E1817', cardLine: 'rgba(251,244,230,0.10)',
  } : {
    dark: false,
    stage: '#FFFFFF', bg: '#FDFCFA', panel: '#FBF4E6', rail: '#FFFFFF',
    ink: D.ink, sub: D.sub, faint: D.faint, line: D.line, line2: D.line2,
    sInk: D.ink, sSub: D.sub, sFaint: D.faint,
    sLine: 'rgba(26,20,17,0.10)', sCard: '#FBF4E6', sCardLine: 'rgba(26,20,17,0.08)',
    glow: 'rgba(225,29,42,0.10)', glow2: 'rgba(244,180,0,0.16)',
    stageBg: 'linear-gradient(168deg, #FFFFFF 0%, #FFFDF8 46%, #FDF6E9 100%)',
    stageLift: '0 10px 26px rgba(26,20,17,0.07)',
    ghostBg: 'rgba(26,20,17,0.07)', ghostFg: D.ink,
    badge: '#9a7200', okBg: 'rgba(46,158,91,0.12)', okFg: D.green,
    pill: D.ink, pillLine: 'none', pillFg: D.cream,
    sheetShadow: 'none', sheetRadius: '0', card: '#FBF4E6', cardLine: 'rgba(26,20,17,0.08)',
  };
}

function DRow({ children, style, onClick }) { return <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, ...style }}>{children}</div>; }
function DEyeb({ children, c, style }) { return <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 1.8, color: c, textTransform: 'uppercase', ...style }}>{children}</div>; }
function DDisp({ children, size = 22, c, style }) { return <div style={{ fontFamily: D.display, fontSize: size, lineHeight: 1, color: c, letterSpacing: 0.4, ...style }}>{children}</div>; }
function DBody({ children, size = 13.5, c, w = 600, style }) { return <div style={{ fontSize: size, fontWeight: w, color: c, lineHeight: 1.45, ...style }}>{children}</div>; }

function DSec({ children, c }) {
  return (
    <DRow style={{ gap: 9, marginBottom: 12 }}>
      <span style={{ width: 9, height: 9, background: D.red, flexShrink: 0 }} />
      <span style={{ fontFamily: D.display, fontSize: 13, letterSpacing: 1.6, color: c.ink }}>{children}</span>
      <span style={{ flex: 1, height: 1.5, background: c.line }} />
    </DRow>
  );
}

function DCard({ children, c, style }) {
  return <div style={{ background: c.card, border: `1.5px solid ${c.cardLine}`, borderRadius: 16, padding: '4px 16px', ...style }}>{children}</div>;
}

function DChip({ tone = 'neutral', children, c }) {
  const map = c.dark ? {
    red: ['#FF7A82', 'rgba(225,29,42,0.20)'], gold: ['#FFD36B', 'rgba(244,180,0,0.18)'],
    green: ['#6FD79B', 'rgba(46,158,91,0.20)'], neutral: ['rgba(251,244,230,0.7)', 'rgba(251,244,230,0.10)'],
  } : {
    red: [D.red, 'rgba(225,29,42,0.10)'], gold: ['#9a7200', 'rgba(244,180,0,0.18)'],
    green: [D.green, 'rgba(46,158,91,0.13)'], neutral: [D.sub, 'rgba(26,20,17,0.06)'],
  };
  const [fg, bg] = map[tone] || map.neutral;
  return <span style={{ background: bg, color: fg, fontWeight: 800, fontSize: 11, padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap' }}>{children}</span>;
}

// ── Aufgabe in der Bühne: was der Mensch noch nicht weiß ──
function DTask({ eyebrow, title, action, tone = 'red', last, wide, c }) {
  const bg = tone === 'red' ? D.red : tone === 'gold' ? D.gold : c.ghostBg;
  const fg = tone === 'gold' ? D.ink : tone === 'red' ? '#fff' : c.ghostFg;
  const pill = <div style={{ display: 'inline-block', background: bg, color: fg, fontWeight: 900, fontSize: 12.5, padding: '9px 15px', borderRadius: 30, whiteSpace: 'nowrap', cursor: 'pointer' }}>{action}</div>;
  if (wide) return (
    <div style={{ flex: 1, background: c.sCard, border: `1.5px solid ${c.sCardLine}`, borderRadius: 14, padding: '15px 16px' }}>
      <DEyeb c={c.sFaint}>{eyebrow}</DEyeb>
      <div style={{ fontWeight: 800, fontSize: 15, color: c.sInk, marginTop: 6, marginBottom: 14 }}>{title}</div>
      {pill}
    </div>
  );
  return (
    <DRow style={{ padding: '13px 0', borderBottom: last ? 'none' : `1px solid ${c.sLine}`, gap: 14 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <DEyeb c={c.sFaint}>{eyebrow}</DEyeb>
        <div style={{ fontWeight: 800, fontSize: 15, color: c.sInk, marginTop: 5 }}>{title}</div>
      </div>
      {pill}
    </DRow>
  );
}

const D_NAV = [
  ['Übersicht', 'home', null], ['Meine Auftritte', 'star', '3'], ['Spielplan', 'calendar', null],
  ['Live-Regie', 'broadcast', 'live'], ['Bierliste', 'beer', '48 €'], ['Beitrag', 'euro', 'offen'],
  ['Mitglieder', 'users', null], ['Galerie', 'image', '42 neu'], ['Klamotten', 'shirt', null], ['Schlüssel', 'key', null],
];

function DNavList({ fs = 23, gap = 8, c }) {
  return (
    <>
      {D_NAV.map(([l, ic, badge], i) => {
        const on = i === 0;
        return (
          <DRow key={l} style={{ padding: `${gap}px 0`, cursor: 'pointer', borderBottom: i < D_NAV.length - 1 ? `1px solid ${c.line2}` : 'none' }}>
            <window.Ic name={ic} size={17} color={on ? D.red : c.faint} sw={2} />
            <div style={{ fontFamily: D.display, fontSize: fs, color: on ? c.ink : c.sub, letterSpacing: 0.6 }}>{l.toUpperCase()}</div>
            <div style={{ flex: 1 }} />
            {badge === 'live' ? <span style={{ width: 8, height: 8, borderRadius: 5, background: D.red }} /> : badge && <span style={{ fontWeight: 900, fontSize: 10.5, color: c.badge }}>{badge}</span>}
          </DRow>
        );
      })}
    </>
  );
}

function DCurtain({ onClose, c }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: c.dark ? c.stage : c.bg, zIndex: 30, display: 'flex', flexDirection: 'column', padding: '50px 22px 22px' }}>
      <div style={{ position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)', width: 460, height: 400, background: `radial-gradient(closest-side, ${c.glow2}, rgba(244,180,0,0))` }} />
      <DRow style={{ position: 'relative' }}>
        <DRow style={{ gap: 11 }}>
          <window.Avatar initials={DME.short} tone="gold" size={34} />
          <div><div style={{ fontWeight: 800, fontSize: 13.5, color: c.ink }}>{DME.name}</div><div style={{ fontSize: 11.5, fontWeight: 600, color: c.faint }}>{DME.group} · Aktiv</div></div>
        </DRow>
        <div style={{ flex: 1 }} />
        <div onClick={onClose} style={{ width: 34, height: 34, borderRadius: 20, border: `1.5px solid ${c.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" stroke={c.ink} strokeWidth="2.4" strokeLinecap="round"><path d="M5 5l14 14M19 5L5 19" /></svg>
        </div>
      </DRow>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}><DNavList c={c} /></div>
      <DRow style={{ position: 'relative', gap: 10, borderTop: `1px solid ${c.line}`, paddingTop: 14 }}>
        <window.Ic name="settings" size={18} color={c.faint} />
        <div style={{ flex: 1, fontWeight: 700, fontSize: 13, color: c.sub }}>Einstellungen</div>
        <window.Ic name="logout" size={18} color={c.faint} />
      </DRow>
    </div>
  );
}

function DMenuButton({ here = 'Übersicht', onOpen, c }) {
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 14, paddingTop: 26, display: 'flex', justifyContent: 'center', pointerEvents: 'none', background: `linear-gradient(to top, ${c.bg} 46%, ${c.dark ? 'rgba(22,17,16,0)' : 'rgba(253,252,250,0)'})`, zIndex: 20 }}>
      <div onClick={onOpen} style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: 12, background: c.pill, border: c.pillLine, color: c.pillFg, padding: '13px 20px 13px 17px', borderRadius: 40, boxShadow: c.dark ? '0 8px 22px rgba(0,0,0,0.5)' : '0 8px 22px rgba(26,20,17,0.26)', cursor: 'pointer' }}>
        <span style={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
          <span style={{ width: 17, height: 2.4, background: D.red }} />
          <span style={{ width: 17, height: 2.4, background: c.pillFg }} />
          <span style={{ width: 17, height: 2.4, background: c.pillFg }} />
        </span>
        <span style={{ fontFamily: D.display, fontSize: 15, letterSpacing: 1.4 }}>{here.toUpperCase()}</span>
        <span style={{ width: 6, height: 6, borderRadius: 5, background: D.red }} />
      </div>
    </div>
  );
}

const D_WEEK = [
  ['DO', '10.', 'Training Tanzgarde', '19:00 · Sporthalle', 'gold', 'Zusage fehlt'],
  ['SA', '12.', 'Arbeitseinsatz Vereinsraum', '09:00 · 6 von 10 Helfern', 'neutral', 'freiwillig'],
  ['DI', '15.', 'Kostümprobe', '18:30 · Vereinsraum', 'green', 'zugesagt'],
];

function DWeek({ c }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {D_WEEK.map(([dy, dt, t, s, tone, chip], i) => (
        <DRow key={t} style={{ padding: '12px 0', borderTop: i ? `1.5px solid ${c.line2}` : 'none', gap: 13 }}>
          <div style={{ width: 38, textAlign: 'center' }}>
            <DEyeb c={i === 0 ? D.red : c.faint}>{dy}</DEyeb>
            <DDisp size={18} c={c.ink} style={{ marginTop: 4 }}>{dt}</DDisp>
          </div>
          <div style={{ width: 1.5, alignSelf: 'stretch', background: c.line2 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: c.ink }}>{t}</div>
            <DBody size={12.5} c={c.sub}>{s}</DBody>
          </div>
          <DChip tone={tone} c={c}>{chip}</DChip>
        </DRow>
      ))}
    </div>
  );
}

function DShow({ c }) {
  return (
    <DRow style={{ gap: 14 }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 14.5, color: c.ink }}>1. Prunksitzung · Sa 23.01.</div>
        <DBody size={12.5} c={c.sub} style={{ marginTop: 3 }}>Platz 6 von 14 · Bühne ca. 20:40 · Reihenfolge noch nicht final</DBody>
      </div>
      <window.Ic name="chevron" size={17} color={c.faint} />
    </DRow>
  );
}

function DStageHead({ quiet, c, big }) {
  return (
    <>
      <DRow style={{ position: 'relative' }}>
        <div style={{ fontFamily: D.display, fontSize: big ? 20 : 17, letterSpacing: 1.2, color: c.sInk }}>FURRIA</div>
        <div style={{ flex: 1 }} />
        <DEyeb c={c.sFaint}>Session 2025/26</DEyeb>
        <div style={{ position: 'relative' }}><window.Ic name="bell" size={19} color={c.sSub} />{!quiet && <span style={{ position: 'absolute', top: -1, right: -1, width: 7, height: 7, borderRadius: 5, background: D.red }} />}</div>
      </DRow>
      <div style={{ position: 'relative', marginTop: big ? 26 : 22 }}>
        <DDisp size={big ? 46 : 33} c={c.sInk}>MOIN, {DME.first.toUpperCase()}.</DDisp>
        <DBody c={c.sSub} size={big ? 15 : 13.5} style={{ marginTop: 10 }}>
          {quiet ? 'Samstag, 6. September · nichts offen, nichts zu bestätigen.' : 'Samstag, 6. September · drei Sachen brauchen dich.'}
        </DBody>
      </div>
    </>
  );
}

function DQuiet({ c }) {
  return (
    <DRow style={{ position: 'relative', marginTop: 22, gap: 12, borderTop: `1px solid ${c.sLine}`, paddingTop: 18 }}>
      <span style={{ width: 34, height: 34, borderRadius: 20, background: c.okBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Ic name="check" size={18} color={c.okFg} sw={2.4} /></span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: c.sInk }}>Alles erledigt.</div>
        <DBody size={12.5} c={c.sFaint}>Beitrag bezahlt · Bierliste ausgeglichen · Training zugesagt</DBody>
      </div>
    </DRow>
  );
}

// ══════════════════════════════════════════════════════════════════
// Mobile
// ══════════════════════════════════════════════════════════════════
function LayoutD({ open = false, quiet = false, dark = false }) {
  const c = dpal(dark);
  const [menu, setMenu] = React.useState(open);
  return (
    <window.PhoneFrame screenBg={c.dark ? '#17100E' : '#FFFFFF'}>
      <div style={{ position: 'relative', zIndex: 40 }}><window.StatusBar color={c.ink} time="9:41" /></div>
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', background: c.bg, overflow: 'hidden' }}>
        <div style={{ padding: '6px 20px 22px', position: 'relative', background: c.stageBg, boxShadow: c.stageLift, zIndex: 6 }}>
          <div style={{ position: 'absolute', top: -120, right: -70, width: 340, height: 320, background: `radial-gradient(closest-side, ${c.glow}, rgba(225,29,42,0))` }} />
          <DStageHead quiet={quiet} c={c} />
          {!quiet ? (
            <div style={{ position: 'relative', marginTop: 20, borderTop: `1px solid ${c.sLine}` }}>
              <DTask c={c} eyebrow="Zusage fehlt" title="Training Do 19:00 · Sporthalle" action="Bin dabei" tone="gold" />
              <DTask c={c} eyebrow="Offen seit 14 Tagen" title="Mitgliedsbeitrag 2025/26 · 30 €" action="Bezahlen" />
              <DTask c={c} eyebrow="Bierliste" title="4 Kisten auf dich · 48 €" action="Ausgleichen" tone="ghost" last />
            </div>
          ) : <DQuiet c={c} />}
        </div>
        <div style={{ flex: 1, background: c.bg, borderRadius: c.sheetRadius, padding: '18px 20px 76px', display: 'flex', flexDirection: 'column', gap: 16, overflow: 'hidden', boxShadow: c.sheetShadow }}>
          <div><DSec c={c}>Deine Woche</DSec><DCard c={c}><DWeek c={c} /></DCard></div>
          <div><DSec c={c}>Dein Auftritt</DSec><DCard c={c} style={{ padding: '14px 16px' }}><DShow c={c} /></DCard></div>
        </div>
        <DMenuButton here="Übersicht" onOpen={() => setMenu(true)} c={c} />
        {menu && <DCurtain onClose={() => setMenu(false)} c={c} />}
      </div>
      <div style={{ position: 'relative', zIndex: 40 }}><window.HomeIndicator color={dark ? 'rgba(251,244,230,0.5)' : 'rgba(26,20,17,0.7)'} /></div>
    </window.PhoneFrame>
  );
}

// ══════════════════════════════════════════════════════════════════
// Desktop — der Vorhang wird zur festen Schiene, die Bühne zum Kopfband
// ══════════════════════════════════════════════════════════════════
function LayoutDDesk({ dark = false, quiet = false }) {
  const c = dpal(dark);
  return (
    <div style={{ height: '100%', display: 'flex', fontFamily: D.font, background: c.bg, overflow: 'hidden' }}>
      <div style={{ flex: '0 0 316px', background: c.rail, borderRight: c.dark ? 'none' : `1.5px solid ${c.line}`, display: 'flex', flexDirection: 'column', padding: '26px 24px 22px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -70, left: '50%', transform: 'translateX(-50%)', width: 420, height: 360, background: `radial-gradient(closest-side, ${c.glow2}, rgba(244,180,0,0))` }} />
        <div style={{ position: 'relative', lineHeight: 0.9, marginBottom: 26 }}>
          <div style={{ fontFamily: D.display, fontSize: 26, letterSpacing: 1.2, color: c.ink }}>FURRIA</div>
          <div style={{ fontSize: 9, fontWeight: 900, letterSpacing: 2.2, color: c.faint, marginTop: 5 }}>CLUB-APP · SESSION 2025/26</div>
        </div>
        <div style={{ position: 'relative', flex: 1 }}><DNavList fs={20} gap={6} c={c} /></div>
        <DRow style={{ position: 'relative', gap: 11, borderTop: `1px solid ${c.line}`, paddingTop: 16 }}>
          <window.Avatar initials={DME.short} tone="gold" size={34} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13, color: c.ink }}>{DME.name}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: c.faint }}>{DME.group} · Aktiv</div>
          </div>
          <window.Ic name="logout" size={17} color={c.faint} />
        </DRow>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <div style={{ background: c.stageBg, padding: '26px 40px 30px', position: 'relative', overflow: 'hidden', boxShadow: c.stageLift, zIndex: 6 }}>
          <div style={{ position: 'absolute', top: -160, right: -40, width: 520, height: 460, background: `radial-gradient(closest-side, ${c.glow}, rgba(225,29,42,0))` }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: 40 }}>
            <div style={{ flex: '0 0 340px' }}>
              <DDisp size={46} c={c.sInk}>MOIN, {DME.first.toUpperCase()}.</DDisp>
              <DBody c={c.sSub} size={14.5} style={{ marginTop: 12 }}>
                {quiet ? 'Samstag, 6. September · nichts offen.' : 'Samstag, 6. September · drei Sachen brauchen dich.'}
              </DBody>
            </div>
            {quiet ? <div style={{ flex: 1 }}><DQuiet c={c} /></div> : (
              <div style={{ flex: 1, display: 'flex', gap: 14 }}>
                <DTask wide c={c} eyebrow="Zusage fehlt" title="Training Do 19:00 · Sporthalle" action="Bin dabei" tone="gold" />
                <DTask wide c={c} eyebrow="Offen seit 14 Tagen" title="Beitrag 2025/26 · 30 €" action="Bezahlen" />
                <DTask wide c={c} eyebrow="Bierliste" title="4 Kisten auf dich · 48 €" action="Ausgleichen" tone="ghost" />
              </div>
            )}
          </div>
        </div>
        <div style={{ flex: 1, padding: '30px 40px', display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 34, alignContent: 'start' }}>
          <div><DSec c={c}>Deine Woche</DSec><DCard c={c}><DWeek c={c} /></DCard></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <div><DSec c={c}>Dein Auftritt</DSec><DCard c={c} style={{ padding: '14px 16px' }}><DShow c={c} /></DCard></div>
            <div>
              <DSec c={c}>Neu im Verein</DSec>
              <DCard c={c}><div style={{ display: 'flex', flexDirection: 'column' }}>
                {[['42 Fotos vom Sommerfest', 'Galerie · vor 2 Tagen'], ['Reihenfolge 1. Prunksitzung im Entwurf', 'Spielplan · vor 4 Tagen'], ['Neue Softshell-Jacken bestellbar', 'Klamotten · vor 1 Woche']].map(([t, s], i) => (
                  <DRow key={t} style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${c.line2}` : 'none', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: c.ink }}>{t}</div>
                      <DBody size={12} c={c.faint}>{s}</DBody>
                    </div>
                    <window.Ic name="chevron" size={16} color={c.faint} />
                  </DRow>
                ))}
              </div></DCard>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LayoutD, LayoutDDesk, DCurtain, DMenuButton });
