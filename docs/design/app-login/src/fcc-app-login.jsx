// fcc-app-login.jsx — Start & login screen of the Club-App (entrypoint).
// Three directions: A Stage (dark) · B Membership card (paper) · C Poster (red).
// Uses window.T (tokens), KK brand components, PhoneFrame/StatusBar/HomeIndicator.

const LT = window.T;
const LK = window.KK.light;
const SESSION = 'SESSION 2026/27';
const MOTTO = '»FURRA HEBT AB«';
const DAYS = 141;

// ── kleine Bausteine ────────────────────────────────────────────────────
function BroomMark({ size = 54, wood = '#F4B400', bristle = '#E11D2A', band = '#FBF4E6' }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="-32 -92 64 148" aria-hidden="true">
      <window.FCCBroom wood={wood} bristle={bristle} band={band} handleLen={78} />
    </svg>
  );
}

function LField({ label, value, dark, mono, focus }) {
  const bd = dark ? 'rgba(251,244,230,0.22)' : LT.line;
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, textTransform: 'uppercase', color: dark ? 'rgba(251,244,230,0.55)' : LT.sub, marginBottom: 7 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: dark ? 'rgba(251,244,230,0.06)' : '#fff', border: `1.5px solid ${focus ? LT.red : bd}`, boxShadow: focus ? `0 0 0 3px rgba(225,29,42,0.14)` : 'none', borderRadius: 12, padding: '13px 15px' }}>
        <span style={{ fontFamily: mono ? 'ui-monospace, monospace' : LT.font, fontWeight: 700, fontSize: 15.5, letterSpacing: mono ? 3 : 0, color: dark ? '#FBF4E6' : LT.ink }}>{value}</span>
      </div>
    </label>
  );
}

function BigBtn({ children, tone = 'red', dark, onClick, hard }) {
  const bg = tone === 'red' ? LT.red : tone === 'ghost' ? 'transparent' : LT.ink;
  const col = tone === 'ghost' ? (dark ? '#FBF4E6' : LT.ink) : '#fff';
  const bd = tone === 'ghost' ? (dark ? 'rgba(251,244,230,0.28)' : LT.line) : 'transparent';
  return (
    <button onClick={onClick} style={{ width: '100%', border: `1.5px solid ${bd}`, background: bg, color: col, fontFamily: LT.font, fontWeight: 900, fontSize: 16.5, letterSpacing: 0.2, padding: '16px 20px', borderRadius: 40, cursor: 'pointer', boxShadow: hard ? `4px 4px 0 ${LT.ink}` : 'none' }}>{children}</button>
  );
}

function CodeBoxes({ chars = ['F', 'C', 'C', '', '', ''], dark }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 8 }}>
      {chars.map((ch, i) => (
        <div key={i} style={{ height: 56, borderRadius: 12, border: `1.5px solid ${ch ? LT.red : (dark ? 'rgba(251,244,230,0.22)' : LT.line)}`, background: dark ? 'rgba(251,244,230,0.06)' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: LT.display, fontSize: 26, color: dark ? '#FBF4E6' : LT.ink }}>{ch || <span style={{ width: 12, height: 2, background: dark ? 'rgba(251,244,230,0.25)' : LT.line }} />}</div>
      ))}
    </div>
  );
}

function Countdown({ dark }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: LT.gold, color: LT.ink, padding: '7px 14px 7px 8px', borderRadius: 30 }}>
      <span style={{ fontFamily: LT.display, fontSize: 20, lineHeight: 1, background: LT.ink, color: LT.gold, padding: '6px 9px 4px', borderRadius: 20 }}>{DAYS}</span>
      <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.2 }}>TAGE BIS ZUR 1. PRUNKSITZUNG</span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// A — "Stage": dark curtain, masthead typography, sheet sliding up from below
// ══════════════════════════════════════════════════════════════════════
function LoginStageBody({ state, setState }) {
  const s = state;
  return (
    <div style={{ flex: 1, position: 'relative', background: '#15110E', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Stage light */}
      <div style={{ position: 'absolute', top: -180, left: '50%', transform: 'translateX(-50%)', width: 640, height: 560, background: 'radial-gradient(closest-side, rgba(244,180,0,0.20), rgba(244,180,0,0))', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', padding: '4px 22px 0', display: 'flex', justifyContent: 'space-between', color: 'rgba(251,244,230,0.5)', fontWeight: 900, fontSize: 10, letterSpacing: 2 }}>
        <span>Nº 128</span><span>{SESSION}</span>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, padding: '0 24px' }}>
        <div style={{ fontFamily: LT.display, fontSize: 84, lineHeight: 0.82, color: '#FBF4E6', letterSpacing: 1 }}>FURRIA</div>
        <div style={{ height: 5, width: 128, background: LT.red }} />
        <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 2.6, color: 'rgba(251,244,230,0.62)', textAlign: 'center' }}>FURRSCHER CARNEVALS CLUB e.V.</div>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2.4, color: 'rgba(251,244,230,0.4)' }}>SESSION-MOTTO</div>
          <div style={{ fontFamily: LT.display, fontSize: 23, color: LT.gold, letterSpacing: 0.6, marginTop: 6 }}>{MOTTO}</div>
        </div>
      </div>
      {/* Sheet */}
      <div style={{ position: 'relative', background: LT.cream, borderRadius: '26px 26px 0 0', padding: '26px 24px 40px', display: 'flex', flexDirection: 'column', gap: 12, marginTop: -6 }}>
        {s === 'start' && <>
          <div style={{ fontFamily: LT.display, fontSize: 26, color: LT.ink, lineHeight: 1 }}>SCHÖN, DASS DU DA BIST.</div>
          <div style={{ fontSize: 13.5, color: LT.sub, fontWeight: 600, marginBottom: 6 }}>Der Mitgliederbereich des FCC — Termine, Auftritte, Bierliste, Beitrag.</div>
          <BigBtn onClick={() => setState('form')}>Anmelden</BigBtn>
          <BigBtn tone="ghost" onClick={() => setState('code')}>Einladungs-Code einlösen</BigBtn>
        </>}
        {s === 'form' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: LT.display, fontSize: 26, color: LT.ink, lineHeight: 1 }}>ANMELDEN</div>
            <span onClick={() => setState('start')} style={{ fontWeight: 800, fontSize: 12.5, color: LT.sub, cursor: 'pointer' }}>Zurück</span>
          </div>
          <LField label="Benutzername oder E-Mail" value="m.schulz" />
          <LField label="Passwort" value="••••••••••" focus />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12.5, fontWeight: 700, color: LT.sub, margin: '2px 0 4px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 34, height: 20, borderRadius: 12, background: LT.green, position: 'relative' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: 10, background: '#fff' }} /></span>Angemeldet bleiben</span>
            <span style={{ color: LT.red, cursor: 'pointer' }}>Passwort vergessen?</span>
          </div>
          <BigBtn onClick={() => setState('start')}>Los geht's</BigBtn>
        </>}
        {s === 'code' && <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontFamily: LT.display, fontSize: 26, color: LT.ink, lineHeight: 1 }}>EINLADUNG EINLÖSEN</div>
            <span onClick={() => setState('start')} style={{ fontWeight: 800, fontSize: 12.5, color: LT.sub, cursor: 'pointer' }}>Zurück</span>
          </div>
          <div style={{ fontSize: 13, color: LT.sub, fontWeight: 600 }}>Den Code bekommst du vom Geschäftsführer — per Link oder auf Papier.</div>
          <CodeBoxes />
          <BigBtn onClick={() => setState('start')}>Code prüfen</BigBtn>
        </>}
      </div>
    </div>
  );
}

function LoginStage({ start = 'start' }) {
  const [s, setS] = React.useState(start);
  return (
    <window.PhoneFrame screenBg="#15110E">
      <window.StatusBar color="#FBF4E6" time="19:11" />
      <LoginStageBody state={s} setState={setS} />
      <window.HomeIndicator color="rgba(251,244,230,0.5)" />
    </window.PhoneFrame>
  );
}

// ══════════════════════════════════════════════════════════════════════
// B — "Membership card": the login is your card
// ══════════════════════════════════════════════════════════════════════
function LoginCardBody({ state, setState }) {
  return (
    <div style={{ flex: 1, position: 'relative', background: `repeating-linear-gradient(135deg, rgba(26,20,17,0.035) 0 2px, transparent 2px 13px), ${LT.cream}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '2px 22px 0', display: 'flex', justifyContent: 'space-between', color: LT.faint, fontWeight: 900, fontSize: 10, letterSpacing: 2 }}>
        <span>GROSSBESENSTADT</span><span>{SESSION}</span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ position: 'relative', transform: 'rotate(-1.4deg)' }}>
          {/* Karte */}
          <div style={{ background: '#fff', border: `2px solid ${LT.ink}`, borderRadius: 18, boxShadow: `9px 9px 0 ${LT.ink}`, overflow: 'hidden' }}>
            <div style={{ background: LT.red, color: '#fff', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: LT.display, fontSize: 16, letterSpacing: 1.4 }}>MITGLIEDSAUSWEIS</span>
              <span style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.6, color: 'rgba(255,255,255,0.8)' }}>Nº 128</span>
            </div>
            <div style={{ padding: '18px 18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 14 }}>
                <BroomMark size={34} wood="#83531F" bristle={LT.gold} band={LT.ink} />
                <div>
                  <div style={{ fontFamily: LT.display, fontSize: 46, lineHeight: 0.8, color: LT.ink }}>FURRIA</div>
                  <div style={{ fontWeight: 800, fontSize: 9.5, letterSpacing: 1.8, color: LT.sub, marginTop: 5 }}>FURRSCHER CARNEVALS CLUB e.V.</div>
                </div>
              </div>
              <div style={{ height: 1.5, background: LT.line, margin: '0 0 16px' }} />
              {state === 'code' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: LT.sub }}>EINLADUNGS-CODE</div>
                  <CodeBoxes />
                  <BigBtn onClick={() => setState('form')}>Code prüfen</BigBtn>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
                  <LField label="Mitglied" value="m.schulz" />
                  <LField label="Passwort" value="••••••••••" focus />
                  <BigBtn onClick={() => setState('form')}>Ausweis vorzeigen</BigBtn>
                </div>
              )}
            </div>
            <div style={{ borderTop: `1.5px dashed ${LT.line}`, padding: '9px 16px', display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 10, letterSpacing: 1.4, color: LT.faint }}>
              <span>SEIT 1963</span><span style={{ color: LT.red }}>HELAU</span><span>GROSSFURRA</span>
            </div>
          </div>
          {/* Siegel */}
          <div style={{ position: 'absolute', right: -14, bottom: -26 }}><window.KKSeal c={LK} size={104} rot={-12} /></div>
        </div>
        <div style={{ marginTop: 40, textAlign: 'center' }}><Countdown /></div>
      </div>
      <div style={{ padding: '0 24px 34px', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
        <span onClick={() => setState(state === 'code' ? 'form' : 'code')} style={{ fontWeight: 800, fontSize: 13, color: LT.ink, borderBottom: `2px solid ${LT.red}`, cursor: 'pointer', paddingBottom: 2 }}>{state === 'code' ? 'Ich habe schon einen Zugang' : 'Einladungs-Code einlösen'}</span>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: LT.faint, textAlign: 'center' }}>Noch kein Zugang? Der Geschäftsführer lädt dich ein.</span>
      </div>
    </div>
  );
}

function LoginCard({ start = 'form' }) {
  const [s, setS] = React.useState(start);
  return (
    <window.PhoneFrame screenBg={LT.cream}>
      <window.StatusBar color={LT.ink} time="19:11" />
      <LoginCardBody state={s} setState={setS} />
      <window.HomeIndicator />
    </window.PhoneFrame>
  );
}

// ══════════════════════════════════════════════════════════════════════
// C — "poster": knallrot, Typo bis an den Rand
// ══════════════════════════════════════════════════════════════════════
function LoginPosterBody({ state, setState }) {
  return (
    <div style={{ flex: 1, position: 'relative', background: LT.red, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}><window.KKConfetti c={{ red: '#fff', gold: LT.gold, ink: LT.ink }} n={12} seed={3} /></div>
      <div style={{ position: 'relative', padding: '2px 22px 0', display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.72)', fontWeight: 900, fontSize: 10, letterSpacing: 2 }}>
        <span>Nº 128</span><span>{SESSION}</span>
      </div>
      <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 20px' }}>
        <div style={{ fontFamily: LT.display, fontSize: 118, lineHeight: 0.76, color: '#fff', letterSpacing: -1 }}>FUR<br />RIA</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
          <div style={{ height: 4, flex: 1, background: LT.gold }} />
          <span style={{ fontWeight: 900, fontSize: 11, letterSpacing: 2.4, color: '#fff' }}>MITGLIEDERBEREICH</span>
        </div>
        <div style={{ marginTop: 22, transform: 'rotate(-2.5deg)' }}><window.KKTicker c={LK} fs={14} rot={0} bg={LT.ink} fg={LT.cream} /></div>
      </div>
      {/* Papierblock */}
      <div style={{ position: 'relative', background: LT.cream, margin: '0 14px 16px', borderRadius: 18, border: `2px solid ${LT.ink}`, boxShadow: `6px 6px 0 ${LT.ink}`, padding: '20px 18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {state === 'code' ? <>
          <div style={{ fontFamily: LT.display, fontSize: 22, color: LT.ink, lineHeight: 1 }}>EINLADUNGS-CODE</div>
          <CodeBoxes />
          <BigBtn onClick={() => setState('form')}>Code prüfen</BigBtn>
        </> : <>
          <LField label="Mitglied" value="m.schulz" />
          <LField label="Passwort" value="••••••••••" focus />
          <BigBtn onClick={() => setState('form')}>Rein in die Session</BigBtn>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800 }}>
            <span onClick={() => setState('code')} style={{ color: LT.ink, cursor: 'pointer' }}>Einladungs-Code</span>
            <span style={{ color: LT.red, cursor: 'pointer' }}>Passwort vergessen?</span>
          </div>
        </>}
      </div>
    </div>
  );
}

function LoginPoster({ start = 'form' }) {
  const [s, setS] = React.useState(start);
  return (
    <window.PhoneFrame screenBg={LT.red}>
      <window.StatusBar color="#fff" time="19:11" />
      <LoginPosterBody state={s} setState={setS} />
      <window.HomeIndicator color="rgba(255,255,255,0.7)" />
    </window.PhoneFrame>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Desktop-Login (Richtung A als geteilter Bildschirm)
// ══════════════════════════════════════════════════════════════════════
function LoginDesk() {
  const [s, setS] = React.useState('form');
  return (
    <div style={{ display: 'flex', height: '100%', fontFamily: LT.font, background: LT.cream }}>
      <div style={{ flex: '1 1 58%', position: 'relative', background: '#15110E', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ position: 'absolute', top: -260, left: '50%', transform: 'translateX(-50%)', width: 900, height: 780, background: 'radial-gradient(closest-side, rgba(244,180,0,0.18), rgba(244,180,0,0))' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}><window.KKConfetti c={window.KK.dark} n={12} seed={11} /></div>
        <div style={{ position: 'relative', padding: '18px 34px', display: 'flex', justifyContent: 'space-between', color: 'rgba(251,244,230,0.5)', fontWeight: 900, fontSize: 11, letterSpacing: 2.4 }}>
          <span>MITGLIEDERBEREICH · GROSSBESENSTADT</span><span>{SESSION} · Nº 128</span>
        </div>
        <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          <div style={{ fontFamily: LT.display, fontSize: 132, lineHeight: 0.82, color: '#FBF4E6', letterSpacing: 2 }}>FURRIA</div>
          <div style={{ height: 6, width: 200, background: LT.red }} />
          <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 3.2, color: 'rgba(251,244,230,0.6)' }}>FURRSCHER CARNEVALS CLUB e.V.</div>
          <div style={{ textAlign: 'center', marginTop: 6 }}>
            <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 2.6, color: 'rgba(251,244,230,0.4)' }}>SESSION-MOTTO</div>
            <div style={{ fontFamily: LT.display, fontSize: 30, color: LT.gold, letterSpacing: 0.8, marginTop: 6 }}>{MOTTO}</div>
          </div>
        </div>
      </div>
      <div style={{ flex: '0 0 460px', padding: '0 52px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14, background: LT.cream }}>
        <div style={{ fontFamily: LT.display, fontSize: 34, color: LT.ink, lineHeight: 1 }}>{s === 'code' ? 'EINLADUNG EINLÖSEN' : 'ANMELDEN'}</div>
        <div style={{ fontSize: 14, color: LT.sub, fontWeight: 600, marginBottom: 10 }}>{s === 'code' ? 'Den Code bekommst du vom Geschäftsführer — per Link oder auf Papier.' : 'Termine, Auftritte, Bierliste, Beitrag — alles an einem Ort.'}</div>
        {s === 'code' ? <>
          <CodeBoxes />
          <BigBtn onClick={() => setS('form')}>Code prüfen</BigBtn>
          <span onClick={() => setS('form')} style={{ fontWeight: 800, fontSize: 13, color: LT.ink, cursor: 'pointer' }}>Ich habe schon einen Zugang</span>
        </> : <>
          <LField label="Benutzername oder E-Mail" value="m.schulz" />
          <LField label="Passwort" value="••••••••••" focus />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, fontWeight: 700, color: LT.sub, margin: '2px 0 6px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><span style={{ width: 34, height: 20, borderRadius: 12, background: LT.green, position: 'relative' }}><span style={{ position: 'absolute', top: 2, right: 2, width: 16, height: 16, borderRadius: 10, background: '#fff' }} /></span>Angemeldet bleiben</span>
            <span style={{ color: LT.red, cursor: 'pointer' }}>Passwort vergessen?</span>
          </div>
          <BigBtn>Los geht's</BigBtn>
          <BigBtn tone="ghost" onClick={() => setS('code')}>Einladungs-Code einlösen</BigBtn>
        </>}
        <div style={{ marginTop: 18, fontSize: 12, fontWeight: 600, color: LT.faint }}>Kein Zugang? Der Geschäftsführer lädt dich ein — per Link oder gedrucktem Code.</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Splash — a short brand moment: the broom flies in, confetti bursts,
// the wordmark settles, then it hands over to the (calm) login.
// phase 0 leer · 1 Besen · 2 Konfetti + FURRIA · 3 Motto/Ruhe
// ══════════════════════════════════════════════════════════════════════
const BURST = Array.from({ length: 22 }).map((_, i) => {
  const a = (i / 22) * Math.PI * 2 + (i % 3) * 0.35;
  const d = 110 + ((i * 37) % 130);
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d * 0.9 - 40, r: (i * 57) % 360, w: 7 + (i % 4) * 4, h: i % 2 ? 7 + (i % 3) * 3 : 14, c: [LT.red, LT.gold, '#FBF4E6'][i % 3], round: i % 4 === 0 };
});

function SplashScene({ p }) {
  const on = (n) => p >= n;
  const ease = 'cubic-bezier(.2,.8,.25,1)';
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#15110E', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 700, height: 620, background: 'radial-gradient(closest-side, rgba(244,180,0,0.22), rgba(244,180,0,0))', opacity: on(1) ? 1 : 0, transition: `opacity 700ms ${ease}` }} />
      {/* Confetti explosion from the center */}
      <div style={{ position: 'absolute', left: '50%', top: '44%' }}>
        {BURST.map((b, i) => (
          <div key={i} style={{ position: 'absolute', width: b.w, height: b.h, background: b.c, borderRadius: b.round ? b.w : 1.5, opacity: on(2) ? (on(3) ? 0 : 1) : 0, transform: on(2) ? `translate(${b.dx}px, ${b.dy + (on(3) ? 90 : 0)}px) rotate(${b.r + (on(3) ? 160 : 0)}deg)` : 'translate(0,0) rotate(0deg) scale(.4)', transition: `transform ${on(3) ? 900 : 780}ms ${ease} ${(i % 5) * 22}ms, opacity ${on(3) ? 700 : 260}ms linear ${(i % 5) * 22}ms` }} />
        ))}
      </div>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ overflow: 'hidden', height: 76, display: 'flex' }}>
          {'FURRIA'.split('').map((ch, i) => (
            <span key={i} style={{ fontFamily: LT.display, fontSize: 82, lineHeight: 0.9, color: '#FBF4E6', letterSpacing: 1, display: 'inline-block', transform: on(1) ? 'translateY(0)' : 'translateY(90px)', transition: `transform 520ms ${ease} ${i * 45}ms` }}>{ch}</span>
          ))}
        </div>
        <div style={{ height: 5, background: LT.red, width: on(1) ? 128 : 0, transition: `width 520ms ${ease} 320ms` }} />
        <div style={{ textAlign: 'center', opacity: on(3) ? 1 : 0, transform: on(3) ? 'translateY(0)' : 'translateY(10px)', transition: `all 480ms ${ease}` }}>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2.4, color: 'rgba(251,244,230,0.4)' }}>SESSION-MOTTO</div>
          <div style={{ fontFamily: LT.display, fontSize: 23, color: LT.gold, letterSpacing: 0.6, marginTop: 6 }}>{MOTTO}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 34, textAlign: 'center', fontWeight: 900, fontSize: 10, letterSpacing: 2.4, color: 'rgba(251,244,230,0.35)', opacity: on(1) ? 1 : 0, transition: 'opacity 500ms' }}>FURRSCHER CARNEVALS CLUB e.V. · Nº 128</div>
    </div>
  );
}

// Still frame of a splash moment (for the artboards)
function LoginSplash({ phase = 3 }) {
  return (
    <window.PhoneFrame screenBg="#15110E">
      <div style={{ position: 'relative', zIndex: 55 }}><window.StatusBar color="#FBF4E6" time="19:11" /></div>
      <SplashScene p={phase} />
      <window.HomeIndicator color="rgba(251,244,230,0.5)" />
    </window.PhoneFrame>
  );
}

// Der echte Ablauf: Splash → Login. Klick startet neu.
function LoginEntry() {
  const [p, setP] = React.useState(0);
  const [run, setRun] = React.useState(0);
  const [s, setS] = React.useState('start');
  React.useEffect(() => {
    setP(0); setS('start');
    const t = [setTimeout(() => setP(1), 120), setTimeout(() => setP(2), 780), setTimeout(() => setP(3), 1700), setTimeout(() => setP(4), 2700)];
    return () => t.forEach(clearTimeout);
  }, [run]);
  return (
    <window.PhoneFrame screenBg="#15110E">
      <div style={{ position: 'relative', zIndex: 55 }}><window.StatusBar color="#FBF4E6" time="19:11" /></div>
      <LoginStageBody state={s} setState={setS} />
      <div style={{ position: 'absolute', inset: '50px 0 0', opacity: p >= 4 ? 0 : 1, pointerEvents: p >= 4 ? 'none' : 'auto', transition: 'opacity 620ms cubic-bezier(.2,.8,.25,1)', zIndex: 40 }}>
        <SplashScene p={p} />
      </div>
      <div onClick={() => setRun(run + 1)} title="Nochmal abspielen" style={{ position: 'absolute', left: 14, bottom: 26, zIndex: 60, background: 'rgba(26,20,17,0.55)', color: '#FBF4E6', fontWeight: 800, fontSize: 10.5, letterSpacing: 1.2, padding: '6px 11px', borderRadius: 20, cursor: 'pointer', border: '1px solid rgba(251,244,230,0.25)' }}>▶ NOCHMAL</div>
      <window.HomeIndicator color={p >= 4 ? 'rgba(26,20,17,0.7)' : 'rgba(251,244,230,0.5)'} />
    </window.PhoneFrame>
  );
}

Object.assign(window, { LoginStage, LoginCard, LoginPoster, LoginDesk, LoginSplash, LoginEntry, BroomMark: BroomMark });
