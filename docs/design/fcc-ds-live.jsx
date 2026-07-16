// fcc-ds-live.jsx — Live-Regie (Part 4).
// Runs the running order built in /events LIVE during the event. Operator advances
// the program; the current act + queue update; performers get a push when their
// group is up next ("in ~X Min auf die Bühne"). Real-time bridge from plan → evening.
// Surfaces:
//  • PageLive (desktop, operator/Regie): JETZT auf der Bühne, Als-Nächstes-Queue,
//    advance control, live push feed + Backstage-Bereitschaft.
//  • MLive (mobile, performer): "macht euch bereit" countdown → "ihr seid dran".
//  • LockPush (mobile lock-screen push mock) for the canvas.
// Composes the system shell + tokens. Exports window.PageLive + window.MLive + window.LockPush.

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Eyebrow } = window;
  const { useState, useEffect, useRef } = React;

  const CAT = { tanz: '#E11D2A', buett: '#2F6DA8', musik: '#C98A00', show: '#2E9E5B', gast: '#7A6E63' };
  const CATL = { tanz: 'Tanz', buett: 'Büttenrede', musik: 'Gesang & Musik', show: 'Show & Sketch', gast: 'Gastauftritt' };

  // running order (matches the optimised program from Part 3). MINE = the performer's group.
  const MINE = 'Showtanz Große';
  const ORDER = [
    { id: 'prinz', n: 'Prinzengarde – Einmarsch', g: 'Prinzengarde', cat: 'tanz', dur: 8 },
    { id: 'begr', n: 'Begrüßung & Sessionsorden', g: 'Präsidium', cat: 'show', dur: 10 },
    { id: 'funken', n: 'Funkengarde – Gardetanz', g: 'Funkengarde', cat: 'tanz', dur: 6 },
    { id: 'klaere', n: 'Büttenrede „Oma Kläre"', g: 'Käthe Brandt', cat: 'buett', dur: 7 },
    { id: 'sketch', n: 'Sketch – „Beim Bauern"', g: 'Theatergruppe', cat: 'show', dur: 9 },
    { id: 'duo', n: 'Gesangsduo – Stimmungsmedley', g: 'Uwe & Petra', cat: 'musik', dur: 8 },
    { id: 'casino', n: 'Showtanz Damen – „Casino"', g: 'Showtanz Damen', cat: 'tanz', dur: 6 },
    { id: 'PAUSE', pause: true, dur: 15 },
    { id: 'kinder', n: 'Kindertanz – Dschungelbuch', g: 'Kindergarde', cat: 'tanz', dur: 5 },
    { id: 'buerg', n: 'Büttenrede „Der Bürgermeister"', g: 'Klaus Reinhardt', cat: 'buett', dur: 8 },
    { id: 'bigband', n: 'FURRIA Bigband', g: 'Bigband', cat: 'musik', dur: 10 },
    { id: 'grosse', n: 'Showtanz Große – „Königlich"', g: MINE, cat: 'tanz', dur: 6 },
    { id: 'bebra', n: 'Gastauftritt KCV Bebra', g: 'befreundeter Verein', cat: 'gast', dur: 12 },
    { id: 'maenner', n: 'Männerballett – „Schwanensee"', g: 'Männerballett', cat: 'tanz', dur: 7 },
  ];
  const START_MIN = 19 * 60 + 11; // 19:11 Einlass-Beginn
  const clock = (idx) => { let m = START_MIN; for (let i = 0; i < idx; i++) m += ORDER[i].dur; const h = Math.floor(m / 60) % 24, mm = m % 60; return `${h}:${String(mm).padStart(2, '0')}`; };
  const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── DESKTOP · operator cockpit ───────────────────────────────────────────────
  function PageLive() {
    const [cur, setCur] = useState(10); // FURRIA Bigband on stage; Showtanz Große next
    const [sec, setSec] = useState(198); // 3:18 into the act
    const [feed, setFeed] = useState([
      ['20:36', 'push', 'Push an Showtanz Große · 12 Aktive — „in ~7 Min auf die Bühne"'],
      ['20:33', 'play', 'FURRIA Bigband gestartet'],
      ['20:31', 'edit', 'Reihenfolge bestätigt — alle Aktiven aktualisiert'],
      ['20:18', 'play', 'Pause beendet'],
    ]);
    const tmr = useRef(null);
    useEffect(() => { tmr.current = setInterval(() => setSec((s) => s + 1), 1000); return () => clearInterval(tmr.current); }, []);

    const act = ORDER[cur];
    const upcoming = ORDER.slice(cur + 1).filter(() => true).slice(0, 4);
    const nextAct = ORDER[cur + 1];

    const advance = () => {
      if (cur >= ORDER.length - 1) return;
      const ni = cur + 1;
      setCur(ni); setSec(0);
      const now = clock(ni);
      const entries = [[now, 'play', `${ORDER[ni].pause ? 'Pause' : ORDER[ni].n} ${ORDER[ni].pause ? 'gestartet' : 'auf der Bühne'}`]];
      const after = ORDER[ni + 1];
      if (after && !after.pause) entries.unshift([now, 'push', `Push an ${after.g} — „gleich dran"`]);
      setFeed((f) => [...entries, ...f]);
    };

    const FeedIcon = ({ k }) => {
      const c = k === 'push' ? T.red : k === 'edit' ? T.blue : T.green;
      return <span style={{ width: 28, height: 28, borderRadius: 8, background: c + '1a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name={k === 'push' ? 'bell' : k === 'edit' ? 'settings' : 'broadcast'} size={15} color={c} sw={2} /></span>;
    };

    return (
      <div style={{ padding: 24, maxWidth: 1260, display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* status bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.red, color: '#fff', fontWeight: 900, fontSize: 12.5, letterSpacing: 1, padding: '6px 12px', borderRadius: 20 }}><span className="fcc-livedot" style={{ width: 8, height: 8, borderRadius: 5, background: '#fff' }} />LIVE</span>
          <Title size={20}>Große Prunksitzung</Title>
          <Chip tone="gold" dot>+6 Min zum Plan</Chip>
          <div style={{ flex: 1 }} />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, color: T.sub }}><Ic name="broadcast" size={16} color={T.green} sw={2} />138 Aktive sehen den Ablauf live</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.55fr) minmax(0,1fr)', gap: 20, alignItems: 'start' }}>
          {/* LEFT: stage + queue + controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* JETZT */}
            <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, padding: '22px 26px', boxShadow: `8px 8px 0 ${T.red}`, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -18, bottom: -26, opacity: 0.09 }}><window.KKBroom size={190} color="#fff" band="#fff" /></div>
              <div style={{ position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <Eyebrow style={{ color: 'rgba(251,244,230,0.6)' }}>Jetzt auf der Bühne</Eyebrow>
                  <span style={{ fontFamily: T.font, fontWeight: 800, fontSize: 11.5, color: '#F4B400' }}>Beitrag {cur + 1 - (cur > 7 ? 1 : 0)} von 13</span>
                </div>
                {act.pause ? (
                  <div style={{ fontFamily: T.display, fontSize: 46, lineHeight: 0.95 }}>PAUSE</div>
                ) : (
                  <>
                    <div style={{ fontFamily: T.display, fontSize: 40, letterSpacing: 0.5, lineHeight: 0.96 }}>{act.n}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 13.5 }}><span style={{ width: 9, height: 9, borderRadius: 2, background: CAT[act.cat] }} />{CATL[act.cat]}</span>
                      <span style={{ color: 'rgba(251,244,230,0.4)' }}>·</span>
                      <span style={{ fontWeight: 700, fontSize: 13.5, color: 'rgba(251,244,230,0.85)' }}>{act.g}</span>
                    </div>
                  </>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 18 }}>
                  <span style={{ fontFamily: T.display, fontSize: 30, color: '#fff' }}>{mmss(sec)}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'rgba(251,244,230,0.6)' }}>/ {act.dur}:00</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 6, background: 'rgba(251,244,230,0.18)', overflow: 'hidden' }}><div style={{ width: Math.min(100, sec / (act.dur * 60) * 100) + '%', height: '100%', background: sec > act.dur * 60 ? '#F4B400' : T.red, borderRadius: 6, transition: 'width 1s linear' }} /></div>
                </div>
              </div>
            </div>

            {/* controls */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <Btn primary icon="chevron" onClick={advance} style={{ fontSize: 16, padding: '14px 22px' }}>Nächster Beitrag</Btn>
              <Btn ghost icon="plus">Beitrag einschieben</Btn>
              <Btn ghost icon="settings">Reihenfolge ändern</Btn>
              <Btn ghost icon="beer">Pause einlegen</Btn>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 12.5, color: T.sub }}><Ic name="broadcast" size={15} color={T.green} sw={2} />Jede Änderung ist sofort bei allen Aktiven auf dem Handy.</div>

            {/* queue */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 11, height: 11, background: T.red, flexShrink: 0 }} />
                <Title size={16}>Als Nächstes</Title>
                <div style={{ flex: 1, height: 2, background: T.line }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {upcoming.map((a, i) => {
                  const isNext = i === 0;
                  const mineRow = a.g === MINE;
                  if (a.pause) return <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 16px', background: T.panel2, border: `1.5px dashed ${T.line}`, borderRadius: 12 }}><Ic name="beer" size={17} color={T.sub} sw={2} /><span style={{ fontWeight: 800, fontSize: 13.5, color: T.sub, letterSpacing: 1 }}>PAUSE · 15 Min</span></div>;
                  return (
                    <Card key={i} pad={0} style={{ borderColor: isNext ? T.ink : T.line, borderWidth: isNext ? 2 : 1.5 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px' }}>
                        <div style={{ width: 6, alignSelf: 'stretch', borderRadius: 6, background: CAT[a.cat] }} />
                        <div style={{ fontFamily: T.display, fontSize: 18, color: T.faint, width: 52 }}>{clock(cur + 1 + i)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 800, fontSize: 14.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.n}</div>
                          <div style={{ fontWeight: 600, fontSize: 12, color: T.sub }}>{a.g} · {CATL[a.cat]}</div>
                        </div>
                        {isNext && <Chip tone="gold" dot>benachrichtigt</Chip>}
                        {!isNext && mineRow && <Chip tone="red" dot>bald dran</Chip>}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT: live feed + backstage */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 11, height: 11, background: T.red, flexShrink: 0 }} />
                <Title size={16}>Live-Benachrichtigungen</Title>
                <div style={{ flex: 1, height: 2, background: T.line }} />
              </div>
              <Card pad={0} style={{ overflow: 'hidden' }}>
                {feed.slice(0, 6).map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <FeedIcon k={f[1]} />
                    <span style={{ flex: 1, fontWeight: 700, fontSize: 12.5, color: T.ink, lineHeight: 1.35 }}>{f[2]}</span>
                    <span style={{ fontWeight: 700, fontSize: 11, color: T.faint, flexShrink: 0 }}>{f[0]}</span>
                  </div>
                ))}
              </Card>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <span style={{ width: 11, height: 11, background: T.red, flexShrink: 0 }} />
                <Title size={16}>Backstage bereit</Title>
                <div style={{ flex: 1, height: 2, background: T.line }} />
              </div>
              <Card pad={16}>
                {[[MINE, 11, 12, 'tanz'], ['Männerballett', 6, 9, 'tanz'], ['KCV Bebra', 1, 1, 'gast']].map(([g, r, t, cat], i) => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT[cat], flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 800, fontSize: 13.5 }}>{g}</span>
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: r === t ? T.green : T.sub }}>{r}/{t} bereit</span>
                    {r === t ? <Ic name="check" size={17} color={T.green} sw={2.4} /> : <span style={{ width: 17 }} />}
                  </div>
                ))}
              </Card>
            </div>
          </div>
        </div>
        <style>{`@keyframes fccLivePulse{0%,100%{opacity:1}50%{opacity:.25}}.fcc-livedot{animation:fccLivePulse 1.1s infinite}`}</style>
      </div>
    );
  }

  // ── MOBILE · performer view ─────────────────────────────────────────────────
  function Ring({ pct, label, big }) {
    return (
      <div style={{ width: 168, height: 168, borderRadius: 100, background: `conic-gradient(${T.red} ${pct}%, rgba(26,20,17,0.1) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
        <div style={{ width: 138, height: 138, borderRadius: 80, background: T.panel, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontFamily: T.display, fontSize: 40, color: T.ink, lineHeight: 1 }}>{big}</div>
          <div style={{ fontWeight: 800, fontSize: 12, color: T.sub, marginTop: 4 }}>{label}</div>
        </div>
      </div>
    );
  }
  function MLive({ state = 'soon' }) {
    if (state === 'now') {
      return (
        <div style={{ height: '100%', boxSizing: 'border-box', background: T.red, color: '#fff', padding: '28px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.18)', fontWeight: 900, fontSize: 12, letterSpacing: 1.5, padding: '6px 14px', borderRadius: 20 }}><span className="fcc-livedot" style={{ width: 8, height: 8, borderRadius: 5, background: '#fff' }} />JETZT</span>
          <div style={{ fontFamily: T.display, fontSize: 52, lineHeight: 0.92, marginTop: 6 }}>IHR SEID<br />DRAN!</div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>Showtanz Große</div>
          <div style={{ fontWeight: 600, fontSize: 14.5, color: 'rgba(255,255,255,0.85)', maxWidth: 250, lineHeight: 1.5 }}>Bühne frei für „Königlich". Toi, toi, toi!</div>
          <div style={{ position: 'absolute', bottom: 26, left: 0, right: 0, textAlign: 'center', fontWeight: 700, fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>← Ablauf live aus der Regie</div>
          <style>{`@keyframes fccLivePulse{0%,100%{opacity:1}50%{opacity:.25}}.fcc-livedot{animation:fccLivePulse 1.1s infinite}`}</style>
        </div>
      );
    }
    // soon
    return (
      <div style={{ padding: '16px 18px 24px', display: 'flex', flexDirection: 'column', gap: 16, height: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: T.red, color: '#fff', fontWeight: 900, fontSize: 11, letterSpacing: 1, padding: '5px 11px', borderRadius: 20 }}><span className="fcc-livedot" style={{ width: 7, height: 7, borderRadius: 4, background: '#fff' }} />LIVE</span>
          <span style={{ fontFamily: T.display, fontSize: 17 }}>Große Prunksitzung</span>
        </div>

        <Card pad={22} style={{ textAlign: 'center' }}>
          <Eyebrow style={{ color: T.red }}>Macht euch bereit</Eyebrow>
          <div style={{ margin: '16px 0 14px' }}><Ring pct={62} label="Minuten" big="~7" /></div>
          <div style={{ fontFamily: T.display, fontSize: 22 }}>Showtanz Große</div>
          <div style={{ fontWeight: 700, fontSize: 13.5, color: T.sub, marginTop: 4 }}>ist in <b style={{ color: T.ink }}>2 Beiträgen</b> dran</div>
        </Card>

        <Card pad={15} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name="broadcast" size={20} color={T.red} sw={2} /></span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 11.5, color: T.sub }}>Jetzt auf der Bühne</div><div style={{ fontWeight: 800, fontSize: 14.5 }}>FURRIA Bigband</div></div>
          <span style={{ fontFamily: T.display, fontSize: 17, color: T.faint }}>20:33</span>
        </Card>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '13px 15px', borderRadius: 12, background: T.ink, color: T.cream }}>
          <Ic name="pin" size={18} color="#F4B400" sw={2} />
          <span style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.45 }}>Bitte jetzt zum <b>Bühneneingang rechts</b> — Kostüme & Requisiten fertig machen.</span>
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 11.5, color: T.faint }}>Aktualisiert sich automatisch · Regie sendet live</div>
        <style>{`@keyframes fccLivePulse{0%,100%{opacity:1}50%{opacity:.25}}.fcc-livedot{animation:fccLivePulse 1.1s infinite}`}</style>
      </div>
    );
  }

  // ── MOBILE · lock-screen push (for the canvas) ───────────────────────────────
  function LockPush() {
    const Note = ({ title, body, when, fresh }) => (
      <div style={{ background: fresh ? 'rgba(40,34,30,0.66)' : 'rgba(40,34,30,0.5)', backdropFilter: 'blur(12px)', borderRadius: 22, padding: '13px 15px', display: 'flex', gap: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
        <span style={{ width: 40, height: 40, borderRadius: 10, background: T.red, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.KKBroom size={24} color="#fff" band="rgba(255,255,255,0.85)" /></span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontWeight: 800, fontSize: 12.5, color: 'rgba(255,255,255,0.95)', letterSpacing: 0.3 }}>FURRIA</span>
            <span style={{ fontWeight: 600, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{when}</span>
          </div>
          <div style={{ fontWeight: 800, fontSize: 14, color: '#fff', marginTop: 2 }}>{title}</div>
          <div style={{ fontWeight: 500, fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.4, marginTop: 2 }}>{body}</div>
        </div>
      </div>
    );
    return (
      <div style={{ height: '100%', boxSizing: 'border-box', background: 'linear-gradient(160deg, #2A2118 0%, #1A1411 55%, #3a1416 100%)', color: '#fff', padding: '64px 16px 30px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: 'rgba(255,255,255,0.7)' }}>Samstag, 14. Februar</div>
          <div style={{ fontFamily: T.display, fontSize: 76, lineHeight: 1, letterSpacing: 1 }}>20:36</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          <Note fresh title="Macht euch bereit!" body="Showtanz Große – in ca. 7 Minuten auf die Bühne. Bitte fertig machen." when="jetzt" />
          <Note title="Reihenfolge aktualisiert" body="Die Regie hat den Ablauf angepasst. Tippen für Details." when="vor 5 Min" />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>Push von der Live-Regie · scoped auf deine Gruppe</div>
      </div>
    );
  }

  window.PageLive = PageLive;
  window.MLive = MLive;
  window.LockPush = LockPush;
})();
