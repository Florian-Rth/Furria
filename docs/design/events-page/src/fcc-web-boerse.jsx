// FCC Website — The ticket exchange. Return, waitlist, swap an evening.
// Its own page (/termine/boerse) + the building blocks that connect it to the schedule, the
// event, the hall plan and the ticket itself.

// Returned seats. status: 'warteliste' (right of first refusal running) · 'offen' (open to all)
const EV_RETURNS = [
  { id: 'r1', event: 'prunk1', reihe: 9, platz: 5, seit: 'vor 12 Minuten', status: 'warteliste', wer: 'Nr. 1 der Warteliste', restMin: 252 },
  { id: 'r2', event: 'prunk1', reihe: 21, platz: 8, seit: 'vor 2 Stunden', status: 'offen', grund: 'Warteliste hat nicht zugegriffen' },
  { id: 'r3', event: 'prunk1', reihe: 4, platz: 2, seit: 'vor 3 Stunden', status: 'offen', grund: 'Warteliste hat nicht zugegriffen' },
  { id: 'r4', event: 'prunk1', reihe: 17, platz: 11, seit: 'gestern, 21:40', status: 'offen', grund: 'niemand auf der Warteliste wollte einzeln sitzen' },
];
const evReturnsFor = (id, status) => EV_RETURNS.filter((r) => r.event === id && (!status || r.status === status));

const EV_BOERSE_STATS = [['19', 'Karten zurück in dieser Session'], ['3', 'gerade sofort frei'], ['7', 'auf der Warteliste'], ['0 €', 'Aufpreis, immer']];
const EV_BOERSE_SCHRITTE = [
  ['01', 'Zurückgeben statt verfallen', 'Ein Klick in der Bestätigungs-Mail, bis zum Vortag 18 Uhr. Der Platz geht sofort zurück in den Umlauf, dein Geld kommt zurück, sobald er weg ist.'],
  ['02', 'Die Warteliste bekommt zuerst Bescheid', 'Wer angestellt ist, bekommt eine SMS und 6 Stunden Vorkaufsrecht — in der Reihenfolge des Anstellens.'],
  ['03', 'Danach für alle', 'Greift niemand zu, erscheint der Platz öffentlich in der Börse und im Saalplan. Wer zuerst klickt, sitzt.'],
  ['04', 'Kein Handel, kein Aufpreis', 'Immer 12 €, immer über uns. Wer privat weiterverkauft, riskiert, dass die Karte am Einlass nicht mehr gültig ist.'],
];

function evClock(min) { const h = Math.floor(min / 60); return `${h}:${String(min % 60).padStart(2, '0')} h`; }

// ── One returned seat as a row ────────────────────────────────────────────
function EvReturnRow({ c, r, go, small }) {
  const e = window.evById(r.event);
  const offen = r.status === 'offen';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr auto' : '150px 1fr 190px 186px', gap: small ? 10 : 18, alignItems: 'center', padding: small ? '12px 0' : '14px 0', borderTop: `1.5px solid ${c.line}` }}>
      <div>
        <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 19 : 24, lineHeight: 1 }}>REIHE {r.reihe} · PL. {r.platz}</div>
        <div style={{ fontWeight: 700, fontSize: small ? 10.5 : 11.5, color: c.sub, marginTop: 4 }}>{r.reihe <= 6 ? 'Nah an der Bühne' : r.reihe >= 19 ? 'Nah an der Theke' : 'Mitte'}</div>
      </div>
      {!small ? (
        <div>
          <div style={{ fontWeight: 900, fontSize: 13.5 }}>{e.titel} · {e.tag}, {e.d}{e.mm}.</div>
          <div style={{ fontWeight: 600, fontSize: 12, color: c.sub, marginTop: 4, lineHeight: 1.4 }}>Zurückgegeben {r.seit}{r.grund ? ' · ' + r.grund : ''}</div>
        </div>
      ) : null}
      {!small ? (
        <div>
          {offen ? (
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.1, color: '#2E9E5B' }}>ÖFFENTLICH · SOFORT SICHERBAR</div>
          ) : (
            <div>
              <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.1, color: c.gold === '#F4B400' && c.bg !== '#15110E' ? '#9a7200' : c.gold }}>VORKAUFSRECHT LÄUFT</div>
              <div style={{ fontWeight: 700, fontSize: 11.5, color: c.sub, marginTop: 4 }}>{r.wer} · noch {evClock(r.restMin)}</div>
            </div>
          )}
        </div>
      ) : null}
      <div style={{ textAlign: 'right' }}>
        {small ? <div style={{ fontWeight: 900, fontSize: 10, letterSpacing: 0.6, color: offen ? '#2E9E5B' : c.sub, marginBottom: 6 }}>{offen ? 'SOFORT FREI' : `NOCH ${evClock(r.restMin)}`}</div> : null}
        {offen ? <window.EvBtn c={c} fs={small ? 12.5 : 14} onClick={() => go('seats', r.event)}>{window.EV_PREIS} € · Platz sichern</window.EvBtn> : <span style={{ fontWeight: 700, fontSize: small ? 10.5 : 11.5, color: c.sub }}>gerade vergeben</span>}
      </div>
    </div>
  );
}

// ── Waitlist for a sold-out evening ───────────────────────────────────────
function EvWaitPanel({ c, e, small, compact, go }) {
  const [on, setOn] = React.useState(false);
  const pos = 8;
  return (
    <div style={{ border: `2px solid ${c.ink}`, background: c.paper, padding: small ? '14px 16px 16px' : '18px 20px 20px', boxShadow: compact ? 'none' : window.evHard(c, 8) }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
        <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.6, color: c.red }}>AUSVERKAUFT</span>
        <span style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.1, color: c.sub }}>{e.tag}, {e.d}{e.mm}.</span>
      </div>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 26 : 32, lineHeight: 0.96, marginTop: 7 }}>{on ? `DU BIST NR. ${pos}` : 'STELL DICH AN'}</div>
      <div style={{ fontWeight: 600, fontSize: small ? 11.5 : 12.5, color: c.sub, marginTop: 7, lineHeight: 1.5 }}>
        {on ? 'Wird eine Karte zurückgegeben, rücken wir auf und du bekommst eine SMS mit 6 Stunden Vorkaufsrecht. Kein Automatik-Kauf, keine Vorkasse.' : `In dieser Session kamen bisher 19 Karten zurück, im Schnitt 14 pro Abend. Anstehen kostet nichts und verpflichtet zu nichts.`}
      </div>
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1.5px solid ${c.line}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: small ? 9.5 : 10, letterSpacing: 1.2, color: c.sub, marginBottom: 6 }}>
          <span>CHANCE, NOCH REINZUKOMMEN</span><span style={{ color: '#2E9E5B' }}>GUT</span>
        </div>
        <div style={{ display: 'flex', gap: 3 }}>
          {Array.from({ length: 14 }, (_, i) => <div key={i} style={{ flex: 1, height: small ? 8 : 10, background: i < 10 ? '#2E9E5B' : c.line }} />)}
        </div>
        <div style={{ fontWeight: 700, fontSize: small ? 10.5 : 11.5, color: c.sub, marginTop: 6 }}>{on ? `Vor dir stehen ${pos - 1} Leute · zuletzt vergeben vor 12 Minuten` : '7 Leute stehen schon an · 3 Plätze sind gerade zurückgekommen'}</div>
      </div>
      <button onClick={() => setOn(!on)} style={{ marginTop: 14, width: '100%', border: `2px solid ${on ? c.ink : c.red}`, background: on ? 'transparent' : c.red, color: on ? c.ink : c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 13.5 : 15, padding: small ? '12px 0' : '14px 0', cursor: 'pointer' }}>{on ? 'Von der Warteliste nehmen' : 'Auf die Warteliste'}</button>
      {go ? <div style={{ marginTop: 10, fontWeight: 700, fontSize: small ? 11 : 12 }}><a href="#" onClick={(ev) => { ev.preventDefault(); go('boerse'); }}>Zur Kartenbörse — 3 Plätze sind sofort frei →</a></div> : null}
    </div>
  );
}

// ── Return / swap an evening ──────────────────────────────────────────────
function EvSwap({ c, small, invert }) {
  const [tab, setTab] = React.useState('back');
  const p = window.evPanel(c);
  const fg = invert ? p.fg : c.ink, sub = invert ? p.sub : c.sub, line = invert ? 'rgba(251,244,230,0.22)' : c.line;
  const alt = window.evById('prunk2');
  return (
    <div style={{ background: invert ? p.bg : c.paper, color: fg, border: invert ? 'none' : `1.5px solid ${c.line}`, padding: small ? '16px 16px 18px' : '20px 22px 22px' }}>
      <div style={{ display: 'flex', gap: 7 }}>
        {[['back', 'Zurückgeben'], ['swap', 'Abend tauschen']].map(([k, t]) => (
          <button key={k} onClick={() => setTab(k)} style={{ border: tab === k ? `2px solid ${c.red}` : `1.5px solid ${line}`, background: tab === k ? c.red : 'transparent', color: tab === k ? c.onRed : sub, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 11.5 : 12.5, padding: small ? '8px 12px' : '9px 14px', cursor: 'pointer' }}>{t}</button>
        ))}
      </div>
      <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 24 : 30, lineHeight: 0.98, marginTop: 14 }}>{tab === 'back' ? 'DU KANNST DOCH NICHT?' : 'LIEBER DER ANDERE ABEND?'}</div>
      <div style={{ fontWeight: 600, fontSize: small ? 11.5 : 12.5, color: sub, marginTop: 8, lineHeight: 1.5, textWrap: 'pretty' }}>
        {tab === 'back'
          ? 'Gib die Karte zurück statt sie verfallen zu lassen. Wir setzen sie in die Börse, du bekommst die 12 € zurück, sobald jemand sie nimmt — und ein leerer Stuhl weniger im Saal.'
          : `Solange am Wunschabend Plätze frei sind, tauschen wir kostenlos um. Beispiel: 1. Prunksitzung → ${alt.titel} am ${alt.d}${alt.mm}., dort sind aktuell ${alt.frei} Plätze frei.`}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: small ? '1fr' : '1fr 1fr', gap: 10, marginTop: 14 }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.3, color: sub, marginBottom: 5 }}>KARTENNUMMER ODER MAIL</div>
          <div style={{ border: `1.5px solid ${line}`, padding: small ? '10px 11px' : '11px 12px', fontFamily: 'ui-monospace, monospace', fontSize: 12.5, color: sub }}>2027-0317</div>
        </div>
        <div>
          <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 1.3, color: sub, marginBottom: 5 }}>{tab === 'back' ? 'WELCHE PLÄTZE' : 'NEUER ABEND'}</div>
          <div style={{ border: `1.5px solid ${line}`, padding: small ? '10px 11px' : '11px 12px', fontWeight: 800, fontSize: 12.5 }}>{tab === 'back' ? 'Reihe 20 · Platz 3 + 4' : `${alt.titel} · ${alt.d}${alt.mm}.`}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 13.5 : 15, padding: small ? '12px 16px' : '13px 18px', cursor: 'pointer' }}>{tab === 'back' ? 'In die Börse geben' : 'Umbuchen'}</button>
        <span style={{ fontWeight: 700, fontSize: small ? 10.5 : 11.5, color: sub }}>{tab === 'back' ? 'Rückgabe bis zum Vortag, 18 Uhr' : 'Einmal pro Karte, kostenlos'}</span>
      </div>
    </div>
  );
}

// ── Band for the schedule (short, with real numbers) ─────────────────────
function EvBoerseBand({ c, small, go }) {
  return (
    <div style={{ background: c.paper, color: c.ink, borderTop: `1.5px solid ${c.line}`, borderBottom: `1.5px solid ${c.line}`, padding: small ? '20px 20px' : '28px 40px' }}>
      <div style={{ display: small ? 'block' : 'grid', gridTemplateColumns: '1.1fr 1fr', gap: small ? 0 : 40, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 11, letterSpacing: 1.8, color: c.red }}>AUSVERKAUFT IST NICHT DAS ENDE</div>
          <div style={{ fontFamily: "'Anton', sans-serif", fontSize: small ? 28 : 40, lineHeight: 0.95, marginTop: 7 }}>DIE KARTEN&shy;BÖRSE</div>
          <div style={{ fontWeight: 600, fontSize: small ? 12 : 13.5, color: c.sub, marginTop: 9, lineHeight: 1.5, textWrap: 'pretty' }}>Wer nicht kann, gibt die Karte zurück statt sie verfallen zu lassen. Sie geht an die Warteliste, danach an alle — zum gleichen Preis, ohne Handel drumherum. In dieser Session sind so schon 19 Karten wieder in Umlauf gekommen.</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button onClick={() => go('boerse')} style={{ border: 'none', background: c.red, color: c.onRed, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 13.5 : 15, padding: small ? '12px 16px' : '13px 18px', cursor: 'pointer' }}>Zur Kartenbörse →</button>
            <button onClick={() => go('detail', 'prunk1')} style={{ border: `2px solid ${c.ink}`, background: 'transparent', color: c.ink, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: small ? 13.5 : 15, padding: small ? '12px 16px' : '13px 18px', cursor: 'pointer' }}>Warteliste 1. Prunksitzung</button>
          </div>
        </div>
        <div style={{ marginTop: small ? 18 : 4 }}>
          <div style={{ fontWeight: 900, fontSize: small ? 9.5 : 10.5, letterSpacing: 1.5, color: c.sub, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
            <span style={{ width: 7, height: 7, background: c.red, borderRadius: 9, animation: 'ev-blink 1.4s steps(1,end) infinite' }} />
            GERADE WIEDER FREI
          </div>
          {evReturnsFor('prunk1').slice(0, 3).map((r, i) => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center', padding: small ? '9px 0' : '10px 0', borderTop: `1.5px solid ${c.line}` }}>
              <span style={{ fontWeight: 900, fontSize: small ? 12.5 : 13.5 }}>1. Prunksitzung · Reihe {r.reihe}, Platz {r.platz}</span>
              <span style={{ fontWeight: 700, fontSize: small ? 10 : 11, color: c.sub }}>{r.seit}</span>
              <span style={{ fontWeight: 900, fontSize: small ? 10 : 11, letterSpacing: 0.8, color: r.status === 'offen' ? '#2E9E5B' : c.sub }}>{r.status === 'offen' ? 'FREI' : 'RESERVIERT'}</span>
            </div>
          ))}
          <div style={{ fontWeight: 600, fontSize: small ? 10.5 : 11.5, color: c.sub, marginTop: 10, lineHeight: 1.45 }}>Diese Liste aktualisiert sich von selbst. Sechs Stunden Vorkaufsrecht für die Warteliste, danach für alle.</div>
        </div>
      </div>
    </div>
  );
}

// ── DIE SEITE ───────────────────────────────────────────────────────────
function EvBoerseDesktop({ c, go }) {
  const p = window.evPanel(c);
  const prunk1 = window.evById('prunk1');
  const offen = evReturnsFor('prunk1', 'offen');
  return (
    <div style={{ fontFamily: 'Archivo, sans-serif', color: c.ink, background: c.bg, minHeight: '100%' }}>
      <window.EvKeyframes />
      <window.KKMastheadBar c={c} />
      <div style={{ padding: '20px 56px 0' }}>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 13, padding: 0, cursor: 'pointer' }}>← Alle Termine</button>
      </div>
      <div style={{ padding: '16px 56px 0', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 46, alignItems: 'start' }}>
        <div>
          <div style={{ fontWeight: 900, fontSize: 12.5, letterSpacing: 3, color: c.red }}>KARTENBÖRSE · 55. SESSION</div>
          <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 80, lineHeight: 0.86, margin: '14px 0 0' }}>KARTENBÖRSE</h1>
          <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.5, color: c.sub, margin: '16px 0 0', maxWidth: 580, textWrap: 'pretty' }}>
            Jedes Jahr bleiben Plätze frei, weil jemand krank wird oder Schicht hat — während andere vor der ausverkauften Tür stehen. Die Börse bringt beide zusammen: Karte zurückgeben, Warteliste rückt auf, Preis bleibt 12 €.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,auto)', gap: 32, marginTop: 22, paddingTop: 18, borderTop: `1.5px solid ${c.line}`, justifyContent: 'start' }}>
            {EV_BOERSE_STATS.map(([n, t]) => (
              <div key={t}>
                <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 0.9 }}>{n}</div>
                <div style={{ fontWeight: 800, fontSize: 10.5, letterSpacing: 1.3, color: c.sub, marginTop: 4, maxWidth: 150, lineHeight: 1.3 }}>{t.toUpperCase()}</div>
              </div>
            ))}
          </div>
        </div>
        <EvWaitPanel c={c} e={prunk1} />
      </div>

      <div style={{ padding: '34px 56px 0' }}>
        <window.EvRule c={c} label="JETZT WIEDER FREI" right="AKTUALISIERT SICH VON SELBST" />
        {EV_RETURNS.map((r) => <EvReturnRow key={r.id} c={c} r={r} go={go} />)}
        <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, lineHeight: 1.5, maxWidth: 620 }}>
            {offen.length} Plätze kannst du sofort nehmen — sie stehen im Saalplan gelb markiert und sind für niemanden reserviert. Wer zuerst klickt, sitzt.
          </div>
          <button onClick={() => go('seats', 'prunk1')} style={{ border: 'none', background: 'transparent', color: c.red, fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 14, cursor: 'pointer', padding: 0 }}>Freie Plätze im Saalplan zeigen →</button>
        </div>
      </div>

      <div style={{ padding: '32px 56px 0' }}>
        <window.EvRule c={c} label="DEINE KARTE WEITERGEBEN" right="ODER AUF DEN ANDEREN ABEND UMBUCHEN" />
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 22, alignItems: 'stretch' }}>
          <EvSwap c={c} />
          <div style={{ background: c.paper, color: c.ink, border: `1.5px solid ${c.line}`, padding: '20px 22px 22px' }}>
            <div style={{ fontWeight: 900, fontSize: 10.5, letterSpacing: 1.5, color: c.red }}>WARUM NICHT EINFACH PRIVAT VERKAUFEN</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 1, marginTop: 8 }}>WEIL DER SAAL<br />EIN DORF IST</div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 9, lineHeight: 1.55, textWrap: 'pretty' }}>
              Karten sind auf den Namen gebucht, damit wir am Einlass wissen, wer wo sitzt — und damit niemand 30 € für eine 12-€-Karte zahlt. Läuft die Karte über die Börse, ist der neue Name sofort hinterlegt und der alte QR-Code wird ungültig.
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1.5px solid ${c.line}` }}>
              {[['Rückgabe bis', 'Vortag, 18 Uhr'], ['Geld zurück', 'sobald der Platz weg ist'], ['Gebühr', 'keine']].map(([t, d], i) => (
                <div key={t} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
                  <span style={{ fontWeight: 700, fontSize: 12.5, color: c.sub }}>{t}</span>
                  <span style={{ fontWeight: 900, fontSize: 12.5 }}>{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 56px 0' }}>
        <window.EvRule c={c} label="SO LÄUFT ES AB" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0, border: `1.5px solid ${c.line}`, background: c.paper }}>
          {EV_BOERSE_SCHRITTE.map(([n, t, d], i) => (
            <div key={n} style={{ padding: '18px 20px 20px', borderLeft: i ? `1.5px solid ${c.line}` : 'none' }}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 32, color: c.red, lineHeight: 0.9 }}>{n}</div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 20, lineHeight: 1.05, marginTop: 8 }}>{t}</div>
              <div style={{ fontWeight: 600, fontSize: 12.5, color: c.sub, marginTop: 7, lineHeight: 1.5, textWrap: 'pretty' }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '30px 56px 0' }}>
        <div style={{ border: `2px solid ${c.ink}`, background: c.bg, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 28, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontWeight: 900, fontSize: 11, letterSpacing: 1.8, color: c.red }}>NOCH KEINE KARTE, ABER AUCH KEINE GEDULD?</div>
            <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 30, lineHeight: 1, marginTop: 7 }}>DIE 2. PRUNKSITZUNG HAT NOCH {window.evById('prunk2').frei} PLÄTZE</div>
            <div style={{ fontWeight: 600, fontSize: 13, color: c.sub, marginTop: 7, maxWidth: 660, lineHeight: 1.5 }}>Gleiches Programm, gleicher Preis, eine Woche später. Wer sicher dabei sein will, nimmt diesen Abend — die Börse ist der Notausgang, nicht der Haupteingang.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <window.EvBtn c={c} fs={15} onClick={() => go('seats', 'prunk2')}>Platz wählen · 12 €</window.EvBtn>
            <window.EvBtn c={c} ghost fs={15} onClick={() => go('index')}>Alle Termine</window.EvBtn>
          </div>
        </div>
      </div>
      <div style={{ marginTop: 34 }}><window.EvFilmstrip c={c} h={92} speed={54} /></div>
      <window.KKFooter c={c} />
    </div>
  );
}

// ── MOBILE ──────────────────────────────────────────────────────────────
function EvBoerseMobile({ c, go }) {
  const prunk1 = window.evById('prunk1');
  return (
    <window.EvMobShell c={c} label="BÖRSE" cta={{ t: '3 Plätze sofort frei', s: '1. Prunksitzung · 12 €', b: 'Ansehen', onClick: () => go('seats', 'prunk1') }}>
      <div style={{ padding: '16px 20px 0' }}>
        <button onClick={() => go('index')} style={{ border: 'none', background: 'transparent', color: c.red, fontWeight: 900, fontSize: 12, padding: 0, cursor: 'pointer' }}>← Alle Termine</button>
        <div style={{ fontWeight: 900, fontSize: 9.5, letterSpacing: 2, color: c.red, marginTop: 12 }}>KARTENBÖRSE · 55. SESSION</div>
        <h1 style={{ fontFamily: "'Anton', sans-serif", fontSize: 38, lineHeight: 0.88, margin: '8px 0 0' }}>KARTENBÖRSE</h1>
        <p style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.45, color: c.sub, margin: '9px 0 0' }}>Karte zurückgeben statt verfallen lassen, Warteliste rückt auf, Preis bleibt 12 €.</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, paddingTop: 12, borderTop: `1.5px solid ${c.line}` }}>
          {EV_BOERSE_STATS.map(([n, t]) => (
            <div key={t}>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 28, lineHeight: 0.9 }}>{n}</div>
              <div style={{ fontWeight: 800, fontSize: 9.5, letterSpacing: 1.1, color: c.sub, marginTop: 3, lineHeight: 1.3 }}>{t.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ padding: '16px 20px 0' }}><EvWaitPanel c={c} e={prunk1} small go={go} /></div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="JETZT WIEDER FREI" />
        {EV_RETURNS.map((r) => <EvReturnRow key={r.id} c={c} r={r} go={go} small />)}
        <div style={{ borderTop: `1.5px solid ${c.line}`, paddingTop: 10, fontWeight: 600, fontSize: 11, color: c.sub, lineHeight: 1.45 }}>Freie Plätze stehen im Saalplan gelb markiert. Wer zuerst klickt, sitzt.</div>
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="KARTE WEITERGEBEN" />
        <EvSwap c={c} small />
      </div>
      <div style={{ padding: '18px 20px 0' }}>
        <window.EvRule c={c} label="SO LÄUFT ES AB" />
        {EV_BOERSE_SCHRITTE.map(([n, t, d], i) => (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '34px 1fr', gap: 12, padding: '11px 0', borderTop: i ? `1.5px solid ${c.line}` : 'none' }}>
            <span style={{ fontFamily: "'Anton', sans-serif", fontSize: 22, color: c.red, lineHeight: 0.9 }}>{n}</span>
            <div>
              <div style={{ fontFamily: "'Anton', sans-serif", fontSize: 16.5, lineHeight: 1.05 }}>{t}</div>
              <div style={{ fontWeight: 600, fontSize: 11.5, color: c.sub, marginTop: 4, lineHeight: 1.45 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18 }}><window.KKFooter c={c} /></div>
    </window.EvMobShell>
  );
}

Object.assign(window, { EV_RETURNS, evReturnsFor, EvReturnRow, EvWaitPanel, EvSwap, EvBoerseBand, EvBoerseDesktop, EvBoerseMobile });
