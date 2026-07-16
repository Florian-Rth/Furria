// fcc-ds-landing.jsx — public landing page. NOW THE "DESTILLAT" WINNER of the
// modernization: same newspaper components (masthead-nav, asymmetric editorial hero,
// tilted photo + 11.11 seal, ticker, program cards, Mitmachen recruit band, footer)
// but the CALM modern treatment chosen over the loud poster original:
//   · soft elevation (hairline borders + soft ambient shadows, no hard offset blocks)
//   · pill buttons with a soft shadow · flat red/gold ticker (no skew)
//   · subtle photo tilt with a thin ink keyline · one restrained confetti cluster
//   · a whisper of poster head-shadow on FURRIA! · brand-true cream/red/gold
// Fonts stay Anton + Archivo. Works in light & dark (driven by KK[mode]).
// Exports BestV({ mode, device }) + MemberBestV.

// soft, mode-aware elevation tokens (replace the original hard offset shadows)
function softTokens(c) {
  const dark = c.shadow === '#000000';
  return {
    card: dark ? '0 10px 30px rgba(0,0,0,0.5)' : '0 6px 20px rgba(26,20,17,0.08)',
    cardHi: dark ? '0 20px 46px rgba(0,0,0,0.6)' : '0 20px 44px rgba(26,20,17,0.16)',
    photo: dark ? '0 26px 60px rgba(0,0,0,0.55)' : '0 22px 48px rgba(26,20,17,0.16)',
    btn: dark ? '0 6px 18px rgba(0,0,0,0.4)' : '0 4px 14px rgba(26,20,17,0.12)',
    hair: c.line,
  };
}

// ── calm primitives (local to the landing so the shared KK poster components stay loud for the pitch) ──
function LBtn({ c, children, primary, fs = 17 }) {
  const s = softTokens(c);
  if (primary) return (
    <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: fs, padding: `${fs - 1}px ${fs * 1.6}px`, borderRadius: 50, cursor: 'pointer', boxShadow: s.btn }}>{children}</button>
  );
  return (
    <button style={{ border: `2px solid ${c.line2 || 'rgba(26,20,17,0.2)'}`, background: 'transparent', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 700, fontSize: fs - 1, padding: `${fs - 2}px ${fs * 1.45}px`, borderRadius: 50, cursor: 'pointer' }}>{children}</button>
  );
}

// flat, un-skewed ticker (was KKTicker rot=-1.3 with ink keylines)
function LTicker({ c, fs = 20 }) {
  const item = (k) => (
    <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 20, fontFamily: "'Anton', sans-serif", fontSize: fs, letterSpacing: 1.5, color: c.onRed, paddingRight: 20 }}>
      GROSS FURRIA <span style={{ color: c.gold }}>✶</span> GROSSBESENSTADT <span style={{ color: c.gold }}>✶</span> SESSION 2026 <span style={{ color: c.gold }}>✶</span>
    </span>
  );
  return (
    <div style={{ background: c.red, padding: `${fs * 0.65}px 0`, overflow: 'hidden' }}>
      <div className="fcc-mq" style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}>{[0, 1, 2, 3].map(item)}{[4, 5, 6, 7].map(item)}</div>
    </div>
  );
}

// hairline program card with soft elevation (was 2px ink + 5px offset block)
function LProgramCard({ c, d, m, t, s, tint }) {
  const sh = softTokens(c);
  return (
    <div style={{ background: c.paper, border: `1px solid ${c.line}`, borderRadius: 18, overflow: 'hidden', boxShadow: sh.card }}>
      <window.KKPlh h={150} label="event-foto" c={c} tint={tint} />
      <div style={{ padding: '18px 20px 20px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 44 }}>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 34, lineHeight: 0.9, color: tint === c.gold ? c.ink : tint }}>{d}</div>
          <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, color: c.sub }}>{m}</div>
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 19, letterSpacing: -0.2, color: c.ink }}>{t}</div>
          <div style={{ fontSize: 14, fontWeight: 500, color: c.sub, marginTop: 3 }}>{s}</div>
        </div>
      </div>
    </div>
  );
}

// mobile event row (was 2px ink + 4px offset block)
function LEventCard({ c, d, m, t, s, tint, compact }) {
  const sh = softTokens(c);
  return (
    <div style={{ background: c.paper, border: `1px solid ${c.line}`, borderRadius: 16, padding: compact ? '13px 15px' : '16px 18px', display: 'flex', gap: 14, alignItems: 'center', boxShadow: sh.card }}>
      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 46 }}>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: compact ? 30 : 36, lineHeight: 0.9, color: tint === c.gold ? c.ink : tint }}>{d}</div>
        <div style={{ fontWeight: 800, fontSize: 12, letterSpacing: 1, color: c.sub }}>{m}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: compact ? 16 : 18, letterSpacing: -0.2, color: c.ink }}>{t}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: c.sub, marginTop: 2 }}>{s}</div>
      </div>
      <span style={{ width: 12, height: 12, borderRadius: 6, background: tint, flexShrink: 0 }} />
    </div>
  );
}

// ── decorative: confetti contained to a box (never over the reading column) ──
function BestConfetti({ c, n = 13, seed = 12 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <window.KKConfetti c={c} n={n} seed={seed} />
    </div>
  );
}

// ── the photo anchor: subtle tilt + thin ink keyline + soft shadow + "Seit 1971" tag + seal ──
function HeroPhoto({ c, h = 420 }) {
  const s = softTokens(c);
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ transform: 'rotate(-1.5deg)', border: `2px solid ${c.ink}`, borderRadius: 18, overflow: 'hidden', boxShadow: s.photo }}>
        <window.KKPlh h={h} label="garde-auf-der-bühne" c={c} tint={c.red} />
      </div>
      <div style={{ position: 'absolute', bottom: 18, left: 18, background: c.shadow === '#000000' ? 'rgba(34,27,22,0.82)' : 'rgba(255,255,255,0.92)', backdropFilter: 'blur(6px)', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13, letterSpacing: 0.5, padding: '9px 15px', borderRadius: 30, boxShadow: s.btn, transform: 'rotate(2deg)' }}>Seit 1971</div>
      <div className="fcc-floaty" style={{ position: 'absolute', top: -24, right: -22 }}>
        <window.KKSeal c={c} size={112} rot={-6} />
      </div>
    </div>
  );
}

// ── recruit band: red block, calm treatment (rounded, soft button, restrained confetti) ──
function MitmachenBand({ c }) {
  return (
    <div style={{ margin: '0 56px 56px', position: 'relative', background: c.red, borderRadius: 24, overflow: 'hidden', padding: '50px 54px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40 }}>
      <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.1 }}>
        <window.KKBroom size={300} color="#fff" band="#fff" />
      </div>
      <div style={{ position: 'relative', color: '#fff', maxWidth: 700 }}>
        <div style={{ fontWeight: 800, fontSize: 12.5, letterSpacing: 2, opacity: 0.85 }}>MITMACHEN · SAISON OFFEN</div>
        <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 56, lineHeight: 0.92, letterSpacing: 0.4, margin: '10px 0 0' }}>WERD TEIL DER GARDE</h2>
        <p style={{ fontSize: 17, fontWeight: 500, lineHeight: 1.55, margin: '13px 0 0', maxWidth: 540, color: 'rgba(255,255,255,0.92)' }}>
          Tanzgarde, Männerballett, Elferrat oder Spielmannszug — der FCC probt das ganze Jahr. Komm vorbei, schau rein, mach mit.
        </p>
      </div>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <button style={{ border: 'none', background: '#fff', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 17, padding: '16px 30px', borderRadius: 50, cursor: 'pointer', boxShadow: '0 12px 28px rgba(0,0,0,0.18)' }}>Mitglied werden →</button>
      </div>
    </div>
  );
}

// ── DESKTOP ────────────────────────────────────────────────────────────
function BestDesktop({ c }) {
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.KKMastheadBar c={c} />
      {/* hero — asymmetric editorial split */}
      <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1.06fr 0.94fr', gap: 60, alignItems: 'center', padding: '56px 56px 52px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '42%', transform: 'translate(-50%,-50%) rotate(-8deg)', opacity: c.shadow === '#000000' ? 0.08 : 0.05, pointerEvents: 'none', zIndex: 0 }}><window.KKBroom size={480} color={c.ink} band={c.ink} /></div>
        <BestConfetti c={c} n={13} seed={12} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: c.ink, color: c.bg, fontWeight: 800, fontSize: 12.5, letterSpacing: 1.6, padding: '8px 16px', borderRadius: 30, whiteSpace: 'nowrap' }}>★ SESSION 2026 · 11.11. ERÖFFNUNG</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 104, lineHeight: 0.9, letterSpacing: 0.2, margin: '20px 0 0' }}>
            <span style={{ color: c.ink }}>GROSS</span><br /><span style={{ color: c.red, textShadow: `3px 3px 0 ${c.ink}` }}>FURRIA!</span>
          </h1>
          <p style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.5, maxWidth: 490, color: c.sub, margin: '24px 0 0' }}>
            Der Furrscher Carnevals Club lädt die <b style={{ color: c.ink, fontWeight: 700 }}>Großbesenstadt</b> zur fünften Jahreszeit — gebunden mit Herz, seit Generationen.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 30 }}>
            <LBtn c={c} primary fs={17}>Tickets sichern →</LBtn>
            <LBtn c={c} fs={16}>Programm ansehen</LBtn>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 34, paddingTop: 24, borderTop: `1px solid ${c.line}` }}>
            {[['180+', 'Mitglieder'], ['12', 'Garden & Gruppen'], ['1971', 'gegründet']].map(([b, s], i) => (
              <div key={i}><div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 1, color: c.red }}>{b}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: c.sub, marginTop: 3 }}>{s}</div></div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <BestConfetti c={c} n={7} seed={5} />
          <div style={{ position: 'relative', padding: '20px 24px 24px 0' }}><HeroPhoto c={c} /></div>
        </div>
      </div>
      <LTicker c={c} fs={20} />
      {/* programm */}
      <div style={{ padding: '52px 56px 56px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 26 }}>
          <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 48, letterSpacing: 0.4, margin: 0, color: c.ink, whiteSpace: 'nowrap' }}>DAS PROGRAMM</h2>
          <span style={{ fontWeight: 700, fontSize: 14.5, color: c.red, cursor: 'pointer' }}>Alle Termine →</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22 }}>
          <LProgramCard c={c} d="14" m="FEB" t="Große Prunksitzung" s="Festhalle · 19:11 Uhr" tint={c.red} />
          <LProgramCard c={c} d="08" m="FEB" t="Kinderfasching" s="Sporthalle · 14:30 Uhr" tint={c.gold} />
          <LProgramCard c={c} d="16" m="FEB" t="Rosenmontagsumzug" s="Dorfplatz · 13:11 Uhr" tint={c.ink} />
        </div>
      </div>
      <MitmachenBand c={c} />
      <window.KKFooter c={c} />
    </div>
  );
}

// ── MOBILE ─────────────────────────────────────────────────────────────
function BestMobileBar({ c }) {
  return (
    <div style={{ flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 18px', fontSize: 9, fontWeight: 800, letterSpacing: 1.5, color: c.sub, borderBottom: `1px solid ${c.line}` }}>
        <span>GROSSBESENSTADT · EST. 1971</span>
        <span style={{ color: c.red }}>11.11.2026</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '9px 18px 11px' }}>
        <div style={{ justifySelf: 'start', display: 'flex', flexDirection: 'column', gap: 3, cursor: 'pointer' }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 2.4, background: c.ink, borderRadius: 2 }} />)}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{ width: 16, height: 1.5, background: c.ink, opacity: 0.5 }} />
          <div style={{ textAlign: 'center', lineHeight: 0.9 }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 27, letterSpacing: 1.5, color: c.ink }}>FURRIA</div>
            <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: 2, color: c.sub, marginTop: 2 }}>Nº 128 · SESSION 2026</div>
          </div>
          <div style={{ width: 16, height: 1.5, background: c.ink, opacity: 0.5 }} />
        </div>
        <button style={{ justifySelf: 'end', border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12, padding: '8px 14px', borderRadius: 40, cursor: 'pointer' }}>Tickets</button>
      </div>
    </div>
  );
}

// compact recruit band for mobile (calm: rounded, hairline, soft button)
function MitmachenMobile({ c }) {
  const s = softTokens(c);
  return (
    <div style={{ position: 'relative', background: c.red, overflow: 'hidden', margin: '22px 18px 0', borderRadius: 20, padding: '22px 20px 24px' }}>
      <div style={{ position: 'absolute', right: -20, bottom: -24, opacity: 0.12 }}><window.KKBroom size={150} color="#fff" band="#fff" /></div>
      <div style={{ position: 'relative', color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: 10.5, letterSpacing: 2, opacity: 0.9 }}>MITMACHEN · SAISON OFFEN</div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 33, lineHeight: 0.92, margin: '7px 0 0' }}>WERD TEIL<br />DER GARDE</div>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45, margin: '9px 0 15px', color: 'rgba(255,255,255,0.92)', maxWidth: 250 }}>Tanzgarde, Männerballett, Elferrat — komm vorbei und mach mit.</p>
        <button style={{ border: 'none', background: '#fff', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, padding: '13px 24px', borderRadius: 50, cursor: 'pointer', boxShadow: '0 10px 22px rgba(0,0,0,0.2)' }}>Mitglied werden →</button>
      </div>
    </div>
  );
}

// compact footer for mobile
function FooterMobile() {
  const fg = '#FBF4E6';
  return (
    <div style={{ background: '#1A1411', color: fg, padding: '26px 22px 30px', marginTop: 22, fontFamily: 'Archivo, sans-serif' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <window.KKBroom size={28} color={fg} band="#1A1411" />
        <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, letterSpacing: 1 }}>FURRIA</span>
      </div>
      <p style={{ fontSize: 13, lineHeight: 1.55, color: 'rgba(251,244,230,0.7)', fontWeight: 500, margin: '12px 0 0' }}>Furrscher Carnevals Club e.V. · Die Großbesenstadt feiert seit 1971. Groß Furria!</p>
      <div style={{ display: 'flex', gap: 9, marginTop: 16 }}>
        {['f', 'I', '▶'].map((s) => <div key={s} style={{ width: 34, height: 34, borderRadius: 17, border: `1.5px solid ${fg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>{s}</div>)}
      </div>
      <div style={{ borderTop: '1px solid rgba(251,244,230,0.18)', marginTop: 20, paddingTop: 16, fontSize: 11, fontWeight: 500, color: 'rgba(251,244,230,0.5)' }}>© 2026 FCC · Impressum · Datenschutz</div>
    </div>
  );
}

function BestMobile({ c }) {
  const s = softTokens(c);
  return (
    <window.PhoneFrame screenBg={c.bg}>
      <window.StatusBar color={c.ink} />
      <BestMobileBar c={c} />
      <div className="fcc-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'relative', padding: '18px 22px 4px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: c.ink, color: c.bg, fontWeight: 800, fontSize: 10.5, letterSpacing: 1.5, padding: '6px 13px', borderRadius: 30, whiteSpace: 'nowrap' }}>★ SESSION 2026 · 11.11. ERÖFFNUNG</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 62, lineHeight: 0.86, letterSpacing: 0.4, margin: '12px 0 0' }}>
            <span style={{ color: c.ink }}>GROSS</span><br /><span style={{ color: c.red, textShadow: `2px 2px 0 ${c.ink}` }}>FURRIA!</span>
          </h1>
          <p style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.45, color: c.sub, margin: '13px 0 0' }}>Die Großbesenstadt feiert die fünfte Jahreszeit — gebunden mit Herz, seit Generationen.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
            <LBtn c={c} primary fs={15}>Tickets sichern →</LBtn>
            <LBtn c={c} fs={14}>Programm</LBtn>
          </div>
        </div>
        <div style={{ position: 'relative', padding: '24px 30px 26px 22px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ transform: 'rotate(-1.5deg)', border: `2px solid ${c.ink}`, borderRadius: 16, overflow: 'hidden', boxShadow: s.photo }}>
              <window.KKPlh h={186} label="garde-auf-der-bühne" c={c} tint={c.red} />
            </div>
            <div className="fcc-floaty" style={{ position: 'absolute', top: -20, right: -14 }}><window.KKSeal c={c} size={88} rot={-6} /></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 14, margin: '0 22px', padding: '4px 0 18px' }}>
          {[['180+', 'Mitglieder'], ['12', 'Garden'], ['1971', 'gegründet']].map(([b, sl], i) => (
            <div key={i} style={{ flex: 1 }}><div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 1, color: c.red }}>{b}</div><div style={{ fontSize: 11, fontWeight: 600, color: c.sub, marginTop: 2 }}>{sl}</div></div>
          ))}
        </div>
        <LTicker c={c} fs={15} />
        <div style={{ padding: '20px 18px 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 24, letterSpacing: 0.5, color: c.ink }}>DAS PROGRAMM</div>
            <span style={{ fontWeight: 700, fontSize: 12.5, color: c.red }}>Alle Termine →</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <LEventCard c={c} d="14" m="FEB" t="Große Prunksitzung" s="Festhalle · 19:11" tint={c.red} compact />
            <LEventCard c={c} d="08" m="FEB" t="Kinderfasching" s="Sporthalle · 14:30" tint={c.gold} compact />
            <LEventCard c={c} d="16" m="FEB" t="Rosenmontagsumzug" s="Dorfplatz · 13:11" tint={c.ink} compact />
          </div>
        </div>
        <MitmachenMobile c={c} />
        <FooterMobile />
      </div>
      <window.HomeIndicator color={c.ink} />
    </window.PhoneFrame>
  );
}

function BestV({ mode = 'light', device = 'desktop' }) {
  const c = window.KK[mode];
  return device === 'mobile' ? <BestMobile c={c} /> : <BestDesktop c={c} />;
}

// member app: masthead-nav dashboard matches the landing's identity (reuse V7 shell+body)
function MemberBestV({ mode = 'light' }) { return window.MemberV7V({ mode }); }

Object.assign(window, { BestV, MemberBestV, MitmachenBand });
