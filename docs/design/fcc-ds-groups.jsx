// fcc-ds-groups.jsx — Gruppen & Ämter (/groups).
// Two tabs: Gruppen (CRUD + archive, member assignment, leader) and Ämter
// (roster of all offices with holders / vacancies, unique-rule enforced).
// Composes the system. Exports window.PageGroups + window.MGroups.

(function () {
  const { T, Ic, Card, Chip, Btn, Avatar, Title } = window;
  const { useState } = React;

  const CAT_TONE = { Tanz: 'red', Show: 'gold', Musik: 'blue', Sonstige: 'ink' };

  // groups: [id, name, cat, since, status, desc, leader{n,ini,tone,role}|null, members[{ini,tone,name}]]
  const G = [
    ['g1', 'Garde', 'Tanz', 2009, 'aktiv', 'Die große Tanzgarde — Aushängeschild bei jeder Prunksitzung.', ['Christoph Mayr', 'CM', 'gold', 'Trainer'], 14],
    ['g2', 'Biergarde', 'Show', 2014, 'aktiv', 'Die Männer-Showgruppe rund um die Bierkasse.', ['Markus Veit', 'MV', 'ink', 'Gruppenleiter'], 9],
    ['g3', 'Die heißen Öfen', 'Show', 2016, 'aktiv', 'Männerballett mit Krawall-Garantie.', ['Robert Stark', 'RS', 'ink', 'Trainer'], 11],
    ['g4', 'Die frechen Füchtchen', 'Tanz', 2018, 'aktiv', 'Die Jugend- und Minigarde des Vereins.', ['Anna Brunner', 'AB', 'gold', 'Trainerin'], 12],
    ['g5', 'Die Furrschen Perlen', 'Tanz', 2012, 'aktiv', 'Showtanz der Damen — elegant und mitreißend.', null, 8],
    ['g6', 'Tommi & Christoph', 'Musik', 2020, 'aktiv', 'Das Gesangsduo für Stimmung im Saal.', null, 2],
    ['g7', 'Das Goldbörnchen Trio', 'Musik', 2019, 'aktiv', 'Drei Stimmen, ein Ohrwurm.', null, 3],
    ['g8', 'Die Wirbelwinde', 'Tanz', 2005, 'archiviert', 'Ehemalige Gardegruppe (2005–2018).', null, 0],
  ];
  const mkG = (a) => ({ id: a[0], name: a[1], cat: a[2], since: a[3], status: a[4], desc: a[5], leader: a[6] ? { n: a[6][0], ini: a[6][1], tone: a[6][2], role: a[6][3] } : null, count: a[7] });
  const GROUPS = G.map(mkG);

  // sample member avatars for stacks/detail
  const SAMPLE = [['Petra S.', 'PS', 'red'], ['Lena H.', 'LH', 'gold'], ['Tobias R.', 'TR', 'ink'], ['Jonas B.', 'JB', 'red'], ['Sven K.', 'SK', 'gold'], ['Daniel P.', 'DP', 'ink'], ['Felix W.', 'FW', 'red'], ['Mira L.', 'ML', 'gold']];

  function AvatarStack({ items, size = 30, max = 5 }) {
    const show = items.slice(0, max);
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {show.map((p, i) => <div key={i} style={{ marginLeft: i ? -10 : 0, border: `2px solid ${T.panel}`, borderRadius: size, position: 'relative', zIndex: max - i }}><Avatar initials={p[1]} tone={p[2]} size={size} /></div>)}
        {items.length > max && <div style={{ marginLeft: -10, width: size, height: size, borderRadius: size, background: T.panel2, border: `2px solid ${T.panel}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: size * 0.34, color: T.sub }}>+{items.length - max}</div>}
      </div>
    );
  }

  // ── group card ────────────────────────────────────────────────────────────
  function GroupCard({ g, onOpen, mobile }) {
    const archived = g.status === 'archiviert';
    const stack = SAMPLE.slice(0, Math.min(g.count, SAMPLE.length));
    return (
      <Card onClick={() => onOpen(g.id)} pad={mobile ? 15 : 18} style={{ cursor: 'pointer', opacity: archived ? 0.62 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <Title size={mobile ? 19 : 21} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{g.name}</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 7, flexWrap: 'wrap' }}>
              <Chip tone={CAT_TONE[g.cat]}>{g.cat}</Chip>
              {archived ? <Chip tone="neutral" dot>Archiviert</Chip> : <span style={{ fontSize: 12, fontWeight: 600, color: T.sub }}>seit {g.since}</span>}
            </div>
          </div>
          <Ic name="chevron" size={17} color={T.faint} />
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: T.sub, lineHeight: 1.45, margin: '11px 0 13px', minHeight: 34 }}>{g.desc}</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: `1px solid ${T.line2}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {g.count > 0 ? <AvatarStack items={stack} size={28} /> : <span style={{ fontSize: 12.5, fontWeight: 600, color: T.faint }}>Keine Mitglieder</span>}
            {g.count > 0 && <span style={{ fontSize: 12.5, fontWeight: 700, color: T.sub }}>{g.count} Mitglieder</span>}
          </div>
          {g.leader
            ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Ic name="key" size={13} color="#9a7200" sw={2} /><span style={{ fontSize: 12, fontWeight: 700, color: T.sub, whiteSpace: 'nowrap' }}>{g.leader.n.split(' ')[0]}</span></span>
            : <span style={{ fontSize: 12, fontWeight: 700, color: T.red }}>Kein Trainer</span>}
        </div>
      </Card>
    );
  }

  // ── group detail ────────────────────────────────────────────────────────────
  function GroupDetail({ id, onBack, mobile }) {
    const g = GROUPS.find((x) => x.id === id) || GROUPS[0];
    const [edit, setEdit] = useState(false);
    const members = SAMPLE.slice(0, Math.min(g.count, SAMPLE.length));
    const Panel = ({ title, action, children }) => (
      <Card pad={mobile ? 16 : 18}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}><Title size={15}>{title}</Title>{action}</div>
        {children}
      </Card>
    );
    return (
      <div style={{ padding: mobile ? '12px 16px 24px' : 28, display: 'flex', flexDirection: 'column', gap: mobile ? 14 : 20, maxWidth: 900 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub }}>
            <span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span> {mobile ? 'Zurück' : 'Gruppen'}
          </button>
          <div style={{ display: 'flex', gap: 9 }}>
            {!mobile && g.status === 'aktiv' && <Btn ghost sm icon="check">Archivieren</Btn>}
            <Btn primary={!edit} ghost={edit} sm icon={edit ? 'check' : 'settings'} onClick={() => setEdit((v) => !v)}>{edit ? 'Fertig' : 'Bearbeiten'}</Btn>
          </div>
        </div>

        <Card pad={mobile ? 16 : 20}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <Title size={mobile ? 24 : 30}>{g.name}</Title>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9, flexWrap: 'wrap' }}>
                <Chip tone={CAT_TONE[g.cat]}>{g.cat}</Chip>
                {g.status === 'archiviert' ? <Chip tone="neutral" dot>Archiviert</Chip> : <Chip tone="green" dot>Aktiv</Chip>}
                <span style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>· gegründet {g.since} · {g.count} Mitglieder</span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 500, color: T.sub, lineHeight: 1.55, marginTop: 14 }}>{g.desc}</div>
        </Card>

        <Panel title="Gruppenleiter / Trainer" action={edit ? <Btn sm ghost icon="plus">Weitere/r Trainer/in</Btn> : null}>
          {g.leader ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Avatar initials={g.leader.ini} tone={g.leader.tone} size={42} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 15 }}>{g.leader.n}</div><div style={{ fontSize: 12.5, fontWeight: 600, color: T.sub }}>{g.leader.role} · verwaltet diese Gruppe</div></div>
              <Chip tone="red" dot>{g.leader.role}</Chip>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: T.red }}>Kein Trainer / Gruppenleiter</span>
              <Btn sm primary icon="plus">Zuweisen</Btn>
            </div>
          )}
          <div style={{ fontSize: 11.5, fontWeight: 600, color: T.faint, lineHeight: 1.5, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${T.line2}` }}>Wer hier als Trainer/in gesetzt wird, erhält automatisch die <b style={{ color: T.sub }}>Trainer-Rechte für genau diese Gruppe</b>: Mitglieder zuordnen, weitere Trainer benennen, Gruppen-Termine im Spielplan pflegen.</div>
        </Panel>

        <Panel title={`Mitglieder · ${g.count}`} action={<Btn sm primary icon="plus">Mitglied hinzufügen</Btn>}>
          {g.count > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {members.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 11px', background: T.panel2, border: `1px solid ${T.line2}`, borderRadius: 10 }}>
                  <Avatar initials={p[1]} tone={p[2]} size={32} />
                  <span style={{ flex: 1, fontWeight: 800, fontSize: 14 }}>{p[0]}</span>
                  {edit && <span style={{ cursor: 'pointer', color: T.red, fontWeight: 800, fontSize: 12.5 }}>Entfernen</span>}
                </div>
              ))}
              {g.count > members.length && <div style={{ fontSize: 12.5, fontWeight: 700, color: T.sub, padding: '4px 2px' }}>+ {g.count - members.length} weitere</div>}
            </div>
          ) : <span style={{ fontSize: 13.5, fontWeight: 600, color: T.faint }}>Noch keine Mitglieder zugeordnet.</span>}
        </Panel>
      </div>
    );
  }

  // ── groups list view ──────────────────────────────────────────────────────
  function GroupsView({ onOpen, mobile }) {
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('Alle');
    const [showArch, setShowArch] = useState(false);
    const cats = ['Alle', 'Tanz', 'Show', 'Musik', 'Sonstige'];
    const rows = GROUPS.filter((g) => (showArch || g.status === 'aktiv') && (cat === 'Alle' || g.cat === cat) && (q === '' || g.name.toLowerCase().includes(q.toLowerCase())));
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 40, borderRadius: 30, border: `1.5px solid ${T.line}`, padding: '0 14px', background: T.panel, flex: 1, minWidth: 180, maxWidth: mobile ? 'none' : 300 }}>
            <Ic name="search" size={16} color={T.faint} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gruppe suchen …" style={{ border: 'none', outline: 'none', background: 'transparent', fontFamily: T.font, fontWeight: 600, fontSize: 13.5, color: T.ink, flex: 1, minWidth: 0 }} />
          </div>
          {!mobile && <div style={{ flex: 1 }} />}
          {!mobile && <Btn primary sm icon="plus">Gruppe anlegen</Btn>}
        </div>
        <div className="fcc-scroll" style={{ display: 'flex', gap: 7, overflowX: 'auto', margin: mobile ? '0 -16px' : 0, padding: mobile ? '0 16px' : 0, flexWrap: mobile ? 'nowrap' : 'wrap' }}>
          {cats.map((a) => <button key={a} onClick={() => setCat(a)} style={{ flexShrink: 0, border: `1.5px solid ${cat === a ? T.ink : T.line}`, background: cat === a ? T.ink : 'transparent', color: cat === a ? '#fff' : T.ink, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, padding: '7px 14px', borderRadius: 30, cursor: 'pointer' }}>{a}</button>)}
          <div style={{ width: 1, height: 22, background: T.line, alignSelf: 'center', flexShrink: 0 }} />
          <button onClick={() => setShowArch((v) => !v)} style={{ flexShrink: 0, border: `1.5px solid ${showArch ? T.red : T.line}`, background: showArch ? 'rgba(225,29,42,0.08)' : 'transparent', color: showArch ? T.red : T.sub, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, padding: '7px 14px', borderRadius: 30, cursor: 'pointer' }}>Archiv</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: mobile ? '1fr' : 'repeat(3,1fr)', gap: mobile ? 11 : 18 }}>
          {rows.map((g) => <GroupCard key={g.id} g={g} onOpen={onOpen} mobile={mobile} />)}
        </div>
        {rows.length === 0 && <div style={{ padding: 30, textAlign: 'center', color: T.sub, fontWeight: 600 }}>Keine Gruppen gefunden.</div>}
        {mobile && <Btn primary icon="plus" style={{ justifyContent: 'center' }}>Gruppe anlegen</Btn>}
      </div>
    );
  }

  // ── desktop page ────────────────────────────────────────────────────────────
  function PageGroups({ start }) {
    const [sel, setSel] = useState(start || null);
    if (sel) return <GroupDetail id={sel} onBack={() => setSel(null)} />;
    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 1320 }}>
        <GroupsView onOpen={setSel} />
      </div>
    );
  }

  // ── mobile page ───────────────────────────────────────────────────────────
  function MGroups() {
    const [sel, setSel] = useState(null);
    if (sel) return <GroupDetail id={sel} onBack={() => setSel(null)} mobile />;
    return (
      <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <GroupsView onOpen={setSel} mobile />
      </div>
    );
  }

  window.PageGroups = PageGroups;
  window.MGroups = MGroups;
})();
