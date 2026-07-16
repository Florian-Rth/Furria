// fcc-theme.jsx — Konfetti Kinetik theme (light + dark) + shared helpers.
// SOURCE OF TRUTH: the FCC brand layer. Bold editorial poster DNA: Anton display + Archivo. Exports to window.

const KK = {
  light: { bg: '#FBF4E6', ink: '#1A1411', red: '#E11D2A', redDk: '#B3101C', gold: '#F4B400', sub: 'rgba(26,20,17,0.62)', paper: '#FFFFFF', shadow: '#1A1411', line: 'rgba(26,20,17,0.14)', onRed: '#FFFFFF' },
  dark:  { bg: '#15110E', ink: '#FBF4E6', red: '#FF3B47', redDk: '#E11D2A', gold: '#FFC42E', sub: 'rgba(251,244,230,0.6)', paper: '#221B16', shadow: '#000000', line: 'rgba(251,244,230,0.16)', onRed: '#FFFFFF' },
};

function KKBroom({ size = 34, color, band }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" aria-hidden="true">
      <g transform="translate(30 33)">
        <window.FCCBroom s={0.92} rot={-122} wood={color} bristle={color} band={band} handleLen={44} />
        <window.FCCBroom s={0.92} rot={122} wood={color} bristle={color} band={band} handleLen={44} />
      </g>
    </svg>
  );
}

function KKPlh({ h, label, c, tint, radius = 0, style }) {
  const t = tint || c.red;
  return (
    <div style={{ height: h, width: '100%', borderRadius: radius, background: `repeating-linear-gradient(135deg, ${t}26, ${t}26 11px, ${t}10 11px, ${t}10 22px), ${c.paper}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', ...style }}>
      <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11, letterSpacing: 0.5, color: t, background: c.bg + 'cc', padding: '4px 9px', borderRadius: 5 }}>{label}</span>
    </div>
  );
}

// scattered confetti chips (deterministic)
function KKConfetti({ c, n = 12, seed = 1 }) {
  const rng = (k) => ((Math.sin(seed * 53.3 + k * 12.9) + 1) / 2);
  const cols = [c.red, c.gold, c.ink];
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const x = rng(i) * 100, y = rng(i + 40) * 100, r = rng(i + 9) * 360, sz = 9 + rng(i + 3) * 9;
        return <div key={i} className="fcc-floaty" style={{ position: 'absolute', left: x + '%', top: y + '%', width: sz, height: i % 2 ? sz : sz * 0.5, background: cols[i % 3], transform: `rotate(${r}deg)`, borderRadius: i % 3 === 0 ? sz : 2, animationDelay: `${(i % 6) * 0.5}s`, pointerEvents: 'none' }} />;
      })}
    </>
  );
}

// diagonal scrolling marquee
function KKTicker({ c, fs = 22, rot = -1.4, bg, fg }) {
  const B = bg || c.red, F = fg || c.onRed;
  const item = (k) => (
    <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, fontFamily: "'Anton', sans-serif", fontSize: fs, letterSpacing: 1.5, color: F, paddingRight: 20 }}>
      GROSS FURRIA <span style={{ color: c.gold }}>✶</span> GROSSBESENSTADT <span style={{ color: c.gold }}>✶</span> SESSION 2026 <span style={{ color: c.gold }}>✶</span>
    </span>
  );
  return (
    <div style={{ background: B, padding: `${fs * 0.5}px 0`, overflow: 'hidden', transform: `rotate(${rot}deg) scale(1.04)`, borderTop: `2px solid ${c.ink}`, borderBottom: `2px solid ${c.ink}` }}>
      <div className="fcc-mq" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>
        {[0, 1, 2, 3].map(item)}{[4, 5, 6, 7].map(item)}
      </div>
    </div>
  );
}

// circular "11.11" eröffnung seal
function KKSeal({ c, size = 168, rot = -8 }) {
  return (
    <div style={{ width: size, height: size, transform: `rotate(${rot}deg)`, position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ position: 'absolute', inset: 0 }}>
        <circle cx="60" cy="60" r="57" fill={c.gold} stroke={c.ink} strokeWidth="3" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={c.ink} strokeWidth="1" strokeDasharray="2 3" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: c.ink }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: size * 0.34, lineHeight: 0.8 }}>11.11</div>
        <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: size * 0.08, letterSpacing: 2, marginTop: size * 0.02 }}>ERÖFFNUNG</div>
      </div>
    </div>
  );
}

function KKBtn({ c, children, primary, fs = 17, onLight }) {
  if (primary) return (
    <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: fs, padding: `${fs}px ${fs * 1.9}px`, borderRadius: 50, cursor: 'pointer', boxShadow: `4px 4px 0 ${c.shadow === '#000000' ? c.gold : c.shadow}` }}>{children}</button>
  );
  return (
    <button style={{ border: `2.5px solid ${c.ink}`, background: 'transparent', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: fs - 1, padding: `${fs - 2}px ${fs * 1.6}px`, borderRadius: 50, cursor: 'pointer' }}>{children}</button>
  );
}

// desktop top nav
function KKNav({ c }) {
  const link = (t) => <a key={t} style={{ color: c.ink, fontWeight: 700, fontSize: 15, textDecoration: 'none', cursor: 'pointer' }}>{t}</a>;
  return (
    <div style={{ height: 76, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 48px', borderBottom: `2px solid ${c.ink}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <KKBroom size={34} color={c.red} band={c.ink} />
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 25, letterSpacing: 1, color: c.ink }}>FURRIA</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        {['Verein', 'Programm', 'Galerie', 'Kontakt'].map(link)}
        <button style={{ border: `2px solid ${c.ink}`, background: 'transparent', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: '8px 16px', borderRadius: 40, cursor: 'pointer' }}>Login</button>
        <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: '10px 20px', borderRadius: 40, cursor: 'pointer' }}>Tickets</button>
      </div>
    </div>
  );
}

// mobile top bar (inside PhoneFrame)
function KKMobBar({ c }) {
  return (
    <div style={{ height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <KKBroom size={26} color={c.red} band={c.ink} />
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 19, letterSpacing: 0.5, color: c.ink }}>FURRIA</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {[0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 2.4, background: c.ink, borderRadius: 2 }} />)}
      </div>
    </div>
  );
}

// compact event row used in mobile + strips
function KKEventCard({ c, d, m, t, s, tint, compact }) {
  return (
    <div style={{ background: c.paper, border: `2px solid ${c.ink}`, borderRadius: 16, padding: compact ? '12px 14px' : '16px 18px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: `4px 4px 0 ${c.shadow === '#000000' ? c.red : c.shadow}` }}>
      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 46 }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: compact ? 30 : 36, lineHeight: 0.9, color: tint === c.gold ? c.ink : tint }}>{d}</div>
        <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 1, color: c.sub }}>{m}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: compact ? 16 : 18, letterSpacing: -0.2, color: c.ink }}>{t}</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: c.sub, marginTop: 2 }}>{s}</div>
      </div>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: tint, flexShrink: 0 }} />
    </div>
  );
}

// program card with photo (used by Original)
function KKProgramCard({ c, d, m, t, s, tint }) {
  return (
    <div style={{ background: c.paper, border: `2px solid ${c.ink}`, borderRadius: 18, overflow: 'hidden', boxShadow: `5px 5px 0 ${c.shadow === '#000000' ? c.red : c.shadow}` }}>
      <window.KKPlh h={150} label="event-foto" c={c} tint={tint} />
      <div style={{ padding: '18px 20px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 0.9, color: tint === c.gold ? c.ink : tint }}>{d}</div>
          <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 1, color: c.sub }}>{m}</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: -0.2, color: c.ink }}>{t}</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: c.sub, marginTop: 3 }}>{s}</div>
        </div>
      </div>
    </div>
  );
}

// masthead stripe — "Nr.128 ——— FURRIA ——— SESSION 2026"
function KKMasthead({ c, fs = 104, color, flankColor }) {
  const col = color || c.ink;
  const fl = flankColor || (color ? color : c.sub);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
      <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: fl, whiteSpace: 'nowrap' }}>Nr. 128</span>
      <div style={{ flex: 1, height: 3, background: col }} />
      <span style={{ fontFamily: "'Anton', sans-serif", fontSize: fs, letterSpacing: 4, lineHeight: 0.8, color: col }}>FURRIA</span>
      <div style={{ flex: 1, height: 3, background: col }} />
      <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: fl, whiteSpace: 'nowrap' }}>SESSION 2026</span>
    </div>
  );
}

// shared dark footer (works on light & dark pages)
function KKFooter({ c }) {
  const fg = '#FBF4E6';
  const col = (h, items) => (
    <div>
      <div style={{ fontWeight: 900, fontSize: 13, letterSpacing: 1.5, color: c.gold, marginBottom: 14 }}>{h}</div>
      {items.map((t) => <div key={t} style={{ fontWeight: 600, fontSize: 15, color: 'rgba(251,244,230,0.72)', marginBottom: 10, cursor: 'pointer' }}>{t}</div>)}
    </div>
  );
  return (
    <div style={{ background: '#1A1411', color: fg, padding: '46px 56px 26px', fontFamily: 'Archivo, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 48, flexWrap: 'wrap' }}>
        <div style={{ maxWidth: 320 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <window.KKBroom size={34} color={fg} band="#1A1411" />
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, letterSpacing: 1 }}>FURRIA</span>
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.6, color: 'rgba(251,244,230,0.7)', fontWeight: 600, marginTop: 14 }}>Furrscher Carnevals Club e.V. · Die Großbesenstadt feiert seit 1971. Groß Furria!</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            {['f', 'I', '▶'].map((s) => <div key={s} style={{ width: 38, height: 38, borderRadius: 19, border: `2px solid ${fg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, cursor: 'pointer' }}>{s}</div>)}
          </div>
        </div>
        {col('VEREIN', ['Über uns', 'Vorstand', 'Geschichte', 'Kontakt'])}
        {col('EVENTS', ['Prunksitzung', 'Kinderfasching', 'Umzug', 'Tickets'])}
        {col('MITMACHEN', ['Tanzgarde', 'Männerballett', 'Elferrat', 'Mitglied werden'])}
      </div>
      <div style={{ borderTop: '1.5px solid rgba(251,244,230,0.18)', marginTop: 34, paddingTop: 20, display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, color: 'rgba(251,244,230,0.55)' }}>
        <span>© 2026 Furrscher Carnevals Club</span>
        <span>Impressum · Datenschutz</span>
      </div>
    </div>
  );
}

// masthead app bar (the header IS the nav) — newspaper style, NO bottom divider.
// inverted = white-on-red color block.
function KKMastheadBar({ c, inverted }) {
  const fg = inverted ? '#fff' : c.ink;
  const sub = inverted ? 'rgba(255,255,255,0.72)' : c.sub;
  const accent = inverted ? c.gold : c.red;
  const dlBorder = inverted ? 'rgba(255,255,255,0.3)' : c.line;
  const link = (t) => <a key={t} style={{ color: fg, fontWeight: 700, fontSize: 14.5, textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}>{t}</a>;
  const flank = (t) => <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: sub, whiteSpace: 'nowrap' }}>{t}</span>;
  return (
    <header style={{ background: inverted ? c.red : 'transparent', color: fg }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 56px', fontSize: 11, fontWeight: 800, letterSpacing: 2, color: sub, borderBottom: `1px solid ${dlBorder}` }}>
        <span>GROSSBESENSTADT · EST. 1971</span>
        <span style={{ color: inverted ? '#fff' : accent, letterSpacing: 3 }}>★ DIE FÜNFTE JAHRESZEIT ★</span>
        <span>11.11.2026 · 19:11 UHR</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22, padding: '15px 56px 17px' }}>
        <nav style={{ display: 'flex', gap: 22, flexShrink: 0 }}>{['Verein', 'Programm', 'Galerie'].map(link)}</nav>
        <div style={{ flex: 1, height: 2, background: fg, opacity: 0.85 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          {flank('Nº 128')}
          <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 54, letterSpacing: 2, lineHeight: 0.8, color: fg }}>FURRIA</span>
          {flank('SESSION 2026')}
        </div>
        <div style={{ flex: 1, height: 2, background: fg, opacity: 0.85 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <a style={{ color: fg, fontWeight: 800, fontSize: 14, textDecoration: 'none', cursor: 'pointer' }}>Login</a>
          <button style={{ border: 'none', background: inverted ? '#fff' : c.red, color: inverted ? c.red : c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: '10px 20px', borderRadius: 40, cursor: 'pointer' }}>Tickets</button>
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { KK, KKBroom, KKPlh, KKConfetti, KKTicker, KKSeal, KKBtn, KKNav, KKMobBar, KKEventCard, KKProgramCard, KKMasthead, KKMastheadBar, KKFooter });
