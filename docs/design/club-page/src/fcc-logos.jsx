// fcc-logos.jsx — FCC / Furria coat-of-arms recreated as crisp vector art.
// Three versions: faithful Wappen badge, modernized emblem, app-icon set.
// Exports to window: FCCBroom, LogoBadge, LogoModern, LogoAppIcon.

// ── shared palette ──────────────────────────────────────────
const FCC = {
  red:     '#C8102E',
  redDark: '#9C0B22',
  roof:    '#D9402E',
  gold:    '#E2A72C',
  goldDk:  '#B47E16',
  wood:    '#83531F',
  ink:     '#241C17',
  cream:   '#FBF5EA',
  paper:   '#FFFFFF',
};

// ── the broom glyph (vertical: handle up, bristles down, origin at the band) ──
function FCCBroom({ x = 0, y = 0, s = 1, rot = 0, wood = FCC.wood, bristle = FCC.gold, band = FCC.ink, handleLen = 78 }) {
  // bristle texture lines fanning out
  const lines = [];
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const topX = -8 + 16 * t;
    const botX = -21 + 42 * t;
    lines.push(<line key={i} x1={topX} y1="7" x2={botX} y2="47" stroke={band} strokeOpacity="0.28" strokeWidth="1.1" />);
  }
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x="-2.6" y={-handleLen} width="5.2" height={handleLen} rx="2.6" fill={wood} />
      <circle cx="0" cy={-handleLen} r="4.1" fill={wood} />
      <rect x="-2.6" y={-handleLen} width="5.2" height={handleLen} rx="2.6" fill="#fff" fillOpacity="0.12" />
      {/* bristle fan */}
      <path d="M-8.5,6 L-21,48 Q0,53 21,48 L8.5,6 Z" fill={bristle} />
      <path d="M-8.5,6 L-21,48 Q0,53 21,48 L8.5,6 Z" fill="#fff" fillOpacity="0.06" />
      {lines}
      {/* binding band */}
      <rect x="-9.5" y="-5" width="19" height="12" rx="3" fill={band} />
      <rect x="-9.5" y="-5" width="19" height="4" rx="2" fill="#fff" fillOpacity="0.18" />
    </g>
  );
}

// ── a compact geometric village skyline (rooftops + central tower) ──
function Skyline({ roof = FCC.roof, wall = FCC.cream, line = FCC.ink, w = 180 }) {
  return (
    <g>
      {/* left house */}
      <g>
        <rect x="6" y="34" width="34" height="34" fill={wall} stroke={line} strokeWidth="1.4" />
        <path d="M3,35 L23,18 L43,35 Z" fill={roof} stroke={line} strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="14" y="46" width="8" height="10" fill={line} opacity="0.55" />
        <rect x="26" y="46" width="8" height="10" fill={line} opacity="0.2" />
      </g>
      {/* central tower */}
      <g>
        <rect x="70" y="20" width="40" height="48" fill={wall} stroke={line} strokeWidth="1.5" />
        <path d="M66,21 L90,-4 L114,21 Z" fill={roof} stroke={line} strokeWidth="1.5" strokeLinejoin="round" />
        <line x1="90" y1="-4" x2="90" y2="-16" stroke={line} strokeWidth="1.4" />
        <path d="M90,-15 L101,-12 L90,-9 Z" fill={FCC.red} />
        <rect x="83" y="30" width="14" height="20" rx="7" fill={line} opacity="0.5" />
        <circle cx="90" cy="26" r="2.4" fill={line} opacity="0.5" />
      </g>
      {/* right house */}
      <g>
        <rect x="138" y="38" width="32" height="30" fill={wall} stroke={line} strokeWidth="1.4" />
        <path d="M135,39 L154,24 L173,39 Z" fill={roof} stroke={line} strokeWidth="1.4" strokeLinejoin="round" />
        <rect x="148" y="48" width="8" height="10" fill={line} opacity="0.4" />
      </g>
    </g>
  );
}

// ── a notched heraldic banner with centered text ──
function Banner({ y = 0, w = 300, h = 40, text = '', fill = FCC.red, color = '#fff', fs = 19 }) {
  const x = -w / 2, notch = 16;
  return (
    <g transform={`translate(0 ${y})`}>
      <path d={`M${x},2 H${x + w} L${x + w - notch},${h / 2} L${x + w},${h - 2} H${x} L${x + notch},${h / 2} Z`} fill={fill} />
      <path d={`M${x},2 H${x + w} L${x + w - notch},${h / 2}`} fill="none" stroke="#fff" strokeOpacity="0.25" strokeWidth="1.5" />
      <text x="0" y={h / 2} textAnchor="middle" dominantBaseline="central"
        fontFamily="'Oswald', sans-serif" fontWeight="600" fontSize={fs} letterSpacing="1.5" fill={color}>{text}</text>
    </g>
  );
}

// ════════════════════════════════════════════════════════════
// VERSION 1 — Faithful Wappen badge
// ════════════════════════════════════════════════════════════
function LogoBadge({ size = 320 }) {
  const shield = 'M30,20 H270 Q278,20 278,30 V150 C278,232 200,278 150,300 C100,278 22,232 22,150 V30 Q22,20 30,20 Z';
  return (
    <svg width={size} height={size * (340 / 300)} viewBox="0 0 300 340" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg-field" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor={FCC.cream} />
        </linearGradient>
      </defs>
      {/* shield */}
      <path d={shield} fill="url(#bg-field)" stroke={FCC.red} strokeWidth="12" strokeLinejoin="round" />
      <path d={shield} fill="none" stroke={FCC.redDark} strokeWidth="1.5" strokeLinejoin="round" opacity="0.4" transform="scale(1.0)" />
      {/* top banner */}
      <g transform="translate(150 0)">
        <Banner y={34} w={236} h={36} text="GROSSBESENSTADT" fs={17} />
      </g>
      {/* crossed brooms behind the scene */}
      <g transform="translate(150 150)">
        <FCCBroom x={0} y={-2} s={1.18} rot={-118} />
        <FCCBroom x={0} y={-2} s={1.18} rot={118} />
      </g>
      {/* skyline */}
      <g transform="translate(60 96)">
        <Skyline />
      </g>
      {/* ground sweep */}
      <path d="M40,176 Q150,150 260,176 L260,196 Q150,170 40,196 Z" fill={FCC.red} opacity="0.92" />
      {/* gold cartouche */}
      <g transform="translate(150 214)">
        <ellipse cx="0" cy="0" rx="62" ry="40" fill={FCC.gold} stroke={FCC.ink} strokeWidth="3.5" />
        <ellipse cx="0" cy="0" rx="62" ry="40" fill="none" stroke="#fff" strokeOpacity="0.3" strokeWidth="1.4" transform="scale(0.92)" />
        <text x="0" y="2" textAnchor="middle" dominantBaseline="central"
          fontFamily="'Oswald', sans-serif" fontWeight="700" fontSize="34" letterSpacing="1" fill={FCC.ink}
          transform="skewX(-6)">FURRIA</text>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// VERSION 2 — Modernized emblem (simplified, 2-tone, generous space)
// ════════════════════════════════════════════════════════════
function LogoModern({ size = 320 }) {
  const shield = 'M40,28 H260 Q268,28 268,38 V150 C268,224 196,266 150,286 C104,266 32,224 32,150 V38 Q32,28 40,28 Z';
  return (
    <svg width={size} height={size * (320 / 300)} viewBox="0 0 300 320" xmlns="http://www.w3.org/2000/svg">
      <path d={shield} fill={FCC.red} />
      <path d={shield} fill="none" stroke="#fff" strokeOpacity="0.85" strokeWidth="3" transform="scale(0.955)" transform-origin="150 150" style={{ transformBox: 'fill-box', transformOrigin: 'center' }} />
      {/* crossed brooms, white on red — the ownable mark */}
      <g transform="translate(150 132)">
        <FCCBroom s={1.62} rot={-122} wood="#fff" bristle="#fff" band={FCC.redDark} handleLen={72} />
        <FCCBroom s={1.62} rot={122} wood="#fff" bristle="#fff" band={FCC.redDark} handleLen={72} />
      </g>
      {/* wordmark plate */}
      <g transform="translate(150 232)">
        <rect x="-66" y="-21" width="132" height="42" rx="21" fill="#fff" />
        <text x="0" y="1" textAnchor="middle" dominantBaseline="central"
          fontFamily="'Oswald', sans-serif" fontWeight="700" fontSize="30" letterSpacing="2" fill={FCC.red}>FURRIA</text>
      </g>
    </svg>
  );
}

// ════════════════════════════════════════════════════════════
// VERSION 3 — App-icon set (squircle tile, shown at sizes + mono)
// ════════════════════════════════════════════════════════════
function AppTile({ size = 120, mono = false, label }) {
  const id = 'tile' + Math.round(size) + (mono ? 'm' : '');
  const r = size * 0.225;
  const bg = mono ? FCC.ink : FCC.red;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg"
        style={{ borderRadius: r, boxShadow: '0 8px 22px rgba(40,20,10,0.18)', display: 'block' }}>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={mono ? '#33271f' : '#D81834'} />
            <stop offset="1" stopColor={bg} />
          </linearGradient>
        </defs>
        <rect width="300" height="300" fill={`url(#${id})`} />
        <g transform="translate(150 150)">
          <FCCBroom s={2.05} rot={-122} wood="#fff" bristle="#fff" band={mono ? '#33271f' : FCC.redDark} handleLen={66} />
          <FCCBroom s={2.05} rot={122} wood="#fff" bristle="#fff" band={mono ? '#33271f' : FCC.redDark} handleLen={66} />
        </g>
      </svg>
      {label && <span style={{ fontSize: 11, color: 'rgba(60,50,40,0.55)', fontFamily: "'Oswald', sans-serif", letterSpacing: 0.5 }}>{label}</span>}
    </div>
  );
}

function LogoAppIcon() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30, padding: '8px 4px' }}>
      <AppTile size={132} label="180 px" />
      <AppTile size={84} label="120 px" />
      <AppTile size={56} label="76 px" />
      <AppTile size={84} mono label="mono" />
    </div>
  );
}

Object.assign(window, { FCC, FCCBroom, Skyline, Banner, LogoBadge, LogoModern, LogoAppIcon });
