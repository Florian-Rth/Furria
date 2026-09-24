// fcc-pg-dir.jsx — Screens 1–4: Members (list), Person, Groups, Group.
// Read-only, for everyone in the club. No write actions.

const { PGP: G, PG: GD, PgRow: R, PgEyeb: Eb, PgDisp: Dp, PgBody: By, PgSec: Sc, PgCd: Cd,
  PgAv: Av, PgSeal: Seal, PgKey: KeyM, PgState: St, PgSearch: Srch, PgFilters: Flt, PgStat: Stt,
  PgSkel: Sk, PgSkelRow: SkR, PgEmpty: Emp, PgMob: Mob, PgDesk: Desk, PgFlecks: Fl } = window;

const lastOf = (n) => n.split(' ').slice(-1)[0];
const byName = [...GD.PERSONS].sort((a, b) => lastOf(a.n).localeCompare(lastOf(b.n), 'de'));
const P_BY = Object.fromEntries(GD.PERSONS.map(p => [p.n, p]));

// ── one person as a row ────────────────────────────────────────────────────
function PgPersonRow({ p, i, size = 38, showAdr }) {
  const amt = p.a[0] && p.a[0][0].split(' · ')[0];
  const grp = p.g.length ? p.g.map(x => x[0]).join(' · ') : null;
  return (
    <R style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${G.line2}` : 'none', gap: 12, cursor: 'pointer' }}>
      <Av name={p.n} size={size} tone={p.ehren ? 'gold' : null} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <R style={{ gap: 7 }}>
          <div style={{ fontWeight: 800, fontSize: 14.5, color: G.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.n}</div>
          {p.ehren && <Seal size={14} />}
          {p.k && <KeyM size={11} />}
        </R>
        <div style={{ marginTop: 3, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {amt && <span style={{ color: G.red }}>{amt}</span>}
          {amt && grp && <span style={{ color: G.faint }}> · </span>}
          {grp ? <span style={{ color: G.faint }}>{grp}</span> : !amt && <span style={{ color: G.faint, fontWeight: 600, fontStyle: 'italic' }}>keine Gruppe</span>}
          {showAdr && <span style={{ color: G.faint, fontWeight: 600 }}>{(amt || grp) ? ' · ' : ''}{p.adr}</span>}
        </div>
      </div>
      <St s={p.s} sm />
    </R>
  );
}

function PgLetter({ ch }) {
  return <R style={{ gap: 8, padding: '14px 0 4px' }}>
    <span style={{ fontFamily: G.display, fontSize: 15, color: G.red, letterSpacing: 1 }}>{ch}</span>
    <span style={{ flex: 1, height: 1.5, background: G.line2 }} />
  </R>;
}

function PgGrouped({ list, from = 0, to = 99, size }) {
  const out = []; let last = '', fresh = true;
  list.slice(from, to).forEach(p => {
    const ch = p.n.split(' ').slice(-1)[0][0];
    if (ch !== last) { out.push(<PgLetter key={'l' + ch} ch={ch} />); last = ch; fresh = true; }
    out.push(<PgPersonRow key={p.n} p={p} i={fresh ? 0 : 1} size={size} />);
    fresh = false;
  });
  return <>{out}</>;
}

// ══ 1 · MITGLIEDER ═══════════════════════════════════════════════════════
function PgMembersMob({ state }) {
  return (
    <Mob kicker="Verein" title="MITGLIEDER" back={false} pill="Mitglieder"
      right={<span style={{ fontFamily: G.display, fontSize: 15, color: G.faint }}>152</span>}
      head={<div style={{ position: 'relative', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Srch />
        <Flt items={['Alle 152', 'Aktiv 134', 'Ehrenmitglied 6', 'Nach Gruppe', 'Mit Amt']} />
      </div>} pad="6px 18px 84px" gap={0}>
      {state === 'load' ? <div style={{ paddingTop: 8 }}>{[0, 1, 2, 3, 4, 5, 6].map(i => <SkR key={i} />)}</div>
        : state === 'empty' ? <Emp icon="search" title="NIEMAND GEFUNDEN" text="Kein Name, keine Gruppe und kein Amt passt zu „Schmidtke“. Vielleicht anders geschrieben?" />
          : <PgGrouped list={byName} to={8} />}
    </Mob>
  );
}

function PgMembersDesk() {
  const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const have = new Set(byName.map(p => p.n.split(' ').slice(-1)[0][0]));
  return (
    <Desk active="Mitglieder" kicker="Verein · lesend" title="MITGLIEDER" sub="152 Personen sind aktuell mit dem FCC verbunden. Alles hier ist Ansicht — geändert wird in der Personenverwaltung."
      actions={<R style={{ gap: 12 }}><Srch w={330} /></R>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 250px', gap: 28 }}>
        <div>
          <Flt items={['Alle 152', 'Aktiv 134', 'Ruht 12', 'Ehrenmitglied 6', 'Mit Amt 9', 'Tanzgarde', 'Elferrat', 'Kindergarde']} style={{ marginBottom: 16, flexWrap: 'wrap' }} />
          <Cd pad="4px 20px">
            <R style={{ padding: '10px 0 8px', gap: 12, borderBottom: `1.5px solid ${G.cardLine}` }}>
              <Eb style={{ width: 246 }}>Person</Eb><Eb style={{ flex: 1 }}>Gruppen</Eb><Eb style={{ width: 190 }}>Ämter</Eb><Eb style={{ width: 96 }}>Marker</Eb><Eb style={{ width: 84 }}>Status</Eb>
            </R>
            {byName.slice(0, 12).map((p, i) => (
              <R key={p.n} style={{ padding: '9px 0', gap: 12, borderTop: i ? `1.5px solid ${G.line2}` : 'none', cursor: 'pointer' }}>
                <R style={{ width: 246, gap: 10 }}>
                  <Av name={p.n} size={32} tone={p.ehren ? 'gold' : null} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 13.5, color: G.ink }}>{p.n}</div>
                    <By size={11} c={G.faint}>{p.seit ? 'Mitglied seit ' + p.seit : 'ohne Mitgliedschaft'}</By>
                  </div>
                </R>
                <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.g.length ? p.g.map(([n]) => <window.Chip key={n} tone="ink">{n}</window.Chip>) : <By size={12} c={G.faint} style={{ fontStyle: 'italic' }}>keine Gruppe</By>}
                </div>
                <div style={{ width: 190, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {p.a.length ? p.a.map(([n]) => <window.Chip key={n} tone="red">{n.split(' · ')[0]}</window.Chip>) : <By size={12} c={G.faint}>—</By>}
                </div>
                <R style={{ width: 96, gap: 6 }}>{p.ehren && <Seal size={17} />}{p.k && <KeyM size={13} />}{!p.ehren && !p.k && <By size={12} c={G.faint}>—</By>}</R>
                <div style={{ width: 84 }}><St s={p.s} /></div>
              </R>
            ))}
            <R style={{ padding: '13px 0', borderTop: `1.5px solid ${G.line2}`, justifyContent: 'center' }}>
              <By size={12.5} c={G.faint}>… 140 weitere · scrollen oder Buchstabe wählen</By>
            </R>
          </Cd>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Cd pad="16px 18px">
            <Eb style={{ marginBottom: 10 }}>Buchstabe</Eb>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {AZ.map(ch => <span key={ch} style={{ width: 25, height: 25, borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: G.display, fontSize: 13, color: have.has(ch) ? G.ink : 'rgba(26,20,17,0.22)', background: ch === 'B' ? 'rgba(225,29,42,0.10)' : 'transparent', cursor: have.has(ch) ? 'pointer' : 'default' }}>{ch}</span>)}
            </div>
          </Cd>
          <Cd pad="16px 18px">
            <Eb style={{ marginBottom: 12 }}>Der Verein in Zahlen</Eb>
            <div style={{ display: 'flex', gap: 14 }}><Stt label="Aktiv" value="134" /><Stt label="Ruht" value="12" /><Stt label="Ehren" value="6" /></div>
            <div style={{ height: 1.5, background: G.cardLine, margin: '14px 0' }} />
            <By size={12} c={G.sub}>6 Personen tanzen oder helfen mit, ohne Mitglied zu sein. Sie stehen mit in der Liste.</By>
          </Cd>
          <Cd pad="16px 18px">
            <R style={{ gap: 10 }}><KeyM size={14} /><By size={12.5} c={G.sub} style={{ flex: 1 }}>Das Schlüssel-Zeichen zeigt später, wer aufschließen kann. Kommt mit dem Schlüssel-Register.</By></R>
          </Cd>
        </div>
      </div>
    </Desk>
  );
}

// ══ 2 · PERSON ═══════════════════════════════════════════════════════════
function PgKV({ k, v, i, hint }) {
  return (
    <div style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${G.cardLine}` : 'none' }}>
      <R style={{ gap: 12 }}>
        <By size={12.5} c={G.faint} style={{ flex: 1 }}>{k}</By>
        <By size={13} w={800} c={G.ink}>{v}</By>
      </R>
      {hint && <By size={11.5} c={G.faint} style={{ marginTop: 4 }}>{hint}</By>}
    </div>
  );
}

function PgSinceRow({ label, since, sub, tone = 'ink', i, icon = 'star' }) {
  return (
    <R style={{ padding: '12px 0', borderTop: i ? `1.5px solid ${G.cardLine}` : 'none', gap: 12 }}>
      <span style={{ width: 30, height: 30, borderRadius: 18, background: tone === 'red' ? 'rgba(225,29,42,0.10)' : 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <window.Ic name={icon} size={15} color={tone === 'red' ? G.red : G.sub} sw={2} />
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: G.ink }}>{label}</div>
        {sub && <By size={11.5} c={G.faint} style={{ marginTop: 2 }}>{sub}</By>}
      </div>
      <div style={{ textAlign: 'right' }}>
        <Eb style={{ fontSize: 9 }}>seit</Eb>
        <Dp size={17} style={{ marginTop: 3 }}>{since}</Dp>
      </div>
    </R>
  );
}

// Contact in two honest states
function PgContact({ p, open, canSeeAnyway }) {
  if (open || canSeeAnyway) {
    return (
      <Cd pad="4px 16px">
        {canSeeAnyway && !open && <R style={{ padding: '11px 0 10px', gap: 9, borderBottom: `1.5px solid ${G.cardLine}` }}>
          <window.Ic name="key" size={15} color={G.blue} sw={2} />
          <By size={11.5} c={G.blue} w={800}>Du siehst das über dein Amt — für andere Mitglieder ist es verborgen</By>
        </R>}
        <PgKV k="Telefon" v={p.tel} />
        <PgKV k="E-Mail" v={p.mail} i />
        <PgKV k="Adresse" v={p.adr} i />
      </Cd>
    );
  }
  return (
    <Cd pad="16px" style={{ background: '#fff', borderStyle: 'dashed', borderColor: 'rgba(26,20,17,0.18)' }}>
      <R style={{ gap: 11, alignItems: 'flex-start' }}>
        <span style={{ width: 30, height: 30, borderRadius: 18, background: 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <window.Ic name="bell" size={15} color={G.faint} sw={2} />
        </span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: G.ink }}>Kontaktdaten sind hinterlegt, aber nicht freigegeben</div>
          <By size={12.5} c={G.sub} style={{ marginTop: 5 }}>{p.n.split(' ')[0]} hat die Anzeige für Mitglieder ausgeschaltet. Das ist eine Einstellung, keine Lücke — frag im Zweifel eine Gruppen-Admin.</By>
          <div style={{ display: 'flex', gap: 18, marginTop: 12 }}>
            {['Telefon', 'E-Mail', 'Adresse'].map(k => (
              <div key={k}><Eb style={{ fontSize: 9 }}>{k}</Eb><R style={{ gap: 5, marginTop: 5 }}><span style={{ width: 34, height: 8, borderRadius: 6, background: 'repeating-linear-gradient(90deg, rgba(26,20,17,0.18) 0 3px, transparent 3px 6px)' }} /><By size={10.5} c={G.faint} w={800}>privat</By></R></div>
            ))}
          </div>
        </div>
      </R>
    </Cd>
  );
}

function PgPersonMob({ who = 'Anna Brunner', hidden }) {
  const p = P_BY[who];
  return (
    <Mob kicker="Mitglieder" pill="Mitglieder"
      head={<div style={{ position: 'relative', marginTop: 16 }}>
        <R style={{ gap: 14 }}>
          <Av name={p.n} size={58} tone={p.ehren ? 'gold' : null} />
          <div style={{ minWidth: 0 }}>
            <Dp size={30}>{p.n.split(' ')[0].toUpperCase()}</Dp>
            <Dp size={30} style={{ marginTop: 2 }}>{p.n.split(' ').slice(1).join(' ').toUpperCase()}</Dp>
          </div>
        </R>
        <R style={{ gap: 7, marginTop: 14, flexWrap: 'wrap' }}>
          <St s={p.s} />
          {p.ehren && <window.Chip tone="gold">Ehrenmitglied</window.Chip>}
          {p.a.map(([n]) => <window.Chip key={n} tone="red">{n}</window.Chip>)}
          {p.k && <window.Chip tone="blue">Schlüssel</window.Chip>}
        </R>
      </div>}>
      <div><Sc>Im Verein</Sc><Cd pad="4px 16px">
        <PgKV k="Mitglied seit" v={p.seit || '—'} />
        <PgKV k="Mitgliedschaft" v={p.art || 'keine'} i />
        {p.ehren && <PgKV k="Ehrenmitglied" v={'verliehen ' + p.ehren} i />}
      </Cd></div>
      <div><Sc>Gruppen</Sc><Cd pad="2px 16px">
        {p.g.map(([n, s], i) => <PgSinceRow key={n} label={n} since={s} i={i} />)}
      </Cd></div>
      {!!p.a.length && <div><Sc>Ämter</Sc><Cd pad="2px 16px">
        {p.a.map(([n, s], i) => <PgSinceRow key={n} label={n} since={s} tone="red" icon="key" i={i} />)}
      </Cd></div>}
      <div><Sc>Kontakt</Sc><PgContact p={p} open={!hidden} /></div>
    </Mob>
  );
}

function PgPersonDesk({ who = 'Christa Vogel', hidden = true, canSeeAnyway }) {
  const p = P_BY[who];
  return (
    <Desk active="Mitglieder" kicker="Mitglieder · Person" title={p.n.toUpperCase()}
      sub={(p.seit ? 'Mitglied seit ' + p.seit : 'Ohne Mitgliedschaft — in der Kindergarde als Trainerin') + (p.ehren ? ' · Ehrenmitglied seit Session ' + p.ehren : '')}
      actions={<R style={{ gap: 8 }}><St s={p.s} />{p.ehren && <Seal size={22} label="EHRENMITGLIED" />}{p.k && <KeyM size={15} />}</R>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div><Sc>Gruppen</Sc><Cd pad="2px 18px">
            {p.g.length ? p.g.map(([n, s], i) => <PgSinceRow key={n} label={n} since={s} i={i} sub="Zugehörigkeit läuft" />) : <div style={{ padding: '6px 0' }}><Emp icon="grid" title="IN KEINER GRUPPE" text={p.n.split(' ')[0] + ' ist Mitglied, tanzt und spielt aber in keiner Gruppe mit.'} /></div>}
          </Cd></div>
          <div><Sc>Ämter</Sc><Cd pad="2px 18px">
            {p.a.map(([n, s], i) => <PgSinceRow key={n} label={n} since={s} tone="red" icon="key" i={i} sub="gewählt auf der Jahreshauptversammlung" />)}
          </Cd></div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div><Sc>Mitgliedschaft</Sc><Cd pad="4px 18px">
            <PgKV k="Mitglied seit" v={p.seit || '—'} />
            <PgKV k="Mitgliedschaftsart" v={p.art || 'keine'} i />
            <PgKV k="Status" v={p.s === 'aktiv' ? 'aktiv' : p.s} i />
            {p.ehren && <PgKV k="Ehrenmitgliedschaft" v={'Session ' + p.ehren} i hint="Läuft neben der Mitgliedschaft weiter." />}
          </Cd></div>
          <div><Sc>Kontakt</Sc><PgContact p={p} open={!hidden} canSeeAnyway={canSeeAnyway} /></div>
        </div>
      </div>
    </Desk>
  );
}

// ══ 3 · GRUPPEN ══════════════════════════════════════════════════════════
function PgOpenTag({ open, sm }) {
  if (open) return <window.Chip tone="gold" dot style={sm ? { fontSize: 10 } : null}>sucht Verstärkung</window.Chip>;
  return <window.Chip tone="neutral" style={sm ? { fontSize: 10 } : null}>Team komplett</window.Chip>;
}

function PgFaceStack({ n = 4, names }) {
  const list = names || byName.slice(0, n).map(p => p.n);
  return (
    <R style={{ gap: 0 }}>
      {list.map((nm, i) => <span key={nm} style={{ marginLeft: i ? -10 : 0, borderRadius: 30, boxShadow: '0 0 0 2.5px #FBF4E6' }}><Av name={nm} size={26} /></span>)}
    </R>
  );
}

function PgGroupCard({ g, wide }) {
  return (
    <Cd pad={wide ? '20px 22px' : '16px 18px'} style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', opacity: g.archived ? 0.72 : 1 }}>
      <R style={{ alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Dp size={wide ? 27 : 23}>{g.n.toUpperCase()}</Dp>
          <Eb style={{ marginTop: 7 }}>seit {g.since}{g.archived ? ' · archiviert ' + g.ended : ''}</Eb>
        </div>
        <Dp size={wide ? 34 : 28} c={g.archived ? G.faint : G.red}>{g.c}</Dp>
      </R>
      <By size={13} c={G.sub} style={{ marginTop: 12, flex: 1 }}>{g.d}</By>
      <R style={{ marginTop: 16, gap: 12 }}>
        {g.c > 0 ? <PgFaceStack n={4} /> : <By size={12} c={G.faint} style={{ fontStyle: 'italic' }}>keine Mitglieder</By>}
        <By size={11.5} c={G.faint}>{g.c > 0 ? g.c + ' Personen' : ''}</By>
        <div style={{ flex: 1 }} />
        {g.archived ? <window.Chip tone="neutral">archiviert</window.Chip> : <PgOpenTag open={g.open} />}
      </R>
    </Cd>
  );
}

function PgGroupsMob({ state }) {
  return (
    <Mob kicker="Verein" title="GRUPPEN" back={false} pill="Gruppen"
      right={<span style={{ fontFamily: G.display, fontSize: 15, color: G.faint }}>7</span>}
      head={<By size={13} c={G.sub} style={{ marginTop: 10, position: 'relative' }}>Sieben Einheiten, eine Session. Drei suchen gerade Verstärkung.</By>}>
      {state === 'load' ? <>{[0, 1].map(i => <Cd key={i} pad="16px 18px"><Sk w="55%" h={22} /><Sk w="100%" h={11} style={{ marginTop: 14 }} /><Sk w="80%" h={11} style={{ marginTop: 8 }} /><Sk w={110} h={26} r={20} style={{ marginTop: 16 }} /></Cd>)}</>
        : GD.GROUPS.filter(g => !g.archived).slice(0, 3).map(g => <PgGroupCard key={g.id} g={g} />)}
    </Mob>
  );
}

function PgGroupsDesk() {
  const live = GD.GROUPS.filter(g => !g.archived), arch = GD.GROUPS.filter(g => g.archived);
  return (
    <Desk active="Gruppen" kicker="Verein · lesend" title="UNSERE GRUPPEN" sub="Sieben Einheiten tragen die Session. Drei suchen gerade Verstärkung — einfach bei der Gruppen-Admin melden."
      actions={<R style={{ gap: 14 }}><Stt label="Gruppen" value="7" /><Stt label="Sucht Verstärkung" value="3" /><Stt label="Personen in Gruppen" value="93" /></R>}>
      <Sc right={<By size={12} c={G.faint}>nach Gründungsjahr</By>}>Aktive Gruppen</Sc>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 18 }}>
        {live.map(g => <PgGroupCard key={g.id} g={g} wide />)}
      </div>
      <Sc style={{ marginTop: 28 }}>Ruhende Gruppen</Sc>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 18 }}>
        {arch.map(g => <PgGroupCard key={g.id} g={g} wide />)}
      </div>
    </Desk>
  );
}

// ══ 4 · GRUPPE ═══════════════════════════════════════════════════════════
function PgBilder({ n = 3, h = 96, note = 'Bilder aus vergangenen Sessions kommen später aus der Galerie.' }) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${n}, minmax(0,1fr))`, gap: 10 }}>
        {Array.from({ length: n }).map((_, i) => (
          <div key={i} style={{ height: h, borderRadius: 12, border: '1.5px dashed rgba(26,20,17,0.18)', background: 'repeating-linear-gradient(135deg, rgba(26,20,17,0.045) 0 7px, transparent 7px 14px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 9.5, color: G.faint, letterSpacing: 0.4 }}>{['SITZUNG 24/25', 'UMZUG 23/24', 'GARDE 22/23', 'PROBE'][i] || 'FOTO'}</span>
          </div>
        ))}
      </div>
      <By size={11.5} c={G.faint} style={{ marginTop: 10 }}>{note}</By>
    </div>
  );
}

const TG_MEMBERS = ['Anna Brunner', 'Ilka Reineke', 'Lena Sommer', 'Paula Dietz'];

function PgAdminRow({ name, funk, since, i, action }) {
  const p = P_BY[name];
  return (
    <R style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${G.cardLine}` : 'none', gap: 12 }}>
      <Av name={name} size={34} tone={p && p.ehren ? 'gold' : null} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13.5, color: G.ink }}>{name}</div>
        <R style={{ gap: 6, marginTop: 3 }}>
          <span style={{ fontWeight: 800, fontSize: 11.5, color: G.red }}>{funk}</span>
          {p && p.s === 'kein' && <span style={{ fontWeight: 700, fontSize: 11, color: G.faint }}>· kein Mitglied</span>}
        </R>
      </div>
      <div style={{ textAlign: 'right' }}><Eb style={{ fontSize: 9 }}>seit</Eb><Dp size={15} style={{ marginTop: 3 }}>{since}</Dp></div>
      {action}
    </R>
  );
}

function PgGroupMob({ hub, admin, sheet, lower }) {
  const g = GD.GROUPS[0];
  return (
    <Mob kicker={hub ? 'Meine Gruppen' : 'Gruppen'} pill={hub ? 'Tanzgarde' : 'Gruppen'} sheet={sheet}
      right={admin ? <window.Chip tone="red">Gruppen-Admin</window.Chip> : null}
      head={<div style={{ position: 'relative', marginTop: 14 }}>
        <Dp size={34}>TANZGARDE</Dp>
        <R style={{ gap: 7, marginTop: 12 }}>
          <PgOpenTag open={g.open} />
          <window.Chip tone="ink">18 Personen</window.Chip>
          <window.Chip tone="neutral">seit 1974</window.Chip>
        </R>
      </div>}>
      {!lower && <Cd pad="14px 16px">
        <By size={13} c={G.sub}>{g.d}</By>
        {admin && <R style={{ marginTop: 12, gap: 8 }}><window.Btn sm ghost icon="settings">Beschreibung ändern</window.Btn></R>}
      </Cd>}
      {admin && !lower && <Cd pad="12px 16px" style={{ background: '#fff' }}>
        <R style={{ gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 13.5, color: G.ink }}>Sucht Verstärkung</div>
            <By size={11.5} c={G.faint} style={{ marginTop: 3 }}>Steht dann öffentlich auf der Gruppen-Seite</By>
          </div>
          <window.PgSw on />
        </R>
      </Cd>}
      {!lower && <div><Sc right={admin ? <window.Btn sm ghost icon="plus" style={{ padding: '5px 11px', fontSize: 12 }}>Admin</window.Btn> : null}>Gruppen-Admins</Sc>
        <Cd pad="2px 16px">
          <PgAdminRow name="Anna Brunner" funk="Trainerin" since="2019" action={admin ? <window.Ic name="chevron" size={15} color={G.faint} /> : null} />
          <PgAdminRow name="Lena Sommer" funk="Kommandantin" since="2022" i action={admin ? <window.Ic name="chevron" size={15} color={G.faint} /> : null} />
        </Cd>
      </div>}
      <div><Sc right={admin ? <window.Btn sm ghost icon="plus" style={{ padding: '5px 11px', fontSize: 12 }}>Mitglied</window.Btn> : null}>Mitglieder · 18</Sc>
        <Cd pad="2px 16px">
          {TG_MEMBERS.slice(0, lower ? 4 : 2).map((nm, i) => <PgSinceRow key={nm} label={nm} since={P_BY[nm].g[0][1]} sub={P_BY[nm].s === 'ruht' ? 'ruht diese Session' : null} i={i} icon="users" />)}
          <R style={{ padding: '11px 0', borderTop: `1.5px solid ${G.cardLine}`, justifyContent: 'center' }}><By size={12} c={G.faint}>{lower ? '14' : '16'} weitere</By></R>
        </Cd>
      </div>
      {hub && lower && <div><Sc>Termine</Sc><Cd pad="16px" style={{ background: '#fff', borderStyle: 'dashed', borderColor: 'rgba(26,20,17,0.18)' }}>
        <R style={{ gap: 11 }}><window.Ic name="calendar" size={18} color={G.faint} sw={2} /><div><div style={{ fontWeight: 800, fontSize: 13, color: G.ink }}>Kommt mit dem Spielplan</div><By size={11.5} c={G.faint}>Training, Proben und Auftritte der Tanzgarde — Phase 2.</By></div></R>
      </Cd></div>}
      {lower && <div><Sc>Bilder</Sc><PgBilder n={3} h={78} /></div>}
    </Mob>
  );
}

function PgGroupDesk() {
  const g = GD.GROUPS[0];
  return (
    <Desk active="Gruppen" kicker="Verein · Gruppe" title="TANZGARDE" sub={g.d}
      actions={<R style={{ gap: 14 }}><Stt label="Personen" value="18" /><Stt label="In der Gruppe seit ø" value="2017" /><div><PgOpenTag open /></div></R>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.25fr) minmax(0,1fr)', gap: 28 }}>
        <div>
          <Sc right={<By size={12} c={G.faint}>mit „in der Gruppe seit“</By>}>Mitglieder</Sc>
          <Cd pad="2px 20px">
            {TG_MEMBERS.concat(['Katrin Möller', 'Jonas Weber']).map((nm, i) => (
              <R key={nm} style={{ padding: '10px 0', borderTop: i ? `1.5px solid ${G.line2}` : 'none', gap: 12, cursor: 'pointer' }}>
                <Av name={nm} size={32} tone={P_BY[nm].ehren ? 'gold' : null} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: G.ink }}>{nm}</div>
                  <By size={11.5} c={G.faint}>{P_BY[nm].a[0] ? P_BY[nm].a[0][0] : 'Tänzerin'}</By>
                </div>
                <St s={P_BY[nm].s} sm />
                <div style={{ width: 66, textAlign: 'right' }}><Eb style={{ fontSize: 9 }}>seit</Eb><Dp size={16} style={{ marginTop: 3 }}>{(P_BY[nm].g[0] || ['', '2015'])[1]}</Dp></div>
              </R>
            ))}
            <R style={{ padding: '12px 0', borderTop: `1.5px solid ${G.line2}`, justifyContent: 'center' }}><By size={12} c={G.faint}>12 weitere Personen</By></R>
          </Cd>
          <Sc style={{ marginTop: 26 }}>Bilder</Sc>
          <PgBilder n={4} h={128} note="Platz für ein paar Bilder aus vergangenen Sessions. Die Galerie liefert sie später automatisch — hier wird nichts hochgeladen." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div><Sc>Gruppen-Admins</Sc><Cd pad="2px 18px">
            <PgAdminRow name="Anna Brunner" funk="Trainerin" since="2019" />
            <PgAdminRow name="Lena Sommer" funk="Kommandantin" since="2022" i />
          </Cd>
          <By size={11.5} c={G.faint} style={{ marginTop: 9 }}>Gruppen-Admins pflegen die Gruppe. Sie müssen nicht selbst in der Gruppe tanzen.</By></div>
          <div><Sc>Mitmachen</Sc><Cd pad="18px">
            <Dp size={20}>WIR SUCHEN VERSTÄRKUNG</Dp>
            <By size={13} c={G.sub} style={{ marginTop: 9 }}>Donnerstag 19:00, Sporthalle. Vorkenntnisse braucht keiner, Spaß am Marschieren hilft.</By>
            <R style={{ marginTop: 14, gap: 8 }}><window.Btn sm primary>Bei Anna melden</window.Btn></R>
          </Cd></div>
        </div>
      </div>
    </Desk>
  );
}

Object.assign(window, { PgPersonRow, PgLetter, PgGrouped, PgKV, PgSinceRow, PgContact, PgOpenTag, PgFaceStack, PgGroupCard, PgBilder, PgAdminRow, PgMembersMob, PgMembersDesk, PgPersonMob, PgPersonDesk, PgGroupsMob, PgGroupsDesk, PgGroupMob, PgGroupDesk, P_BY, byName });
