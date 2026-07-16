// fcc-ds-shell.jsx — internal Club-App design system shell.
// Calmer, denser, tool-grade reinterpretation of the Konfetti-Kinetik brand:
// Anton headers + red accent + cream/ink + broom mark, but soft elevation,
// hairline borders and real app chrome (top strip + dark sidebar + topbar).
// Exports tokens (T), Ic, primitives, NAVCONFIG, AppShell.

const T = {
  bg: '#FBF4E6', panel: '#FFFFFF', panel2: '#FBF8F1', ink: '#1A1411',
  sub: 'rgba(26,20,17,0.6)', faint: 'rgba(26,20,17,0.4)',
  red: '#E11D2A', redDk: '#B3101C', gold: '#F4B400', green: '#2E9E5B', blue: '#2F6DA8',
  line: 'rgba(26,20,17,0.12)', line2: 'rgba(26,20,17,0.07)',
  sideBg: '#171210', sideLine: 'rgba(251,244,230,0.10)', sideText: 'rgba(251,244,230,0.80)',
  sideDim: 'rgba(251,244,230,0.45)', cream: '#FBF4E6',
  shadow: '0 1px 2px rgba(26,20,17,0.05)', shadowLg: '0 12px 32px rgba(26,20,17,0.12)',
  radius: 14, font: "'Archivo', sans-serif", display: "'Anton', sans-serif",
};

// ── icon set (24x24 stroke) ──────────────────────────────────────────────
function Ic({ name, size = 20, color = 'currentColor', sw = 1.85, fill = 'none' }) {
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const P = {
    home: <><path d="M3 11l9-8 9 8" {...p} /><path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" {...p} /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2.5" {...p} /><path d="M3 9.5h18M8 3v4M16 3v4" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7.5V12l3.2 2" {...p} /></>,
    star: <><path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.3L12 16.9 6.1 18.6l1.1-5.3-4-3.7 5.4-.6Z" {...p} fill={fill} /></>,
    image: <><rect x="3" y="4.5" width="18" height="15" rx="2.5" {...p} /><circle cx="8.5" cy="9.5" r="1.7" {...p} /><path d="M21 15l-5-4.5L5 19.5" {...p} /></>,
    beer: <><path d="M7 8.5h8.5V19a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8.5Z" {...p} /><path d="M15.5 10.5H18a1.6 1.6 0 0 1 1.6 1.6v2.8A1.6 1.6 0 0 1 18 16.5h-2.5" {...p} /><path d="M8 8.3a2 2 0 0 1 .2-3.6 2.1 2.1 0 0 1 3.4-1.1 1.9 1.9 0 0 1 3 .8 1.7 1.7 0 0 1 .3 3.4" {...p} /><path d="M10 12v5M12.6 12v5" {...p} /></>,
    shirt: <><path d="M8 3 4 6l2 3 2-1.5V21h8V7.5L18 9l2-3-4-3-2 2H10L8 3Z" {...p} /></>,
    users: <><circle cx="9" cy="8.5" r="3" {...p} /><path d="M3.5 20c0-3.1 2.5-5 5.5-5s5.5 1.9 5.5 5" {...p} /><path d="M16 6a3 3 0 0 1 0 5.6M16.5 15.2c2.4.4 4 2.1 4 4.8" {...p} /></>,
    grid: <><rect x="3.5" y="3.5" width="7" height="7" rx="1.6" {...p} /><rect x="13.5" y="3.5" width="7" height="7" rx="1.6" {...p} /><rect x="3.5" y="13.5" width="7" height="7" rx="1.6" {...p} /><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" {...p} /></>,
    chart: <><path d="M4 4v16h16" {...p} /><path d="M8 15l3-3.5 3 2.5 4-5.5" {...p} /></>,
    settings: <><path d="M4 7h10M18 7h2M4 12h2M10 12h10M4 17h7M15 17h5" {...p} /><circle cx="16" cy="7" r="2" {...p} /><circle cx="8" cy="12" r="2" {...p} /><circle cx="13" cy="17" r="2" {...p} /></>,
    broadcast: <><circle cx="12" cy="12" r="2.4" {...p} fill={fill} /><path d="M7.5 7.5a6 6 0 0 0 0 9M16.5 7.5a6 6 0 0 1 0 9M5 5a9.5 9.5 0 0 0 0 14M19 5a9.5 9.5 0 0 1 0 14" {...p} /></>,
    bell: <><path d="M6 9.5a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" {...p} /><path d="M10.3 19.5a1.8 1.8 0 0 0 3.4 0" {...p} /></>,
    search: <><circle cx="11" cy="11" r="6.5" {...p} /><path d="M16 16l4 4" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    trash: <><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" {...p} /></>,
    refresh: <><path d="M20 8a8 8 0 1 0 1 6" {...p} /><path d="M20 4v4h-4" {...p} /></>,
    check: <><path d="M5 12.5l4.5 4.5L19 6.5" {...p} /></>,
    chevron: <><path d="M9 5l7 7-7 7" {...p} /></>,
    chevdown: <><path d="M5 9l7 7 7-7" {...p} /></>,
    pin: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" {...p} /><circle cx="12" cy="10" r="2.5" {...p} /></>,
    key: <><circle cx="8" cy="8" r="4" {...p} /><path d="M11 11l8 8M16 16l2-2M19 19l1.5-1.5" {...p} /></>,
    euro: <><path d="M16 7.5a5.5 5.5 0 1 0 0 9M5 11h7M5 13.5h6" {...p} /></>,
    upload: <><path d="M12 16V5M8 9l4-4 4 4" {...p} /><path d="M5 16v2.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V16" {...p} /></>,
    bolt: <><path d="M13 3 5 13h6l-1 8 8-10h-6l1-8Z" {...p} fill={fill} /></>,
    logout: <><path d="M14 4h4a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 18 20h-4" {...p} /><path d="M10 12h9M16 8.5 19.5 12 16 15.5" {...p} /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{P[name]}</svg>;
}

// ── primitives ───────────────────────────────────────────────────────────
function Card({ children, style, pad = 20, onClick }) {
  return <div onClick={onClick} style={{ background: T.panel, border: `1.5px solid ${T.line}`, borderRadius: T.radius, boxShadow: T.shadow, padding: pad, ...style }}>{children}</div>;
}

const CHIP = {
  red: [T.red, 'rgba(225,29,42,0.1)'], gold: ['#9a7200', 'rgba(244,180,0,0.16)'], green: [T.green, 'rgba(46,158,91,0.13)'],
  ink: [T.ink, 'rgba(26,20,17,0.08)'], blue: [T.blue, 'rgba(47,109,168,0.12)'], neutral: [T.sub, 'rgba(26,20,17,0.06)'],
};
function Chip({ tone = 'neutral', children, dot, style }) {
  const [fg, bg] = CHIP[tone] || CHIP.neutral;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: bg, color: fg, fontWeight: 800, fontSize: 11, letterSpacing: 0.3, padding: '4px 9px', borderRadius: 20, whiteSpace: 'nowrap', ...style }}>{dot && <span style={{ width: 6, height: 6, borderRadius: 4, background: fg }} />}{children}</span>;
}

function Btn({ children, primary, ghost, sm, icon, tone, style, onClick }) {
  const h = sm ? { fs: 13, pad: '8px 14px' } : { fs: 14.5, pad: '11px 18px' };
  let bg = T.ink, col = '#fff', bd = 'transparent';
  if (primary) { bg = tone === 'green' ? T.green : T.red; col = '#fff'; }
  if (ghost) { bg = 'transparent'; col = T.ink; bd = T.line; }
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: `1.5px solid ${bd}`, background: bg, color: col, fontFamily: T.font, fontWeight: 800, fontSize: h.fs, padding: h.pad, borderRadius: 30, cursor: 'pointer', whiteSpace: 'nowrap', ...style }}>
      {icon && <Ic name={icon} size={sm ? 15 : 17} color={col} sw={2} />}{children}
    </button>
  );
}

function Avatar({ initials, tone = 'gold', size = 36 }) {
  const bg = tone === 'gold' ? T.gold : tone === 'red' ? T.red : T.ink;
  const col = tone === 'gold' ? T.ink : '#fff';
  return <div style={{ width: size, height: size, borderRadius: size, background: bg, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.display, fontSize: size * 0.46, flexShrink: 0 }}>{initials}</div>;
}

function Eyebrow({ children, color = T.sub, style }) {
  return <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1.6, color, textTransform: 'uppercase', ...style }}>{children}</div>;
}
function Title({ children, size = 20, style }) {
  return <div style={{ fontFamily: T.display, fontSize: size, letterSpacing: 0.5, color: T.ink, lineHeight: 1, ...style }}>{children}</div>;
}
function Progress({ value, max, tone = 'red', h = 8 }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const c = tone === 'green' ? T.green : tone === 'gold' ? T.gold : T.red;
  return <div style={{ height: h, borderRadius: h, background: 'rgba(26,20,17,0.08)', overflow: 'hidden' }}><div style={{ width: pct + '%', height: '100%', background: c, borderRadius: h }} /></div>;
}

// ── navigation config (role-aware) ─────────────────────────────────────────
const NAVCONFIG = [
  { group: 'Mein Bereich', items: [
    { id: 'uebersicht', label: 'Übersicht', icon: 'home' },
    { id: 'auftritte', label: 'Meine Auftritte', icon: 'star' },
  ] },
  { group: 'Verein', items: [
    { id: 'spielplan', label: 'Spielplan', icon: 'clock' },
    { id: 'galerie', label: 'Galerie', icon: 'image' },
    { id: 'bierliste', label: 'Bierliste', icon: 'beer' },
    { id: 'shop', label: 'Klamotten-Shop', icon: 'shirt' },
  ] },
  { group: 'Vorstand', role: 'vorstand', items: [
    { id: 'cockpit', label: 'Cockpit', icon: 'grid' },
    { id: 'mitglieder', label: 'Mitglieder-Management', icon: 'users' },
    { id: 'gruppen', label: 'Gruppen', icon: 'star' },
    { id: 'roles', label: 'Ämter & Rechte', icon: 'key' },
    { id: 'veranstaltungen', label: 'Veranstaltungen', icon: 'star' },
    { id: 'fees', label: 'Beiträge & Kasse', icon: 'euro' },
    { id: 'getraenke', label: 'Getränkekasse', icon: 'beer' },
    { id: 'shop_manage', label: 'Shop-Verwaltung', icon: 'shirt' },
    { id: 'statistik', label: 'Statistik', icon: 'chart' },
    { id: 'einstellungen', label: 'Einstellungen', icon: 'settings' },
  ] },
];

// ── top brand strip (the masthead echo) ────────────────────────────────────
function TopStrip() {
  return (
    <div style={{ background: T.ink, color: T.cream, height: 30, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', fontSize: 10.5, fontWeight: 800, letterSpacing: 2 }}>
      <span>MITGLIEDERBEREICH · GROSSBESENSTADT</span>
      <span style={{ color: 'rgba(251,244,230,0.6)' }}>SESSION 2026 · 11.11.2026 · Nº 128</span>
    </div>
  );
}

// ── sidebar ─────────────────────────────────────────────────────────────────
function NavItem({ item, active, onNav }) {
  const live = item.id === 'live';
  return (
    <div onClick={() => onNav(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', background: active ? T.red : 'transparent', color: active ? '#fff' : T.sideText, fontWeight: active ? 800 : 600, fontSize: 14, position: 'relative', transition: 'background .12s' }}>
      <Ic name={item.icon} size={19} color={active ? '#fff' : (live ? T.red : 'rgba(251,244,230,0.66)')} sw={active ? 2.1 : 1.85} />
      <span style={{ flex: 1 }}>{item.label}</span>
      {live && <span className="fcc-live" style={{ width: 7, height: 7, borderRadius: 5, background: T.red }} />}
      {item.badge && <span style={{ background: active ? 'rgba(255,255,255,0.25)' : T.red, color: '#fff', fontSize: 10.5, fontWeight: 800, padding: '1px 7px', borderRadius: 10 }}>{item.badge}</span>}
    </div>
  );
}

function Sidebar({ active, role, onNav, onRole, user }) {
  const groups = NAVCONFIG.filter((g) => !g.role || g.role === role);
  return (
    <aside style={{ width: 256, flexShrink: 0, background: T.sideBg, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.sideLine}` }}>
      {/* brand lockup */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '18px 18px 14px' }}>
        <window.KKBroom size={30} color={T.red} band={T.cream} />
        <div style={{ lineHeight: 0.92 }}>
          <div style={{ fontFamily: T.display, fontSize: 23, letterSpacing: 1, color: T.cream }}>FURRIA</div>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 2, color: T.sideDim, marginTop: 2 }}>CLUB-APP</div>
        </div>
      </div>
      {/* LIVE quick access */}
      <div style={{ padding: '0 14px 6px' }}>
        <NavItem item={{ id: 'live', label: 'Live-Regie', icon: 'broadcast', badge: 'LIVE' }} active={active === 'live'} onNav={onNav} />
      </div>
      {/* groups */}
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', padding: '6px 14px 10px' }}>
        {groups.map((g) => (
          <div key={g.group} style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.8, color: T.sideDim, padding: '0 12px 7px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 7 }}>
              {g.group}{g.role && <Ic name="key" size={12} color={T.gold} sw={2} />}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {g.items.map((it) => <NavItem key={it.id} item={it} active={active === it.id} onNav={onNav} />)}
            </div>
          </div>
        ))}
      </div>
      {/* role switch (demo) + user */}
      <div style={{ borderTop: `1px solid ${T.sideLine}`, padding: 14 }}>
        <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, color: T.sideDim, marginBottom: 7 }}>ANSICHT (DEMO)</div>
        <div style={{ display: 'flex', background: 'rgba(251,244,230,0.07)', borderRadius: 9, padding: 3, marginBottom: 13 }}>
          {[['mitglied', 'Mitglied'], ['vorstand', 'Vorstand']].map(([r, l]) => (
            <button key={r} onClick={() => onRole(r)} style={{ flex: 1, border: 'none', cursor: 'pointer', background: role === r ? T.cream : 'transparent', color: role === r ? T.ink : T.sideDim, fontFamily: T.font, fontWeight: 800, fontSize: 12, padding: '6px 0', borderRadius: 7 }}>{l}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <Avatar initials="A" tone="gold" size={38} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: T.cream }}>Anna Brunner</div>
            <div style={{ fontSize: 11.5, color: T.sideDim, fontWeight: 600 }}>{role === 'vorstand' ? 'Vorstand · Schriftführerin' : 'Tanzgarde'}</div>
          </div>
          <Ic name="logout" size={17} color={T.sideDim} />
        </div>
      </div>
    </aside>
  );
}

// ── topbar ──────────────────────────────────────────────────────────────────
function Topbar({ title, sub, action, onAction }) {
  return (
    <div style={{ height: 68, flexShrink: 0, background: T.panel, borderBottom: `1.5px solid ${T.line}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px' }}>
      <div>
        <Title size={24}>{title}</Title>
        {sub && <div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub, marginTop: 3 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 230, height: 38, borderRadius: 30, border: `1.5px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', color: T.faint, fontWeight: 600, fontSize: 13 }}><Ic name="search" size={16} color={T.faint} /> Suchen …</div>
        <div style={{ position: 'relative' }}><Ic name="bell" size={21} color={T.ink} /><span style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 5, background: T.red, border: `1.5px solid ${T.panel}` }} /></div>
        {action && <Btn primary icon="plus" onClick={onAction}>{action}</Btn>}
      </div>
    </div>
  );
}

// ── shell ─────────────────────────────────────────────────────────────────
function AppShell({ active, role, onNav, onRole, title, sub, action, onAction, height = '100vh', children }) {
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column', fontFamily: T.font, color: T.ink, background: T.bg, overflow: 'hidden' }}>
      <TopStrip />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar active={active} role={role} onNav={onNav} onRole={onRole} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Topbar title={title} sub={sub} action={action} onAction={onAction} />
          <main className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', background: T.bg }}>{children}</main>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { T, Ic, Card, Chip, Btn, Avatar, Eyebrow, Title, Progress, NAVCONFIG, AppShell });
