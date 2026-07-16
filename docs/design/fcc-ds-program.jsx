// fcc-ds-program.jsx — Programm & Auto-Reihenfolge (inside /events · Programm task).
// The marquee "it thinks for us" feature: a manual draft has real problems
// (performers in back-to-back acts → no costume change; clustered categories);
// "Reihenfolge berechnen" optimises while RESPECTING locked acts + hints.
// Human-in-control: pins (fixed position) + hints (früh/spät/Finale) + weighted
// factors. Composes the system shell + tokens. Exports window.TaskProgram + MProgram.

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Progress } = window;
  const { useState, useEffect, useRef } = React;

  // ── categories ──────────────────────────────────────────────────────────────
  const CAT = {
    tanz: { label: 'Tanz', col: '#E11D2A' },
    buett: { label: 'Büttenrede', col: '#2F6DA8' },
    musik: { label: 'Gesang & Musik', col: '#C98A00' },
    show: { label: 'Show & Sketch', col: '#2E9E5B' },
    gast: { label: 'Gastauftritt', col: '#7A6E63' },
  };

  // ── acts ──────────────────────────────────────────────────────────────────
  const ACTS = {
    prinz: { name: 'Prinzengarde – Einmarsch', group: 'Prinzengarde', cat: 'tanz', dur: 8, perf: 14, lock: 'Eröffnung' },
    begr: { name: 'Begrüßung & Sessionsorden', group: 'Präsidium', cat: 'show', dur: 10, perf: 3, lock: 'Beitrag 2' },
    funken: { name: 'Funkengarde – Gardetanz', group: 'Funkengarde', cat: 'tanz', dur: 6, perf: 12 },
    klaere: { name: 'Büttenrede „Oma Kläre"', group: 'Käthe Brandt', cat: 'buett', dur: 7, perf: 1, hint: 'eher früh' },
    kinder: { name: 'Kindertanz – Dschungelbuch', group: 'Kindergarde', cat: 'tanz', dur: 5, perf: 16 },
    casino: { name: 'Showtanz Damen – „Casino"', group: 'Showtanz Damen', cat: 'tanz', dur: 6, perf: 14 },
    duo: { name: 'Gesangsduo – Stimmungsmedley', group: 'Uwe & Petra', cat: 'musik', dur: 8, perf: 2 },
    bebra: { name: 'Gastauftritt KCV Bebra', group: 'befreundeter Verein', cat: 'gast', dur: 12, perf: 0 },
    buerg: { name: 'Büttenrede „Der Bürgermeister"', group: 'Klaus Reinhardt', cat: 'buett', dur: 8, perf: 1 },
    sketch: { name: 'Sketch – „Beim Bauern"', group: 'Theatergruppe', cat: 'show', dur: 9, perf: 3 },
    bigband: { name: 'FURRIA Bigband', group: 'Bigband', cat: 'musik', dur: 10, perf: 11 },
    grosse: { name: 'Showtanz Große – „Königlich"', group: 'Showtanz Große', cat: 'tanz', dur: 6, perf: 10, hint: '2. Hälfte' },
    maenner: { name: 'Männerballett – „Schwanensee"', group: 'Männerballett', cat: 'tanz', dur: 7, perf: 9, lock: 'Finale' },
  };

  const DRAFT = ['prinz', 'begr', 'funken', 'casino', 'kinder', 'klaere', 'duo', 'PAUSE', 'grosse', 'bebra', 'sketch', 'bigband', 'buerg', 'maenner'];
  const OPT = ['prinz', 'begr', 'funken', 'klaere', 'sketch', 'duo', 'casino', 'PAUSE', 'kinder', 'buerg', 'bigband', 'grosse', 'bebra', 'maenner'];

  // per-state per-act conflict notes (the human-readable proof)
  const NOTES = {
    draft: {
      casino: ['bad', '4 Tänzerinnen tanzen auch in der Funkengarde (Beitrag 3) — direkt danach, keine Umziehzeit'],
      bigband: ['bad', 'Jan Köhler spielt — tanzt aber auch im Sketch (Beitrag 10) direkt davor'],
    },
    opt: {
      casino: ['good', '4 Tänzerinnen auch in der Funkengarde — jetzt 24 Min dazwischen'],
      bigband: ['good', 'Jan Köhler auch im Sketch — jetzt 28 Min Pause'],
      maenner: ['good', 'Tom, Jan & Bernd auch im Sketch — reichlich Umziehzeit'],
    },
  };

  const KPIS = {
    draft: [['Min. Umziehzeit', '0 Min', 'bad'], ['Konflikte', '2', 'bad'], ['Kategorie-Mix', 'gedrängt', 'warn'], ['Gesamtdauer', '2:45 h', 'neutral']],
    opt: [['Min. Umziehzeit', '24 Min', 'good'], ['Konflikte', '0', 'good'], ['Kategorie-Mix', 'ausgewogen', 'good'], ['Gesamtdauer', '2:45 h', 'neutral']],
  };

  const FACTORS = [
    ['Umziehzeit maximieren', 'Höchste Priorität', 4],
    ['Kategorien abwechseln', 'Hoch', 3],
    ['Höhepunkte verteilen', 'Mittel', 2],
    ['Vorgaben einhalten', 'Pflicht', 4],
  ];
  const VORGABEN = [
    ['pin', 'Prinzengarde', 'Eröffnung — fest'],
    ['pin', 'Begrüßung', 'Beitrag 2 — fest'],
    ['pin', 'Pause', 'nach Beitrag 7 — fest'],
    ['pin', 'Männerballett', 'Finale — fest'],
    ['up', 'Oma Kläre', 'eher früh'],
    ['down', 'Showtanz Große', '2. Hälfte'],
  ];

  const toneCol = (t) => (t === 'bad' ? T.red : t === 'good' ? T.green : t === 'warn' ? '#9a7200' : T.ink);

  function WarnIcon({ size = 14, color }) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 1.5 21h21L12 3Z" fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M12 9.5v5M12 17.6v.01" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    );
  }

  // ── KPI tile ────────────────────────────────────────────────────────────────
  function ProgStat({ label, value, tone }) {
    const col = toneCol(tone);
    return (
      <Card style={{ flex: 1, minWidth: 0 }} pad={15}>
        <div style={{ fontFamily: T.display, fontSize: 30, color: col, lineHeight: 1, whiteSpace: 'nowrap' }}>{value}</div>
        <div style={{ fontWeight: 800, fontSize: 12, color: T.sub, marginTop: 7 }}>{label}</div>
      </Card>
    );
  }

  // ── one act row in the running order ─────────────────────────────────────────
  function ActRow({ aid, pos, note, mobile, dim }) {
    const a = ACTS[aid];
    const c = CAT[a.cat];
    return (
      <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, background: T.panel, border: `1.5px solid ${note ? toneCol(note[0]) + '66' : T.line}`, borderRadius: 12, overflow: 'hidden', boxShadow: T.shadow, opacity: dim ? 0.55 : 1, transition: 'opacity .3s' }}>
        <div style={{ width: 6, background: c.col, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, padding: mobile ? '11px 13px' : '13px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div style={{ fontFamily: T.display, fontSize: mobile ? 22 : 26, color: T.ink, width: mobile ? 26 : 32, textAlign: 'center', flexShrink: 0, lineHeight: 1 }}>{pos}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: T.font, fontWeight: 800, fontSize: mobile ? 14 : 15.5, color: T.ink }}>{a.name}</span>
                {a.lock && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 10.5, color: T.sub, background: T.panel2, border: `1px solid ${T.line}`, padding: '2px 8px', borderRadius: 20 }}><Ic name="pin" size={11} color={T.sub} sw={2} />{a.lock}</span>}
                {a.hint && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 10.5, color: '#2F6DA8', border: `1px dashed #2F6DA8`, padding: '2px 8px', borderRadius: 20 }}>{a.hint}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 11, color: c.col }}><span style={{ width: 8, height: 8, borderRadius: 2, background: c.col }} />{c.label}</span>
                <span style={{ color: T.line }}>·</span>
                <span style={{ fontWeight: 600, fontSize: 12, color: T.sub, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.group}</span>
              </div>
            </div>
            {!mobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                {a.perf > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontWeight: 800, fontSize: 12.5, color: T.sub }}><Ic name="users" size={15} color={T.faint} sw={2} />{a.perf}</span>}
                <span style={{ fontWeight: 800, fontSize: 12.5, color: T.faint, width: 44, textAlign: 'right' }}>{a.dur} Min</span>
                <span style={{ cursor: 'grab', display: 'inline-flex', flexDirection: 'column', gap: 3 }}>
                  {[0, 1, 2].map((r) => <span key={r} style={{ display: 'flex', gap: 3 }}><i style={{ width: 3, height: 3, borderRadius: 2, background: T.faint }} /><i style={{ width: 3, height: 3, borderRadius: 2, background: T.faint }} /></span>)}
                </span>
              </div>
            )}
            {mobile && <span style={{ fontWeight: 800, fontSize: 11.5, color: T.faint, flexShrink: 0 }}>{a.dur}′</span>}
          </div>
          {note && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 9, padding: '8px 10px', borderRadius: 8, background: toneCol(note[0]) + '14' }}>
              <span style={{ flexShrink: 0, marginTop: 1 }}>{note[0] === 'good' ? <Ic name="check" size={14} color={toneCol(note[0])} sw={2.6} /> : <WarnIcon size={14} color={toneCol(note[0])} />}</span>
              <span style={{ fontWeight: 700, fontSize: 11.5, color: toneCol(note[0]), lineHeight: 1.4 }}>{note[1]}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  function PauseRow({ mobile }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: mobile ? '9px 14px' : '11px 18px', background: T.ink, color: T.cream, borderRadius: 12 }}>
        <Ic name="beer" size={mobile ? 17 : 19} color="#F4B400" sw={2} />
        <span style={{ fontFamily: T.display, fontSize: mobile ? 16 : 19, letterSpacing: 1 }}>PAUSE</span>
        <div style={{ flex: 1, height: 1, background: 'rgba(251,244,230,0.2)' }} />
        <span style={{ fontWeight: 800, fontSize: 12.5, color: 'rgba(251,244,230,0.7)' }}>15 Min · Getränke & Tombola</span>
      </div>
    );
  }

  // ── running order list (numbers skip the pause) ───────────────────────────────
  function OrderList({ order, state, mobile, animKey }) {
    let pos = 0;
    return (
      <div key={animKey} style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 9 : 10 }}>
        {order.map((aid, i) => {
          if (aid === 'PAUSE') return <PauseRow key={'p' + i} mobile={mobile} />;
          pos += 1;
          const note = (NOTES[state] || {})[aid];
          return (
            <div key={aid} style={{ animation: animKey ? `progIn .4s ease both ${i * 0.04}s` : 'none' }}>
              <ActRow aid={aid} pos={pos} note={note} mobile={mobile} />
            </div>
          );
        })}
      </div>
    );
  }

  // ── right rail: CTA + factors + vorgaben ──────────────────────────────────────
  function FactorBar({ w }) {
    return <span style={{ display: 'inline-flex', gap: 3 }}>{[1, 2, 3, 4].map((n) => <i key={n} style={{ width: 7, height: 7, borderRadius: 2, background: n <= w ? T.red : T.line }} />)}</span>;
  }
  function RightRail({ state, computing, onCompute, onReset }) {
    const isOpt = state === 'opt';
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card pad={18} style={{ background: isOpt ? 'rgba(46,158,91,0.06)' : T.panel, borderColor: isOpt ? 'rgba(46,158,91,0.4)' : T.line }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: 5, background: isOpt ? T.green : '#9a7200' }} />
            <span style={{ fontWeight: 800, fontSize: 13.5, color: T.ink }}>{isOpt ? 'Optimierte Reihenfolge' : 'Manueller Entwurf'}</span>
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, lineHeight: 1.45, marginBottom: 14 }}>
            {isOpt ? 'Berechnet · gerade eben. Gesperrte Beiträge blieben an ihrer Position.' : 'Beiträge in Anmelde-Reihenfolge. 2 Konflikte bei den Umziehzeiten.'}
          </div>
          <Btn primary icon="bolt" onClick={onCompute} style={{ width: '100%', justifyContent: 'center', opacity: computing ? 0.7 : 1 }}>
            {computing ? 'Berechne …' : isOpt ? 'Neu berechnen' : 'Reihenfolge berechnen'}
          </Btn>
          {isOpt && <div onClick={onReset} style={{ textAlign: 'center', fontWeight: 800, fontSize: 12.5, color: T.sub, cursor: 'pointer', marginTop: 11 }}>↺ Entwurf wieder ansehen</div>}
        </Card>

        <Card pad={18}>
          <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 0.5, color: T.ink, textTransform: 'uppercase', marginBottom: 13 }}>Stellschrauben</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FACTORS.map(([label, weight, w]) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: T.ink }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 11, color: T.sub, marginTop: 1 }}>{weight}</div>
                </div>
                <FactorBar w={w} />
              </div>
            ))}
          </div>
        </Card>

        <Card pad={18}>
          <div style={{ fontWeight: 900, fontSize: 12, letterSpacing: 0.5, color: T.ink, textTransform: 'uppercase', marginBottom: 13 }}>Vorgaben des Planers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {VORGABEN.map(([kind, who, what]) => (
              <div key={who} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: 7, background: kind === 'pin' ? 'rgba(225,29,42,0.1)' : T.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {kind === 'pin'
                    ? <Ic name="pin" size={13} color={T.red} sw={2.2} />
                    : <span style={{ display: 'inline-flex', transform: kind === 'up' ? 'rotate(-90deg)' : 'rotate(90deg)' }}><Ic name="chevron" size={13} color={T.sub} sw={2.6} /></span>}
                </span>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontWeight: 800, fontSize: 12.5, color: T.ink }}>{who}</span>
                  <span style={{ fontWeight: 600, fontSize: 12, color: T.sub }}> — {what}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  function BackBtn({ children, onClick }) {
    return (
      <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub, padding: 0 }}>
        <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span>{children}
      </button>
    );
  }

  // ── desktop task page ─────────────────────────────────────────────────────────
  function TaskProgram({ initial = 'draft', onBack }) {
    const [state, setState] = useState(initial);
    const [computing, setComputing] = useState(false);
    const [animKey, setAnimKey] = useState(0);
    const tmr = useRef(null);
    useEffect(() => () => clearTimeout(tmr.current), []);
    const order = state === 'opt' ? OPT : DRAFT;
    const kpis = KPIS[state];
    const compute = () => {
      setComputing(true);
      clearTimeout(tmr.current);
      tmr.current = setTimeout(() => { setComputing(false); setState('opt'); setAnimKey((k) => k + 1); }, 1100);
    };
    const reset = () => { setState('draft'); setAnimKey((k) => k + 1); };

    return (
      <div style={{ padding: 28, maxWidth: 1240, display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <BackBtn onClick={onBack}>Zurück zum Event</BackBtn>
          <span style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>Große Prunksitzung · 13 Beiträge</span>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <span style={{ width: 12, height: 12, background: T.red, flexShrink: 0 }} />
            <Title size={30}>Programm & Reihenfolge</Title>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.sub, marginTop: 6, maxWidth: 760 }}>Der Algorithmus baut die beste Reihenfolge — maximale Umziehzeit für Aktive in mehreren Gruppen, abwechslungsreiche Kategorien. Gesperrte Beiträge und Hinweise bleiben dabei erhalten.</div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>{kpis.map(([l, v, t]) => <ProgStat key={l} label={l} value={v} tone={t} />)}</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 22, alignItems: 'start' }}>
          <div style={{ position: 'relative' }}>
            <OrderList order={order} state={state} animKey={animKey} />
            {computing && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(251,244,230,0.78)', backdropFilter: 'blur(2px)', borderRadius: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, zIndex: 5 }}>
                <div style={{ display: 'flex', gap: 7 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 13, height: 13, borderRadius: 7, background: T.red, animation: `progBounce 1s ${i * 0.15}s infinite ease-in-out` }} />)}</div>
                <div style={{ fontFamily: T.display, fontSize: 22, color: T.ink }}>Berechne optimale Reihenfolge …</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: T.sub }}>prüft Doppel-Auftritte · Umziehzeiten · Kategorie-Mix</div>
              </div>
            )}
          </div>
          <RightRail state={state} computing={computing} onCompute={compute} onReset={reset} />
        </div>
        <style>{`@keyframes progIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@keyframes progBounce{0%,80%,100%{transform:scale(.5);opacity:.4}40%{transform:scale(1);opacity:1}}`}</style>
      </div>
    );
  }

  // ── mobile: read-only running order (members view the program) ────────────────
  function MProgram({ onBack }) {
    const [state, setState] = useState('opt');
    let pos = 0;
    const kpis = KPIS[state];
    return (
      <div style={{ padding: '14px 16px 26px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <BackBtn onClick={onBack}>Zurück</BackBtn>
        <div>
          <Title size={24}>Programm</Title>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.sub, marginTop: 4 }}>Große Prunksitzung · 13 Beiträge · 2:45 h</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
          {kpis.slice(0, 2).map(([l, v, t]) => <ProgStat key={l} label={l} value={v} tone={t} />)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {(state === 'opt' ? OPT : DRAFT).map((aid, i) => {
            if (aid === 'PAUSE') return <PauseRow key={'p' + i} mobile />;
            pos += 1;
            return <ActRow key={aid} aid={aid} pos={pos} note={(NOTES[state] || {})[aid]} mobile />;
          })}
        </div>
      </div>
    );
  }

  window.TaskProgram = TaskProgram;
  window.MProgram = MProgram;
})();
