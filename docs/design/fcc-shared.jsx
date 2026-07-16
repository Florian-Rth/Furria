// fcc-shared.jsx — phone frame, status bar, icon set, bottom nav.
// Reused by all three design directions. Exports to window.

// ── icon set (simple stroke icons; fill variants where noted) ──────────
function Icon({ name, size = 24, color = 'currentColor', sw = 1.8, fill = 'none', style }) {
  const p = { fill: 'none', stroke: color, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const paths = {
    home: <><path d="M3 10.5 12 3l9 7.5" {...p} /><path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" {...p} /></>,
    calendar: <><rect x="3" y="4.5" width="18" height="16" rx="2.5" {...p} /><path d="M3 9h18M8 2.5v4M16 2.5v4" {...p} /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2.5" {...p} /><circle cx="8.5" cy="9.5" r="1.8" {...p} /><path d="M21 16l-5-4.5L5 20" {...p} /></>,
    activity: <><path d="M4 12h3l2.5-6 5 13 2.5-7H21" {...p} /></>,
    dumbbell: <><path d="M6.5 6.5l11 11M4 9l-1.5 1.5a1.5 1.5 0 0 0 0 2.1l.4.4M9 4l-1.5 1.5M20 15l1.5-1.5a1.5 1.5 0 0 0 0-2.1l-.4-.4M15 20l1.5-1.5" {...p} /></>,
    user: <><circle cx="12" cy="8" r="3.8" {...p} /><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" {...p} /></>,
    bell: <><path d="M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7Z" {...p} /><path d="M10.5 20a1.7 1.7 0 0 0 3 0" {...p} /></>,
    ticket: <><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h15A1.5 1.5 0 0 1 21 8.5v1a2 2 0 0 0 0 4v1a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 14.5v-1a2 2 0 0 0 0-4Z" {...p} /><path d="M14 7v10" {...p} strokeDasharray="2 2.5" /></>,
    seat: <><path d="M6 11V6.5A2.5 2.5 0 0 1 8.5 4h7A2.5 2.5 0 0 1 18 6.5V11" {...p} /><path d="M5 11h14a1.5 1.5 0 0 1 1.5 1.5V17H3.5v-4.5A1.5 1.5 0 0 1 5 11Z" {...p} /><path d="M6 17v3M18 17v3" {...p} /></>,
    plus: <><path d="M12 5v14M5 12h14" {...p} /></>,
    heart: <><path d="M12 20s-7-4.4-7-9.4A3.6 3.6 0 0 1 12 7a3.6 3.6 0 0 1 7-1.4c0 5-7 9.4-7 9.4Z" {...p} fill={fill} /></>,
    play: <><path d="M7 5l11 7-11 7Z" {...p} fill={fill} /></>,
    chevron: <><path d="M9 5l7 7-7 7" {...p} /></>,
    pin: <><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" {...p} /><circle cx="12" cy="10" r="2.6" {...p} /></>,
    clock: <><circle cx="12" cy="12" r="8.5" {...p} /><path d="M12 7.5V12l3 2" {...p} /></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6" {...p} /></>,
    confetti: <><path d="M4 20l5-13 8 8-13 5Z" {...p} /><path d="M14 4l.5 1.5M19 7l1.5-.5M17 11l1.5.8M20 13l-1.4.4" {...p} /></>,
    star: <><path d="M12 4l2.3 5 5.5.5-4.1 3.7 1.2 5.4L12 16.8 7.1 18.6l1.2-5.4L4.2 9.5 9.7 9Z" {...p} fill={fill} /></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">{paths[name]}</svg>
  );
}

// ── iOS-style status bar ───────────────────────────────────────────────
function StatusBar({ color = '#1a1a1a', time = '20:11' }) {
  return (
    <div style={{ height: 50, padding: '0 28px 0 30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color, flexShrink: 0 }}>
      <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: 0.3, fontFamily: '-apple-system, system-ui, sans-serif' }}>{time}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill={color}><rect x="0" y="7" width="3" height="5" rx="1" /><rect x="5" y="4.5" width="3" height="7.5" rx="1" /><rect x="10" y="2" width="3" height="10" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={color}><path d="M8.5 2.5c2.3 0 4.4.9 6 2.3l-1.4 1.5A6.6 6.6 0 0 0 8.5 4.5 6.6 6.6 0 0 0 3.9 6.3L2.5 4.8A8.6 8.6 0 0 1 8.5 2.5Z" /><path d="M8.5 6.6c1.2 0 2.3.5 3.1 1.2L8.5 11 5.4 7.8a4.6 4.6 0 0 1 3.1-1.2Z" /></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="21" height="12" rx="3.2" stroke={color} strokeOpacity="0.5" /><rect x="2.2" y="2.2" width="16" height="8.6" rx="1.8" fill={color} /><rect x="23" y="4" width="2" height="5" rx="1" fill={color} fillOpacity="0.5" /></svg>
      </div>
    </div>
  );
}

// ── phone frame: black bezel, dynamic island, home indicator ───────────
function PhoneFrame({ children, screenBg = '#fff', islandHint }) {
  return (
    <div style={{ width: 400, height: 858, background: '#0b0b0d', borderRadius: 56, padding: 9, boxShadow: 'inset 0 0 2px 1px rgba(255,255,255,0.18)', position: 'relative' }}>
      <div style={{ width: '100%', height: '100%', background: screenBg, borderRadius: 48, overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {/* dynamic island */}
        <div style={{ position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)', width: 116, height: 33, background: '#0b0b0d', borderRadius: 18, zIndex: 50 }} />
        {children}
      </div>
    </div>
  );
}

// ── home indicator bar ──────────────────────────────────────────────────
function HomeIndicator({ color = 'rgba(20,20,20,0.85)' }) {
  return <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 3, background: color, zIndex: 60 }} />;
}

// ── MUI-style bottom navigation generator ───────────────────────────────
// items: [{icon,label}], variant: 'plain' | 'pill' | 'fab'
function BottomNav({ items, active = 0, bg = '#fff', activeColor = '#C8102E', inactiveColor = 'rgba(20,20,20,0.45)', variant = 'plain', topBorder = '1px solid rgba(0,0,0,0.07)', fab }) {
  return (
    <div style={{ flexShrink: 0, background: bg, borderTop: topBorder, paddingBottom: 22, paddingTop: 9, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', padding: '0 8px' }}>
        {items.map((it, i) => {
          const on = i === active;
          const col = on ? activeColor : inactiveColor;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1, position: 'relative' }}>
              {variant === 'pill' && (
                <div style={{ position: 'absolute', top: -3, width: 56, height: 32, borderRadius: 16, background: on ? activeColor + '1f' : 'transparent', transition: 'background .2s' }} />
              )}
              <div style={{ position: 'relative' }}>
                <Icon name={it.icon} size={25} color={col} sw={on ? 2.1 : 1.8} fill={on && it.fillActive ? col : 'none'} />
              </div>
              <span style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, color: col, letterSpacing: 0.1 }}>{it.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Icon, StatusBar, PhoneFrame, HomeIndicator, BottomNav });
