// fcc-pg-hub.jsx — Screens 5–7: Gruppen-Hub (Mitglied / Gruppen-Admin) + Mein Profil.

const { PGP: H, PgRow: HR, PgEyeb: HEb, PgDisp: HDp, PgBody: HBy, PgSec: HSc, PgCd: HCd, PgAv: HAv,
  PgState: HSt, PgSw: HSw, PgSearch: HSrch, PgStat: HStt, PgEmpty: HEmp, PgConfirm: HConf,
  PgMob: HMob, PgDesk: HDesk, PgSinceRow: HSince, PgAdminRow: HAdm, PgBilder: HBil, PgOpenTag: HOpen, P_BY: HP } = window;

// ── generisches Blatt für Schreib-Aktionen ────────────────────────────────
function PgSheet({ kicker, title, text, children, primary = 'Speichern', cancel = 'Abbrechen', mode = 'sheet' }) {
  const sheet = mode !== 'dialog';
  const body = (
    <div style={{ background: '#fff', borderRadius: sheet ? '22px 22px 0 0' : 20, padding: sheet ? '20px 20px 18px' : '26px 26px 22px', boxShadow: sheet ? '0 -10px 40px rgba(26,20,17,0.18)' : '0 30px 80px rgba(26,20,17,0.34)' }}>
      <HEb c={H.red}>{kicker}</HEb>
      <HDp size={22} style={{ marginTop: 7 }}>{title}</HDp>
      {text && <HBy size={12.5} c={H.sub} style={{ marginTop: 8 }}>{text}</HBy>}
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
      <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: sheet ? 'stretch' : 'flex-end' }}>
        <window.Btn ghost style={sheet ? { flex: 1, justifyContent: 'center' } : null}>{cancel}</window.Btn>
        <window.Btn primary style={sheet ? { flex: 1, justifyContent: 'center' } : null}>{primary}</window.Btn>
      </div>
    </div>
  );
  return <window.PgModal mode={mode} w={560}>{body}</window.PgModal>;
}

function PgField({ label, value, hint, ph, chips, icon }) {
  return (
    <div>
      <HEb style={{ marginBottom: 7 }}>{label}</HEb>
      <HR style={{ background: H.card, border: `1.5px solid ${H.cardLine}`, borderRadius: 12, padding: '11px 14px', gap: 10 }}>
        {icon && <window.Ic name={icon} size={16} color={H.faint} sw={2} />}
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: value ? 800 : 600, color: value ? H.ink : H.faint }}>{value || ph}</span>
        {!value && <window.Ic name="chevdown" size={15} color={H.faint} />}
      </HR>
      {chips && <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>{chips.map((c, i) => <span key={c} style={{ background: i === 0 ? H.ink : 'transparent', color: i === 0 ? H.cream : H.sub, border: `1.5px solid ${i === 0 ? H.ink : H.line}`, fontWeight: 800, fontSize: 11.5, padding: '5px 11px', borderRadius: 30, cursor: 'pointer' }}>{c}</span>)}</div>}
      {hint && <HBy size={11.5} c={H.faint} style={{ marginTop: 7 }}>{hint}</HBy>}
    </div>
  );
}

// die drei Schreib-Blätter des Gruppen-Admins
function PgSheetAddMember({ mode }) {
  return (
    <PgSheet mode={mode} kicker="Tanzgarde" title="MITGLIED AUFNEHMEN" text="Such die Person im Verzeichnis. Wer noch nicht drin ist, muss zuerst in der Personenverwaltung angelegt werden."
      primary="Aufnehmen">
      <div><HEb style={{ marginBottom: 7 }}>Person</HEb><HSrch ph="Name eingeben …" />
        <HCd pad="2px 14px" style={{ marginTop: 8 }}>
          {['Greta Simon', 'Jonas Weber'].map((nm, i) => (
            <HR key={nm} style={{ padding: '9px 0', borderTop: i ? `1.5px solid ${H.cardLine}` : 'none', gap: 10, cursor: 'pointer' }}>
              <HAv name={nm} size={30} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 13, color: H.ink }}>{nm}</div><HBy size={11} c={H.faint}>{HP[nm].g.map(x => x[0]).join(' · ') || 'keine Gruppe'}</HBy></div>
              <window.Ic name="plus" size={16} color={H.red} sw={2.2} />
            </HR>
          ))}
        </HCd>
      </div>
      <PgField label="In der Gruppe seit" value="01.09.2026" icon="calendar" chips={['Heute', 'Saisonstart 01.09.', 'Datum wählen']} hint="Das Datum steht später in der Gruppen-Liste und in ihrem Profil." />
    </PgSheet>
  );
}

function PgSheetAddAdmin({ mode }) {
  return (
    <PgSheet mode={mode} kicker="Tanzgarde" title="GRUPPEN-ADMIN ERNENNEN" text="Gruppen-Admins pflegen Beschreibung, Mitglieder und später die Termine. Sie müssen nicht selbst in der Gruppe sein."
      primary="Ernennen">
      <PgField label="Person" value="Elif Kaya" icon="users" hint="Kein Mitglied — geht trotzdem." />
      <PgField label="Funktion (frei wählbar)" ph="z. B. Trainerin" chips={['Trainerin', 'Sprecher', 'Kommandantin', 'Betreuerin', 'Eigene …']} hint="Nur ein Etikett für die Anzeige. Die Rechte hängen an der Gruppen-Admin-Rolle, nicht am Wort." />
      <PgField label="Amt seit" value="01.09.2026" icon="calendar" />
    </PgSheet>
  );
}

function PgConfirmEnd({ mode }) {
  return <HConf mode={mode} eyebrow="Zugehörigkeit beenden" title="PAULA AUS DER TANZGARDE?"
    text="Sie verschwindet aus der Gruppen-Liste, bleibt aber Mitglied und behält ihre Geschichte: „Tanzgarde 2017–2026“ steht weiter in ihrem Profil."
    rows={[['Person', 'Paula Dietz'], ['In der Gruppe seit', '2017'], ['Ende am', '30.09.2026'], ['Bleibt Mitglied', 'ja, ruht']]}
    danger="Zugehörigkeit beenden" />;
}

// ══ 5/6 · GRUPPEN-HUB Desktop ════════════════════════════════════════════
const HUB_MEMBERS = ['Anna Brunner', 'Ilka Reineke', 'Lena Sommer', 'Paula Dietz', 'Katrin Möller'];

function PgHubDesk({ admin, confirm, add }) {
  return (
    <HDesk active="Tanzgarde" dialog={confirm ? <PgConfirmEnd mode="dialog" /> : add ? <PgSheetAddMember mode="dialog" /> : null} kicker={admin ? 'Meine Gruppen · du bist Gruppen-Admin' : 'Meine Gruppen · du tanzt hier mit'} title="TANZGARDE"
      sub="Marschtanz mit Gardeuniform, jede Session eine neue Choreografie. Training donnerstags in der Sporthalle."
      actions={<HR style={{ gap: 14 }}><HStt label="Personen" value="18" /><HStt label="Sucht Verstärkung" value="ja" />{admin && <window.Btn primary icon="plus">Mitglied aufnehmen</window.Btn>}</HR>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.3fr) minmax(0,1fr)', gap: 28 }}>
        <div>
          <HSc right={admin ? <HR style={{ gap: 8 }}><window.Btn sm ghost icon="plus" style={{ padding: '6px 12px', fontSize: 12 }}>Mitglied</window.Btn></HR> : <HBy size={12} c={H.faint}>mit „in der Gruppe seit“</HBy>}>Mitglieder · 18</HSc>
          <HCd pad="2px 20px">
            {HUB_MEMBERS.map((nm, i) => (
              <HR key={nm} style={{ padding: '10px 0', borderTop: i ? `1.5px solid ${H.line2}` : 'none', gap: 12 }}>
                <HAv name={nm} size={32} tone={HP[nm].ehren ? 'gold' : null} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: H.ink }}>{nm}</div>
                  <HBy size={11.5} c={H.faint}>{HP[nm].a[0] ? HP[nm].a[0][0] : 'Tänzerin'}</HBy>
                </div>
                <HSt s={HP[nm].s} sm />
                <div style={{ width: 62, textAlign: 'right' }}><HEb style={{ fontSize: 9 }}>seit</HEb><HDp size={16} style={{ marginTop: 3 }}>{(HP[nm].g[0] || ['', '2015'])[1]}</HDp></div>
                {admin && <HR style={{ gap: 6 }}>
                  <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5 }}>Datum</window.Btn>
                  <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5, color: H.red, borderColor: 'rgba(225,29,42,0.35)' }}>Beenden</window.Btn>
                </HR>}
              </HR>
            ))}
            <HR style={{ padding: '12px 0', borderTop: `1.5px solid ${H.line2}`, justifyContent: 'center' }}><HBy size={12} c={H.faint}>13 weitere Personen</HBy></HR>
          </HCd>

          <HSc style={{ marginTop: 26 }}>Termine</HSc>
          <HCd pad="22px" style={{ background: '#fff', borderStyle: 'dashed', borderColor: 'rgba(26,20,17,0.18)' }}>
            <HR style={{ gap: 14 }}>
              <span style={{ width: 42, height: 42, borderRadius: 24, background: 'rgba(26,20,17,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Ic name="calendar" size={20} color={H.faint} sw={1.9} /></span>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: H.display, fontSize: 19, color: H.ink }}>HIER STEHT SPÄTER DAS TRAINING</div>
                <HBy size={12.5} c={H.sub} style={{ marginTop: 5 }}>Training, Proben und Auftritte der Tanzgarde — zieht der eine Vereins-Spielplan. {admin ? 'Du wirst sie hier direkt anlegen können.' : 'Kommt in einer späteren Phase.'}</HBy>
              </div>
              <window.Chip tone="neutral">Phase 2</window.Chip>
            </HR>
          </HCd>

          <HSc style={{ marginTop: 26 }}>Bilder</HSc>
          <HBil n={4} h={118} note="Reserviert für ein paar Bilder aus vergangenen Sessions. Kommt mit der Galerie — hier wird nichts hochgeladen." />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div><HSc right={admin ? <window.Btn sm ghost icon="plus" style={{ padding: '6px 12px', fontSize: 12 }}>Admin</window.Btn> : null}>Gruppen-Admins</HSc>
            <HCd pad="2px 18px">
              <HAdm name="Anna Brunner" funk="Trainerin" since="2019" action={admin ? <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5 }}>Ändern</window.Btn> : null} />
              <HAdm name="Lena Sommer" funk="Kommandantin" since="2022" i action={admin ? <window.Btn sm ghost style={{ padding: '5px 10px', fontSize: 11.5, color: H.red, borderColor: 'rgba(225,29,42,0.35)' }}>Beenden</window.Btn> : null} />
            </HCd>
          </div>

          {admin ? (
            <>
              <div><HSc>Gruppe pflegen</HSc>
                <HCd pad="18px">
                  <HEb style={{ marginBottom: 8 }}>Beschreibung</HEb>
                  <div style={{ background: '#fff', border: `1.5px solid ${H.line}`, borderRadius: 12, padding: '12px 14px', fontSize: 13, fontWeight: 600, color: H.ink, lineHeight: 1.5 }}>
                    Marschtanz mit Gardeuniform, jede Session eine neue Choreografie. Training donnerstags in der Sporthalle.
                    <span style={{ display: 'inline-block', width: 1.5, height: 15, background: H.red, verticalAlign: -3, marginLeft: 2 }} />
                  </div>
                  <HR style={{ marginTop: 10, gap: 8 }}><HBy size={11.5} c={H.faint} style={{ flex: 1 }}>Steht auf der öffentlichen Gruppen-Seite. 208 von 400 Zeichen.</HBy><window.Btn sm primary>Speichern</window.Btn></HR>
                  <div style={{ height: 1.5, background: H.cardLine, margin: '16px 0' }} />
                  <HR style={{ gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 800, fontSize: 13.5, color: H.ink }}>Sucht Verstärkung</div>
                      <HBy size={11.5} c={H.faint} style={{ marginTop: 3 }}>Zeigt das goldene Fähnchen im Verzeichnis und auf der Website.</HBy>
                    </div>
                    <HSw on />
                  </HR>
                </HCd>
              </div>
              <div><HSc>Wer erreicht wen</HSc><HCd pad="18px">
                <HDp size={20}>18 PERSONEN, 2 ADMINS</HDp>
                <HBy size={13} c={H.sub} style={{ marginTop: 9 }}>Fragen zum Training gehen an Anna, Fragen zur Uniform an Lena. Neue Leute kommen über „sucht Verstärkung“ — im letzten Jahr waren das vier.</HBy>
              </HCd></div>
            </>
          ) : (
            <>
              <div><HSc>Deine Zugehörigkeit</HSc><HCd pad="4px 18px">
                <window.PgKV k="In der Gruppe seit" v="2014" />
                <window.PgKV k="Funktion" v="Trainerin" i />
                <window.PgKV k="Gruppen-Admin" v="ja, seit 2019" i />
              </HCd></div>
              <div><HSc>Kurz gesagt</HSc><HCd pad="18px">
                <HDp size={20}>18 PERSONEN, 1 CHOREO</HDp>
                <HBy size={13} c={H.sub} style={{ marginTop: 9 }}>Zwei Gruppen-Admins halten die Gruppe zusammen. Fragen zum Training gehen an Anna, Fragen zur Uniform an Lena.</HBy>
              </HCd></div>
            </>
          )}
        </div>
      </div>
    </HDesk>
  );
}

// ══ 7 · MEIN PROFIL — die neue Einstellung ═══════════════════════════════
function PgVisibilityCard({ on, wide }) {
  return (
    <HCd pad={wide ? '20px 22px' : '16px 18px'} style={{ background: '#fff' }}>
      <HR style={{ gap: 14, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <HR style={{ gap: 8 }}>
            <div style={{ fontWeight: 900, fontSize: wide ? 15.5 : 14.5, color: H.ink }}>Meine Kontaktdaten für Mitglieder sichtbar</div>
            <window.Chip tone={on ? 'green' : 'neutral'}>{on ? 'an' : 'aus'}</window.Chip>
          </HR>
          <HBy size={12.5} c={H.sub} style={{ marginTop: 8 }}>
            Ist das an, sehen alle eingeloggten Mitglieder in deinem Profil Telefonnummer, E-Mail und Adresse. Ist es aus, steht dort nur der Hinweis, dass du sie nicht freigegeben hast — deine Daten bleiben im Verein hinterlegt.
          </HBy>
        </div>
        <HSw on={on} />
      </HR>
      <div style={{ height: 1.5, background: H.line2, margin: '16px 0 14px' }} />
      <HR style={{ gap: 10, alignItems: 'flex-start' }}>
        <window.Ic name="key" size={15} color={H.blue} sw={2} style={{ marginTop: 2 }} />
        <HBy size={12} c={H.sub} style={{ flex: 1 }}>Unabhängig davon: Wer das Recht <b style={{ color: H.ink }}>„Personendetails sehen“</b> hat — Vorstandsämter, Finanzen, Admin — sieht deine Daten immer. Das lässt sich nicht abschalten und steht so auch in der Beitrittserklärung.</HBy>
      </HR>
      {!on && <HR style={{ gap: 10, marginTop: 12, background: H.card, border: `1.5px solid ${H.cardLine}`, borderRadius: 12, padding: '11px 14px' }}>
        <window.Ic name="users" size={15} color={H.faint} sw={2} />
        <HBy size={12} c={H.sub} style={{ flex: 1 }}>Aus heißt aus: Auch deine Gruppen-Admins müssen dich dann übers Amt oder persönlich erreichen.</HBy>
      </HR>}
    </HCd>
  );
}

function PgProfileMob({ on }) {
  return (
    <HMob kicker="Mein Bereich" title="MEIN PROFIL" back={false} pill="Mein Profil"
      head={<HR style={{ gap: 13, marginTop: 16, position: 'relative' }}>
        <HAv name="Anna Brunner" size={50} tone="gold" />
        <div><div style={{ fontWeight: 900, fontSize: 15, color: H.ink }}>Anna Brunner</div><HBy size={12} c={H.faint}>Aktiv seit 2014 · Tanzgarde, Showtanz</HBy></div>
      </HR>}>
      <div><HSc>Sichtbarkeit</HSc><PgVisibilityCard on={on} /></div>
      <div><HSc>Stammdaten</HSc><HCd pad="4px 16px">
        <window.PgKV k="Telefon" v="0170 44 21 883" />
        <window.PgKV k="E-Mail" v="anna.brunner@web.de" i />
        <window.PgKV k="Adresse" v="Am Anger 7, Großfurra" i />
      </HCd>
      <HBy size={11.5} c={H.faint} style={{ marginTop: 9 }}>Änderungen an Stammdaten gehen an die Schriftführerin — sie werden dort geprüft.</HBy></div>
    </HMob>
  );
}

function PgProfileDesk({ on }) {
  return (
    <HDesk active="Mein Profil" kicker="Mein Bereich" title="MEIN PROFIL" sub="Anna Brunner · Aktiv seit 2014 · Tanzgarde, Showtanz · Trainerin"
      actions={<HR style={{ gap: 14 }}><HStt label="Gruppen" value="2" /><HStt label="Ämter" value="1" /></HR>}>
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.15fr) minmax(0,1fr)', gap: 28 }}>
        <div><HSc>Sichtbarkeit</HSc><PgVisibilityCard on={on} wide />
          <HSc style={{ marginTop: 26 }}>Was andere von dir sehen</HSc>
          <HCd pad="18px">
            <HBy size={12} c={H.faint} style={{ marginBottom: 12 }}>Vorschau deines Profils, wie ein anderes Mitglied es sieht</HBy>
            <div style={{ border: `1.5px solid ${H.line}`, borderRadius: 14, background: '#fff', padding: 16 }}>
              <HR style={{ gap: 12 }}>
                <HAv name="Anna Brunner" size={38} tone="gold" />
                <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 14, color: H.ink }}>Anna Brunner</div><HBy size={11.5} c={H.faint}>Trainerin · Tanzgarde · Showtanz</HBy></div>
                <HSt s="aktiv" sm />
              </HR>
              <div style={{ height: 1.5, background: H.line2, margin: '12px 0' }} />
              {on ? <HR style={{ gap: 20 }}>
                {[['Telefon', '0170 44 21 883'], ['E-Mail', 'anna.brunner@web.de']].map(([k, v]) => <div key={k}><HEb style={{ fontSize: 9 }}>{k}</HEb><div style={{ fontWeight: 800, fontSize: 12.5, color: H.ink, marginTop: 4 }}>{v}</div></div>)}
              </HR> : <HR style={{ gap: 10 }}>
                <span style={{ width: 40, height: 8, borderRadius: 6, background: 'repeating-linear-gradient(90deg, rgba(26,20,17,0.18) 0 3px, transparent 3px 6px)' }} />
                <HBy size={12} c={H.faint}>„Kontaktdaten sind hinterlegt, aber nicht freigegeben“</HBy>
              </HR>}
            </div>
          </HCd>
        </div>
        <div><HSc>Stammdaten</HSc><HCd pad="4px 18px">
          <window.PgKV k="Telefon" v="0170 44 21 883" />
          <window.PgKV k="E-Mail" v="anna.brunner@web.de" i />
          <window.PgKV k="Adresse" v="Am Anger 7, 99713 Großfurra" i />
          <window.PgKV k="Geburtsdatum" v="12.03.1996" i />
          <window.PgKV k="Mitglied seit" v="2014" i hint="Stammdaten ändert die Schriftführerin." />
        </HCd>
        <HSc style={{ marginTop: 26 }}>Weitere Einstellungen</HSc>
        <HCd pad="4px 18px">
          {[['Fotofreigabe für Vereinsfotos', 1], ['Push wenn meine Gruppe dran ist', 1], ['E-Mail bei neuen Terminen', 0]].map(([l, v], i) => (
            <HR key={l} style={{ padding: '13px 0', borderTop: i ? `1.5px solid ${H.cardLine}` : 'none', gap: 12 }}>
              <div style={{ flex: 1, fontWeight: 700, fontSize: 13, color: H.ink }}>{l}</div><HSw on={!!v} />
            </HR>
          ))}
        </HCd></div>
      </div>
    </HDesk>
  );
}

Object.assign(window, { PgSheet, PgField, PgSheetAddMember, PgSheetAddAdmin, PgConfirmEnd, PgHubDesk, PgVisibilityCard, PgProfileMob, PgProfileDesk });
