// fcc-pg-admin.jsx — Screens 8–11: Personenverwaltung, Person bearbeiten,
// Gruppenverwaltung, Ämter & Rechte. Werkzeug-Charakter, aber gleiche Sprache.

const { PGP: A, PG: AD, PgRow: AR, PgEyeb: AEb, PgDisp: ADp, PgBody: ABy, PgSec: ASc, PgCd: ACd,
  PgAv: AAv, PgSeal: ASeal, PgKey: AKey, PgState: ASt, PgSw: ASw, PgSearch: ASrch, PgFilters: AFlt,
  PgStat: AStt, PgSkel: ASk, PgEmpty: AEmp, PgConfirm: AConf, PgMob: AMob, PgDesk: ADesk,
  PgField: AFld, PgSheet: ASheet, PgKV: AKV, P_BY: AP, byName: ABy2 } = window;

// ══ 8 · PERSONENVERWALTUNG ═══════════════════════════════════════════════
const ALL = ABy2;

function PgAdminPersonsDesk({ state }) {
  return (
    <ADesk active="Personenverwaltung" kicker="Verwaltung · Recht: Personen verwalten" title="PERSONENVERWALTUNG"
      sub="Alle Personen im Register — auch ausgetretene und Leute ohne Vereinsbindung."
      actions={<AR style={{ gap: 12 }}><ASrch w={300} ph="Name, Adresse, E-Mail" /><window.Btn primary icon="plus">Person anlegen</window.Btn></AR>}>
      <AR style={{ gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <AFlt items={['Alle 168', 'Aktiv 134', 'Ruht 12', 'Beendet 16', 'Ohne Mitgliedschaft 6', 'Ehrenmitglied 6']} />
        <div style={{ flex: 1 }} />
        <ABy size={12} c={A.faint}>Sortiert nach Nachname</ABy>
      </AR>
      {state === 'load' ? (
        <ACd pad="4px 20px">{Array.from({ length: 9 }).map((_, i) => <window.PgSkelRow key={i} />)}</ACd>
      ) : state === 'empty' ? (
        <ACd pad="10px 20px"><AEmp icon="search" title="KEIN TREFFER" text="Zu „Wollenschläger“ gibt es keine Person. Wenn sie neu ist, leg sie an — Name und Geburtsdatum genügen." action={<window.Btn primary icon="plus">Person anlegen</window.Btn>} /></ACd>
      ) : (
        <ACd pad="4px 20px">
          <AR style={{ padding: '10px 0 8px', gap: 12, borderBottom: `1.5px solid ${A.cardLine}` }}>
            <AEb style={{ width: 224 }}>Person</AEb><AEb style={{ width: 96 }}>Geboren</AEb><AEb style={{ flex: 1 }}>Kontakt</AEb>
            <AEb style={{ width: 128 }}>Mitgliedschaft</AEb><AEb style={{ width: 148 }}>Gruppen / Ämter</AEb><AEb style={{ width: 92 }}>Status</AEb><AEb style={{ width: 92 }} />
          </AR>
          {ALL.slice(0, 11).map((p, i) => (
            <AR key={p.n} style={{ padding: '9px 0', gap: 12, borderTop: i ? `1.5px solid ${A.line2}` : 'none' }}>
              <AR style={{ width: 224, gap: 10 }}>
                <AAv name={p.n} size={30} tone={p.ehren ? 'gold' : null} />
                <div style={{ minWidth: 0 }}>
                  <AR style={{ gap: 6 }}><div style={{ fontWeight: 800, fontSize: 13, color: A.ink }}>{p.n}</div>{p.ehren && <ASeal size={13} />}{p.k && <AKey size={11} />}</AR>
                  <ABy size={10.5} c={A.faint}>{p.adr.split(',')[1] || p.adr}</ABy>
                </div>
              </AR>
              <ABy size={12} c={A.sub} style={{ width: 96 }}>{p.geb}</ABy>
              <div style={{ flex: 1, minWidth: 0 }}>
                <ABy size={12} w={700} c={A.ink} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.mail}</ABy>
                <AR style={{ gap: 6, marginTop: 2 }}><ABy size={10.5} c={A.faint}>{p.tel}</ABy>{!p.c && <window.Chip tone="neutral" style={{ fontSize: 9.5, padding: '2px 6px' }}>nicht freigegeben</window.Chip>}</AR>
              </div>
              <div style={{ width: 128 }}>
                <ABy size={12} w={800} c={A.ink}>{p.art || '—'}</ABy>
                <ABy size={10.5} c={A.faint}>{p.seit ? 'seit ' + p.seit : 'keine Bindung'}{p.bis ? ' – ' + p.bis : ''}</ABy>
              </div>
              <div style={{ width: 148, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {p.g.map(([n]) => <window.Chip key={n} tone="ink" style={{ fontSize: 10 }}>{n}</window.Chip>)}
                {p.a.map(([n]) => <window.Chip key={n} tone="red" style={{ fontSize: 10 }}>{n.split(' · ')[0]}</window.Chip>)}
                {!p.g.length && !p.a.length && <ABy size={12} c={A.faint}>—</ABy>}
              </div>
              <div style={{ width: 92 }}><ASt s={p.s} sm /></div>
              <div style={{ width: 92, textAlign: 'right' }}><window.Btn sm ghost style={{ padding: '5px 11px', fontSize: 11.5 }}>Bearbeiten</window.Btn></div>
            </AR>
          ))}
          <AR style={{ padding: '13px 0', borderTop: `1.5px solid ${A.line2}`, gap: 12 }}>
            <ABy size={12} c={A.faint} style={{ flex: 1 }}>11 von 168 Personen</ABy>
            <window.Btn sm ghost>Weitere laden</window.Btn>
          </AR>
        </ACd>
      )}
    </ADesk>
  );
}

function PgAdminPersonsMob() {
  return (
    <AMob kicker="Verwaltung" title="PERSONEN" back={false} pill="Personenverwaltung"
      right={<window.Chip tone="red">Amt</window.Chip>}
      head={<div style={{ position: 'relative', marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <ASrch ph="Name, Adresse, E-Mail" />
        <AFlt items={['Alle 168', 'Aktiv 134', 'Beendet 16', 'Ohne Bindung 6']} />
      </div>} pad="6px 18px 84px" gap={0}>
      {ALL.slice(0, 7).map((p, i) => (
        <AR key={p.n} style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${A.line2}` : 'none', gap: 12 }}>
          <AAv name={p.n} size={38} tone={p.ehren ? 'gold' : null} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <AR style={{ gap: 6 }}><div style={{ fontWeight: 800, fontSize: 14, color: A.ink }}>{p.n}</div>{p.ehren && <ASeal size={13} />}</AR>
            <ABy size={11.5} c={A.faint} style={{ marginTop: 2 }}>{p.geb} · {p.art || 'keine Mitgliedschaft'}{p.seit ? ' seit ' + p.seit : ''}</ABy>
          </div>
          <ASt s={p.s} sm />
          <window.Ic name="chevron" size={15} color={A.faint} />
        </AR>
      ))}
      <div style={{ position: 'absolute', right: 20, bottom: 84, zIndex: 22 }}>
        <div style={{ width: 54, height: 54, borderRadius: 30, background: A.red, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(225,29,42,0.35)' }}>
          <window.Ic name="plus" size={24} color="#fff" sw={2.4} />
        </div>
      </div>
    </AMob>
  );
}

// ══ 9 · PERSON BEARBEITEN ════════════════════════════════════════════════
function PgFactRow({ title, span, meta, tone = 'ink', i, actions = true, running }) {
  return (
    <AR style={{ padding: '12px 0', borderTop: i ? `1.5px solid ${A.cardLine}` : 'none', gap: 12 }}>
      <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: tone === 'gold' ? A.gold : tone === 'red' ? A.red : 'rgba(26,20,17,0.18)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <AR style={{ gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: A.ink }}>{title}</div>
          {running && <window.Chip tone="green" dot style={{ fontSize: 10 }}>läuft</window.Chip>}
        </AR>
        {meta && <ABy size={11.5} c={A.faint} style={{ marginTop: 3 }}>{meta}</ABy>}
      </div>
      <div style={{ fontFamily: A.display, fontSize: 15, color: A.ink, letterSpacing: 0.4, whiteSpace: 'nowrap' }}>{span}</div>
      {actions && <AR style={{ gap: 6 }}>
        <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5 }}>Ändern</window.Btn>
        <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5, color: A.red, borderColor: 'rgba(225,29,42,0.35)' }}>Beenden</window.Btn>
      </AR>}
    </AR>
  );
}

// Der Editor für EINEN datierten Fakt — hier: Ruhezeit
function PgFactEditor({ inline = true }) {
  return (
    <ACd pad="18px" style={{ background: '#fff', border: `1.5px solid ${A.red}` }}>
      <AR style={{ gap: 10, marginBottom: 14 }}>
        <span style={{ width: 9, height: 9, background: A.red }} />
        <ADp size={19}>RUHEZEIT HINZUFÜGEN</ADp>
        <div style={{ flex: 1 }} />
        <ABy size={11.5} c={A.faint}>Ruhezeiten gelten immer für ganze Sessions</ABy>
      </AR>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 14 }}>
        <AFld label="Von Session" value="2025/26" icon="calendar" />
        <AFld label="Bis Session" ph="offen — bis auf Weiteres" icon="calendar" chips={['offen lassen', '2026/27', '2027/28']} />
      </div>
      <div style={{ marginTop: 14 }}>
        <AFld label="Grund" value="Studium" chips={['Studium', 'Schule', 'Ausbildung', 'Elternzeit', 'Krankheit', 'Eigener Text']} hint="Der Grund ist intern. In ihrem Profil steht nur „ruht“." />
      </div>
      <AR style={{ marginTop: 16, gap: 12, background: A.card, border: `1.5px solid ${A.cardLine}`, borderRadius: 12, padding: '12px 14px' }}>
        <window.Ic name="bolt" size={16} color={A.gold} sw={2} />
        <ABy size={12} c={A.sub} style={{ flex: 1 }}>Ab Session 2025/26 zahlt Paula keinen Beitrag und zählt nicht als aktiv. Ihre Gruppen bleiben bestehen.</ABy>
      </AR>
      <AR style={{ marginTop: 16, gap: 10, justifyContent: 'flex-end' }}>
        <window.Btn ghost sm>Abbrechen</window.Btn>
        <window.Btn primary sm>Ruhezeit speichern</window.Btn>
      </AR>
    </ACd>
  );
}

function PgAdminPersonEditDesk({ editor = true }) {
  const p = AP['Paula Dietz'];
  return (
    <ADesk active="Personenverwaltung" kicker="Verwaltung · Person bearbeiten" title="PAULA DIETZ"
      sub="Mitglied seit 2017 · Aktiv · ruht seit Session 2025/26 (Studium in Jena)"
      actions={<AR style={{ gap: 10 }}><ASt s="ruht" /><window.Btn ghost>Verlauf</window.Btn><window.Btn primary>Speichern</window.Btn></AR>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.35fr) minmax(0,1fr)', gap: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div><ASc right={<ABy size={12} c={A.faint}>Beginn und Ende, offen möglich</ABy>}>Mitgliedschaft</ASc>
            <ACd pad="2px 18px">
              <PgFactRow title="Aktiv · 30 € / Jahr" span="01.09.2017 – offen" meta="Aufnahme beschlossen 12.08.2017" running />
              <PgFactRow title="Jugend · 15 € / Jahr" span="2014 – 2017" meta="Übergang mit dem 18. Geburtstag" i actions={false} />
              <AR style={{ padding: '11px 0', borderTop: `1.5px solid ${A.cardLine}` }}><window.Btn sm ghost icon="plus" style={{ padding: '6px 12px', fontSize: 12 }}>Zeitraum hinzufügen</window.Btn></AR>
            </ACd>
          </div>
          <div><ASc right={<ABy size={12} c={A.faint}>ganze Sessions</ABy>}>Ruhezeiten</ASc>
            {editor ? <PgFactEditor /> : <ACd pad="2px 18px">
              <PgFactRow title="Studium" span="2025/26 – offen" meta="angelegt von Ilka Reineke am 02.09.2026" tone="gold" running />
              <AR style={{ padding: '11px 0', borderTop: `1.5px solid ${A.cardLine}` }}><window.Btn sm ghost icon="plus" style={{ padding: '6px 12px', fontSize: 12 }}>Ruhezeit hinzufügen</window.Btn></AR>
            </ACd>}
          </div>
          <div><ASc>Beitragsermäßigungen</ASc>
            <ACd pad="2px 18px">
              <PgFactRow title="Studium · beitragsfrei" span="2025/26 – 2027/28" meta="Nachweis: Immatrikulationsbescheinigung" tone="gold" running />
              <PgFactRow title="Minderjährig · halber Beitrag" span="2014 – 2017" meta="automatisch aus dem Geburtsdatum" i actions={false} />
              <AR style={{ padding: '11px 0', borderTop: `1.5px solid ${A.cardLine}` }}><window.Btn sm ghost icon="plus" style={{ padding: '6px 12px', fontSize: 12 }}>Ermäßigung hinzufügen</window.Btn></AR>
            </ACd>
          </div>
          <div><ASc>Ehrenmitgliedschaft</ASc>
            <ACd pad="18px">
              <AR style={{ gap: 12 }}>
                <ASeal size={26} />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13.5, color: A.ink }}>Keine Ehrenmitgliedschaft</div><ABy size={11.5} c={A.faint} style={{ marginTop: 3 }}>Wird in einer Session verliehen und läuft dann neben der Mitgliedschaft weiter.</ABy></div>
                <window.Btn sm ghost icon="plus" style={{ padding: '6px 12px', fontSize: 12 }}>Verleihen</window.Btn>
              </AR>
            </ACd>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div><ASc>Stammdaten</ASc><ACd pad="4px 18px">
            <AKV k="Name" v={p.n} />
            <AKV k="Geburtsdatum" v={p.geb} i />
            <AKV k="Telefon" v={p.tel} i />
            <AKV k="E-Mail" v={p.mail} i />
            <AKV k="Adresse" v="Wagnergasse 12, 07743 Jena" i />
            <AR style={{ padding: '12px 0', borderTop: `1.5px solid ${A.cardLine}`, gap: 12 }}>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 13, color: A.ink }}>Kontakt für Mitglieder sichtbar</div><ABy size={11} c={A.faint}>von Paula selbst gesetzt</ABy></div>
              <ASw on />
            </AR>
          </ACd></div>
          <div><ASc right={<window.Chip tone="neutral">nur Ansicht</window.Chip>}>Gruppen</ASc>
            <ACd pad="2px 18px">
              <window.PgSinceRow label="Tanzgarde" since="2017" sub="Zugehörigkeit läuft" icon="users" />
              <AR style={{ padding: '11px 0', borderTop: `1.5px solid ${A.cardLine}`, gap: 10 }}>
                <window.Ic name="bolt" size={15} color={A.faint} sw={2} />
                <ABy size={11.5} c={A.faint} style={{ flex: 1 }}>Gruppen pflegen die Gruppen-Admins. Überschreiben geht in der Gruppenverwaltung.</ABy>
              </AR>
            </ACd>
          </div>
          <div><ASc right={<window.Chip tone="neutral">nur Ansicht</window.Chip>}>Ämter</ASc>
            <ACd pad="10px 18px"><AEmp icon="key" title="KEIN AMT" text="Ämter werden unter „Ämter & Rechte“ vergeben." /></ACd>
          </div>
        </div>
      </div>
    </ADesk>
  );
}

// ══ 10 · GRUPPENVERWALTUNG ═══════════════════════════════════════════════
const GADM = { tanzgarde: ['Anna Brunner · Trainerin', 'Lena Sommer · Kommandantin'], elferrat: ['Bernd Kastner · Sprecher'], maennerballett: ['Jonas Weber · Trainer'], kindergarde: ['Elif Kaya · Trainerin'], showtanz: ['Katrin Möller · Trainerin'], technik: ['Frank Öhler · Bühnenmeister'], kapelle: [], funken: [] };

function PgAdminGroupsDesk({ confirm }) {
  return (
    <ADesk active="Gruppenverwaltung" kicker="Verwaltung · Recht „Gruppen anlegen, bearbeiten, archivieren“" title="GRUPPENVERWALTUNG"
      dialog={confirm ? <AConf mode="dialog" eyebrow="Gruppe archivieren" title="MUSIK & KAPELLE ARCHIVIEREN?"
        text="Die Gruppe verschwindet aus dem Verzeichnis und von der öffentlichen Gruppen-Seite. Die 9 Zugehörigkeiten werden zum gewählten Datum beendet — in den Profilen bleibt „Musik & Kapelle 1972–2026“ stehen."
        rows={[['Personen betroffen', '9'], ['Gruppen-Admins', 'keine'], ['Ende am', '30.09.2026'], ['Rückgängig', 'jederzeit, wieder aktivieren']]}
        danger="Archivieren" /> : null}
      sub="Die höhere Instanz: hier lässt sich jede Zugehörigkeit und jede Gruppen-Admin-Rolle überschreiben."
      actions={<AR style={{ gap: 12 }}><ASrch w={240} ph="Gruppe suchen" /><window.Btn primary icon="plus">Gruppe anlegen</window.Btn></AR>}>
      <div>
        <div>
          <AFlt items={['Alle 8', 'Aktiv 7', 'Archiviert 1', 'Sucht Verstärkung 3', 'Ohne Admin 2']} style={{ marginBottom: 16 }} />
          <ACd pad="4px 20px">
            <AR style={{ padding: '10px 0 8px', gap: 12, borderBottom: `1.5px solid ${A.cardLine}` }}>
              <AEb style={{ width: 210 }}>Gruppe</AEb><AEb style={{ width: 74 }}>Personen</AEb><AEb style={{ flex: 1 }}>Gruppen-Admins</AEb><AEb style={{ width: 150 }}>Offenheit</AEb><AEb style={{ width: 96 }}>Status</AEb><AEb style={{ width: 168 }} />
            </AR>
            {AD.GROUPS.map((g, i) => (
              <AR key={g.id} style={{ padding: '11px 0', gap: 12, borderTop: i ? `1.5px solid ${A.line2}` : 'none', opacity: g.archived ? 0.66 : 1 }}>
                <div style={{ width: 210 }}>
                  <div style={{ fontFamily: A.display, fontSize: 17, color: A.ink, letterSpacing: 0.4 }}>{g.n.toUpperCase()}</div>
                  <ABy size={11} c={A.faint}>seit {g.since}{g.ended ? ' · beendet ' + g.ended : ''}</ABy>
                </div>
                <div style={{ width: 74, fontFamily: A.display, fontSize: 20, color: g.c ? A.ink : A.faint }}>{g.c}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {GADM[g.id].length ? GADM[g.id].map(x => (
                    <ABy key={x} size={12} w={700} c={A.ink}>{x.split(' · ')[0]} <span style={{ color: A.red }}>· {x.split(' · ')[1]}</span></ABy>
                  )) : <window.Chip tone="gold">kein Admin</window.Chip>}
                </div>
                <div style={{ width: 150 }}>{g.archived ? <ABy size={12} c={A.faint}>—</ABy> : <window.PgOpenTag open={g.open} sm />}</div>
                <div style={{ width: 96 }}>{g.archived ? <window.Chip tone="neutral">archiviert</window.Chip> : <window.Chip tone="green" dot>aktiv</window.Chip>}</div>
                <AR style={{ width: 168, gap: 6, justifyContent: 'flex-end' }}>
                  <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5 }}>Bearbeiten</window.Btn>
                  {g.archived ? <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5 }}>Aktivieren</window.Btn>
                    : <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5, color: A.red, borderColor: 'rgba(225,29,42,0.35)' }}>Archivieren</window.Btn>}
                </AR>
              </AR>
            ))}
          </ACd>
          <AR style={{ marginTop: 14, gap: 10 }}>
            <window.Ic name="bolt" size={15} color={A.faint} sw={2} />
            <ABy size={12} c={A.faint}>Archivieren löscht nichts: Die Gruppe verschwindet aus dem Verzeichnis, ihre Geschichte bleibt in den Profilen stehen.</ABy>
          </AR>
        </div>
      </div>
    </ADesk>
  );
}

Object.assign(window, { PgAdminPersonsDesk, PgAdminPersonsMob, PgFactRow, PgFactEditor, PgAdminPersonEditDesk, PgAdminGroupsDesk });
