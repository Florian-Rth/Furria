// fcc-ds-docs.jsx — living documentation of the FCC design system.
// Reads tokens straight from window.T (app) + window.KK (brand) so docs
// never drift from code. Exports Doc* panels for the design-system canvas.

const DT = window.T;            // app tokens
const DK = () => window.KK.light; // brand tokens (light)
const DSP = 'rgba(26,20,17,0.6)', DFA = 'rgba(26,20,17,0.4)', DLN = 'rgba(26,20,17,0.12)';
const DINK = '#1A1411', DRED = '#E11D2A', DCREAM = '#FBF4E6';
const DDISP = "'Anton', sans-serif", DFONT = "'Archivo', sans-serif", DMONO = 'ui-monospace, SFMono-Regular, monospace';

// shared scaffolding ---------------------------------------------------------
function DPanel({ title, kicker, children, pad = 34 }) {
  return (
    <div style={{ fontFamily: DFONT, color: DINK, background: '#fff', height: '100%', padding: pad, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: 1.8, color: DRED, textTransform: 'uppercase' }}>
        <span style={{ width: 9, height: 9, background: DRED }} />{kicker}
      </div>
      <h2 style={{ fontFamily: DDISP, fontSize: 34, letterSpacing: 0.5, margin: '9px 0 20px', lineHeight: 0.95 }}>{title}</h2>
      {children}
    </div>
  );
}
function DLabel({ children, style }) {
  return <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: 1.4, color: DFA, textTransform: 'uppercase', marginBottom: 11, ...style }}>{children}</div>;
}
function Mono({ children }) { return <span style={{ fontFamily: DMONO, fontSize: 11.5, color: DSP }}>{children}</span>; }

// ── FOUNDATION ──────────────────────────────────────────────────────────────
function DocFoundation() {
  const c = DK();
  return (
    <DPanel kicker="01 · Fundament" title="Marke & Haltung">
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 36 }}>
        <div>
          <p style={{ fontSize: 15, lineHeight: 1.6, fontWeight: 500, color: 'rgba(26,20,17,0.78)', margin: '0 0 18px' }}>
            <b>Konfetti Kinetik</b> ist die Designsprache des Furrscher Carnevals Club. Sie verbindet die <b>Zeitungs-Masthead-Geste</b> (Erbe der Großbesenstadt) mit <b>plakativer Editorial-Typografie</b> und festlicher Energie — im modernen „Destillat“ durchgängig <b>ruhig &amp; wertig</b>: weiche Elevation, Haarlinien, dezente Akzente.
          </p>
          <DLabel>Eine Sprache, ein Ton</DLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[['Website', 'Editorial-Hero &amp; Masthead — weiche Schatten, Haarlinien, Pill-Buttons, dezentes Konfetti.', c.red], ['Club-App', 'Gleiche DNA, dichter &amp; werkzeug-tauglich — selbe weiche Elevation.', DINK]].map(([t, s, col]) => (
              <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ width: 10, height: 10, borderRadius: 5, background: col, marginTop: 4, flexShrink: 0 }} />
                <div><div style={{ fontWeight: 800, fontSize: 14 }}>{t}</div><div style={{ fontSize: 13, color: DSP, fontWeight: 500, lineHeight: 1.45 }}>{s}</div></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: DCREAM, borderRadius: 16, border: `1.5px solid ${DLN}`, padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <DLabel style={{ marginBottom: 0 }}>Das Zeichen · gekreuzte Besen</DLabel>
          <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
            <window.KKBroom size={62} color={c.red} band={c.ink} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontFamily: DDISP, fontSize: 40, letterSpacing: 1.5, lineHeight: 0.8 }}>FURRIA</span>
              <span style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 2, color: DSP }}>FURRSCHER CARNEVALS CLUB</span>
            </div>
          </div>
          <div style={{ height: 1, background: DLN }} />
          <div style={{ display: 'flex', gap: 10 }}>
            {[c.red, c.ink].map((bg, i) => (
              <div key={i} style={{ width: 54, height: 54, borderRadius: 13, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <window.KKBroom size={34} color={i ? c.gold : '#fff'} band={bg} />
              </div>
            ))}
            <div style={{ fontSize: 12, fontWeight: 600, color: DSP, lineHeight: 1.4, alignSelf: 'center' }}>App-Icon: Besen weiß/gold auf Rot oder Tinte. Nie kleiner als 24 px.</div>
          </div>
        </div>
      </div>
    </DPanel>
  );
}

// ── COLOR ───────────────────────────────────────────────────────────────────
function Swatch({ name, hex, sample, big }) {
  return (
    <div style={{ borderRadius: 11, overflow: 'hidden', border: `1px solid ${DLN}`, background: '#fff' }}>
      <div style={{ height: big ? 64 : 48, background: sample || hex }} />
      <div style={{ padding: '8px 10px' }}>
        <div style={{ fontWeight: 800, fontSize: 12 }}>{name}</div>
        <div style={{ fontFamily: DMONO, fontSize: 10.5, color: DSP, marginTop: 1 }}>{hex}</div>
      </div>
    </div>
  );
}
function DocColor() {
  return (
    <DPanel kicker="02 · Farbe" title="Palette">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div>
          <DLabel>Marke — die drei Konstanten + Tinte</DLabel>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12 }}>
            <Swatch big name="Rot" hex="#E11D2A" />
            <Swatch big name="Rot dunkel" hex="#B3101C" />
            <Swatch big name="Gold" hex="#F4B400" />
            <Swatch big name="Tinte" hex="#1A1411" />
            <Swatch big name="Creme" hex="#FBF4E6" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <div>
            <DLabel>App-Oberflächen</DLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              <Swatch name="bg" hex="#FBF4E6" />
              <Swatch name="panel" hex="#FFFFFF" />
              <Swatch name="panel2" hex="#FBF8F1" />
              <Swatch name="sideBg" hex="#171210" />
            </div>
          </div>
          <div>
            <DLabel>Status</DLabel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
              <Swatch name="Erfolg" hex="#2E9E5B" />
              <Swatch name="Warnung" hex="#F4B400" />
              <Swatch name="Gefahr" hex="#E11D2A" />
              <Swatch name="Info" hex="#2F6DA8" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 260, background: DCREAM, borderRadius: 11, border: `1px solid ${DLN}`, padding: '13px 15px' }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 4 }}>Text auf Creme/Weiß</div>
            <div style={{ fontSize: 12, color: DSP, fontWeight: 500 }}>Tinte 100 % · <Mono>sub</Mono> 60 % · <Mono>faint</Mono> 40 %. Rot nur für Akzent &amp; Aktion, nie für Fließtext.</div>
          </div>
          <div style={{ flex: 1, minWidth: 260, background: '#171210', borderRadius: 11, padding: '13px 15px', color: DCREAM }}>
            <div style={{ fontWeight: 800, fontSize: 12.5, marginBottom: 4 }}>Dunkel (Sidebar / Tab-Bar / Dark-Mode)</div>
            <div style={{ fontSize: 12, color: 'rgba(251,244,230,0.6)', fontWeight: 500 }}>Creme-Text auf Tinte. Aktiv = Rot. Gold als festlicher Zweitakzent.</div>
          </div>
        </div>
      </div>
    </DPanel>
  );
}

// ── TYPE ────────────────────────────────────────────────────────────────────
function DocType() {
  const row = (font, size, weight, label, sample, ls) => (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, borderTop: `1px solid ${DLN}`, padding: '12px 0' }}>
      <div style={{ width: 132, flexShrink: 0 }}><div style={{ fontWeight: 800, fontSize: 12.5 }}>{label}</div><div style={{ fontFamily: DMONO, fontSize: 10.5, color: DSP }}>{size}px · {weight}</div></div>
      <div style={{ fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: ls, lineHeight: 1, color: DINK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sample}</div>
    </div>
  );
  return (
    <DPanel kicker="03 · Typografie" title="Schrift">
      <div style={{ display: 'flex', gap: 16, marginBottom: 18 }}>
        <div style={{ flex: 1, background: DCREAM, borderRadius: 12, border: `1px solid ${DLN}`, padding: '16px 18px' }}>
          <div style={{ fontFamily: DDISP, fontSize: 30, letterSpacing: 0.5 }}>Anton</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: DSP, marginTop: 4 }}>Display · Headlines, Zahlen, Masthead. Immer GROSS, eng, kondensiert.</div>
        </div>
        <div style={{ flex: 1, background: DCREAM, borderRadius: 12, border: `1px solid ${DLN}`, padding: '16px 18px' }}>
          <div style={{ fontFamily: DFONT, fontSize: 30, fontWeight: 800 }}>Archivo</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, color: DSP, marginTop: 4 }}>Text · UI, Fließtext, Labels. Gewichte 500–900.</div>
        </div>
      </div>
      {row(DDISP, 56, 400, 'Display L', 'GROSS FURRIA', 0.5)}
      {row(DDISP, 34, 400, 'Display M', 'DAS PROGRAMM', 0.5)}
      {row(DDISP, 20, 400, 'Heading', 'Übersicht', 0.5)}
      {row(DFONT, 16, 600, 'Body', 'Die Großbesenstadt feiert seit 1971.', 0)}
      {row(DFONT, 13, 800, 'Label / Eyebrow', 'SESSION 2026 · 11.11.', 1.4)}
    </DPanel>
  );
}

// ── SPACING / RADIUS / ELEVATION ──────────────────────────────────────────────
function DocSpacing() {
  return (
    <DPanel kicker="04 · Form" title="Radius, Abstand & Elevation">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
        <div>
          <DLabel>Radius</DLabel>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            {[['Card', 14], ['Chip', 20], ['Pill', 40]].map(([t, r]) => (
              <div key={t} style={{ textAlign: 'center' }}>
                <div style={{ width: 74, height: 56, background: DCREAM, border: `1.5px solid ${DINK}`, borderRadius: r }} />
                <div style={{ fontWeight: 800, fontSize: 12, marginTop: 7 }}>{t}</div><Mono>{r}px</Mono>
              </div>
            ))}
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, background: '#F4B400', border: `1.5px solid ${DINK}`, borderRadius: 40 }} />
              <div style={{ fontWeight: 800, fontSize: 12, marginTop: 7 }}>Siegel</div><Mono>voll rund</Mono>
            </div>
          </div>
          <DLabel style={{ marginTop: 22 }}>Abstand · 4er-Schritte</DLabel>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            {[8, 12, 16, 22, 28].map((s) => (
              <div key={s} style={{ textAlign: 'center' }}>
                <div style={{ width: s, height: s, background: DRED, borderRadius: 3, margin: '0 auto' }} /><Mono>{s}</Mono>
              </div>
            ))}
          </div>
        </div>
        <div>
          <DLabel>Elevation — weich als Standard</DLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#fff', border: `1.5px solid ${DLN}`, borderRadius: 14, boxShadow: '0 1px 2px rgba(26,20,17,0.05)', padding: '14px 16px' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>Standard · weiche Elevation</div>
              <Mono>0 1px 2px / 0 6px 20px · Haarlinie 1–1.5px</Mono>
            </div>
            <div style={{ background: '#fff', border: `2px solid ${DINK}`, borderRadius: 16, boxShadow: `5px 5px 0 ${DINK}`, padding: '14px 16px' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>Akzent · harter Offset-Schatten</div>
              <Mono>4–5px 4–5px 0 ink · Kontur 2px</Mono>
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: DSP, lineHeight: 1.45 }}>Weiche Elevation ist der <b>Standard</b> — Website wie App. Der harte Offset-Schatten ist nur noch ein <b>seltener Akzent</b> für ein einzelnes Held-Element, nicht die Regel.</div>
          </div>
        </div>
      </div>
    </DPanel>
  );
}

// ── COMPONENTS ────────────────────────────────────────────────────────────────
function DBlock({ label, children }) {
  return <div><DLabel>{label}</DLabel><div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>{children}</div></div>;
}
function DocComponents() {
  const c = DK();
  return (
    <DPanel kicker="05 · Bausteine" title="Komponenten">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28 }}>
          <DBlock label="Buttons · App">
            <window.Btn primary>Primär</window.Btn>
            <window.Btn primary tone="green" icon="check">Erfolg</window.Btn>
            <window.Btn ghost icon="plus">Ghost</window.Btn>
            <window.Btn sm ghost icon="settings">Klein</window.Btn>
          </DBlock>
          <DBlock label="Buttons · Plakat">
            <window.KKBtn c={c} primary fs={14}>Tickets →</window.KKBtn>
            <window.KKBtn c={c} fs={14}>Mehr</window.KKBtn>
          </DBlock>
        </div>
        <DBlock label="Chips & Status">
          <window.Chip tone="red" dot>Offen</window.Chip>
          <window.Chip tone="green" dot>Bezahlt</window.Chip>
          <window.Chip tone="gold" dot>Knapp</window.Chip>
          <window.Chip tone="blue">Info</window.Chip>
          <window.Chip tone="ink">Auftritt</window.Chip>
          <window.Chip tone="neutral">Neutral</window.Chip>
        </DBlock>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, alignItems: 'start' }}>
          <div><DLabel>Avatare</DLabel><div style={{ display: 'flex', gap: 10 }}><window.Avatar initials="AB" tone="gold" /><window.Avatar initials="MV" tone="red" /><window.Avatar initials="TR" tone="ink" /></div></div>
          <div><DLabel>Fortschritt</DLabel><div style={{ paddingTop: 6 }}><window.Progress value={3.5} max={24} tone="gold" /></div></div>
          <div><DLabel>Suchfeld</DLabel><div style={{ height: 38, borderRadius: 30, border: `1.5px solid ${DLN}`, display: 'flex', alignItems: 'center', gap: 9, padding: '0 14px', color: DFA, fontWeight: 600, fontSize: 13 }}><window.Ic name="search" size={16} color={DFA} /> Suchen …</div></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16, alignItems: 'start' }}>
          <div><DLabel>Stat-Kachel</DLabel><window.Card><div style={{ fontFamily: DDISP, fontSize: 34, color: DRED, lineHeight: 1 }}>−12,50 €</div><div style={{ fontWeight: 800, fontSize: 13, marginTop: 6 }}>Bier-Saldo</div><div style={{ fontSize: 12, fontWeight: 600, color: DSP }}>offen</div></window.Card></div>
          <div><DLabel>Event-Zeile</DLabel><window.KKEventCard c={c} d="14" m="FEB" t="Große Prunksitzung" s="Festhalle · 19:11" tint={c.red} compact /></div>
        </div>
      </div>
    </DPanel>
  );
}

// ── ICONS ───────────────────────────────────────────────────────────────────
function DocIcons() {
  const names = ['home', 'calendar', 'clock', 'star', 'image', 'beer', 'users', 'grid', 'chart', 'settings', 'broadcast', 'bell', 'search', 'plus', 'check', 'chevron', 'pin', 'key', 'euro', 'upload', 'bolt', 'logout'];
  return (
    <DPanel kicker="06 · Icons" title="Icon-Set">
      <p style={{ fontSize: 13.5, fontWeight: 500, color: DSP, margin: '0 0 18px', lineHeight: 1.5 }}>Eine Linien-Familie, 24×24, Strichstärke 1.85 (aktiv 2.1). Durchgehend für die App.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 12 }}>
        {names.map((n) => (
          <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: '16px 6px', background: DCREAM, borderRadius: 11, border: `1px solid ${DLN}` }}>
            <window.Ic name={n} size={24} color={DINK} />
            <span style={{ fontFamily: DMONO, fontSize: 10.5, color: DSP }}>{n}</span>
          </div>
        ))}
      </div>
    </DPanel>
  );
}

// ── PATTERNS ──────────────────────────────────────────────────────────────────
function DocPatterns() {
  const c = DK();
  return (
    <DPanel kicker="07 · Muster" title="Signatur-Muster">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <DLabel>Masthead — die Marken-Geste (Nav & Hero)</DLabel>
          <div style={{ border: `1px solid ${DLN}`, borderRadius: 12, padding: '14px 20px' }}><window.KKMasthead c={c} fs={40} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <DLabel>Editorial-Sektionskopf</DLabel>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 9, height: 9, background: DRED, flexShrink: 0 }} />
              <span style={{ fontFamily: DDISP, fontSize: 16 }}>DIESE WOCHE</span>
              <div style={{ flex: 1, height: 2, background: DLN }} />
            </div>
            <DLabel style={{ marginTop: 18 }}>Zwei-Ton-Headline</DLabel>
            <div style={{ fontFamily: DDISP, fontSize: 40, lineHeight: 0.85 }}><span>GROSS</span> <span style={{ color: DRED, textShadow: `3px 3px 0 ${DINK}` }}>FURRIA!</span></div>
          </div>
          <div>
            <DLabel>Held-Banner · Offset-Signatur</DLabel>
            <div style={{ background: DRED, borderRadius: 14, boxShadow: `4px 4px 0 ${DINK}`, padding: '14px 16px', color: '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, opacity: 0.9 }}>DEIN NÄCHSTER EINSATZ</div>
              <div style={{ fontFamily: DDISP, fontSize: 22, lineHeight: 0.95, marginTop: 4 }}>Große Prunksitzung</div>
            </div>
            <DLabel style={{ marginTop: 14 }}>Live-Streifen</DLabel>
            <div style={{ background: DRED, color: '#fff', display: 'flex', alignItems: 'center', gap: 9, padding: '8px 14px', borderRadius: 10 }}>
              <span className="fcc-live" style={{ width: 8, height: 8, borderRadius: 5, background: '#fff' }} />
              <span style={{ fontWeight: 800, fontSize: 12, flex: 1 }}>LIVE · auf der Bühne</span>
              <span style={{ fontWeight: 800, fontSize: 11.5 }}>Cockpit →</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 16, alignItems: 'center' }}>
          <div>
            <DLabel>Lauftext-Ticker</DLabel>
            <div style={{ overflow: 'hidden', borderRadius: 8 }}><window.KKTicker c={c} fs={15} rot={0} /></div>
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div><DLabel>Foto-Platzhalter</DLabel><div style={{ width: 150 }}><window.KKPlh h={56} label="event-foto" c={c} tint={c.red} radius={8} /></div></div>
            <div><DLabel>Siegel</DLabel><window.KKSeal c={c} size={62} rot={-8} /></div>
          </div>
        </div>
      </div>
    </DPanel>
  );
}

Object.assign(window, { DocFoundation, DocColor, DocType, DocSpacing, DocComponents, DocIcons, DocPatterns });
