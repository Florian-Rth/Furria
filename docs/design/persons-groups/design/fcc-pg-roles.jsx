// fcc-pg-roles.jsx — Screen 11 neu: Rollen & Rechte als Master-Detail.
// Links die Rollen des Vereins, rechts genau eine Rolle: ihre Inhaber und der
// vollständige Rechte-Katalog — ein Recht pro Zeile, mit Klartext-Beschreibung,
// logisch gruppiert. Kein Lesen/Schreiben/Löschen-Raster.

const { PGP: L, PG: LD, PgRow: LR, PgEyeb: LEb, PgDisp: LDp, PgBody: LBy, PgSec: LSc, PgCd: LCd,
  PgAv: LAv, PgSw: LSw, PgSearch: LSrch, PgConfirm: LConf, PgMob: LMob, PgDesk: LDesk,
  PgAdminRow: LHold, PgEmpty: LEmp, P_BY: LP } = window;

const KINDS = [
  ['basis', 'Grundrolle', 'hat jede Person mit Zugang'],
  ['gewählt', 'Gewählt', 'Jahreshauptversammlung'],
  ['ernannt', 'Ernannt', 'vom Präsidium bestimmt'],
  ['technisch', 'Technisch', 'nicht gewählt'],
];
const roleById = (id) => LD.ROLES.find(r => r.id === id) || LD.ROLES[1];

// ── Master: eine Rolle in der Liste ──────────────────────────────────────
function PgRoleItem({ ro, on }) {
  const n = window.PG.roleRights(ro).length;
  return (
    <div style={{ background: on ? '#fff' : 'transparent', border: `1.5px solid ${on ? L.ink : 'transparent'}`, borderRadius: 12, padding: '10px 12px 10px 11px', display: 'flex', alignItems: 'center', gap: 11, cursor: 'pointer' }}>
      <span style={{ width: 3, alignSelf: 'stretch', borderRadius: 3, background: on ? L.red : 'transparent' }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: L.display, fontSize: 17, letterSpacing: 0.4, color: on ? L.ink : L.sub }}>{ro.n.toUpperCase()}</div>
        <LBy size={11} c={L.faint} style={{ marginTop: 3 }}>
          {ro.locked ? ro.count + ' Personen' : ro.h.length ? ro.h.map(h => h[0]).join(', ') : 'unbesetzt'}
        </LBy>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontFamily: L.display, fontSize: 16, color: on ? L.red : L.faint }}>{n}</div>
        <LEb style={{ fontSize: 8.5, letterSpacing: 1.2 }}>Rechte</LEb>
      </div>
    </div>
  );
}

function PgRoleMaster({ sel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <LSrch ph="Rolle suchen" />
      {KINDS.map(([k, label, hint]) => {
        const list = LD.ROLES.filter(r => r.kind === k);
        if (!list.length) return null;
        return (
          <div key={k}>
            <LR style={{ gap: 8, marginBottom: 6, padding: '0 2px' }}>
              <LEb style={{ fontSize: 9, letterSpacing: 1.8 }}>{label}</LEb>
              <span style={{ flex: 1, height: 1.5, background: L.line2 }} />
              <LBy size={10.5} c={L.faint}>{hint}</LBy>
            </LR>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {list.map(ro => <PgRoleItem key={ro.id} ro={ro} on={ro.id === sel} />)}
            </div>
          </div>
        );
      })}
      <window.Btn ghost icon="plus" style={{ justifyContent: 'center' }}>Rolle anlegen</window.Btn>
    </div>
  );
}

// ── Detail: ein Recht = eine Zeile ───────────────────────────────────────
function PgRightRow({ r, on, i, locked }) {
  const others = window.PG.rightHolders(r.id) - (on ? 1 : 0);
  return (
    <LR style={{ padding: '13px 0', borderTop: i ? `1.5px solid ${L.line2}` : 'none', gap: 14, alignItems: 'flex-start', opacity: locked ? 0.62 : 1 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <LR style={{ gap: 8 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5, color: L.ink }}>{r.label}</div>
          {r.sens && <window.Chip tone="blue" style={{ fontSize: 9.5, padding: '2px 7px' }}>sensibel</window.Chip>}
          {r.danger && <window.Chip tone="red" style={{ fontSize: 9.5, padding: '2px 7px' }}>unwiderruflich</window.Chip>}
          {r.base && <window.Chip tone="neutral" style={{ fontSize: 9.5, padding: '2px 7px' }}>Grundrecht</window.Chip>}
        </LR>
        <LBy size={12} c={L.sub} style={{ marginTop: 4, maxWidth: 560 }}>{r.desc}</LBy>
      </div>
      <div style={{ width: 108, textAlign: 'right', paddingTop: 2 }}>
        <LBy size={11} c={L.faint}>{others > 0 ? 'auch in ' + others + ' Rollen' : on ? 'nur hier' : '—'}</LBy>
      </div>
      <div style={{ paddingTop: 1 }}>{locked ? <window.Chip tone="gold">gesetzt</window.Chip> : <LSw on={on} />}</div>
    </LR>
  );
}

function PgRightGroup({ g, has, locked }) {
  const n = g.rights.filter(r => has.includes(r.id)).length;
  return (
    <div style={{ marginTop: 22 }}>
      <LR style={{ gap: 10, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: n ? 'rgba(225,29,42,0.10)' : 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <window.Ic name={g.icon} size={16} color={n ? L.red : L.faint} sw={2} />
        </span>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: L.display, fontSize: 16, letterSpacing: 0.5, color: L.ink }}>{g.label.toUpperCase()}</div>
          <LBy size={11} c={L.faint} style={{ marginTop: 2 }}>{g.hint}</LBy>
        </div>
        <span style={{ flex: 1, height: 1.5, background: L.line2 }} />
        <LBy size={11.5} c={n ? L.ink : L.faint} w={800}>{n} von {g.rights.length}</LBy>
      </LR>
      <LCd pad="2px 18px">
        {g.rights.map((r, i) => <PgRightRow key={r.id} r={r} i={i} on={has.includes(r.id)} locked={locked || (r.base && has.includes(r.id))} />)}
      </LCd>
    </div>
  );
}

function PgRoleDetail({ ro }) {
  const has = window.PG.roleRights(ro);
  const kind = KINDS.find(k => k[0] === ro.kind);
  return (
    <div>
      <LCd pad="20px 22px" style={{ background: '#fff' }}>
        <LR style={{ gap: 16, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <LR style={{ gap: 8, marginBottom: 9 }}>
              <window.Chip tone="ink">{kind ? kind[1] : ro.kind}</window.Chip>
              {ro.unique && <window.Chip tone="gold">genau einmal</window.Chip>}
              {ro.multi && <window.Chip tone="neutral">mehrere möglich</window.Chip>}
              {ro.locked && <window.Chip tone="neutral">automatisch</window.Chip>}
            </LR>
            <LDp size={34}>{ro.n.toUpperCase()}</LDp>
            <LBy size={13.5} c={L.sub} style={{ marginTop: 10, maxWidth: 520 }}>{ro.desc}</LBy>
          </div>
          <LR style={{ gap: 10 }}>
            {!ro.locked && <window.Btn ghost sm>Umbenennen</window.Btn>}
            <window.Btn primary sm icon="plus">Inhaber</window.Btn>
          </LR>
        </LR>
        <div style={{ height: 1.5, background: L.line2, margin: '18px 0 14px' }} />
        {ro.locked ? (
          <LR style={{ gap: 11 }}>
            <window.Ic name="users" size={16} color={L.faint} sw={2} />
            <LBy size={12.5} c={L.sub} style={{ flex: 1 }}>Diese Rolle wird nicht vergeben — <b style={{ color: L.ink }}>{ro.count} Personen</b> haben sie automatisch mit ihrem Zugang. Ihre Rechte sind das, was jedes Mitglied darf.</LBy>
          </LR>
        ) : ro.h.length ? (
          <div>
            <LEb style={{ marginBottom: 4 }}>Inhaber</LEb>
            {ro.h.map(([nm, since], i) => (
              <LHold key={nm} name={nm} funk={ro.n} since={since} i={i}
                action={<window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5, color: L.red, borderColor: 'rgba(225,29,42,0.35)' }}>Beenden</window.Btn>} />
            ))}
          </div>
        ) : (
          <LR style={{ gap: 11 }}>
            <window.Ic name="bolt" size={16} color={L.gold} sw={2} />
            <LBy size={12.5} c={L.sub} style={{ flex: 1 }}>Die Rolle ist <b style={{ color: L.ink }}>unbesetzt</b>. Die Rechte sind gesetzt und greifen, sobald jemand eingetragen wird.</LBy>
          </LR>
        )}
      </LCd>

      <LR style={{ marginTop: 26, gap: 12 }}>
        <span style={{ width: 9, height: 9, background: L.red }} />
        <span style={{ fontFamily: L.display, fontSize: 15, letterSpacing: 1.4, color: L.ink }}>RECHTE DIESER ROLLE</span>
        <span style={{ flex: 1, height: 1.5, background: L.line2 }} />
        <LBy size={12} c={L.sub} w={800}>{has.length} von {LD.RIGHT_COUNT}</LBy>
      </LR>
      <LBy size={12} c={L.faint} style={{ marginTop: 8 }}>
        {ro.r === 'all'
          ? 'Admin trägt alle Rechte. Einzelne abschalten geht nicht — dafür eine eigene Rolle anlegen.'
          : 'Jede Zeile ist eine Sache, die man tun darf. Umschalten wirkt sofort für alle Inhaber dieser Rolle.'}
      </LBy>
      {LD.RIGHTGROUPS.map(g => <PgRightGroup key={g.id} g={g} has={has} locked={ro.locked || ro.r === 'all'} />)}
    </div>
  );
}

function PgRolesDesk({ role = 'praesidentin', confirm }) {
  const ro = roleById(role);
  return (
    <LDesk active="Rollen & Rechte" kicker="Verwaltung · Recht „Rechte einer Rolle ändern“" title="ROLLEN & RECHTE"
      sub="Der Verein legt seine Rollen selbst fest. Jede Rolle bekommt Rechte aus einem Katalog, der mit der App wächst."
      dialog={confirm ? <LConf mode="dialog" eyebrow="Inhaber beenden" title="KATRIN ALS PRÄSIDENTIN BEENDEN?"
        text="Sie verliert sofort die 16 Rechte dieser Rolle — darunter „Kontaktdaten aller Personen sehen“ und „Gruppen-Admins ernennen“. Was sie über andere Rollen hat, bleibt."
        rows={[['Rolle', 'Präsidentin'], ['Im Amt seit', '2022'], ['Ende am', '10.09.2026'], ['Danach', 'Rolle unbesetzt'], ['Andere Rollen von Katrin', 'keine']]}
        danger="Inhaberschaft beenden" /> : null}
      actions={<LR style={{ gap: 22 }}>
        <window.PgStat label="Rollen" value={LD.ROLES.length} />
        <window.PgStat label="Rechte im Katalog" value={LD.RIGHT_COUNT} />
        <window.PgStat label="Unbesetzt" value={LD.ROLES.filter(r => !r.locked && !r.h.length).length} />
      </LR>}>
      <div style={{ display: 'grid', gridTemplateColumns: '292px minmax(0,1fr)', gap: 32, alignItems: 'start' }}>
        <PgRoleMaster sel={ro.id} />
        <PgRoleDetail ro={ro} />
      </div>
    </LDesk>
  );
}

// ── Mobile: Liste → eine Rolle ───────────────────────────────────────────
function PgRolesMob({ role }) {
  if (!role) return (
    <LMob kicker="Verwaltung" title="ROLLEN" back={false} pill="Rollen & Rechte"
      right={<span style={{ fontFamily: L.display, fontSize: 15, color: L.faint }}>{LD.ROLES.length}</span>}
      head={<LBy size={13} c={L.sub} style={{ marginTop: 10, position: 'relative' }}>{LD.RIGHT_COUNT} Rechte im Katalog. Tippen öffnet eine Rolle.</LBy>} gap={12}>
      {KINDS.map(([k, label]) => {
        const list = LD.ROLES.filter(r => r.kind === k);
        if (!list.length) return null;
        return (
          <div key={k}>
            <LR style={{ gap: 8, marginBottom: 8 }}>
              <LEb style={{ fontSize: 9, letterSpacing: 1.8 }}>{label}</LEb>
              <span style={{ flex: 1, height: 1.5, background: L.line2 }} />
            </LR>
            <LCd pad="2px 16px">
              {list.map((ro, i) => (
                <LR key={ro.id} style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${L.cardLine}` : 'none', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: L.display, fontSize: 17, letterSpacing: 0.4, color: L.ink }}>{ro.n.toUpperCase()}</div>
                    <LBy size={11} c={L.faint} style={{ marginTop: 3 }}>{ro.locked ? ro.count + ' Personen' : ro.h.length ? ro.h.map(h => h[0]).join(', ') : 'unbesetzt'}</LBy>
                  </div>
                  {!ro.locked && !ro.h.length && <window.Chip tone="gold" style={{ fontSize: 10 }}>frei</window.Chip>}
                  <div style={{ textAlign: 'right' }}><div style={{ fontFamily: L.display, fontSize: 15, color: L.ink }}>{window.PG.roleRights(ro).length}</div><LEb style={{ fontSize: 8 }}>Rechte</LEb></div>
                  <window.Ic name="chevron" size={15} color={L.faint} />
                </LR>
              ))}
            </LCd>
          </div>
        );
      })}
    </LMob>
  );
  const ro = roleById(role);
  const has = window.PG.roleRights(ro);
  return (
    <LMob kicker="Rollen & Rechte" pill="Rollen & Rechte"
      head={<div style={{ position: 'relative', marginTop: 14 }}>
        <LDp size={30}>{ro.n.toUpperCase()}</LDp>
        <LR style={{ gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
          <window.Chip tone="ink">{(KINDS.find(k => k[0] === ro.kind) || [])[1]}</window.Chip>
          {ro.unique && <window.Chip tone="gold">genau einmal</window.Chip>}
          <window.Chip tone="red">{has.length} von {LD.RIGHT_COUNT} Rechten</window.Chip>
        </LR>
      </div>} gap={14}>
      <LCd pad="14px 16px"><LBy size={12.5} c={L.sub}>{ro.desc}</LBy></LCd>
      <div><LSc right={<window.Btn sm ghost icon="plus" style={{ padding: '5px 11px', fontSize: 12 }}>Inhaber</window.Btn>}>Inhaber</LSc>
        <LCd pad="2px 16px">{ro.h.map(([nm, s], i) => <LHold key={nm} name={nm} funk={ro.n} since={s} i={i} />)}</LCd>
      </div>
      <LR style={{ gap: 9 }}>
        <span style={{ width: 9, height: 9, background: L.red }} />
        <span style={{ fontFamily: L.display, fontSize: 13, letterSpacing: 1.4, color: L.ink }}>DIESE ROLLE DARF</span>
        <span style={{ flex: 1, height: 1.5, background: L.line2 }} />
      </LR>
      {LD.RIGHTGROUPS.map(g => {
        const mine = g.rights.filter(r => has.includes(r.id));
        if (!mine.length) return null;
        return (
        <div key={g.id}>
          <LR style={{ gap: 9, marginBottom: 9 }}>
            <span style={{ width: 26, height: 26, borderRadius: 8, background: 'rgba(225,29,42,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><window.Ic name={g.icon} size={14} color={L.red} sw={2} /></span>
            <span style={{ fontFamily: L.display, fontSize: 14, letterSpacing: 1, color: L.ink }}>{g.label.toUpperCase()}</span>
            <span style={{ flex: 1, height: 1.5, background: L.line2 }} />
            <LBy size={11} c={L.faint} w={800}>{mine.length}/{g.rights.length}</LBy>
          </LR>
          <LCd pad="2px 16px">
            {mine.map((r, i) => (
              <LR key={r.id} style={{ padding: '11px 0', borderTop: i ? `1.5px solid ${L.cardLine}` : 'none', gap: 11, alignItems: 'flex-start' }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(225,29,42,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><window.Ic name="check" size={13} color={L.red} sw={2.6} /></span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <LR style={{ gap: 7 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: L.ink }}>{r.label}</div>
                    {r.sens && <window.Chip tone="blue" style={{ fontSize: 9, padding: '2px 6px' }}>sensibel</window.Chip>}
                  </LR>
                  <LBy size={11.5} c={L.faint} style={{ marginTop: 3 }}>{r.desc}</LBy>
                </div>
              </LR>
            ))}
          </LCd>
        </div>
      );})}
      <window.Btn ghost icon="settings" style={{ justifyContent: 'center' }}>Rechte ändern · {LD.RIGHT_COUNT} im Katalog</window.Btn>
    </LMob>
  );
}

Object.assign(window, { PgRolesDesk, PgRolesMob, PgRoleDetail, PgRoleMaster, PgRightRow, PgRightGroup });
