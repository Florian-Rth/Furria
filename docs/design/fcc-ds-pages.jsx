// fcc-ds-pages.jsx — page bodies for the Club-App.
// Exports renderFccPage(id, ctx) + PAGEMETA. Uses shell primitives off window.

const { T, Ic, Card, Chip, Btn, Avatar, Eyebrow, Title, Progress } = window;

function Sec({ title, action, onAction, children, sub }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 13 }}>
        <div><Title size={19}>{title}</Title>{sub && <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, marginTop: 4 }}>{sub}</div>}</div>
        {action && <span onClick={onAction} style={{ fontWeight: 800, fontSize: 13, color: T.red, cursor: 'pointer', whiteSpace: 'nowrap' }}>{action} →</span>}
      </div>
      {children}
    </div>
  );
}
const Wrap = ({ children }) => <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1320 }}>{children}</div>;

// type colours for schedule items
const TYPE = { training: ['ink', 'Training'], auftritt: ['red', 'Auftritt'], sitzung: ['gold', 'Sitzung'], probe: ['blue', 'Probe'] };

// ════════════ ÜBERSICHT (personal dashboard) ════════════
function PageUebersicht({ go }) {
  const stat = (n, lbl, sub, tone) => (
    <Card style={{ flex: 1 }}><div style={{ fontFamily: T.display, fontSize: 40, lineHeight: 1, color: tone === 'red' ? T.red : tone === 'green' ? T.green : T.ink }}>{n}</div><div style={{ fontWeight: 800, fontSize: 14, marginTop: 8 }}>{lbl}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>{sub}</div></Card>
  );
  const qa = (icon, label, target) => (
    <button onClick={() => go(target)} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9, alignItems: 'flex-start', background: T.panel, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: '15px 16px', cursor: 'pointer', fontFamily: T.font }}>
      <Ic name={icon} size={20} color={T.red} /><span style={{ fontWeight: 800, fontSize: 13.5, color: T.ink, textAlign: 'left' }}>{label}</span>
    </button>
  );
  const week = [
    ['Di', '10.', '17:30', 'Tanzgarde · Training', 'Sporthalle', 'training', true],
    ['Do', '12.', '19:00', 'Stellprobe Prunksitzung', 'Festhalle', 'probe', true],
    ['Fr', '14.', '19:11', 'Große Prunksitzung', 'Festhalle · Bühne 19:41', 'auftritt', true],
    ['So', '16.', '13:11', 'Rosenmontagsumzug', 'Dorfplatz', 'auftritt', false],
  ];
  const feed = [
    ['image', '318 neue Fotos hochgeladen', 'Album „Prunksitzung 2025" · von Markus', 'vor 2 Std', T.red],
    ['clock', 'Spielplan geändert', 'Stellprobe Do beginnt 1 Std früher', 'vor 5 Std', T.gold],
    ['beer', 'Markus hat 2 Kisten gesponsert', 'Bierkasse · +28 Flaschen', 'gestern', T.green],
    ['users', 'Neues Mitglied: Lena Hofer', 'Tanzgarde · freigeschaltet', 'gestern', T.blue],
  ];
  return (
    <Wrap>
      <div><Eyebrow>Dienstag, 10. Februar 2026 · 4 Tage bis zur Prunksitzung</Eyebrow><Title size={34} style={{ marginTop: 5 }}>GROSS FURRIA, ANNA!</Title></div>
      <div style={{ display: 'flex', gap: 16 }}>
        {stat('−12,50 €', 'Mein Bier-Saldo', 'offen · jetzt begleichen', 'red')}
        {stat('6', 'Meine Auftritte', 'diese Session', 'ink')}
        {stat('92 %', 'Anwesenheit', 'Tanzgarde-Training', 'green')}
      </div>
      {/* signature banner — the one bold poster element */}
      <div style={{ position: 'relative', background: T.red, borderRadius: 16, boxShadow: `5px 5px 0 ${T.ink}`, padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, color: '#fff', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', opacity: 0.13 }}><window.KKBroom size={170} color="#fff" band="#fff" /></div>
        <div style={{ position: 'relative' }}>
          <Eyebrow color="rgba(255,255,255,0.9)">Dein nächster Einsatz · in 4 Tagen</Eyebrow>
          <div style={{ fontFamily: T.display, fontSize: 38, lineHeight: 0.95, margin: '6px 0 7px' }}>Auftritt: Große Prunksitzung</div>
          <div style={{ fontWeight: 700, fontSize: 14.5, opacity: 0.95 }}>Tanzgarde · Festhalle · Fr 14. Feb · Aufstellung 19:20 · Bühne 19:41 Uhr</div>
        </div>
        <button onClick={() => go('auftritte')} style={{ position: 'relative', border: 'none', background: '#fff', color: T.red, fontFamily: T.font, fontWeight: 900, fontSize: 15, padding: '14px 22px', borderRadius: 40, cursor: 'pointer', flexShrink: 0, boxShadow: `3px 3px 0 ${T.redDk}` }}>Aufstellung ansehen →</button>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        {qa('beer', 'Strich machen', 'bierliste')}
        {qa('upload', 'Foto hochladen', 'galerie')}
        {qa('calendar', 'Abwesenheit melden', 'spielplan')}
        {qa('clock', 'Zum Spielplan', 'spielplan')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.55fr 1fr', gap: 22, alignItems: 'start' }}>
        <Sec title="Diese Woche" action="Spielplan" onAction={() => go('spielplan')}>
          <Card pad={6}>
            {week.map(([d, dt, t, title, loc, type, me], i) => {
              const [tone, tl] = TYPE[type];
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <div style={{ textAlign: 'center', width: 34, flexShrink: 0 }}><div style={{ fontWeight: 800, fontSize: 11, color: T.faint }}>{d}</div><div style={{ fontFamily: T.display, fontSize: 22, color: T.ink, lineHeight: 1 }}>{dt}</div></div>
                  <div style={{ fontFamily: T.display, fontSize: 18, color: T.ink, width: 58, flexShrink: 0 }}>{t}</div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 15 }}>{title}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>{loc}</div></div>
                  <Chip tone={tone}>{tl}</Chip>
                  {me && <Chip tone="green" dot>Eingeteilt</Chip>}
                </div>
              );
            })}
          </Card>
        </Sec>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Sec title="Bierkasse">
            <Card>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}><div style={{ fontFamily: T.display, fontSize: 32, color: T.ink }}>3,5 <span style={{ fontSize: 16, color: T.sub }}>Kisten übrig</span></div><Chip tone="gold" dot>Knapp</Chip></div>
              <div style={{ margin: '12px 0 6px' }}><Progress value={3.5} max={24} tone="gold" /></div>
              <div style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>≈ 42 Flaschen · von 24 Kisten zu Saisonstart</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: `1px solid ${T.line2}` }}>
                <div><div style={{ fontSize: 12, fontWeight: 700, color: T.sub }}>Dein Saldo</div><div style={{ fontFamily: T.display, fontSize: 22, color: T.red }}>−12,50 €</div></div>
                <Btn primary sm icon="beer" onClick={() => go('bierliste')}>Strich machen</Btn>
              </div>
            </Card>
          </Sec>
          <Sec title="Was ist neu">
            <Card pad={6}>
              {feed.map(([ic, t, s, time, col], i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: col + '1f', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name={ic} size={16} color={col} sw={2} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{t}</div><div style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{s}</div></div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.faint, whiteSpace: 'nowrap' }}>{time}</div>
                </div>
              ))}
            </Card>
          </Sec>
        </div>
      </div>
    </Wrap>
  );
}

// ════════════ BIERLISTE (flagship tool) ════════════
function PageBierliste({ go }) {
  const stat = (icon, n, lbl, tone) => (
    <Card style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><Ic name={icon} size={18} color={tone === 'red' ? T.red : tone === 'green' ? T.green : tone === 'gold' ? '#9a7200' : T.ink} /><Ic name="chevron" size={14} color={T.faint} /></div>
      <div style={{ fontFamily: T.display, fontSize: 34, lineHeight: 1, marginTop: 12, color: tone === 'red' ? T.red : tone === 'green' ? T.green : T.ink }}>{n}</div>
      <div style={{ fontWeight: 700, fontSize: 13, color: T.sub, marginTop: 4 }}>{lbl}</div>
    </Card>
  );
  const rows = [
    ['Anna Brunner', 'AB', 'gold', 25, 0, -12.5, 'offen'],
    ['Markus Veit', 'MV', 'red', 41, 2, 21.0, 'bezahlt'],
    ['Tobias Renz', 'TR', 'ink', 33, 0, -16.5, 'offen'],
    ['Sven Köhler', 'SK', 'gold', 18, 1, 8.5, 'bezahlt'],
    ['Daniel Pfaff', 'DP', 'red', 52, 0, -26.0, 'offen'],
    ['Jonas Bauer', 'JB', 'ink', 27, 3, 34.5, 'bezahlt'],
    ['Lukas Mayr', 'LM', 'gold', 12, 0, -6.0, 'offen'],
    ['Felix Wagner', 'FW', 'red', 38, 1, 4.0, 'bezahlt'],
  ];
  const totStriche = rows.reduce((a, r) => a + r[3], 0), totSpon = rows.reduce((a, r) => a + r[4], 0);
  return (
    <Wrap>
      <div style={{ display: 'flex', gap: 16 }}>
        {stat('beer', '3,5', 'Kisten im Bestand', 'gold')}
        {stat('euro', '+184 €', 'In der Kasse', 'green')}
        {stat('euro', '62 €', 'Offene Beträge', 'red')}
        {stat('star', '14', 'Kisten gesponsert', 'ink')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1fr', gap: 22, alignItems: 'start' }}>
        {/* strichliste table */}
        <Sec title="Strichliste · Session 2026" action="Alle Buchungen" onAction={() => {}}>
          <Card pad={0} style={{ overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr 0.9fr 0.9fr 0.9fr', alignItems: 'center', padding: '12px 18px', background: T.panel2, borderBottom: `1.5px solid ${T.line}`, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: T.sub, textTransform: 'uppercase' }}>
              <div>Mitglied</div><div style={{ textAlign: 'right' }}>Striche</div><div style={{ textAlign: 'right' }}>Gesponsert</div><div style={{ textAlign: 'right' }}>Saldo</div><div style={{ textAlign: 'right' }}>Status</div>
            </div>
            {rows.map(([name, ini, tone, striche, spon, saldo, status], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr 0.9fr 0.9fr 0.9fr', alignItems: 'center', padding: '12px 18px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar initials={ini} tone={tone} size={32} /><span style={{ fontWeight: 800, fontSize: 14 }}>{name}</span></div>
                <div style={{ textAlign: 'right', fontFamily: T.display, fontSize: 19, color: T.ink }}>{striche}</div>
                <div style={{ textAlign: 'right', fontWeight: 700, fontSize: 14, color: spon ? T.green : T.faint }}>{spon ? spon + ' Ki.' : '—'}</div>
                <div style={{ textAlign: 'right', fontFamily: T.display, fontSize: 18, color: saldo < 0 ? T.red : T.green }}>{saldo < 0 ? '−' : '+'}{Math.abs(saldo).toFixed(2)} €</div>
                <div style={{ textAlign: 'right' }}><Chip tone={status === 'bezahlt' ? 'green' : 'red'} dot>{status === 'bezahlt' ? 'Bezahlt' : 'Offen'}</Chip></div>
              </div>
            ))}
            <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 0.8fr 0.9fr 0.9fr 0.9fr', alignItems: 'center', padding: '13px 18px', background: T.panel2, borderTop: `1.5px solid ${T.line}`, fontWeight: 800 }}>
              <div style={{ fontSize: 13, color: T.sub }}>Gesamt · 8 Mitglieder</div>
              <div style={{ textAlign: 'right', fontFamily: T.display, fontSize: 19 }}>{totStriche}</div>
              <div style={{ textAlign: 'right', fontSize: 14, color: T.green }}>{totSpon} Ki.</div>
              <div style={{ textAlign: 'right', fontFamily: T.display, fontSize: 18, color: T.red }}>−62 €</div>
              <div />
            </div>
          </Card>
        </Sec>
        {/* right column: bestand + buchungen */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Sec title="Bestand">
            <Card>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><div style={{ fontFamily: T.display, fontSize: 44, color: T.ink, lineHeight: 1 }}>3,5</div><div style={{ fontWeight: 800, fontSize: 15, color: T.sub }}>Kisten · ≈ 42 Fl.</div></div>
              <div style={{ margin: '14px 0 8px' }}><Progress value={3.5} max={24} tone="gold" h={10} /></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, color: T.sub }}><span>von 24 Ki. Saisonstart</span><span>15 % übrig</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(244,180,0,0.12)', border: `1.5px solid rgba(244,180,0,0.4)`, borderRadius: 11, padding: '11px 13px', marginTop: 15 }}>
                <Ic name="bolt" size={18} color="#9a7200" fill="#9a7200" /><span style={{ fontWeight: 800, fontSize: 13, color: '#7c5c00' }}>Nur noch 3,5 Kisten — nachbestellen!</span>
              </div>
              <div style={{ display: 'flex', gap: 9, marginTop: 14 }}><Btn primary sm icon="plus" style={{ flex: 1, justifyContent: 'center' }}>Nachbuchen</Btn><Btn ghost sm icon="star" style={{ flex: 1, justifyContent: 'center' }}>Sponsern</Btn></div>
            </Card>
          </Sec>
          <Sec title="Letzte Buchungen">
            <Card pad={6}>
              {[['Anna B.', '1 Strich', 'vor 8 Min', T.ink], ['Markus V.', '2 Kisten gesponsert', 'vor 1 Std', T.green], ['Tobias R.', '12,50 € bezahlt', 'vor 2 Std', T.green], ['Daniel P.', '3 Striche', 'gestern', T.ink]].map(([n, a, t, col], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '11px 13px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <div style={{ width: 8, height: 8, borderRadius: 5, background: col, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}><span style={{ fontWeight: 800, fontSize: 13.5 }}>{n}</span> <span style={{ fontSize: 13, color: T.sub, fontWeight: 600 }}>· {a}</span></div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: T.faint }}>{t}</div>
                </div>
              ))}
            </Card>
          </Sec>
        </div>
      </div>
    </Wrap>
  );
}

// ════════════ SPIELPLAN (shared scheduler) ════════════
function PageSpielplan({ role }) {
  const days = [
    ['Dienstag', '10. Feb', [['17:30', 'Tanzgarde · Training', 'Sporthalle', 'training'], ['19:00', 'Männerballett · Training', 'Vereinsraum', 'training'], ['20:30', 'Elferrat-Probe', 'Vereinsraum', 'probe']]],
    ['Donnerstag', '12. Feb', [['18:00', 'Stellprobe (früher!)', 'Festhalle', 'probe'], ['20:00', 'Garde + Ballett · Generalprobe', 'Festhalle', 'probe']]],
    ['Freitag', '14. Feb', [['19:11', 'Große Prunksitzung', 'Festhalle · Bühne ab 19:41', 'auftritt']]],
    ['Sonntag', '16. Feb', [['13:11', 'Rosenmontagsumzug', 'Dorfplatz', 'auftritt']]],
  ];
  const filters = ['Alle', 'Tanzgarde', 'Männerballett', 'Auftritte'];
  return (
    <Wrap>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8 }}>{filters.map((f, i) => <button key={f} style={{ border: `1.5px solid ${i === 0 ? T.ink : T.line}`, background: i === 0 ? T.ink : 'transparent', color: i === 0 ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 13, padding: '8px 15px', borderRadius: 30, cursor: 'pointer' }}>{f}</button>)}</div>
        <div style={{ display: 'flex', gap: 16, fontSize: 12, fontWeight: 700, color: T.sub }}>{[['training', 'Training'], ['probe', 'Probe'], ['auftritt', 'Auftritt'], ['sitzung', 'Sitzung']].map(([t, l]) => { const [tn] = TYPE[t]; const c = tn === 'red' ? T.red : tn === 'gold' ? T.gold : tn === 'blue' ? T.blue : T.ink; return <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 5, background: c }} />{l}</span>; })}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {days.map(([day, date, items]) => (
          <div key={day}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 9 }}><Title size={16}>{day.toUpperCase()}</Title><span style={{ fontSize: 13, fontWeight: 700, color: T.sub }}>{date}</span></div>
            <Card pad={6}>
              {items.map(([time, title, loc, type], i) => {
                const [tone, tl] = TYPE[type]; const c = tone === 'red' ? T.red : tone === 'gold' ? T.gold : tone === 'blue' ? T.blue : T.ink;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                    <div style={{ width: 4, alignSelf: 'stretch', borderRadius: 4, background: c, flexShrink: 0 }} />
                    <div style={{ fontFamily: T.display, fontSize: 20, color: T.ink, width: 62, flexShrink: 0 }}>{time}</div>
                    <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 15.5 }}>{title}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>{loc}</div></div>
                    <Chip tone={tone}>{tl}</Chip>
                    {role === 'vorstand'
                      ? <Btn ghost sm icon="settings">Bearbeiten</Btn>
                      : <Btn ghost sm icon="check">Anwesend</Btn>}
                  </div>
                );
              })}
            </Card>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

// ════════════ GALERIE ════════════
function PageGalerie() {
  const albums = [['Prunksitzung 2025', '318 Fotos', 'red'], ['Rosenmontagsumzug', '204 Fotos', 'gold'], ['Maskenball', '156 Fotos', 'ink'], ['Kinderfasching', '98 Fotos', 'red'], ['Gardetreffen', '141 Fotos', 'gold'], ['Sommerfest 2025', '267 Fotos', 'ink']];
  const c = window.KK.light;
  return (
    <Wrap>
      <Sec title="Alben · 6" sub="Alle Mitglieder können Fotos ansehen und hochladen">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
          {albums.map(([t, n, tone], i) => (
            <Card key={i} pad={0} style={{ overflow: 'hidden', cursor: 'pointer' }}>
              <window.KKPlh h={150} label={t.toLowerCase().replace(/ /g, '-')} c={c} tint={tone === 'red' ? T.red : tone === 'gold' ? T.gold : T.ink} />
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><div><div style={{ fontWeight: 800, fontSize: 15 }}>{t}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>{n}</div></div><Ic name="chevron" size={17} color={T.faint} /></div>
            </Card>
          ))}
        </div>
      </Sec>
    </Wrap>
  );
}

// ════════════ MITGLIEDER (admin) ════════════
function PageMitglieder() {
  const rows = [
    ['Anna Brunner', 'AB', 'gold', ['Tanzgarde'], 'Vorstand', 'bezahlt'],
    ['Markus Veit', 'MV', 'red', ['Männerballett', 'Elferrat'], 'Mitglied', 'bezahlt'],
    ['Tobias Renz', 'TR', 'ink', ['Männerballett'], 'Mitglied', 'offen'],
    ['Lena Hofer', 'LH', 'gold', ['Tanzgarde'], 'Mitglied', 'neu'],
    ['Sven Köhler', 'SK', 'red', ['Elferrat'], 'Kassier', 'bezahlt'],
    ['Daniel Pfaff', 'DP', 'ink', ['Spielmannszug'], 'Mitglied', 'offen'],
    ['Jonas Bauer', 'JB', 'gold', ['Männerballett'], 'Mitglied', 'bezahlt'],
  ];
  return (
    <Wrap>
      <Sec title="Mitglieder · 184 aktiv" sub="Stammdaten, Rollen und Gruppen-Zuordnung verwalten">
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 0.9fr', padding: '12px 18px', background: T.panel2, borderBottom: `1.5px solid ${T.line}`, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: T.sub, textTransform: 'uppercase' }}>
            <div>Name</div><div>Gruppen</div><div>Rolle</div><div style={{ textAlign: 'right' }}>Beitrag</div>
          </div>
          {rows.map(([name, ini, tone, groups, rolle, beitrag], i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.6fr 1fr 0.9fr', alignItems: 'center', padding: '12px 18px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}><Avatar initials={ini} tone={tone} size={32} /><span style={{ fontWeight: 800, fontSize: 14 }}>{name}</span></div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{groups.map((g) => <Chip key={g} tone="neutral">{g}</Chip>)}</div>
              <div style={{ fontWeight: 700, fontSize: 13.5, color: rolle === 'Mitglied' ? T.sub : T.ink }}>{rolle}</div>
              <div style={{ textAlign: 'right' }}><Chip tone={beitrag === 'bezahlt' ? 'green' : beitrag === 'neu' ? 'blue' : 'red'} dot>{beitrag === 'bezahlt' ? 'Bezahlt' : beitrag === 'neu' ? 'Neu' : 'Offen'}</Chip></div>
            </div>
          ))}
        </Card>
      </Sec>
    </Wrap>
  );
}

// ════════════ COCKPIT (admin) ════════════
function PageCockpit({ go }) {
  const kpi = (n, lbl, sub, tone) => <Card style={{ flex: 1 }}><div style={{ fontFamily: T.display, fontSize: 36, color: tone === 'red' ? T.red : tone === 'green' ? T.green : T.ink, lineHeight: 1 }}>{n}</div><div style={{ fontWeight: 800, fontSize: 13.5, marginTop: 7 }}>{lbl}</div><div style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{sub}</div></Card>;
  const tiles = [['users', 'Mitglieder verwalten', 'Stammdaten, Rollen, Gruppen', 'mitglieder'], ['star', 'Veranstaltung planen', 'Ablauf & Reihenfolge', 'veranstaltungen'], ['grid', 'Saalplan-Editor', 'Tische & Stühle', 'einstellungen'], ['chart', 'Statistik', 'Auswertungen', 'statistik'], ['key', 'Schlüssel-Verwaltung', '14 Schlüssel · 9 vergeben', 'einstellungen'], ['settings', 'Einstellungen', 'Verein & App', 'einstellungen']];
  const todos = [['12 Beiträge offen', 'Mahnung versenden', 'red'], ['Saalplan Prunksitzung freigeben', 'für Ticketshop', 'gold'], ['3 neue Mitglieder freischalten', 'Lena, Paul, Mira', 'blue']];
  return (
    <Wrap>
      <div style={{ display: 'flex', gap: 16 }}>
        {kpi('184', 'Aktive Mitglieder', '+3 diese Woche', 'ink')}
        {kpi('1.240 €', 'Beiträge offen', '12 Mitglieder', 'red')}
        {kpi('4 Tage', 'Nächste Veranstaltung', 'Große Prunksitzung', 'ink')}
        {kpi('+184 €', 'Bierkasse', '3,5 Kisten Bestand', 'green')}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 22, alignItems: 'start' }}>
        <Sec title="Verwaltung">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {tiles.map(([icon, t, s, target], i) => (
              <Card key={i} onClick={() => go(target)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic name={icon} size={21} color={T.red} sw={2} /></div>
                <div><div style={{ fontWeight: 800, fontSize: 14.5 }}>{t}</div><div style={{ fontSize: 12, fontWeight: 600, color: T.sub, marginTop: 2 }}>{s}</div></div>
              </Card>
            ))}
          </div>
        </Sec>
        <Sec title="Aufgaben">
          <Card pad={6}>
            {todos.map(([t, s, col], i) => {
              const c = col === 'red' ? T.red : col === 'gold' ? T.gold : T.blue;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
                  <div style={{ width: 9, height: 9, borderRadius: 5, background: c, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{t}</div><div style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{s}</div></div>
                  <Ic name="chevron" size={16} color={T.faint} />
                </div>
              );
            })}
          </Card>
        </Sec>
      </div>
    </Wrap>
  );
}

// ════════════ LIVE-COCKPIT ════════════
function PageLive() {
  const order = [
    ['1', 'Einmarsch Elferrat', '19:11', 'done'], ['2', 'Begrüßung Sitzungspräsident', '19:18', 'done'],
    ['3', 'Tanzgarde · Gardetanz', '19:26', 'done'], ['4', 'Büttenrede „Dr. Schnabel"', '19:38', 'done'],
    ['5', 'Männerballett · Schautanz', '19:48', 'live'], ['6', 'Tanzmariechen Solo', '20:02', 'next'],
    ['7', 'Gastverein Großbach', '20:14', 'wait'], ['8', 'Männerballett · Zugabe', '20:30', 'wait'],
  ];
  const ST = { done: ['green', 'Erledigt'], live: ['red', 'Läuft'], next: ['gold', 'Gleich'], wait: ['neutral', 'Wartet'] };
  return (
    <Wrap>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span className="fcc-live" style={{ width: 11, height: 11, borderRadius: 6, background: T.red }} /><Title size={22}>GROSSE PRUNKSITZUNG · LIVE</Title></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.display, fontSize: 24, color: T.ink }}><Ic name="clock" size={20} color={T.sub} /> 19:51 Uhr</div>
      </div>
      {/* now + next */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18 }}>
        <div style={{ background: T.ink, color: T.cream, borderRadius: 16, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
          <Eyebrow color={T.red}>● Jetzt auf der Bühne · seit 3 Min</Eyebrow>
          <div style={{ fontFamily: T.display, fontSize: 42, lineHeight: 0.95, margin: '8px 0 6px' }}>Männerballett</div>
          <div style={{ fontWeight: 700, fontSize: 15, color: 'rgba(251,244,230,0.7)' }}>Programmpunkt 5 von 8 · Schautanz „Bauarbeiter"</div>
        </div>
        <Card style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div><Eyebrow color={T.sub}>Gleich · in 8 Min</Eyebrow><div style={{ fontFamily: T.display, fontSize: 26, color: T.ink, margin: '6px 0 3px' }}>Tanzmariechen Solo</div><div style={{ fontSize: 13, fontWeight: 600, color: T.sub }}>Bühne 20:02 Uhr</div></div>
          <Btn primary icon="broadcast" style={{ marginTop: 14, justifyContent: 'center' }}>Aufruf: „In 10 Min auf die Bühne"</Btn>
        </Card>
      </div>
      <Sec title="Ablaufplan">
        <Card pad={6}>
          {order.map(([n, t, time, status], i) => {
            const [tone, lbl] = ST[status]; const active = status === 'live';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '13px 16px', borderTop: i ? `1px solid ${T.line2}` : 'none', background: active ? 'rgba(225,29,42,0.05)' : 'transparent', borderRadius: active ? 10 : 0 }}>
                <div style={{ fontFamily: T.display, fontSize: 18, color: T.faint, width: 22, flexShrink: 0 }}>{n}</div>
                <div style={{ fontFamily: T.display, fontSize: 17, color: T.ink, width: 58, flexShrink: 0 }}>{time}</div>
                <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 15, color: status === 'wait' ? T.sub : T.ink }}>{t}</div>
                <Chip tone={tone} dot={active}>{lbl}</Chip>
              </div>
            );
          })}
        </Card>
      </Sec>
    </Wrap>
  );
}

// ── empty state for not-yet-built views ──
function PagePlaceholder({ id }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><Ic name="bolt" size={28} color={T.faint} /></div>
        <Title size={22}>Bald verfügbar</Title>
        <p style={{ fontSize: 14, fontWeight: 600, color: T.sub, lineHeight: 1.5, marginTop: 8 }}>„{PAGEMETA[id] ? PAGEMETA[id].title : id}" ist im Design-Prototyp noch als Platzhalter angelegt — das Layout-System und der Look stehen aber bereits.</p>
      </div>
    </div>
  );
}

const PAGEMETA = {
  uebersicht: { title: 'Übersicht', sub: 'Dein persönlicher Vereins-Überblick' },
  auftritte: { title: 'Meine Auftritte', sub: 'Aufstellungen und Einsätze dieser Session' },
  spielplan: { title: 'Spielplan', sub: 'Training, Proben & Auftritte — alle Gruppen', action: 'Termin anlegen' },
  galerie: { title: 'Galerie', sub: 'Fotos aller Veranstaltungen', action: 'Hochladen' },
  bierliste: { title: 'Bierliste', sub: 'Meine Kisten, offener Betrag & Sponsoren' },
  getraenke: { title: 'Getränkekasse', sub: 'Kasse, Bestand & Abrechnung · Amt Getränkewart' },
  shop: { title: 'Klamotten-Shop', sub: 'Vereinskleidung bestellen · Meine Bestellungen' },
  shop_manage: { title: 'Shop-Verwaltung', sub: 'Sammelbestellung, Ausgabe & Sortiment · Amt Kleidung' },
  cockpit: { title: 'Vorstand · Cockpit', sub: 'Verwaltung und Überblick' },
  mitglieder: { title: 'Mitglieder-Management', sub: 'Stammdaten, Gruppen, Ämter & Account' },
  gruppen: { title: 'Gruppen', sub: 'Gruppen anlegen, bearbeiten & Mitglieder zuordnen' },
  roles: { title: 'Ämter & Rechte', sub: 'Nur Admin · Rollen & Rechte je Amt' },
  veranstaltungen: { title: 'Veranstaltungen', sub: 'Saison planen · Status & Aufgaben je Veranstaltung' },
  fees: { title: 'Beiträge & Kasse', sub: 'Kasse, Beiträge & Auswertungen · Amt Finanzen' },
  statistik: { title: 'Statistik', sub: 'Auswertungen & Kennzahlen' },
  einstellungen: { title: 'Einstellungen', sub: 'Verein & App' },
  live: { title: 'Live-Regie', sub: 'Live-Ablauf der laufenden Veranstaltung · Regie' },
};

function renderFccPage(id, ctx) {
  switch (id) {
    case 'uebersicht': return <PageUebersicht {...ctx} />;
    case 'bierliste': return window.PageDrinks ? <window.PageDrinks {...ctx} /> : <PageBierliste {...ctx} />;
    case 'getraenke': return window.PageDrinksAdmin ? <window.PageDrinksAdmin {...ctx} /> : <PagePlaceholder id={id} />;
    case 'spielplan': return <PageSpielplan {...ctx} />;
    case 'galerie': return <PageGalerie {...ctx} />;
    case 'mitglieder': return window.PageMembersManage ? <window.PageMembersManage {...ctx} /> : <PageMitglieder {...ctx} />;
    case 'gruppen': return window.PageGroups ? <window.PageGroups {...ctx} /> : <PagePlaceholder id={id} />;
    case 'roles': return window.PageRoles ? <window.PageRoles {...ctx} /> : <PagePlaceholder id={id} />;
    case 'cockpit': return <PageCockpit {...ctx} />;
    case 'veranstaltungen': return window.PageEvents ? <window.PageEvents {...ctx} /> : <PagePlaceholder id={id} />;
    case 'fees': return window.PageFees ? <window.PageFees {...ctx} /> : <PagePlaceholder id={id} />;
    case 'shop': return window.PageShop ? <window.PageShop {...ctx} /> : <PagePlaceholder id={id} />;
    case 'shop_manage': return window.PageShopManage ? <window.PageShopManage {...ctx} /> : <PagePlaceholder id={id} />;
    case 'live': return window.PageLive ? <window.PageLive {...ctx} /> : <PageLive {...ctx} />;
    default: return <PagePlaceholder id={id} />;
  }
}

Object.assign(window, { renderFccPage, PAGEMETA });
