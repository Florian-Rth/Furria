// fcc-ds-events.jsx — Veranstaltungsplaner (/events).
// An event is a STATUS HUB, not a stepper: once created it opens to a board of
// task cards (Eckdaten · Vorverkauf · Werbung · Saalplan · Programm) that can be
// done in any order. Task set adapts to the event TYPE (eigene Sitzung / auswärts
// / vereinsintern). Composes the system shell + tokens. No new styles.
// Exports window.PageEvents (desktop) + window.MEvents (mobile).

(function () {
  const { T, Ic, Card, Chip, Btn, Title, Progress } = window;
  const { useState } = React;
  const MONO = 'ui-monospace, SFMono-Regular, monospace';

  // ── event type → which task cards apply ───────────────────────────────────
  const TYPES = {
    sitzung: { label: 'Eigene Sitzung', tone: 'red', accent: T.red, tasks: ['basics', 'vorverkauf', 'werbung', 'saalplan', 'programm'] },
    extern: { label: 'Auswärts', tone: 'blue', accent: T.blue, tasks: ['basics', 'teilnahme'] },
    intern: { label: 'Vereinsintern', tone: 'ink', accent: T.ink, tasks: ['basics', 'anmeldung'] },
  };
  const ESTATUS = {
    entwurf: ['neutral', 'Entwurf'], geplant: ['blue', 'Auf der Website'],
    vorverkauf: ['gold', 'Vorverkauf läuft'], knapp: ['red', 'Fast ausverkauft'],
    ausverkauft: ['red', 'Ausverkauft'], vorbei: ['neutral', 'Abgeschlossen'],
  };
  const TASKDEF = {
    basics: { icon: 'star', title: 'Eckdaten', desc: 'Name · Datum · Ort · Motto' },
    vorverkauf: { icon: 'euro', title: 'Vorverkauf', desc: 'Kontingente & Kartenverkauf' },
    werbung: { icon: 'image', title: 'Werbung', desc: 'Plakat & Social Media — automatisch' },
    saalplan: { icon: 'grid', title: 'Saalplanung', desc: 'Tische & Sitzplätze' },
    programm: { icon: 'clock', title: 'Programm', desc: 'Ablauf & Auto-Reihenfolge' },
    teilnahme: { icon: 'users', title: 'Teilnahme', desc: 'Wer fährt mit?' },
    anmeldung: { icon: 'users', title: 'Anmeldung & Helfer', desc: 'Wer kommt? Wer hilft?' },
  };
  const TSTATUS = { done: ['green', 'Erledigt'], doing: ['gold', 'In Arbeit'], open: ['neutral', 'Offen'] };

  // ── season data ───────────────────────────────────────────────────────────
  // [id, name, type, weekday, day, mon, dateLabel, time, status, motto, sold, cap, inDays, place]
  const EV = [
    ['prunk', 'Große Prunksitzung', 'sitzung', 'Sa', '14', 'Feb', '14. Februar 2026', '19:11', 'knapp', 'Großfurra steht Kopf!', 312, 350, 24, null],
    ['weiber', 'Weiberfasching', 'sitzung', 'Do', '12', 'Feb', '12. Februar 2026', '19:33', 'vorverkauf', "Ladies' Night in der Narrhalla", 206, 350, 22, null],
    ['jugend', 'Jugendfasching', 'sitzung', 'Fr', '13', 'Feb', '13. Februar 2026', '18:00', 'geplant', 'Jugend an die Macht', 0, 300, 23, null],
    ['rentner', 'Rentnerfasching', 'sitzung', 'So', '08', 'Feb', '8. Februar 2026', '14:30', 'geplant', 'Schunkeln & Schwofen', 0, 300, 18, null],
    ['kinder', 'Kinderfasching', 'sitzung', 'So', '15', 'Feb', '15. Februar 2026', '14:11', 'entwurf', 'Konfetti für die Kleinen', 0, 300, 25, null],
    ['umzug', 'Rosenmontagsumzug', 'extern', 'Mo', '16', 'Feb', '16. Februar 2026', '13:11', 'geplant', null, 0, 0, 26, 'Sondershausen'],
    ['kreis', 'Kreiskarneval Kyffhäuser', 'extern', 'Sa', '24', 'Jan', '24. Januar 2026', '19:00', 'geplant', null, 0, 0, 3, 'Bad Frankenhausen'],
    ['besuch', 'Besuch beim KCV Bebra', 'extern', 'Sa', '31', 'Jan', '31. Januar 2026', '19:30', 'geplant', null, 0, 0, 10, 'Bebra'],
    ['jhv', 'Jahreshauptversammlung', 'intern', 'Fr', '20', 'Mrz', '20. März 2026', '19:00', 'geplant', null, 0, 0, 58, 'Vereinsraum'],
    ['sommer', 'Sommerfest', 'intern', 'Sa', '04', 'Jul', '4. Juli 2026', '15:00', 'entwurf', null, 0, 0, 164, 'Festwiese'],
    ['wander', 'Herbstwanderung', 'intern', 'So', '11', 'Okt', '11. Oktober 2026', '10:00', 'entwurf', null, 0, 0, 263, 'Treff Marktplatz'],
  ];
  const VENUE = 'Gemeindehaus Großfurra';
  const mk = (a) => ({ id: a[0], name: a[1], type: a[2], weekday: a[3], day: a[4], mon: a[5], dateLabel: a[6], time: a[7], status: a[8], motto: a[9], sold: a[10], cap: a[11], inDays: a[12], place: a[13], venue: VENUE });
  const EVENTS = EV.map(mk);
  const byId = (id) => EVENTS.find((e) => e.id === id) || EVENTS[0];

  // per-event task state — the Prunksitzung is fully fleshed out (the hero)
  const HERO = {
    prunk: {
      basics: { status: 'done', summary: 'Steht & ist veröffentlicht', meta: 'Seit 12.11. auf furria-grossfurra.de sichtbar', foot: 'Website-Vorschau' },
      vorverkauf: { status: 'doing', summary: '312 / 350 verkauft · noch 38 Karten', meta: '8 Mitglieder halten 46 Vorbestell-Karten · VVK bis 12.02.', foot: 'Vorverkauf bis 12.02.', prog: [312, 350] },
      werbung: { status: 'doing', summary: 'Story & Flyer erzeugt', meta: 'Instagram-Post und WhatsApp-Status noch offen', foot: '2 von 4 Formaten' },
      saalplan: { status: 'doing', summary: '44 Tische · 352 Plätze', meta: 'Saalplan steht — Notausgänge frei', foot: '350 Plätze · Ziel erreicht' },
      programm: { status: 'doing', summary: '13 Beiträge · Reihenfolge optimiert', meta: 'Min. Umziehzeit 24 Min · 0 Konflikte', foot: 'Auto-Reihenfolge', prog: null },
    },
  };
  const stateFor = (eid, tkey) => (HERO[eid] && HERO[eid][tkey]) || { status: 'open', summary: 'Noch nicht begonnen', meta: '', foot: '' };

  // ── small shared bits ───────────────────────────────────────────────────────
  function Plh({ w, h, tint = T.ink, radius = 6, style }) {
    return <div style={{ width: w, height: h, borderRadius: radius, background: `repeating-linear-gradient(135deg, ${tint}1f, ${tint}1f 6px, ${tint}0d 6px, ${tint}0d 12px)`, border: `1.5px solid ${tint}33`, ...style }} />;
  }
  function SecHead({ children, count, action, onAction, style }) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14, ...style }}>
        <span style={{ width: 11, height: 11, background: T.red, flexShrink: 0 }} />
        <Title size={17} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>{children}</Title>
        {count != null && <span style={{ fontWeight: 800, fontSize: 12.5, color: T.sub, whiteSpace: 'nowrap' }}>{count}</span>}
        <div style={{ flex: 1, height: 2, background: T.line }} />
        {action && <span onClick={onAction} style={{ fontWeight: 800, fontSize: 13, color: T.red, cursor: 'pointer', whiteSpace: 'nowrap' }}>{action} →</span>}
      </div>
    );
  }
  function DateBlock({ day, mon, tone = T.ink, lg }) {
    return (
      <div style={{ width: lg ? 64 : 54, flexShrink: 0, textAlign: 'center', borderRadius: 11, overflow: 'hidden', border: `1.5px solid ${T.line}`, background: T.panel }}>
        <div style={{ background: tone, color: '#fff', fontSize: 10, fontWeight: 800, letterSpacing: 1, padding: '3px 0', textTransform: 'uppercase' }}>{mon}</div>
        <div style={{ fontFamily: T.display, fontSize: lg ? 28 : 23, color: T.ink, padding: lg ? '7px 0' : '5px 0', lineHeight: 1 }}>{day}</div>
      </div>
    );
  }
  function Meta({ icon, children }) {
    return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13 }}><Ic name={icon} size={15} color="rgba(251,244,230,0.65)" sw={2} />{children}</span>;
  }
  function BackBtn({ children, onClick }) {
    return (
      <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub, padding: 0 }}>
        <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span>{children}
      </button>
    );
  }

  // ── KPI tile ──────────────────────────────────────────────────────────────
  function Stat({ value, unit, sub, label, tone = 'ink', prog, note, noteTone }) {
    const col = tone === 'red' ? T.red : tone === 'green' ? T.green : tone === 'gold' ? '#9a7200' : T.ink;
    return (
      <Card style={{ flex: 1, minWidth: 0 }} pad={17}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, whiteSpace: 'nowrap' }}>
          <span style={{ fontFamily: T.display, fontSize: 33, color: col, lineHeight: 1 }}>{value}</span>
          {unit && <span style={{ fontFamily: T.display, fontSize: 17, color: T.faint }}>{unit}</span>}
          {sub && <span style={{ fontWeight: 800, fontSize: 13, color: T.sub }}>{sub}</span>}
        </div>
        {prog && <div style={{ margin: '11px 0 9px' }}><Progress value={prog[0]} max={prog[1]} tone={tone === 'gold' ? 'gold' : tone === 'green' ? 'green' : 'red'} h={7} /></div>}
        <div style={{ fontWeight: 800, fontSize: 12.5, color: T.ink, marginTop: prog ? 0 : 9 }}>{label}</div>
        {note && <div style={{ fontWeight: 800, fontSize: 11.5, color: noteTone === 'red' ? T.red : T.sub, marginTop: 3 }}>{note}</div>}
      </Card>
    );
  }

  // ── auto-generated advertising formats (Werbung preview) ────────────────────
  function FormatRow() {
    const items = [['Story', 32, true], ['Post', 56, true], ['Plakat', 41, false], ['Flyer', 41, false]];
    return (
      <div style={{ display: 'flex', gap: 10, marginTop: 13, alignItems: 'flex-end' }}>
        {items.map(([n, w, done]) => (
          <div key={n} style={{ textAlign: 'center' }}>
            <div style={{ position: 'relative' }}>
              <Plh w={w} h={58} tint={done ? T.red : T.ink} radius={5} />
              <span style={{ position: 'absolute', top: 4, right: 4, width: 15, height: 15, borderRadius: 8, background: done ? T.green : 'rgba(26,20,17,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{done && <Ic name="check" size={9} color="#fff" sw={3.4} />}</span>
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 800, color: done ? T.ink : T.faint, marginTop: 5 }}>{n}</div>
          </div>
        ))}
      </div>
    );
  }

  // ── task card ───────────────────────────────────────────────────────────────
  function TaskCard({ tkey, st, onOpen, mobile }) {
    const def = TASKDEF[tkey];
    const [tone, label] = TSTATUS[st.status];
    const done = st.status === 'done';
    const isProg = tkey === 'programm';
    return (
      <Card onClick={() => onOpen(tkey)} pad={mobile ? 15 : 18} style={{ cursor: 'pointer' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{ width: 40, height: 40, borderRadius: 11, background: done ? 'rgba(46,158,91,0.13)' : 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name={def.icon} size={20} color={done ? T.green : T.red} sw={2} /></span>
            <div style={{ minWidth: 0 }}><Title size={16}>{def.title}</Title><div style={{ fontSize: 12, fontWeight: 600, color: T.sub, marginTop: 2 }}>{def.desc}</div></div>
          </div>
          <Chip tone={tone} dot={st.status !== 'open'}>{label}</Chip>
        </div>
        <div style={{ height: 1, background: T.line2, margin: '13px 0' }} />
        <div style={{ fontWeight: 800, fontSize: 13.5, color: T.ink, lineHeight: 1.35 }}>{st.summary}</div>
        {st.meta && <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, lineHeight: 1.45, marginTop: 4 }}>{st.meta}</div>}
        {st.prog && <div style={{ marginTop: 11 }}><Progress value={st.prog[0]} max={st.prog[1]} tone="red" h={7} /></div>}
        {tkey === 'werbung' && <FormatRow />}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
          {isProg
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 800, fontSize: 13, color: T.red }}><Ic name="bolt" size={16} color={T.red} fill={T.red} sw={2} />Reihenfolge berechnen</span>
            : <span style={{ fontSize: 11.5, fontWeight: 700, color: T.faint }}>{st.foot}</span>}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontWeight: 800, fontSize: 13, color: T.ink }}>Öffnen<Ic name="chevron" size={15} color={T.ink} /></span>
        </div>
      </Card>
    );
  }

  // ── EVENT LIST (season overview) ────────────────────────────────────────────
  function EventRow({ e, onOpen, last, mobile }) {
    const [stone, slabel] = ESTATUS[e.status];
    const tone = TYPES[e.type].accent;
    const left = e.cap - e.sold;
    const hasGauge = e.type === 'sitzung' && e.sold > 0;
    const metaLine = `${e.weekday} ${e.dateLabel} · ${e.time} Uhr${e.type === 'sitzung' ? ` · ${e.venue}` : e.place ? ` · ${e.place}` : ''}`;

    if (mobile) {
      return (
        <div onClick={() => onOpen(e.id)} style={{ padding: '13px 14px', borderTop: last ? 'none' : `1px solid ${T.line2}`, cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <DateBlock day={e.day} mon={e.mon} tone={tone} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title size={17} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</Title>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{metaLine}</div>
            </div>
            <Ic name="chevron" size={17} color={T.faint} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 11, paddingLeft: 67 }}>
            <Chip tone={stone} dot={e.status === 'vorverkauf' || e.status === 'knapp'}>{slabel}</Chip>
            {hasGauge && (
              <React.Fragment>
                <div style={{ flex: 1, minWidth: 24 }}><Progress value={e.sold} max={e.cap} tone={left <= 50 ? 'red' : 'gold'} h={6} /></div>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: left <= 50 ? T.red : T.sub, whiteSpace: 'nowrap' }}>noch {left}</span>
              </React.Fragment>
            )}
            {!hasGauge && e.type === 'sitzung' && e.sold === 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: T.faint }}>VVK noch nicht offen</span>}
          </div>
        </div>
      );
    }
    return (
      <div onClick={() => onOpen(e.id)} className="fcc-mrow" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 14px', borderTop: last ? 'none' : `1px solid ${T.line2}`, cursor: 'pointer' }}>
        <DateBlock day={e.day} mon={e.mon} tone={tone} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Title size={19} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.name}</Title>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {e.weekday} {e.dateLabel} · {e.time} Uhr{e.type === 'sitzung' ? ` · ${e.venue}` : e.place ? ` · ${e.place}` : ''}
          </div>
        </div>
        {e.type === 'sitzung' && e.sold > 0 && (
          <div style={{ width: 156, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 800, marginBottom: 5 }}><span style={{ color: T.sub }}>{e.sold}/{e.cap}</span><span style={{ color: left <= 50 ? T.red : T.sub }}>noch {left} frei</span></div>
            <Progress value={e.sold} max={e.cap} tone={left <= 50 ? 'red' : 'gold'} h={6} />
          </div>
        )}
        {e.type === 'sitzung' && e.sold === 0 && <span style={{ fontSize: 11.5, fontWeight: 700, color: T.faint, flexShrink: 0 }}>VVK noch nicht offen</span>}
        <Chip tone={stone} dot={e.status === 'vorverkauf' || e.status === 'knapp'}>{slabel}</Chip>
        <Ic name="chevron" size={17} color={T.faint} />
      </div>
    );
  }
  const LISTGROUPS = [
    ['Eigene Sitzungen', 'sitzung', 'Mit Ticketing, Saalplan & Programm'],
    ['Auswärts & Umzüge', 'extern', 'Wir nehmen teil — kein eigenes Ticketing'],
    ['Vereinsintern', 'intern', 'Nur für Mitglieder'],
  ];
  function EventList({ onOpen, mobile }) {
    const sitz = EVENTS.filter((e) => e.type === 'sitzung').length;
    return (
      <div style={{ padding: mobile ? '14px 16px 26px' : 28, maxWidth: 1180, display: 'flex', flexDirection: 'column', gap: mobile ? 18 : 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, height: 38, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 15px', background: T.panel, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
            <Ic name="calendar" size={16} color={T.red} sw={2} />Session 2026<Ic name="chevdown" size={15} color={T.faint} />
          </div>
          {!mobile && <span style={{ fontSize: 13, fontWeight: 700, color: T.sub }}>{EVENTS.length} Veranstaltungen · {sitz} eigene Sitzungen</span>}
          <div style={{ flex: 1 }} />
          {mobile && <Btn primary sm icon="plus">Anlegen</Btn>}
        </div>
        {LISTGROUPS.map(([title, type, hint]) => {
          const rows = EVENTS.filter((e) => e.type === type);
          return (
            <div key={type}>
              <SecHead count={`${rows.length}`}>{title}</SecHead>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: T.faint, margin: '-8px 0 12px 22px' }}>{hint}</div>
              <Card pad={4}>{rows.map((e, i) => <EventRow key={e.id} e={e} onOpen={onOpen} last={i === rows.length - 1} mobile={mobile} />)}</Card>
            </div>
          );
        })}
      </div>
    );
  }

  // ── EVENT HUB (status board) ──────────────────────────────────────────────
  function EventHub({ id, onTask, onBack, mobile }) {
    const e = byId(id);
    const ty = TYPES[e.type];
    const [stone, slabel] = ESTATUS[e.status];
    const tasks = ty.tasks;
    const states = tasks.map((t) => stateFor(e.id, t));
    const doneN = states.filter((s) => s.status === 'done').length;
    const left = e.cap - e.sold;
    const revenue = (e.sold * 10).toLocaleString('de-DE');

    const hero = (
      <div style={{ background: T.ink, color: T.cream, borderRadius: T.radius, boxShadow: `${mobile ? 5 : 8}px ${mobile ? 5 : 8}px 0 ${T.red}`, padding: mobile ? '20px 20px 18px' : '26px 30px', position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ position: 'absolute', right: -14, bottom: -20, opacity: 0.1 }}><window.KKBroom size={mobile ? 150 : 190} color="#fff" band="#fff" /></div>
        <div style={{ position: 'relative', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 11, flexWrap: 'wrap' }}>
            <Chip tone={ty.tone} dot>{ty.label}</Chip>
            <Chip tone={stone} dot={e.status === 'vorverkauf' || e.status === 'knapp'}>{slabel}</Chip>
          </div>
          <div style={{ fontFamily: T.display, fontSize: mobile ? 30 : 46, letterSpacing: 0.5, lineHeight: 0.95 }}>{e.name}</div>
          {e.motto && <div style={{ fontSize: mobile ? 14 : 16, fontWeight: 700, color: '#F4B400', marginTop: 8 }}>„{e.motto}"</div>}
          <div style={{ display: 'flex', gap: mobile ? 14 : 22, flexWrap: 'wrap', marginTop: mobile ? 14 : 18, color: 'rgba(251,244,230,0.82)' }}>
            <Meta icon="calendar">{e.weekday} {e.dateLabel}</Meta>
            <Meta icon="clock">{e.time} Uhr</Meta>
            <Meta icon="pin">{e.type === 'sitzung' ? e.venue : e.place}</Meta>
          </div>
        </div>
        {!mobile && (
          <div style={{ position: 'relative', flexShrink: 0, alignSelf: 'center', textAlign: 'center', background: 'rgba(251,244,230,0.08)', border: '1px solid rgba(251,244,230,0.18)', borderRadius: 14, padding: '16px 22px' }}>
            <div style={{ fontFamily: T.display, fontSize: 50, lineHeight: 0.9, color: '#fff' }}>{e.inDays}</div>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(251,244,230,0.6)', textTransform: 'uppercase', marginTop: 4 }}>Tage</div>
          </div>
        )}
      </div>
    );

    const kpiWrap = mobile
      ? { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }
      : { display: 'flex', gap: 16, flexWrap: 'nowrap' };
    const kpis = e.type === 'sitzung' ? (
      <div style={kpiWrap}>
        <Stat value={e.inDays} unit="Tg" label="bis zur Sitzung" sub={null} tone="ink" note={`${e.weekday} ${e.dateLabel.replace(' 2026', '')}`} />
        {e.sold > 0
          ? <Stat value={e.sold} sub={`/ ${e.cap}`} label="Karten verkauft" tone={left <= 50 ? 'red' : 'gold'} prog={[e.sold, e.cap]} note={`nur noch ${left} frei`} noteTone={left <= 50 ? 'red' : null} />
          : <Stat value="0" sub={`/ ${e.cap}`} label="Karten verkauft" tone="ink" note="VVK noch nicht offen" />}
        <Stat value={`${revenue} €`} label="Einnahmen Vorverkauf" tone="green" note="Ø 10 € pro Karte" />
        <Stat value={`${doneN}/${tasks.length}`} label="Aufgaben erledigt" tone="ink" prog={[doneN, tasks.length]} />
      </div>
    ) : (
      <div style={kpiWrap}>
        <Stat value={e.inDays} unit="Tg" label="bis zum Termin" tone="ink" note={`${e.weekday} ${e.dateLabel.replace(' 2026', '')}`} />
        <Stat value={`${doneN}/${tasks.length}`} label="Aufgaben erledigt" tone="ink" prog={[doneN, tasks.length]} />
      </div>
    );

    return (
      <div style={{ padding: mobile ? '14px 16px 26px' : 28, maxWidth: 1180, display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <BackBtn onClick={onBack}>{mobile ? 'Zurück' : 'Saison 2026'}</BackBtn>
          {!mobile && (
            <div style={{ display: 'flex', gap: 9 }}>
              <Btn ghost sm icon="image">Website-Vorschau</Btn>
              <Btn primary sm icon="settings">Bearbeiten</Btn>
            </div>
          )}
        </div>
        {hero}
        {kpis}
        <div>
          <SecHead count={`${doneN} von ${tasks.length} erledigt`}>Aufgaben</SecHead>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: T.faint, margin: '-8px 0 14px 22px' }}>In beliebiger Reihenfolge — z.B. das Programm früh bauen, lange bevor Tickets verkauft sind.</div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: mobile ? 12 : 16 }}>
            {tasks.map((t) => <TaskCard key={t} tkey={t} st={stateFor(e.id, t)} onOpen={onTask} mobile={mobile} />)}
          </div>
        </div>
      </div>
    );
  }

  // ── TASK · BASICS (Eckdaten + Website-Veröffentlichung) ───────────────────
  function Field({ label, value, wide, edit }) {
    return (
      <div style={{ gridColumn: wide ? '1 / -1' : 'auto' }}>
        <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
        <div style={{ minHeight: 44, display: 'flex', alignItems: 'center', padding: '0 14px', borderRadius: 10, border: `1.5px solid ${edit ? T.ink : T.line}`, background: edit ? T.panel : T.panel2, fontWeight: 700, fontSize: 14, color: T.ink }}>{value}</div>
      </div>
    );
  }
  function TaskBasics({ id, onBack, mobile }) {
    const e = byId(id);
    const [edit, setEdit] = useState(false);
    return (
      <div style={{ padding: mobile ? '14px 16px 26px' : 28, maxWidth: 1080, display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <BackBtn onClick={onBack}>Zurück zum Event</BackBtn>
          <Btn primary={!edit} ghost={edit} sm icon={edit ? 'check' : 'settings'} onClick={() => setEdit((v) => !v)}>{edit ? 'Speichern' : 'Bearbeiten'}</Btn>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title size={mobile ? 24 : 30}>Eckdaten</Title>
            <Chip tone="green" dot>Erledigt</Chip>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.sub, marginTop: 6 }}>Sobald die Eckdaten veröffentlicht sind, erscheint die Veranstaltung automatisch auf der Vereins-Website.</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1.3fr 1fr', gap: mobile ? 16 : 24, alignItems: 'start' }}>
          <Card pad={mobile ? 16 : 22}>
            <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : '1fr 1fr', gap: 16 }}>
              <Field label="Name der Veranstaltung" value={e.name} wide edit={edit} />
              <Field label="Untertitel / Motto" value={e.motto || '—'} wide edit={edit} />
              <Field label="Datum" value={`${e.weekday}, ${e.dateLabel}`} edit={edit} />
              <Field label="Einlass / Beginn" value={`18:11 / ${e.time} Uhr`} edit={edit} />
              <Field label="Ort" value={e.venue} edit={edit} />
              <Field label="Plätze" value={`${e.cap}`} edit={edit} />
              <Field label="Saison / Typ" value="Session 2026 · Eigene Sitzung" wide edit={edit} />
            </div>
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* publish state */}
            <Card pad={mobile ? 16 : 18}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                  <span style={{ width: 9, height: 9, borderRadius: 5, background: T.green, flexShrink: 0 }} />
                  <span style={{ fontWeight: 800, fontSize: 14 }}>Auf der Website</span>
                </div>
                <span style={{ width: 42, height: 24, borderRadius: 20, background: T.green, position: 'relative', flexShrink: 0 }}><span style={{ position: 'absolute', top: 3, right: 3, width: 18, height: 18, borderRadius: 12, background: '#fff' }} /></span>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, lineHeight: 1.45, marginTop: 9 }}>Seit <b style={{ color: T.ink }}>12.11.2025</b> sichtbar auf furria-grossfurra.de — inkl. Datum, Motto und „Karten sichern".</div>
            </Card>
            {/* website preview — the hero of this screen */}
            <div>
              <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase', marginBottom: 9 }}>So erscheint es auf der Website</div>
              <div style={{ background: T.cream, border: `1.5px solid ${T.line}`, borderRadius: T.radius, boxShadow: `6px 6px 0 ${T.ink}`, overflow: 'hidden' }}>
                <Plh w="100%" h={mobile ? 110 : 130} tint={T.red} radius={0} />
                <div style={{ padding: '14px 16px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 9 }}>
                    <DateBlock day={e.day} mon={e.mon} tone={T.red} />
                    <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: T.red, textTransform: 'uppercase' }}>Session 2026</div><Title size={20}>{e.name}</Title></div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.sub, lineHeight: 1.5 }}>„{e.motto}" · {e.weekday} {e.dateLabel} · {e.time} Uhr · {e.venue}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 13 }}>
                    <span style={{ fontFamily: T.display, fontSize: 17 }}>Karten ab 10 €</span>
                    <span style={{ background: T.red, color: '#fff', fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '9px 16px', borderRadius: 30 }}>Karten sichern →</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── TASK · WERBUNG (auto-generated Werbematerial) ─────────────────────────
  function WGlyph({ name, size = 18, color }) {
    const p = { fill: 'none', stroke: color, strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' };
    const G = {
      instagram: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" {...p} /><circle cx="12" cy="12" r="4" {...p} /><circle cx="17" cy="7" r="1.1" fill={color} stroke="none" /></>,
      whatsapp: <><path d="M4 20l1.3-3.8A7.5 7.5 0 1 1 8 19.2L4 20Z" {...p} /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5.6 0 1-.6 1-1l-1.6-.8-.9.9c-1-.4-1.9-1.3-2.3-2.3l.9-.9L10.5 8c-.4 0-1 .4-1 1Z" {...p} /></>,
      download: <><path d="M12 4v11M8 11l4 4 4-4" {...p} /><path d="M5 19h14" {...p} /></>,
      printer: <><path d="M7 9V4h10v5M7 18H5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2" {...p} /><rect x="7" y="15" width="10" height="5" {...p} /></>,
      sparkle: <><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" {...p} /></>,
    };
    return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{G[name]}</svg>;
  }
  const WFORMATS = [
    ['story', 'Instagram Story', '9:16', 'share'],
    ['post', 'Instagram Post', '1:1', 'share'],
    ['flyer', 'Flyer A6', 'Druck', 'print'],
    ['wa', 'WhatsApp-Status', '9:16', 'share'],
  ];
  const WDIMS = { story: [266, 473], wa: [266, 473], post: [370, 370], flyer: [300, 424] };

  // the auto-composed poster (brand system + event data)
  function Poster({ e, w, h }) {
    const s = w / 360;
    const left = e.cap - e.sold;
    return (
      <div style={{ width: w, height: h, background: T.ink, borderRadius: 8, overflow: 'hidden', position: 'relative', color: T.cream, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 80% -10%, ${T.red}cc, transparent 55%)` }} />
        <div style={{ position: 'absolute', right: -18 * s, bottom: -22 * s, opacity: 0.12 }}><window.KKBroom size={190 * s} color="#fff" band="#fff" /></div>
        <div style={{ position: 'relative', height: '100%', boxSizing: 'border-box', padding: 24 * s, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 * s }}>
            <window.KKBroom size={26 * s} color="#fff" band={T.red} />
            <span style={{ fontWeight: 800, fontSize: 11 * s, letterSpacing: 1.5 * s, textTransform: 'uppercase', color: 'rgba(251,244,230,0.75)' }}>FCC · FURRIA Großfurra</span>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 11 * s, letterSpacing: 2 * s, textTransform: 'uppercase', color: '#F4B400' }}>Session 2026 präsentiert</div>
            <div style={{ fontFamily: T.display, fontSize: 46 * s, lineHeight: 0.92, letterSpacing: 0.5 * s, marginTop: 8 * s, textTransform: 'uppercase' }}>{e.name}</div>
            {e.motto && <div style={{ fontFamily: T.font, fontWeight: 800, fontSize: 16 * s, color: '#F4B400', marginTop: 10 * s }}>„{e.motto}"</div>}
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 * s }}>
            <div>
              <div style={{ fontFamily: T.display, fontSize: 30 * s, lineHeight: 1 }}>{e.day}. {e.mon}</div>
              <div style={{ fontWeight: 700, fontSize: 12.5 * s, color: 'rgba(251,244,230,0.82)', marginTop: 3 * s }}>{e.time} Uhr · {e.venue}</div>
            </div>
            <div style={{ background: T.red, color: '#fff', borderRadius: 30 * s, padding: `${7 * s}px ${13 * s}px`, fontWeight: 900, fontSize: 12 * s, letterSpacing: 0.5 * s, whiteSpace: 'nowrap' }}>NUR NOCH {left}</div>
          </div>
          <div style={{ marginTop: 14 * s, borderTop: `${1.5 * s}px solid rgba(251,244,230,0.2)`, paddingTop: 11 * s, fontWeight: 800, fontSize: 12 * s, color: 'rgba(251,244,230,0.9)' }}>Karten: furria-grossfurra.de</div>
        </div>
      </div>
    );
  }

  function TaskWerbung({ id, onBack, mobile }) {
    const e = byId(id);
    const [fmt, setFmt] = useState('story');
    const [w, h] = WDIMS[fmt];
    const meta = WFORMATS.find((f) => f[0] === fmt);
    const isPrint = meta[3] === 'print';
    const fmtCard = (f) => {
      const active = f[0] === fmt;
      return (
        <button key={f[0]} onClick={() => setFmt(f[0])} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 14px', borderRadius: 12, border: `2px solid ${active ? T.ink : T.line}`, background: active ? T.panel2 : T.panel, cursor: 'pointer', fontFamily: T.font }}>
          <span style={{ width: 34, height: 34, borderRadius: 8, background: active ? T.ink : T.panel2, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><WGlyph name={f[3] === 'print' ? 'printer' : f[0] === 'wa' ? 'whatsapp' : 'instagram'} size={18} color={active ? '#fff' : T.sub} /></span>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{f[1]}</div><div style={{ fontWeight: 700, fontSize: 11, color: T.sub }}>{f[2]}</div></div>
          <span style={{ width: 18, height: 18, borderRadius: 10, border: `2px solid ${active ? T.red : T.line}`, background: active ? T.red : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{active && <span style={{ width: 7, height: 7, borderRadius: 4, background: '#fff' }} />}</span>
        </button>
      );
    };
    const actions = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {isPrint ? (
          <Btn primary icon="upload" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '13px' }}>Als PDF herunterladen</Btn>
        ) : (
          <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', background: meta[0] === 'wa' ? '#25D366' : T.red, border: 'none', borderRadius: 13, color: '#fff', fontFamily: T.font, fontWeight: 800, fontSize: 15, padding: '14px', cursor: 'pointer' }}><WGlyph name={meta[0] === 'wa' ? 'whatsapp' : 'instagram'} size={19} color="#fff" />Direkt teilen</button>
        )}
        <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, width: '100%', background: T.panel, border: `1.5px solid ${T.line}`, borderRadius: 13, color: T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 15, padding: '12px', cursor: 'pointer' }}><WGlyph name="download" size={18} color={T.ink} />{isPrint ? 'PNG' : 'Herunterladen'}</button>
      </div>
    );

    return (
      <div style={{ padding: mobile ? '14px 16px 26px' : 28, maxWidth: 1080, display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <BackBtn onClick={onBack}>Zurück zum Event</BackBtn>
          <Chip tone="gold" dot>In Arbeit</Chip>
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Title size={mobile ? 24 : 30}>Werbung</Title>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 12.5, color: T.red, background: 'rgba(225,29,42,0.1)', padding: '4px 10px', borderRadius: 20 }}><WGlyph name="sparkle" size={14} color={T.red} />automatisch erzeugt</span>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.sub, marginTop: 6, maxWidth: 640 }}>Aus den Event-Daten und dem Vereins-Design baut die App fertige Werbung — ein Klick zum Teilen oder Drucken. Kein Grafikprogramm nötig.</div>
        </div>

        {mobile ? (
          <>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
              {WFORMATS.map((f) => (
                <button key={f[0]} onClick={() => setFmt(f[0])} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 13px', borderRadius: 30, border: `2px solid ${f[0] === fmt ? T.ink : T.line}`, background: f[0] === fmt ? T.ink : T.panel, color: f[0] === fmt ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0 }}><WGlyph name={f[3] === 'print' ? 'printer' : f[0] === 'wa' ? 'whatsapp' : 'instagram'} size={15} color={f[0] === fmt ? '#fff' : T.sub} />{f[1]}</button>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}><Poster e={e} w={w * 0.82} h={h * 0.82} /></div>
            {actions}
          </>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 28, alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 11.5, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase', marginBottom: 10 }}>Format wählen</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>{WFORMATS.map(fmtCard)}</div>
              </div>
              {actions}
              <Card pad={14} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <WGlyph name="sparkle" size={17} color={T.red} />
                <span style={{ fontWeight: 700, fontSize: 12, color: T.sub, lineHeight: 1.45 }}>Ändert sich der Ticketstand, wird „nur noch X" automatisch aktualisiert.</span>
              </Card>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: T.radius, padding: '32px 0' }}>
              <Poster e={e} w={w} h={h} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── TASK · VORVERKAUF (Ticketing + schnelle Offline-Erfassung) ────────────
  function VKChannel({ label, n, total, tone }) {
    return (
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontWeight: 800, fontSize: 13 }}>{label}</span>
          <span style={{ fontFamily: T.display, fontSize: 18 }}>{n}</span>
        </div>
        <div style={{ height: 8, borderRadius: 5, background: T.panel2, overflow: 'hidden' }}><div style={{ width: (n / total * 100) + '%', height: '100%', background: tone, borderRadius: 5 }} /></div>
      </div>
    );
  }
  function TaskVorverkauf({ id, onBack, mobile }) {
    const e = byId(id);
    const [open, setOpen] = useState(true);
    const [quick, setQuick] = useState(2);
    const left = e.cap - e.sold;
    const revenue = (e.sold * 10).toLocaleString('de-DE');
    const CHANNELS = [['Online · Website', 188, T.blue], ['Vorbestellung · Mitglieder', 92, T.red], ['Abendkasse', 32, '#9a7200']];
    const HOLDERS = [['Klaus Reinhardt', 'KR', 'ink', 12, 9], ['Tom Berger', 'TB', 'red', 10, 7], ['Bernd Hofer', 'BH', 'ink', 8, 5], ['Uwe Sänger', 'US', 'gold', 8, 4], ['Markus Vogt', 'MV', 'gold', 8, 3]];

    // the fast offline-entry panel (handing over cash at a meeting)
    const quickPanel = (
      <Card pad={mobile ? 16 : 18} style={{ borderColor: T.red + '55' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic name="bolt" size={18} color={T.red} fill={T.red} sw={2} /></span>
          <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>Karten schnell erfassen</div><div style={{ fontWeight: 600, fontSize: 11.5, color: T.sub }}>Offline / bar verkaufte Karten in 2 Sekunden buchen</div></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, flexWrap: mobile ? 'wrap' : 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={() => setQuick(Math.max(1, quick - 1))} style={{ width: 40, height: 40, borderRadius: 11, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.display, fontSize: 22, cursor: 'pointer' }}>–</button>
            <span style={{ fontFamily: T.display, fontSize: 30, minWidth: 40, textAlign: 'center' }}>{quick}</span>
            <button onClick={() => setQuick(quick + 1)} style={{ width: 40, height: 40, borderRadius: 11, border: `1.5px solid ${T.line}`, background: T.panel, fontFamily: T.display, fontSize: 22, cursor: 'pointer' }}>+</button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>{[1, 2, 5, 10].map((n) => <button key={n} onClick={() => setQuick(n)} style={{ minWidth: 40, padding: '8px 10px', borderRadius: 9, border: `2px solid ${quick === n ? T.ink : T.line}`, background: quick === n ? T.ink : T.panel, color: quick === n ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>{n}</button>)}</div>
          <div style={{ flex: 1 }} />
          <Btn primary icon="check" style={mobile ? { width: '100%', justifyContent: 'center' } : undefined}>{quick} buchen · {quick * 10} €</Btn>
        </div>
      </Card>
    );

    const kpis = (
      <div style={{ display: mobile ? 'grid' : 'flex', gridTemplateColumns: '1fr 1fr', gap: mobile ? 11 : 16 }}>
        <Stat value={e.sold} sub={`/ ${e.cap}`} label="Karten verkauft" tone={left <= 50 ? 'red' : 'gold'} prog={[e.sold, e.cap]} note={`nur noch ${left} frei`} noteTone={left <= 50 ? 'red' : null} />
        <Stat value={`${revenue} €`} label="Einnahmen Vorverkauf" tone="green" note="Ø 10 € pro Karte" />
        {!mobile && <Stat value={left} label="freie Karten" tone="ink" note="öffentlich sichtbar" />}
        {!mobile && <Stat value="bis 12.02." label="Vorverkauf" tone="ink" note={open ? 'läuft' : 'geschlossen'} />}
      </div>
    );

    return (
      <div style={{ padding: mobile ? '14px 16px 26px' : 28, maxWidth: 1180, display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <BackBtn onClick={onBack}>Zurück zum Event</BackBtn>
          <Chip tone="gold" dot>Vorverkauf läuft</Chip>
        </div>
        <div>
          <Title size={mobile ? 24 : 30}>Vorverkauf</Title>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: T.sub, marginTop: 6, maxWidth: 660 }}>Kontingent, Preis und Verkauf an einem Ort. Der freie Reststand wird öffentlich angezeigt — das schafft Dringlichkeit in den letzten Tagen.</div>
        </div>

        {kpis}
        {quickPanel}

        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)', gap: mobile ? 16 : 22, alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? 16 : 22 }}>
            <div>
              <SecHead>Kontingent & Preis</SecHead>
              <Card pad={18}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}><span style={{ fontWeight: 700, fontSize: 13.5, color: T.sub }}>Gesamtkontingent</span><span style={{ fontFamily: T.display, fontSize: 22 }}>{e.cap} Plätze</span></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: `1px solid ${T.line2}` }}><span style={{ fontWeight: 700, fontSize: 13.5, color: T.sub }}>Kartenpreis</span><span style={{ fontFamily: T.display, fontSize: 22 }}>10 €</span></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderTop: `1px solid ${T.line2}` }}><span style={{ fontWeight: 700, fontSize: 13.5, color: T.sub }}>VVK-Fenster</span><span style={{ fontWeight: 800, fontSize: 14 }}>15.11. – 12.02.</span></div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 0 2px', borderTop: `1.5px solid ${T.line}`, marginTop: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: open ? T.green : T.faint }} /><span style={{ fontWeight: 800, fontSize: 14 }}>Vorverkauf {open ? 'läuft' : 'geschlossen'}</span></div>
                  <span onClick={() => setOpen((v) => !v)} style={{ width: 42, height: 24, borderRadius: 20, background: open ? T.green : T.line, position: 'relative', cursor: 'pointer', flexShrink: 0 }}><span style={{ position: 'absolute', top: 3, left: open ? 21 : 3, width: 18, height: 18, borderRadius: 12, background: '#fff', transition: 'left .15s' }} /></span>
                </div>
              </Card>
            </div>
            <div>
              <SecHead>Verkauf nach Kanal</SecHead>
              <Card pad={18}><div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>{CHANNELS.map(([l, n, t]) => <VKChannel key={l} label={l} n={n} total={e.cap} tone={t} />)}</div></Card>
            </div>
          </div>

          <div>
            <SecHead count={`46 Karten · 8 Mitglieder`}>Vorbestell-Karten über Mitglieder</SecHead>
            <Card pad={0} style={{ overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr 0.8fr', padding: '10px 16px', background: T.panel2, borderBottom: `1.5px solid ${T.line}`, fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: T.sub, textTransform: 'uppercase' }}>
                <div>Mitglied</div><div style={{ textAlign: 'right' }}>erhalten</div><div style={{ textAlign: 'right' }}>verkauft</div>
              </div>
              {HOLDERS.map(([name, ini, tone, got, sold], i) => (
                <div key={name} style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr 0.8fr', alignItems: 'center', padding: '10px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Avatar initials={ini} tone={tone} size={30} /><span style={{ fontWeight: 800, fontSize: 13.5 }}>{name}</span></div>
                  <div style={{ textAlign: 'right', fontFamily: T.display, fontSize: 17 }}>{got}</div>
                  <div style={{ textAlign: 'right', fontWeight: 800, fontSize: 13.5, color: sold === got ? T.green : T.ink }}>{sold}</div>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: T.panel2, borderTop: `1.5px solid ${T.line}` }}>
                <Btn ghost sm icon="plus">Karten ausgeben</Btn>
                <span style={{ fontWeight: 800, fontSize: 13, color: T.sub }}>28 verkauft · 18 unterwegs</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // ── desktop page (own nav state) ──────────────────────────────────────────
  function PageEvents({ start = 'list', programStart = 'draft' }) {
    const [view, setView] = useState(start === 'list' ? 'list' : 'hub');
    const [eid, setEid] = useState('prunk');
    const [task, setTask] = useState(['basics', 'programm', 'werbung', 'vorverkauf', 'saalplan'].includes(start) ? start : null);
    if (view === 'list') return <EventList onOpen={(id) => { setEid(id); setTask(null); setView('hub'); }} />;
    if (task === 'basics') return <TaskBasics id={eid} onBack={() => setTask(null)} />;
    if (task === 'werbung') return <TaskWerbung id={eid} onBack={() => setTask(null)} />;
    if (task === 'vorverkauf') return <TaskVorverkauf id={eid} onBack={() => setTask(null)} />;
    if (task === 'saalplan' && window.SeatingEditor) return <window.SeatingEditor onBack={() => setTask(null)} />;
    if (task === 'programm' && window.TaskProgram) return <window.TaskProgram initial={programStart} onBack={() => setTask(null)} />;
    return <EventHub id={eid} onTask={(t) => { if (['basics', 'programm', 'werbung', 'vorverkauf', 'saalplan'].includes(t)) setTask(t); }} onBack={() => setView('list')} />;
  }

  // ── mobile page ─────────────────────────────────────────────────────────────
  function MEvents({ start = 'list' }) {
    const [view, setView] = useState(start === 'list' ? 'list' : 'hub');
    const [eid, setEid] = useState('prunk');
    const [task, setTask] = useState(['basics', 'programm', 'werbung', 'vorverkauf', 'saalplan'].includes(start) ? start : null);
    if (view === 'list') return <EventList onOpen={(id) => { setEid(id); setTask(null); setView('hub'); }} mobile />;
    if (task === 'basics') return <TaskBasics id={eid} onBack={() => setTask(null)} mobile />;
    if (task === 'werbung') return <TaskWerbung id={eid} onBack={() => setTask(null)} mobile />;
    if (task === 'vorverkauf') return <TaskVorverkauf id={eid} onBack={() => setTask(null)} mobile />;
    if (task === 'saalplan' && window.SeatingEditor) return <window.SeatingEditor mobile onBack={() => setTask(null)} />;
    if (task === 'programm' && window.MProgram) return <window.MProgram onBack={() => setTask(null)} />;
    return <EventHub id={eid} onTask={(t) => { if (['basics', 'programm', 'werbung', 'vorverkauf', 'saalplan'].includes(t)) setTask(t); }} onBack={() => setView('list')} mobile />;
  }

  window.PageEvents = PageEvents;
  window.MEvents = MEvents;
})();
