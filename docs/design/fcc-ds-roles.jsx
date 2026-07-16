// fcc-ds-roles.jsx — Ämter & Rechte (/roles), Admin-only.
// RBAC config surface: Permissions (resource:read/write/delete) → Roles (bundles)
// → assigned to Ämter (offices). People inherit permissions via their Amt.
// Composes the system. Exports window.PageRoles + window.MRoles.

(function () {
  const { T, Ic, Card, Chip, Btn, Title } = window;
  const { useState } = React;

  // resource catalog [key, label]
  const RES = [
    ['members', 'Mitglieder'], ['groups', 'Gruppen'], ['group_members', 'Gruppen-Mitglieder (Trainer)'],
    ['fees', 'Beiträge'], ['drinks', 'Bierliste'], ['drinks_inventory', 'Getränke-Inventar'],
    ['schedule', 'Spielplan'], ['events', 'Veranstaltungen'], ['seating', 'Saalplan'],
    ['gallery', 'Galerie'], ['shop', 'Shop'], ['keys', 'Schlüssel'],
    ['roles', 'Ämter & Rechte'], ['settings', 'Einstellungen'], ['live', 'Auftritt-Cockpit'],
  ];
  const ACTIONS = [['r', 'Lesen'], ['w', 'Schreiben'], ['d', 'Löschen']];
  const ALL = RES.map((x) => x[0]);

  // roles [id, name, scoped, desc, permsMap]   permsMap: { resKey: 'r'|'rw'|'rwd'... }
  const mkAll = (s) => { const o = {}; ALL.forEach((k) => (o[k] = s)); return o; };
  const ROLES = [
    ['r_admin', 'Voll-Admin', false, 'Alle Rechte. Nur für technische Admins.', mkAll('rwd')],
    ['r_gf', 'Geschäftsführung', false, 'Fast alles vereinsweit — die operative Leitung.', { members: 'rwd', groups: 'rwd', group_members: 'rwd', fees: 'rwd', drinks: 'rwd', drinks_inventory: 'rwd', schedule: 'rwd', events: 'rwd', seating: 'rwd', gallery: 'rwd', shop: 'rwd', keys: 'rwd', roles: 'r', settings: 'rw', live: 'rwd' }],
    ['r_members', 'Mitglieder-Verwaltung', false, 'Stammdaten pflegen & Ämter vergeben.', { members: 'rwd', groups: 'r', roles: 'r' }],
    ['r_fees', 'Beitragskasse', false, 'Beiträge verwalten & abrechnen.', { fees: 'rwd', members: 'r' }],
    ['r_drinks', 'Getränkekasse', false, 'Bierliste, Striche & Inventar.', { drinks: 'rwd', drinks_inventory: 'rwd', members: 'r' }],
    ['r_groups', 'Gruppen-Verwaltung', false, 'Gruppen anlegen, bearbeiten, archivieren.', { groups: 'rwd', group_members: 'rw', members: 'r' }],
    ['r_grouplead', 'Gruppen-Leitung', true, 'Eigene Gruppe leiten — auf die Gruppe begrenzt.', { group_members: 'rw', schedule: 'rw', members: 'r' }],
    ['r_events', 'Veranstaltungsplanung', false, 'Ablauf planen & Saalplan.', { events: 'rwd', seating: 'rw', groups: 'r', members: 'r', live: 'rw' }],
    ['r_gallery', 'Galerie-Verwaltung', false, 'Alben & Fotos kuratieren.', { gallery: 'rwd' }],
    ['r_shop', 'Shop-Verwaltung', false, 'Artikel & Bestellungen.', { shop: 'rwd' }],
    ['r_keys', 'Schlüssel-Verwaltung', false, 'Schlüssel-Register pflegen.', { keys: 'rwd' }],
    ['r_settings', 'Einstellungen & Rechte', false, 'Vereins-, App- und Rechte-Konfiguration.', { settings: 'rwd', roles: 'rwd' }],
  ];
  const ROLE_BY = {}; ROLES.forEach((r) => (ROLE_BY[r[0]] = { id: r[0], name: r[1], scoped: r[2], desc: r[3] }));

  // Ämter → role ids
  const AEMTER = [
    ['Admin', 'technisch', ['r_admin']],
    ['Geschäftsführer', 'einmalig', ['r_gf']],
    ['Präsident', 'einmalig', ['r_members', 'r_groups', 'r_events', 'r_keys']],
    ['Präsidentin', 'einmalig', ['r_members', 'r_groups', 'r_events', 'r_keys']],
    ['Kinderpräsident/in', 'einmalig', ['r_events', 'r_gallery']],
    ['Schriftführer', 'einmalig', ['r_members']],
    ['Finanzen', 'einmalig', ['r_fees']],
    ['Getränkewart', 'einmalig', ['r_drinks']],
    ['Trainer / Gruppenleiter', 'pro Gruppe', ['r_grouplead']],
    ['Fotograf', 'mehrfach', ['r_gallery']],
    ['Kleidung', 'mehrfach', ['r_shop']],
  ];
  const usedBy = (roleId) => AEMTER.filter((a) => a[2].includes(roleId)).map((a) => a[0]);

  // build editable grid: { roleId: { resKey: {r,w,d} } }
  function buildGrid() {
    const g = {};
    ROLES.forEach(([id, , , , pm]) => {
      g[id] = {};
      RES.forEach(([k]) => { const s = pm[k] || ''; g[id][k] = { r: s.includes('r'), w: s.includes('w'), d: s.includes('d') }; });
    });
    return g;
  }

  function Check({ on, onClick, tone }) {
    const c = tone === 'd' ? T.red : tone === 'w' ? '#9a7200' : T.green;
    return (
      <div onClick={onClick} style={{ width: 22, height: 22, borderRadius: 6, border: `1.5px solid ${on ? c : T.line}`, background: on ? c : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto' }}>
        {on && <Ic name="check" size={14} color="#fff" sw={2.6} />}
      </div>
    );
  }

  function Tabs({ tab, setTab, mobile }) {
    const items = [['roles', 'Rollen'], ['aemter', 'Ämter → Rollen']];
    return (
      <div style={{ display: 'inline-flex', background: T.panel2, border: `1.5px solid ${T.line}`, borderRadius: 12, padding: 4, gap: 4 }}>
        {items.map(([id, l]) => <button key={id} onClick={() => setTab(id)} style={{ border: 'none', cursor: 'pointer', background: tab === id ? T.ink : 'transparent', color: tab === id ? '#fff' : T.sub, fontFamily: T.font, fontWeight: 800, fontSize: mobile ? 12.5 : 13.5, padding: mobile ? '8px 14px' : '8px 20px', borderRadius: 9 }}>{l}</button>)}
      </div>
    );
  }

  function AdminBanner() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: 'rgba(244,180,0,0.12)', border: '1.5px solid rgba(244,180,0,0.4)', borderRadius: 12, padding: '11px 14px' }}>
        <Ic name="key" size={17} color="#9a7200" sw={2} />
        <span style={{ fontWeight: 700, fontSize: 12.5, color: '#7c5c00', lineHeight: 1.4 }}>Nur für Admins. Rechte werden zu Rollen gebündelt, Rollen den Ämtern zugewiesen. Ein Mitglied erbt Rechte über sein Amt. Vergeben kann man nur, was man selbst hält.</span>
      </div>
    );
  }

  // ── ROLLEN (master-detail) ──────────────────────────────────────────────────
  function RolesView({ grid, toggle, mobile }) {
    const [sel, setSel] = useState(ROLES[1][0]);
    const role = ROLE_BY[sel];
    const g = grid[sel];
    const count = RES.reduce((n, [k]) => n + (g[k].r ? 1 : 0) + (g[k].w ? 1 : 0) + (g[k].d ? 1 : 0), 0);
    const list = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {ROLES.map(([id, name, scoped]) => {
          const on = id === sel;
          const cnt = RES.reduce((n, [k]) => n + (grid[id][k].r ? 1 : 0) + (grid[id][k].w ? 1 : 0) + (grid[id][k].d ? 1 : 0), 0);
          return (
            <div key={id} onClick={() => setSel(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 13px', borderRadius: 11, border: `1.5px solid ${on ? T.ink : T.line2}`, background: on ? T.ink : T.panel2, cursor: 'pointer' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: on ? '#fff' : T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: on ? 'rgba(251,244,230,0.6)' : T.sub }}>{cnt} Rechte{scoped ? ' · scoped' : ''}</div>
              </div>
              {scoped && <Ic name="pin" size={14} color={on ? T.gold : T.faint} sw={2} />}
            </div>
          );
        })}
        <button style={{ marginTop: 4, border: `1.5px dashed ${T.line}`, background: 'transparent', color: T.sub, fontFamily: T.font, fontWeight: 800, fontSize: 12.5, padding: '10px', borderRadius: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Ic name="plus" size={15} color={T.sub} sw={2.2} />Rolle erstellen</button>
      </div>
    );
    const matrix = (
      <Card pad={0} style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 18px', borderBottom: `1.5px solid ${T.line}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}><Title size={18}>{role.name}</Title>{role.scoped && <Chip tone="gold" dot>auf Gruppe begrenzt</Chip>}</div>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: T.sub, marginTop: 4 }}>{role.desc} · {count} Rechte</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', alignItems: 'center', padding: '9px 18px', background: T.panel2, borderBottom: `1px solid ${T.line2}`, fontSize: 10.5, fontWeight: 800, letterSpacing: 0.6, color: T.sub, textTransform: 'uppercase' }}>
          <div>Bereich</div><div style={{ textAlign: 'center' }}>Lesen</div><div style={{ textAlign: 'center' }}>Schreiben</div><div style={{ textAlign: 'center' }}>Löschen</div>
        </div>
        {RES.map(([k, label], i) => (
          <div key={k} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', alignItems: 'center', padding: '8px 18px', borderTop: i ? `1px solid ${T.line2}` : 'none' }}>
            <div style={{ fontWeight: 700, fontSize: 12.5 }}>{label}<span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 10.5, color: T.faint, marginLeft: 6 }}>{k}</span></div>
            <Check on={g[k].r} tone="r" onClick={() => toggle(sel, k, 'r')} />
            <Check on={g[k].w} tone="w" onClick={() => toggle(sel, k, 'w')} />
            <Check on={g[k].d} tone="d" onClick={() => toggle(sel, k, 'd')} />
          </div>
        ))}
        <div style={{ padding: '13px 18px', background: T.panel2, borderTop: `1.5px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: T.sub }}>Verwendet von:</span>
          {usedBy(sel).length ? usedBy(sel).map((a) => <Chip key={a} tone="neutral">{a}</Chip>) : <span style={{ fontSize: 12, fontWeight: 600, color: T.faint }}>keinem Amt</span>}
        </div>
      </Card>
    );
    if (mobile) {
      const [open, setOpen] = useState(false);
      return open
        ? <div><button onClick={() => setOpen(false)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: T.font, fontWeight: 800, fontSize: 13, color: T.sub, marginBottom: 12 }}><span style={{ display: 'inline-flex', transform: 'rotate(180deg)' }}><Ic name="chevron" size={16} color={T.sub} /></span> Rollen</button>{matrix}</div>
        : <div onClick={() => setOpen(true)}>{list}</div>;
    }
    return <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: 18, alignItems: 'start' }}>{list}{matrix}</div>;
  }

  // ── ÄMTER → ROLLEN ────────────────────────────────────────────────────────
  function AemterRolesView({ mobile }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {AEMTER.map(([name, kind, roleIds]) => (
          <Card key={name} pad={15}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic name="key" size={15} color="#9a7200" sw={2} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 800, fontSize: 14.5 }}>{name}</div><div style={{ fontSize: 11, fontWeight: 700, color: T.faint }}>{kind}</div></div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {roleIds.map((rid) => <Chip key={rid} tone={ROLE_BY[rid].scoped ? 'gold' : 'red'} dot>{ROLE_BY[rid].name}</Chip>)}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: `1.5px dashed ${T.line}`, color: T.sub, fontWeight: 700, fontSize: 12, padding: '4px 10px', borderRadius: 20, cursor: 'pointer' }}><Ic name="plus" size={12} color={T.sub} sw={2.2} />Rolle</span>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // ── desktop page ────────────────────────────────────────────────────────────
  function PageRoles() {
    const [tab, setTab] = useState('roles');
    const [grid, setGrid] = useState(buildGrid);
    const toggle = (rid, res, act) => setGrid((g) => ({ ...g, [rid]: { ...g[rid], [res]: { ...g[rid][res], [act]: !g[rid][res][act] } } }));
    return (
      <div style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1200 }}>
        <AdminBanner />
        <Tabs tab={tab} setTab={setTab} />
        {tab === 'roles' ? <RolesView grid={grid} toggle={toggle} /> : <AemterRolesView />}
      </div>
    );
  }

  // ── mobile page ───────────────────────────────────────────────────────────
  function MRoles() {
    const [tab, setTab] = useState('roles');
    const [grid, setGrid] = useState(buildGrid);
    const toggle = (rid, res, act) => setGrid((g) => ({ ...g, [rid]: { ...g[rid], [res]: { ...g[rid][res], [act]: !g[rid][res][act] } } }));
    return (
      <div style={{ padding: '14px 16px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <AdminBanner />
        <Tabs tab={tab} setTab={setTab} mobile />
        {tab === 'roles' ? <RolesView grid={grid} toggle={toggle} mobile /> : <AemterRolesView mobile />}
      </div>
    );
  }

  window.PageRoles = PageRoles;
  window.MRoles = MRoles;
})();
