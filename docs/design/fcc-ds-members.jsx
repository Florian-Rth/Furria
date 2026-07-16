// fcc-ds-members.jsx — Mitglieder-Management (/members/manage).
// The root data surface: member list ⇄ member detail/edit. Composes the system
// (window.T tokens + primitives); no new styles. Exports window.PageMembersManage.

(function () {
  const { T, Ic, Card, Chip, Btn, Avatar, Title, Eyebrow, Progress } = window;
  const { useState } = React;

  // ── data ──────────────────────────────────────────────────────────────────
  const GROUPS = ['Garde', 'Biergarde', 'Die heißen Öfen', 'Die frechen Füchtchen', 'Die Furrschen Perlen', 'Tommi & Christoph', 'Das Goldbörnchen Trio'];
  const KEYS = ['Sporthalle', 'Vereinsraum', 'Lager (Halle)', 'Lager (Vereinsraum)'];

  // [id, first, last, ini, tone, art, groups, displayTitle, aemter, beitrag, account, drinks, consent, keys, since, birthday, phone, email]
  const M = [
    ['m1', 'Petra', 'Sänger', 'PS', 'red', 'Aktiv', ['Garde'], 'Vorstand · Präsidentin', ['Präsidentin'], 'bezahlt', 'aktiv', false, true, ['Vereinsraum', 'Sporthalle'], 2009, '14.03.1986', '0170 1234567', 'petra@example.de'],
    ['m2', 'Robert', 'Stark', 'RS', 'ink', 'Aktiv', ['Die heißen Öfen'], 'Vorstand · Präsident', ['Präsident'], 'bezahlt', 'aktiv', true, true, ['Vereinsraum'], 2007, '02.11.1981', '0171 2345678', 'robert@example.de'],
    ['m3', 'Mira', 'Lang', 'ML', 'gold', 'Jugend', ['Die frechen Füchtchen'], 'Kinderpräsidentin', ['Kinderpräsidentin'], 'bezahlt', 'eingeladen', false, true, [], 2021, '20.07.2012', '—', '—'],
    ['m4', 'Anna', 'Brunner', 'AB', 'gold', 'Aktiv', ['Garde', 'Die Furrschen Perlen'], 'Vorstand · Schriftführerin', ['Schriftführerin'], 'bezahlt', 'aktiv', false, true, ['Vereinsraum'], 2012, '08.05.1990', '0172 3456789', 'anna@example.de'],
    ['m5', 'Sven', 'Köhler', 'SK', 'red', 'Aktiv', ['Biergarde'], 'Vorstand · Finanzen', ['Finanzen'], 'bezahlt', 'aktiv', true, true, ['Lager (Vereinsraum)'], 2010, '30.01.1984', '0173 4567890', 'sven@example.de'],
    ['m6', 'Markus', 'Veit', 'MV', 'ink', 'Aktiv', ['Biergarde', 'Die heißen Öfen'], 'Getränkewart', ['Getränkewart'], 'bezahlt', 'aktiv', true, true, ['Sporthalle', 'Lager (Halle)'], 2011, '17.09.1987', '0174 5678901', 'markus@example.de'],
    ['m7', 'Christoph', 'Mayr', 'CM', 'gold', 'Aktiv', ['Tommi & Christoph', 'Garde'], 'Trainer · Garde', ['Trainer · Garde'], 'bezahlt', 'aktiv', true, true, [], 2008, '12.06.1983', '0175 6789012', 'christoph@example.de'],
    ['m8', 'Jonas', 'Bauer', 'JB', 'red', 'Aktiv', ['Die heißen Öfen', 'Biergarde'], 'Fotograf', ['Fotograf'], 'offen', 'aktiv', true, true, [], 2015, '25.12.1992', '0176 7890123', 'jonas@example.de'],
    ['m9', 'Tobias', 'Renz', 'TR', 'ink', 'Aktiv', ['Die heißen Öfen'], 'Die heißen Öfen', [], 'offen', 'aktiv', true, true, [], 2016, '03.04.1994', '0177 8901234', 'tobias@example.de'],
    ['m10', 'Lena', 'Hofer', 'LH', 'gold', 'Jugend', ['Die frechen Füchtchen'], 'Die frechen Füchtchen', [], 'bezahlt', 'eingeladen', false, false, [], 2023, '09.02.2011', '—', 'lena@example.de'],
    ['m11', 'Daniel', 'Pfaff', 'DP', 'red', 'Aktiv', ['Das Goldbörnchen Trio'], 'Das Goldbörnchen Trio', [], 'offen', 'keiner', true, true, [], 2018, '21.08.1989', '0178 9012345', '—'],
    ['m12', 'Karl', 'Furtwängler', 'KF', 'ink', 'Ehrenmitglied', [], 'Ehrenmitglied', [], 'bezahlt', 'keiner', false, false, [], 1974, '11.11.1948', '09232 4455', '—'],
    ['m13', 'Felix', 'Wagner', 'FW', 'gold', 'Passiv', [], 'Passiv', [], 'bezahlt', 'keiner', false, false, [], 2019, '06.10.1979', '—', '—'],
  ];
  const key = (a) => ({ id: a[0], first: a[1], last: a[2], ini: a[3], tone: a[4], art: a[5], groups: a[6], title: a[7], aemter: a[8], beitrag: a[9], account: a[10], drinks: a[11], consent: a[12], keys: a[13], since: a[14], birthday: a[15], phone: a[16], email: a[17] });
  const MEMBERS = M.map(key);

  const ART_TONE = { Aktiv: 'ink', Passiv: 'neutral', Jugend: 'blue', Ehrenmitglied: 'gold' };
  const BEITRAG = { bezahlt: ['green', 'Bezahlt'], offen: ['red', 'Offen'] };
  const ACCOUNT = { aktiv: ['green', 'Account aktiv'], eingeladen: ['gold', 'Eingeladen'], keiner: ['neutral', 'Kein Account'] };
  const beitragEuro = (art) => (art === 'Jugend' ? '15 €' : art === 'Ehrenmitglied' ? '0 €' : '30 €');

  // ── small UI bits ───────────────────────────────────────────────────────────
  function StatTile({ n, label, tone }) {
    return <Card style={{ flex: 1 }}><div style={{ fontFamily: T.display, fontSize: 30, lineHeight: 1, color: tone === 'red' ? T.red : tone === 'green' ? T.green : T.ink }}>{n}</div><div style={{ fontWeight: 700, fontSize: 12.5, color: T.sub, marginTop: 5 }}>{label}</div></Card>;
  }
  function Field({ label, value, mono }) {
    return <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.faint, textTransform: 'uppercase' }}>{label}</div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 3, color: value === '—' ? T.faint : T.ink, fontFamily: mono ? 'ui-monospace, monospace' : T.font }}>{value}</div></div>;
  }
  function Toggle({ on, label, sub, onClick }) {
    return (
      <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 14px', background: T.panel2, border: `1px solid ${T.line2}`, borderRadius: 12, cursor: 'pointer' }}>
        <div style={{ width: 40, height: 24, borderRadius: 20, background: on ? T.green : 'rgba(26,20,17,0.18)', position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
          <div style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 20, height: 20, borderRadius: 12, background: '#fff', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{label}</div><div style={{ fontSize: 11.5, fontWeight: 600, color: T.sub }}>{sub}</div></div>
      </div>
    );
  }
  function Panel({ title, action, onAction, children }) {
    return (
      <Card pad={18}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
          <Title size={15}>{title}</Title>
          {action && <span onClick={onAction} style={{ fontWeight: 800, fontSize: 12.5, color: T.red, cursor: 'pointer' }}>{action}</span>}
        </div>
        {children}
      </Card>
    );
  }

  // ── LIST ────────────────────────────────────────────────────────────────────
  function MemberList({ onOpen }) {
    const [q, setQ] = useState('');
    const [art, setArt] = useState('Alle');
    const [quick, setQuick] = useState(null); // 'offen' | 'noacc'
    const arts = ['Alle', 'Aktiv', 'Passiv', 'Jugend', 'Ehrenmitglied'];
    const rows = MEMBERS.filter((m) => (art === 'Alle' || m.art === art)
      && (q === '' || (m.first + ' ' + m.last).toLowerCase().includes(q.toLowerCase()))
      && (quick !== 'offen' || m.beitrag === 'offen')
      && (quick !== 'noacc' || m.account === 'keiner'));
    const COLS = '2fr 1fr 1.7fr 1.3fr 1fr 1.1fr 28px';
    const qbtn = (id, label) => (
      <button onClick={() => setQuick(quick === id ? null : id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1.5px solid ${quick === id ? T.red : T.line}`, background: quick === id ? 'rgba(225,29,42,0.08)' : 'transparent', color: quick === id ? T.red : T.sub, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, padding: '8px 13px', borderRadius: 30, cursor: 'pointer' }}>{label}</button>
    );
    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1320 }}>
        <div style={{ display: 'flex', gap: 14 }}>
          <StatTile n="184" label="Mitglieder" tone="ink" />
          <StatTile n="142" label="mit App-Account" tone="ink" />
          <StatTile n="12" label="Beiträge offen" tone="red" />
          <StatTile n="6" label="Einladungen offen" tone="ink" />
        </div>

        {/* toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 40, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 15px', background: T.panel, flex: 1, minWidth: 220, maxWidth: 300 }}>
            <Ic name="search" size={16} color={T.faint} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mitglied suchen …" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, flex: 1, minWidth: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {arts.map((a) => (
              <button key={a} onClick={() => setArt(a)} style={{ border: `1.5px solid ${art === a ? T.ink : T.line}`, background: art === a ? T.ink : 'transparent', color: art === a ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, padding: '8px 14px', borderRadius: 30, cursor: 'pointer' }}>{a}</button>
            ))}
          </div>
          <div style={{ width: 1, height: 22, background: T.line }} />
          {qbtn('offen', 'Beitrag offen')}
          {qbtn('noacc', 'ohne Account')}
          <div style={{ flex: 1 }} />
          <Btn ghost sm icon="upload">Einladen</Btn>
          <Btn primary sm icon="plus">Mitglied hinzufügen</Btn>
        </div>

        {/* table */}
        <Card pad={0} style={{ overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '12px 18px', background: T.panel2, borderBottom: `1.5px solid ${T.line}`, fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: T.sub, textTransform: 'uppercase' }}>
            <div>Mitglied</div><div>Mitgliedschaft</div><div>Gruppen</div><div>Ämter</div><div>Beitrag</div><div>Account</div><div />
          </div>
          {rows.map((m, i) => (
            <div key={m.id} onClick={() => onOpen(m.id)} className="fcc-mrow" style={{ display: 'grid', gridTemplateColumns: COLS, alignItems: 'center', padding: '11px 18px', borderTop: i ? `1px solid ${T.line2}` : 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                <Avatar initials={m.ini} tone={m.tone} size={34} />
                <div style={{ minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.first} {m.last}</div><div style={{ fontSize: 11.5, fontWeight: 600, color: T.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div></div>
              </div>
              <div><Chip tone={ART_TONE[m.art]}>{m.art}</Chip></div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {m.groups.slice(0, 2).map((g) => <Chip key={g} tone="neutral">{g}</Chip>)}
                {m.groups.length > 2 && <Chip tone="neutral">+{m.groups.length - 2}</Chip>}
                {m.groups.length === 0 && <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>—</span>}
              </div>
              <div>{m.aemter.length ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic name="key" size={14} color="#9a7200" sw={2} /><span style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.aemter[0]}{m.aemter.length > 1 ? ` +${m.aemter.length - 1}` : ''}</span></span> : <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>—</span>}</div>
              <div><Chip tone={BEITRAG[m.beitrag][0]} dot>{BEITRAG[m.beitrag][1]}</Chip></div>
              <div><Chip tone={ACCOUNT[m.account][0]} dot={m.account !== 'keiner'}>{ACCOUNT[m.account][1]}</Chip></div>
              <div style={{ textAlign: 'right' }}><Ic name="chevron" size={16} color={T.faint} /></div>
            </div>
          ))}
          {rows.length === 0 && <div style={{ padding: '34px', textAlign: 'center', color: T.sub, fontWeight: 600, fontSize: 14 }}>Keine Mitglieder gefunden.</div>}
          {rows.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', background: T.panel2, borderTop: `1.5px solid ${T.line}` }}>
              <span style={{ fontSize: 12.5, fontWeight: 700, color: T.sub }}>{rows.length} von 184 Mitgliedern</span>
              <span style={{ fontWeight: 800, fontSize: 12.5, color: T.red, cursor: 'pointer' }}>Mehr laden</span>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // ── DETAIL ──────────────────────────────────────────────────────────────────
  function MemberDetail({ id, onBack }) {
    const m = MEMBERS.find((x) => x.id === id) || MEMBERS[0];
    const [edit, setEdit] = useState(false);
    const [drinks, setDrinks] = useState(m.drinks);
    const [consent, setConsent] = useState(m.consent);
    const otherGroups = GROUPS.filter((g) => !m.groups.includes(g));

    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1320 }}>
        {/* breadcrumb + actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub }}>
            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span> Mitglieder-Management
          </button>
          <div style={{ display: 'flex', gap: 9 }}>
            {m.account === 'keiner' && <Btn ghost sm icon="upload">Zur App einladen</Btn>}
            {m.account === 'eingeladen' && <Btn ghost sm icon="upload">Einladung erneut senden</Btn>}
            <Btn primary={!edit} ghost={edit} sm icon={edit ? 'check' : 'settings'} onClick={() => setEdit((v) => !v)}>{edit ? 'Fertig' : 'Bearbeiten'}</Btn>
          </div>
        </div>

        {/* header card */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Avatar initials={m.ini} tone={m.tone} size={64} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title size={26}>{m.first} {m.last}</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
                <Chip tone={ART_TONE[m.art]}>{m.art}</Chip>
                {m.aemter.map((a) => <Chip key={a} tone="red" dot>{a}</Chip>)}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>· Mitglied seit {m.since}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.faint, textTransform: 'uppercase' }}>Anzeige-Titel</div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, marginTop: 4, fontWeight: 800, fontSize: 14 }}>{m.title}{edit && <Ic name="chevdown" size={15} color={T.faint} />}</div>
            </div>
          </div>
        </Card>

        {/* two columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Panel title="Stammdaten" action={edit ? 'Bearbeiten' : null}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Field label="Vorname" value={m.first} />
                <Field label="Nachname" value={m.last} />
                <Field label="Geburtsdatum" value={m.birthday} />
                <Field label="Mitglied seit" value={String(m.since)} />
                <Field label="Telefon" value={m.phone} mono />
                <Field label="E-Mail" value={m.email} mono />
              </div>
            </Panel>

            <Panel title="Mitgliedschaft & Beitrag">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.faint, textTransform: 'uppercase' }}>Art</div><div style={{ marginTop: 5 }}><Chip tone={ART_TONE[m.art]}>{m.art}</Chip></div></div>
                <div style={{ textAlign: 'center' }}><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.faint, textTransform: 'uppercase' }}>Jahresbeitrag</div><div style={{ fontFamily: T.display, fontSize: 24, marginTop: 3 }}>{beitragEuro(m.art)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.faint, textTransform: 'uppercase' }}>Saison 2026</div><div style={{ marginTop: 5 }}><Chip tone={BEITRAG[m.beitrag][0]} dot>{BEITRAG[m.beitrag][1]}</Chip></div></div>
              </div>
              {m.beitrag === 'offen' && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.line2}` }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>Zahlung wird über die Beitragsverwaltung erfasst.</span>
                  <Btn sm ghost icon="euro">Als bezahlt markieren</Btn>
                </div>
              )}
            </Panel>

            <Panel title="Account & Login">
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: m.account === 'aktiv' ? 'rgba(46,158,91,0.13)' : m.account === 'eingeladen' ? 'rgba(244,180,0,0.16)' : 'rgba(26,20,17,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Ic name={m.account === 'keiner' ? 'users' : 'check'} size={18} color={m.account === 'aktiv' ? T.green : m.account === 'eingeladen' ? '#9a7200' : T.faint} sw={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{ACCOUNT[m.account][1]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>{m.account === 'aktiv' ? 'Login aktiv · Benutzername ' + m.first.toLowerCase() + '.' + m.last.toLowerCase() : m.account === 'eingeladen' ? 'Einladung versendet, noch nicht aktiviert' : 'Mitglied ohne App-Zugang (im Datensatz geführt)'}</div>
                </div>
                {m.account === 'aktiv' && <Btn sm ghost icon="key">Passwort-Reset-Link</Btn>}
                {m.account === 'keiner' && <Btn sm primary icon="upload">Einladen</Btn>}
              </div>
            </Panel>
          </div>

          {/* RIGHT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Panel title="Gruppen">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {m.groups.map((g) => (
                  <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(26,20,17,0.06)', color: T.ink, fontWeight: 800, fontSize: 12.5, padding: '6px 10px', borderRadius: 20 }}>
                    {g}{edit && <span style={{ cursor: 'pointer', display: 'inline-flex' }}><Ic name="plus" size={13} color={T.faint} sw={2.4} /></span>}
                  </span>
                ))}
                {m.groups.length === 0 && <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>Keiner Gruppe zugeordnet</span>}
                {edit && otherGroups.slice(0, 3).map((g) => (
                  <span key={g} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: `1.5px dashed ${T.line}`, color: T.sub, fontWeight: 700, fontSize: 12.5, padding: '5px 10px', borderRadius: 20, cursor: 'pointer' }}>
                    <Ic name="plus" size={13} color={T.sub} sw={2.2} />{g}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: T.faint, marginTop: 11 }}>Mehrfach-Zuordnung möglich · Anzeige-Titel oben wählbar.</div>
            </Panel>

            <Panel title="Ämter & Funktionen">
              {m.aemter.length ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {m.aemter.map((a) => <Chip key={a} tone="red" dot>{a}</Chip>)}
                </div>
              ) : <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>Kein Amt</span>}
              {edit && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line2}` }}>
                  <Btn sm ghost icon="plus">Amt zuweisen</Btn>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: T.faint, marginTop: 9, lineHeight: 1.45 }}>Einmalige Ämter (Präsident/in, Kinderpräsident/in, Geschäftsführer, Schriftführer, Finanzen, Getränkewart) sind je genau einmal vergeben.</div>
                </div>
              )}
            </Panel>

            <Panel title="Teilnahme & Einwilligung">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Toggle on={drinks} onClick={() => edit && setDrinks((v) => !v)} label="Getränkekasse-Teilnehmer" sub="Nimmt an der Bierliste teil (persönliches Flag)" />
                <Toggle on={consent} onClick={() => edit && setConsent((v) => !v)} label="Foto-Einwilligung (intern)" sub="Fotos in der internen Galerie sichtbar" />
              </div>
            </Panel>

            <Panel title="Schlüssel">
              {m.keys.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {m.keys.map((k) => (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: T.panel2, border: `1px solid ${T.line2}`, borderRadius: 10 }}>
                      <Ic name="key" size={16} color="#9a7200" sw={2} /><span style={{ flex: 1, fontWeight: 800, fontSize: 13 }}>{k}</span>
                      {edit && <Ic name="plus" size={14} color={T.faint} sw={2.2} />}
                    </div>
                  ))}
                </div>
              ) : <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>Hält keine Schlüssel</span>}
              {edit && <div style={{ marginTop: 11 }}><Btn sm ghost icon="plus">Schlüssel zuordnen</Btn></div>}
              <div style={{ fontSize: 11.5, fontWeight: 600, color: T.faint, marginTop: 11 }}>Für alle Mitglieder im Verzeichnis sichtbar — so weiß man, wen man zum Aufschließen fragt.</div>
            </Panel>
          </div>
        </div>
      </div>
    );
  }

  // ── page (list ⇄ detail) ──────────────────────────────────────────────────
  function PageMembersManage({ start }) {
    const [sel, setSel] = useState(start || null);
    return sel ? <MemberDetail id={sel} onBack={() => setSel(null)} /> : <MemberList onOpen={setSel} />;
  }

  // ══════════ MOBILE ══════════════════════════════════════════════════════════
  function MobMemberList({ onOpen }) {
    const [q, setQ] = useState('');
    const [art, setArt] = useState('Alle');
    const arts = ['Alle', 'Aktiv', 'Passiv', 'Jugend', 'Ehrenmitglied'];
    const rows = MEMBERS.filter((m) => (art === 'Alle' || m.art === art) && (q === '' || (m.first + ' ' + m.last).toLowerCase().includes(q.toLowerCase())));
    return (
      <div style={{ padding: '14px 16px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* mini stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[['184', 'Mitglieder', 'ink'], ['142', 'mit Account', 'ink'], ['12', 'offen', 'red']].map(([n, l, t]) => (
            <Card key={l} style={{ flex: 1 }} pad={12}><div style={{ fontFamily: T.display, fontSize: 22, lineHeight: 1, color: t === 'red' ? T.red : T.ink }}>{n}</div><div style={{ fontWeight: 700, fontSize: 10.5, color: T.sub, marginTop: 3 }}>{l}</div></Card>
          ))}
        </div>
        {/* primary actions — always visible on landing */}
        <div style={{ display: 'flex', gap: 9 }}>
          <Btn primary sm icon="plus" style={{ flex: 1, justifyContent: 'center' }}>Mitglied hinzufügen</Btn>
          <Btn ghost sm icon="upload" style={{ justifyContent: 'center' }}>Einladen</Btn>
        </div>
        {/* search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 40, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 14px', background: T.panel }}>
          <Ic name="search" size={16} color={T.faint} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Mitglied suchen …" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, flex: 1, minWidth: 0 }} />
        </div>
        {/* filter chips */}
        <div className="fcc-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', margin: '0 -16px', padding: '0 16px' }}>
          {arts.map((a) => <button key={a} onClick={() => setArt(a)} style={{ flexShrink: 0, border: `1.5px solid ${art === a ? T.ink : T.line}`, background: art === a ? T.ink : 'transparent', color: art === a ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, padding: '7px 13px', borderRadius: 30 }}>{a}</button>)}
        </div>
        {/* member cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((m) => (
            <Card key={m.id} onClick={() => onOpen(m.id)} pad={13} style={{ cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar initials={m.ini} tone={m.tone} size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.first} {m.last}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.sub, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.title}</div>
                </div>
                {m.aemter.length > 0 && <Ic name="key" size={15} color="#9a7200" sw={2} />}
                <Ic name="chevron" size={16} color={T.faint} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 11, flexWrap: 'wrap' }}>
                <Chip tone={ART_TONE[m.art]}>{m.art}</Chip>
                {m.groups.slice(0, 1).map((g) => <Chip key={g} tone="neutral">{g}</Chip>)}
                {m.groups.length > 1 && <Chip tone="neutral">+{m.groups.length - 1}</Chip>}
                <div style={{ flex: 1 }} />
                <Chip tone={BEITRAG[m.beitrag][0]} dot>{BEITRAG[m.beitrag][1]}</Chip>
                <Chip tone={ACCOUNT[m.account][0]} dot={m.account !== 'keiner'}>{m.account === 'aktiv' ? 'Account' : m.account === 'eingeladen' ? 'Eingeladen' : 'Kein Account'}</Chip>
              </div>
            </Card>
          ))}
          {rows.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: T.sub, fontWeight: 600, fontSize: 14 }}>Keine Mitglieder gefunden.</div>}
        </div>
        {rows.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, paddingTop: 2 }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: T.sub }}>{rows.length} von 184 ·</span>
            <span style={{ fontWeight: 800, fontSize: 12.5, color: T.red }}>Mehr laden</span>
          </div>
        )}
      </div>
    );
  }

  function MobMemberDetail({ id, onBack }) {
    const m = MEMBERS.find((x) => x.id === id) || MEMBERS[0];
    const [edit, setEdit] = useState(false);
    const [drinks, setDrinks] = useState(m.drinks);
    const [consent, setConsent] = useState(m.consent);
    return (
      <div style={{ padding: '12px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub }}>
            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span> Zurück
          </button>
          <Btn primary={!edit} ghost={edit} sm icon={edit ? 'check' : 'settings'} onClick={() => setEdit((v) => !v)}>{edit ? 'Fertig' : 'Bearbeiten'}</Btn>
        </div>
        {/* header */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar initials={m.ini} tone={m.tone} size={54} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Title size={21}>{m.first} {m.last}</Title>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: T.sub, marginTop: 3 }}>{m.title}{edit && ' ▾'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 13, flexWrap: 'wrap' }}>
            <Chip tone={ART_TONE[m.art]}>{m.art}</Chip>
            {m.aemter.map((a) => <Chip key={a} tone="red" dot>{a}</Chip>)}
            <span style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>seit {m.since}</span>
          </div>
        </Card>
        {/* stammdaten */}
        <Panel title="Stammdaten">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
            <Field label="Geburtsdatum" value={m.birthday} />
            <Field label="Telefon" value={m.phone} mono />
            <Field label="E-Mail" value={m.email} mono />
          </div>
        </Panel>
        {/* beitrag */}
        <Panel title="Mitgliedschaft & Beitrag">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.6, color: T.faint, textTransform: 'uppercase' }}>Jahresbeitrag</div><div style={{ fontFamily: T.display, fontSize: 24, marginTop: 3 }}>{beitragEuro(m.art)}</div></div>
            <Chip tone={BEITRAG[m.beitrag][0]} dot>{BEITRAG[m.beitrag][1]}</Chip>
          </div>
          {m.beitrag === 'offen' && <div style={{ marginTop: 13, paddingTop: 13, borderTop: `1px solid ${T.line2}` }}><Btn sm ghost icon="euro" style={{ width: '100%', justifyContent: 'center' }}>Als bezahlt markieren</Btn></div>}
        </Panel>
        {/* account */}
        <Panel title="Account & Login">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: m.account === 'aktiv' ? 'rgba(46,158,91,0.13)' : m.account === 'eingeladen' ? 'rgba(244,180,0,0.16)' : 'rgba(26,20,17,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Ic name={m.account === 'keiner' ? 'users' : 'check'} size={17} color={m.account === 'aktiv' ? T.green : m.account === 'eingeladen' ? '#9a7200' : T.faint} sw={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 13.5 }}>{ACCOUNT[m.account][1]}</div><div style={{ fontSize: 11.5, fontWeight: 600, color: T.sub }}>{m.account === 'aktiv' ? 'Login aktiv' : m.account === 'eingeladen' ? 'Noch nicht aktiviert' : 'Mitglied ohne App-Zugang'}</div></div>
          </div>
          {m.account === 'keiner' && <div style={{ marginTop: 11 }}><Btn sm primary icon="upload" style={{ width: '100%', justifyContent: 'center' }}>Zur App einladen</Btn></div>}
          {m.account === 'aktiv' && <div style={{ marginTop: 11 }}><Btn sm ghost icon="key" style={{ width: '100%', justifyContent: 'center' }}>Passwort-Reset-Link</Btn></div>}
        </Panel>
        {/* gruppen */}
        <Panel title="Gruppen">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {m.groups.map((g) => <Chip key={g} tone="ink">{g}</Chip>)}
            {m.groups.length === 0 && <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>Keiner Gruppe zugeordnet</span>}
            {edit && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: `1.5px dashed ${T.line}`, color: T.sub, fontWeight: 700, fontSize: 12.5, padding: '5px 10px', borderRadius: 20 }}><Ic name="plus" size={13} color={T.sub} sw={2.2} />Gruppe</span>}
          </div>
        </Panel>
        {/* ämter */}
        <Panel title="Ämter & Funktionen">
          {m.aemter.length ? <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>{m.aemter.map((a) => <Chip key={a} tone="red" dot>{a}</Chip>)}</div> : <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>Kein Amt</span>}
          {edit && <div style={{ marginTop: 11 }}><Btn sm ghost icon="plus">Amt zuweisen</Btn></div>}
        </Panel>
        {/* teilnahme */}
        <Panel title="Teilnahme & Einwilligung">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle on={drinks} onClick={() => edit && setDrinks((v) => !v)} label="Getränkekasse" sub="Nimmt an der Bierliste teil" />
            <Toggle on={consent} onClick={() => edit && setConsent((v) => !v)} label="Foto-Einwilligung" sub="Fotos intern sichtbar" />
          </div>
        </Panel>
        {/* schlüssel */}
        <Panel title="Schlüssel">
          {m.keys.length ? <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{m.keys.map((k) => <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: T.panel2, border: `1px solid ${T.line2}`, borderRadius: 10 }}><Ic name="key" size={15} color="#9a7200" sw={2} /><span style={{ flex: 1, fontWeight: 800, fontSize: 13 }}>{k}</span></div>)}</div> : <span style={{ color: T.faint, fontSize: 13, fontWeight: 600 }}>Hält keine Schlüssel</span>}
          <div style={{ fontSize: 11, fontWeight: 600, color: T.faint, marginTop: 10 }}>Im Verzeichnis für alle sichtbar.</div>
        </Panel>
      </div>
    );
  }

  function MMembersManage({ start }) {
    const [sel, setSel] = useState(start || null);
    return sel ? <MobMemberDetail id={sel} onBack={() => setSel(null)} /> : <MobMemberList onOpen={setSel} />;
  }

  window.PageMembersManage = PageMembersManage;
  window.MMembersManage = MMembersManage;
})();
