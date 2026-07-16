// fcc-app-mocks.jsx — workspace scaffold for the internal Club-App feature mocks.
// Builds ON the FCC Design System (Konfetti Kinetik). Pages here reuse shell +
// tokens from fcc-ds-shell / fcc-theme — this file never invents new styles.
// Exports: MockCover, IAModel, IARoutes.

const MT = window.T;
const MDISP = "'Anton', sans-serif", MFONT = "'Archivo', sans-serif", MMONO = 'ui-monospace, SFMono-Regular, monospace';
const MSUB = 'rgba(26,20,17,0.6)', MFAINT = 'rgba(26,20,17,0.4)', MLINE = 'rgba(26,20,17,0.12)', MLINE2 = 'rgba(26,20,17,0.07)';

function Kicker({ children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontWeight: 800, letterSpacing: 1.8, color: '#E11D2A', textTransform: 'uppercase' }}>
      <span style={{ width: 9, height: 9, background: '#E11D2A' }} />{children}
    </div>
  );
}
function GLabel({ children, style }) {
  return <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.6, color: MFAINT, textTransform: 'uppercase', ...style }}>{children}</div>;
}

// ── cover ───────────────────────────────────────────────────────────────────
function MockCover() {
  return (
    <div style={{ fontFamily: MFONT, color: '#FBF4E6', background: '#1A1411', height: '100%', padding: '34px 38px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <window.KKBroom size={30} color="#E11D2A" band="#FBF4E6" />
        <span style={{ fontFamily: MDISP, fontSize: 23, letterSpacing: 1 }}>FURRIA</span>
        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1.4, color: 'rgba(251,244,230,0.55)', border: '1px solid rgba(251,244,230,0.25)', padding: '2px 7px', borderRadius: 20 }}>CLUB-APP</span>
      </div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#F4B400', marginTop: 24 }}>FEATURE-MOCKS · ARBEITSDATEI</div>
      <h1 style={{ fontFamily: MDISP, fontSize: 38, letterSpacing: 0.5, margin: '9px 0 12px', lineHeight: 0.92 }}>Interner Mitgliederbereich</h1>
      <p style={{ fontSize: 14, lineHeight: 1.6, fontWeight: 500, color: 'rgba(251,244,230,0.72)', margin: 0, maxWidth: 470 }}>
        Die echten Seiten der Club-App — Schritt für Schritt. Identität, Rechte und Routen sind festgelegt (siehe nebenan). Jede Seite <b style={{ color: '#FBF4E6' }}>orientiert sich am FCC Design System</b>: dieselbe Shell, dieselben Tokens und Muster.
      </p>
      <div style={{ marginTop: 'auto', paddingTop: 22, borderTop: '1.5px solid rgba(251,244,230,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(251,244,230,0.6)', lineHeight: 1.5 }}>Quelle der Wahrheit:<br /><b style={{ color: '#FBF4E6' }}>FCC Design System.html</b></div>
        <a href="FCC Design System.html" style={{ flexShrink: 0, textDecoration: 'none', background: '#E11D2A', color: '#fff', fontFamily: MFONT, fontWeight: 800, fontSize: 13.5, padding: '11px 18px', borderRadius: 40 }}>Design System öffnen →</a>
      </div>
    </div>
  );
}

// ── identity & permissions model ────────────────────────────────────────────
function IAModel() {
  const layer = (n, title, sub, body, col) => (
    <div style={{ display: 'flex', gap: 14 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: 30, height: 30, borderRadius: 16, background: col, color: '#fff', fontFamily: MDISP, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{n}</div>
        <div style={{ flex: 1, width: 2, background: MLINE, marginTop: 4 }} />
      </div>
      <div style={{ paddingBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 15 }}>{title} <span style={{ fontWeight: 600, color: MSUB, fontSize: 12.5 }}>· {sub}</span></div>
        <div style={{ fontSize: 12.5, fontWeight: 500, color: MSUB, lineHeight: 1.5, marginTop: 3 }}>{body}</div>
      </div>
    </div>
  );
  const amt = (label, kind) => {
    const tone = kind === 'unique' ? 'red' : kind === 'group' ? 'blue' : 'neutral';
    return <window.Chip key={label} tone={tone}>{label}</window.Chip>;
  };
  return (
    <div style={{ fontFamily: MFONT, color: MT.ink, background: '#fff', height: '100%', padding: '32px 36px', overflow: 'hidden' }}>
      <Kicker>Fundament · Identität & Rechte</Kicker>
      <h2 style={{ fontFamily: MDISP, fontSize: 30, letterSpacing: 0.5, margin: '9px 0 18px', lineHeight: 0.95 }}>Wer ist wer — und wer darf was</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
        <div>
          {layer('A', 'Mitgliedschaftsart', 'genau eine', 'Aktiv · Passiv · Jugend · Ehrenmitglied. Bestimmt Beitrag (≈30 € / 15 € Kind).', '#1A1411')}
          {layer('B', 'Gruppen', 'beliebig viele · m:n', 'Frei anlegbar, archivierbar — „Garde", „Biergarde", „Die heißen Öfen", „Tommi & Christoph". Nutzer wählt seinen Anzeige-Titel.', '#E11D2A')}
          {layer('C', 'Ämter & Funktionen', 'optional · mehrere', 'Geben gezielte Admin-Rechte. Kein „Vorstand sieht alles" — Rechte hängen am Amt. Vergabe nur in der Mitglieder-Verwaltung und nur hierarchisch (man braucht ein gleich hohes Amt). Rechte je Amt definiert der Admin.', '#2F6DA8')}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginLeft: 44, marginTop: -6 }}>
            {amt('Präsident/in', 'unique')}{amt('Kinderpräsident/in', 'unique')}{amt('Geschäftsführer', 'unique')}{amt('Schriftführer', 'unique')}{amt('Finanzen', 'unique')}{amt('Getränkewart', 'unique')}{amt('Trainer', 'group')}{amt('Fotograf', 'many')}{amt('Kleidung', 'many')}{amt('Admin', 'unique')}
          </div>
          <div style={{ display: 'flex', gap: 14, marginLeft: 44, marginTop: 12, fontSize: 11, fontWeight: 700, color: MSUB }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#E11D2A' }} />einmalig</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: '#2F6DA8' }} />pro Gruppe</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 4, background: 'rgba(26,20,17,0.3)' }} />mehrfach</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            ['account', 'Mitglied ≠ Account', 'Jeder ist in der Mitglieder-Datenbank. Ein App-Login ist optional und 1:1 mit einem Datensatz verknüpft. Ältere Mitglieder ohne App bleiben voll erfasst.'],
            ['key', 'Onboarding per Einladung', 'Einmal-Token als Link oder QR-/Code-Zettel (für Mitglieder ohne E-Mail). Einladen: Geschäftsführer · Präsident/in · Admin. Foto-Einwilligung beim Start.'],
            ['euro', 'Geld = Ledger, Zahlung steckbar', 'Beitrag · Bier · Kleidung. Drei Modi vorgesehen: nur Ledger / Stripe / PayPal. „Offen"-Hinweis erscheint nur, wenn etwas unbezahlt ist.'],
            ['beer', 'Getränkekasse = Nutzer-Flag', 'Eine Kasse beim Getränkewart, Teilnahme als persönliches Flag — nicht an eine Gruppe gebunden.'],
            ['key', 'Schlüssel = Register', 'Schlüssel-Typen (Sporthalle, Vereinsraum, Lager …) → wer hält welchen. Für alle im Verzeichnis sichtbar, damit man zum Aufschließen Kontakt aufnehmen kann. Kein eigenes Amt.'],
          ].map(([icon, t, s]) => (
            <div key={t} style={{ display: 'flex', gap: 12, background: MT.panel2, border: `1px solid ${MLINE2}`, borderRadius: 12, padding: '13px 14px' }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(225,29,42,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Ic name={icon} size={17} color="#E11D2A" sw={2} /></div>
              <div><div style={{ fontWeight: 800, fontSize: 13.5 }}>{t}</div><div style={{ fontSize: 12, fontWeight: 500, color: MSUB, lineHeight: 1.45, marginTop: 2 }}>{s}</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── route map (the real Fahrplan) ────────────────────────────────────────────
const ST = { done: ['green', 'Entwurf steht'], next: ['gold', 'Als nächstes'], plan: ['neutral', 'Geplant'] };
function Route({ route, label, note, status, split }) {
  const [tone] = ST[status];
  const dot = tone === 'green' ? MT.green : tone === 'gold' ? '#9a7200' : MFAINT;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '8px 11px', background: MT.panel2, border: `1px solid ${MLINE2}`, borderRadius: 10 }}>
      <span style={{ width: 7, height: 7, borderRadius: 4, background: dot, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 13, lineHeight: 1.1 }}>{label}{split && <span style={{ fontSize: 10, fontWeight: 800, color: '#2F6DA8', marginLeft: 6, letterSpacing: 0.3 }}>◑ {split}</span>}</div>
        <div style={{ fontFamily: MMONO, fontSize: 10.5, color: MSUB, marginTop: 1 }}>{route}{note && <span style={{ fontFamily: MFONT, fontWeight: 600, color: MFAINT }}>  ·  {note}</span>}</div>
      </div>
    </div>
  );
}
function Bucket({ title, hint, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 9 }}>
        <span style={{ fontFamily: MDISP, fontSize: 15, letterSpacing: 0.5 }}>{title}</span>
        {hint && <span style={{ fontSize: 10.5, fontWeight: 700, color: MFAINT }}>{hint}</span>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>{children}</div>
    </div>
  );
}
function IARoutes() {
  return (
    <div style={{ fontFamily: MFONT, color: MT.ink, background: '#fff', height: '100%', padding: '32px 36px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
        <div>
          <Kicker>Fahrplan · Routen & Seiten</Kicker>
          <h2 style={{ fontFamily: MDISP, fontSize: 30, letterSpacing: 0.5, margin: '9px 0 0', lineHeight: 0.95 }}>Die Seitenstruktur</h2>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', maxWidth: 360, justifyContent: 'flex-end' }}>
          {Object.entries(ST).map(([k, [tone, label]]) => <window.Chip key={k} tone={tone} dot={k !== 'plan'}>{label}</window.Chip>)}
          <span style={{ fontSize: 11, fontWeight: 800, color: '#2F6DA8' }}>◑ Mitglied- + Admin-Ansicht</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.15fr', gap: 26, alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <Bucket title="START">
            <Route route="/" label="Übersicht" note="Einsatz · Hinweise · Woche" status="next" />
          </Bucket>
          <Bucket title="MEIN BEREICH" hint="alle">
            <Route route="/performances" label="Meine Auftritte" status="plan" />
            <Route route="/profile" label="Profil & Einstellungen" note="inkl. Beitragsstatus" status="plan" />
          </Bucket>
          <Bucket title="LIVE" hint="kontextuell">
            <Route route="/live" label="Live-Regie" note="Regie schaltet · Performer-Push" status="done" />
          </Bucket>
        </div>
        <div>
          <Bucket title="VEREIN" hint="alle, meist lesend">
            <Route route="/schedule" label="Spielplan" note="ein Kalender, alle Gruppen" split="Trainer" status="plan" />
            <Route route="/gallery" label="Galerie" split="Fotograf" status="plan" />
            <Route route="/members" label="Mitglieder-Verzeichnis" note="Wer-ist-wer · Schlüssel-Halter · Consent" status="next" />
            <Route route="/drinks" label="Bierliste" note="Biertrinker: Kisten kaufen, PayPal · Stand öffentlich" split="Getränkewart" status="done" />
            <Route route="/shop" label="Klamotten-Shop" note="Sammelbestellung + Meine Bestellungen" split="Kleidung" status="done" />
          </Bucket>
        </div>
        <div>
          <Bucket title="VERWALTUNG" hint="je Amt freigeschaltet">
            <Route route="/cockpit" label="Vorstand-Cockpit" note="Präsident/in · GF" status="plan" />
            <Route route="/members/manage" label="Mitglieder-Management" note="GF · Präsident/in · Schriftf. · Admin · inkl. Ämter-Vergabe (hierarchisch)" status="done" />
            <Route route="/groups" label="Gruppen" note="anlegen: GF · Präsident/in · Admin · eigene Gruppe: Trainer" status="done" />
            <Route route="/fees" label="Beiträge & Kasse" note="Finanzen · ein Zahlsystem + e.V.-Controlling" status="done" />
            <Route route="/drinks/inventory" label="Getränke-Inventar" note="Getränkewart" status="plan" />
            <Route route="/events" label="Veranstaltungsplaner" note="Status-Hub · Eckdaten/VVK/Werbung/Saalplan/Programm · GF" status="done" />
            <Route route="/seating" label="Saalplan-Editor" note="Drag&Drop · Aufgabe im Event-Hub" status="done" />
            <Route route="/shop/manage" label="Shop-Verwaltung" note="Kleidung · Konsolidierung + Ausgabe" status="done" />
            <Route route="/keys" label="Schlüssel-Register" note="GF · Präsident/in · Admin" status="plan" />
            <Route route="/roles" label="Ämter & Rechte" note="nur Admin · Rechte je Amt wählen" status="done" />
            <Route route="/settings" label="Vereins-Einstellungen" note="Admin" status="plan" />
          </Bucket>
        </div>
      </div>
    </div>
  );
}

// ── agent briefing (on-canvas handoff for a fresh agent) ────────────────────
function AgentBriefing() {
  const step = (n, t, s) => (
    <div style={{ display: 'flex', gap: 11 }}>
      <div style={{ width: 24, height: 24, borderRadius: 13, background: '#E11D2A', color: '#fff', fontFamily: MDISP, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{n}</div>
      <div><div style={{ fontWeight: 800, fontSize: 13 }}>{t}</div><div style={{ fontSize: 11.5, fontWeight: 500, color: MSUB, lineHeight: 1.45, marginTop: 1 }}>{s}</div></div>
    </div>
  );
  const file = (name, role) => (
    <div style={{ display: 'flex', gap: 9, alignItems: 'baseline', padding: '5px 0' }}>
      <span style={{ fontFamily: MMONO, fontSize: 11, color: MT.ink, fontWeight: 600, flexShrink: 0, width: 138 }}>{name}</span>
      <span style={{ fontSize: 11.5, fontWeight: 500, color: MSUB, lineHeight: 1.35 }}>{role}</span>
    </div>
  );
  return (
    <div style={{ fontFamily: MFONT, color: MT.ink, background: '#fff', height: '100%', padding: '30px 34px', overflow: 'hidden' }}>
      <Kicker>Für neue Agents · Briefing</Kicker>
      <h2 style={{ fontFamily: MDISP, fontSize: 28, letterSpacing: 0.5, margin: '8px 0 4px', lineHeight: 0.95 }}>So arbeitest du hier weiter</h2>
      <p style={{ fontSize: 12.5, fontWeight: 500, color: MSUB, lineHeight: 1.5, margin: '0 0 18px', maxWidth: 760 }}>
        Wir mocken die interne Club-App des FCC, Feature für Feature. Voller Kontext steht in <b style={{ color: MT.ink }}>CLAUDE.md</b> (wird automatisch geladen) und in den beiden Panels rechts (Identität & Routen). Kurzfassung:
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 26, alignItems: 'start' }}>
        <div>
          <GLabel style={{ marginBottom: 9 }}>Ablauf je Feature</GLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {step('1', 'Erst interviewen & empfehlen', 'Fokussierte Fragen vor dem Bauen, Abhängigkeiten zuerst. Immer mit klarer Empfehlung. Danach Zug beenden.')}
            {step('2', 'Seite im System bauen', 'Body in fcc-ds-pages.jsx (+ renderFccPage, PAGEMETA, ggf. NAVCONFIG-Eintrag mit Amt-Gate). Mobil in fcc-ds-mobile.jsx.')}
            {step('3', 'Auf dem Canvas zeigen', 'Neue DCSection/DCArtboards in dieser Datei. Varianten nebeneinander, nicht in neue Dateien forken.')}
            {step('4', 'Roadmap & Verify', 'Status in IARoutes nachziehen. ready_for_verification, Artboards passend hoch (kein Clipping).')}
          </div>
          <div style={{ background: MT.panel2, border: `1px solid ${MLINE2}`, borderRadius: 11, padding: '12px 14px', marginTop: 16 }}>
            <GLabel style={{ marginBottom: 6 }}>Eiserne Regeln</GLabel>
            <div style={{ fontSize: 11.5, fontWeight: 600, color: MT.ink, lineHeight: 1.55 }}>
              System <b>komponieren</b>, nicht erweitern — nur <span style={{ fontFamily: MMONO }}>window.T</span>-Tokens & vorhandene Komponenten. · Routen/Code <b>englisch</b>, Inhalte <b>deutsch</b>. · Rot nur Akzent. · Offset-Schatten nur 1× pro Screen.
            </div>
          </div>
        </div>
        <div>
          <GLabel style={{ marginBottom: 7 }}>Dateien</GLabel>
          <div style={{ background: MT.panel2, border: `1px solid ${MLINE2}`, borderRadius: 11, padding: '8px 14px' }}>
            {file('FCC Design System', 'Quelle der Wahrheit — zuerst lesen')}
            {file('…Feature Mocks', 'Diese Arbeitsdatei — hier bauen')}
            {file('fcc-ds-shell.jsx', 'Tokens T · Ic · Card/Chip/Btn… · AppShell · NAVCONFIG')}
            {file('fcc-ds-pages.jsx', 'Desktop-Seiten · renderFccPage · PAGEMETA')}
            {file('fcc-ds-mobile.jsx', 'Mobile-App · MobileApp')}
            {file('fcc-theme.jsx', 'Marke KK + KK-Komponenten')}
          </div>
          <GLabel style={{ margin: '16px 0 7px' }}>Nächstes Feature (empfohlen)</GLabel>
          <div style={{ background: '#1A1411', borderRadius: 12, padding: '13px 15px', color: '#FBF4E6' }}>
            <div style={{ fontFamily: MMONO, fontSize: 11, color: '#F4B400' }}>Einladungs-Flow</div>
            <div style={{ fontFamily: MDISP, fontSize: 19, letterSpacing: 0.3, margin: '3px 0 4px' }}>Onboarding & Einladung</div>
            <div style={{ fontSize: 11.5, fontWeight: 500, color: 'rgba(251,244,230,0.7)', lineHeight: 1.45 }}>Datenmodell steht (Mitglieder + Gruppen). Nächster Schritt: der Einladungs-/Onboarding-Flow (Token + QR), dann Beitrags- oder Getränke-Verwaltung.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── build-status board (pitch roadmap, lives on the canvas) ─────────────────
// Update task `s` ('open' | 'doing' | 'done') and part `phase` as we build.
const BUILD_PARTS = [
  {
    n: '2', col: '#E11D2A', title: 'Veranstaltungsplaner', route: '/events · Status-Hub statt Stepper',
    pitch: 'Eine Veranstaltung als Aufgaben-Board: alle To-dos in beliebiger Reihenfolge — Programm darf früher als Tickets.',
    phase: 'now',
    tasks: [
      ['Saison-/Event-Liste', 'done'],
      ['Event-Hub (Status-Board)', 'done'],
      ['Basics → „auf Website sichtbar"', 'done'],
      ['Vorverkauf + „noch X Tickets"', 'done'],
      ['Werbung: Insta + Flyer (auto)', 'done'],
      ['Saalplan-Editor (Drag&Drop)', 'done'],
      ['Programm → Teil 3', 'done'],
    ],
  },
  {
    n: '3', col: '#2F6DA8', title: 'Auto-Reihenfolge', route: '/events · Programm-Algorithmus',
    pitch: 'Der Algorithmus rechnet die beste Reihenfolge — maximale Umziehzeit, gute Mischung. Mensch behält die Kontrolle.',
    phase: 'now',
    tasks: [
      ['Akte-Liste · Kategorien · Pins · Hinweise', 'done'],
      ['„Reihenfolge berechnen" + Ergebnis (Umziehzeit, Pacing)', 'done'],
      ['Sperren/Nudgen + neu rechnen', 'done'],
    ],
  },
  {
    n: '1', col: '#1A1411', title: 'Zahlungen & Kasse', route: '/fees · Bezahl-Flow · Controlling',
    pitch: 'Ein Zahlsystem für alles — Beitrag, Klamotten, Getränke & Tickets per Tippen. Spart Bargeld und macht die e.V.-Buchhaltung automatisch.',
    phase: 'now',
    tasks: [
      ['Mitglied: 1-Tap zahlen (Stripe/PayPal)', 'done'],
      ['Finanzen: Einnahmen, offene Posten, Beiträge', 'done'],
      ['Belege & Auslagen (Ausgaben-Seite, bar)', 'done'],
      ['Kassenbericht-Export (CSV/PDF)', 'done'],
    ],
  },
  {
    n: '4', col: '#E11D2A', title: 'Live-Regie', route: '/live · Operator-Cockpit + Performer-Push',
    pitch: 'Die geplante Reihenfolge läuft live am Abend — Last-Minute-Änderungen für alle, Push „du bist gleich dran".',
    phase: 'now',
    tasks: [
      ['Live-Ablauf: aktuell/als nächstes + umsortieren', 'done'],
      ['Push „Du bist in ~10 Min dran" (Sperrbildschirm)', 'done'],
      ['Name festgelegt: Live-Regie', 'done'],
    ],
  },
];
function TaskBox({ s }) {
  if (s === 'done') return <span style={{ width: 16, height: 16, borderRadius: 5, background: MT.green, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><window.Ic name="check" size={11} color="#fff" sw={3.2} /></span>;
  if (s === 'doing') return <span style={{ width: 16, height: 16, borderRadius: 5, border: '2px solid #9a7200', background: 'rgba(244,180,0,0.2)', flexShrink: 0 }} />;
  return <span style={{ width: 16, height: 16, borderRadius: 5, border: `1.5px solid ${MLINE}`, flexShrink: 0 }} />;
}
function BuildRow({ part, first }) {
  const now = part.phase === 'now';
  return (
    <div style={{ display: 'flex', gap: 26, padding: '20px 0', borderTop: first ? 'none' : `1px solid ${MLINE2}` }}>
      <div style={{ width: 320, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 7 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, background: part.col, color: '#fff', fontFamily: MDISP, fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{part.n}</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: MDISP, fontSize: 21, letterSpacing: 0.4, lineHeight: 0.95 }}>{part.title}</div>
            <div style={{ fontFamily: MMONO, fontSize: 10.5, color: MSUB, marginTop: 2 }}>{part.route}</div>
          </div>
        </div>
        <p style={{ fontSize: 12.5, fontWeight: 500, color: MSUB, lineHeight: 1.5, margin: '8px 0 10px' }}>{part.pitch}</p>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: now ? '#9a7200' : MFAINT, background: now ? 'rgba(244,180,0,0.16)' : MT.panel2, border: `1px solid ${now ? 'rgba(244,180,0,0.4)' : MLINE2}`, padding: '4px 10px', borderRadius: 20 }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: now ? '#9a7200' : MFAINT }} />{now ? 'Jetzt im Bau' : 'Danach'}
        </span>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px 22px', alignContent: 'start' }}>
        {part.tasks.map(([t, s]) => (
          <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
            <TaskBox s={s} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: s === 'done' ? MFAINT : MT.ink, textDecoration: s === 'done' ? 'line-through' : 'none', lineHeight: 1.3 }}>{t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function BuildBoard() {
  const total = BUILD_PARTS.reduce((a, p) => a + p.tasks.length, 0);
  const done = BUILD_PARTS.reduce((a, p) => a + p.tasks.filter(t => t[1] === 'done').length, 0);
  return (
    <div style={{ fontFamily: MFONT, color: MT.ink, background: '#fff', height: '100%', padding: '30px 36px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <Kicker>Pitch-Fahrplan · Bau-Status</Kicker>
          <h2 style={{ fontFamily: MDISP, fontSize: 28, letterSpacing: 0.5, margin: '8px 0 4px', lineHeight: 0.95 }}>Die 4 wertvollsten Features</h2>
          <p style={{ fontSize: 12.5, fontWeight: 500, color: MSUB, margin: 0, maxWidth: 620, lineHeight: 1.45 }}>Was wir für den Pitch mocken — je ein „heute → mit App"-Moment. Wir starten mit 2 & 3.</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: MDISP, fontSize: 30, lineHeight: 0.9 }}>{done}<span style={{ color: MFAINT }}>/{total}</span></div>
          <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1, color: MFAINT, textTransform: 'uppercase', marginTop: 2 }}>Aufgaben erledigt</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 9, justifyContent: 'flex-end' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: MSUB }}><TaskBox s="done" />erledigt</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: MSUB }}><TaskBox s="doing" />in Arbeit</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 10.5, fontWeight: 700, color: MSUB }}><TaskBox s="open" />offen</span>
          </div>
        </div>
      </div>
      <div>
        {BUILD_PARTS.map((p, i) => <BuildRow key={p.n} part={p} first={i === 0} />)}
      </div>
    </div>
  );
}

// ── pitch arguments field (the full pitch text, on-brand) ───────────────────
function PA_Core({ n, title, body }) {
  return (
    <div style={{ display: 'flex', gap: 16, padding: '18px 20px', background: '#1A1411', borderRadius: 14, color: '#FBF4E6' }}>
      <div style={{ fontFamily: MDISP, fontSize: 40, color: '#E11D2A', lineHeight: 0.9, flexShrink: 0, width: 42 }}>{n}</div>
      <div>
        <div style={{ fontFamily: MDISP, fontSize: 20, letterSpacing: 0.4, lineHeight: 1.05, marginBottom: 6 }}>{title}</div>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(251,244,230,0.78)', lineHeight: 1.55 }}>{body}</div>
      </div>
    </div>
  );
}
function PA_Feature({ title, route, points }) {
  return (
    <div style={{ breakInside: 'avoid', background: MT.panel, border: `1.5px solid ${MLINE}`, borderRadius: 13, padding: '15px 17px', marginBottom: 14, boxShadow: '0 1px 0 rgba(26,20,17,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 9, marginBottom: 10 }}>
        <span style={{ width: 9, height: 9, background: '#E11D2A', flexShrink: 0 }} />
        <span style={{ fontFamily: MDISP, fontSize: 17, letterSpacing: 0.3 }}>{title}</span>
        <span style={{ fontFamily: MMONO, fontSize: 10, color: MFAINT }}>{route}</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {points.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 9 }}>
            <span style={{ color: '#E11D2A', fontWeight: 800, fontSize: 13, flexShrink: 0, marginTop: 1 }}>→</span>
            <span style={{ fontSize: 12.5, fontWeight: 500, color: MT.ink, lineHeight: 1.5 }}>{p}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function PA_StakeCol({ tone, kicker, title, points }) {
  return (
    <div style={{ flex: 1, background: MT.panel, border: `1.5px solid ${MLINE}`, borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: tone, textTransform: 'uppercase' }}>{kicker}</div>
      <div style={{ fontFamily: MDISP, fontSize: 21, letterSpacing: 0.3, margin: '5px 0 13px' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {points.map(([h, b], i) => (
          <div key={i}>
            <div style={{ fontWeight: 800, fontSize: 13 }}>{h}</div>
            <div style={{ fontSize: 12, fontWeight: 500, color: MSUB, lineHeight: 1.5, marginTop: 1 }}>{b}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
function PitchArguments() {
  const FEATURES = [
    ['Zahlungen & Kasse', '/fees', ['Jederzeit sichtbarer Kassenstand — kein Suchen, kein Nachzählen.', 'Ein-Klick-Bezahlung (Karte/PayPal) statt Bargeld-Übergabe.', 'Automatische e.V.-Buchhaltung: Einnahmen nach Kategorie, offen/bezahlt, Kassenbericht per Knopfdruck (CSV/PDF) für Kassenprüfer & Finanzamt.', 'Der Finanzwart spart Sammeln, Zählen, Abtippen über die ganze Saison.']],
    ['Belege & Auslagen', '/fees', ['Beleg per Foto einreichen, Geld bar zurück — sauber verbucht.', 'Der Kassenbericht ist endlich vollständig: Einnahmen − Ausgaben = Saldo.', 'Keine verlorenen Belege mehr.']],
    ['Bierliste & Getränkekasse', '/drinks', ['Schluss mit Strichliste auf Papier: jederzeit klar, wie viel da ist, wer gezahlt hat, wer offen ist.', 'Warnung bei Nachbestellbedarf.', 'Palettenabgleich sagt exakt, wie viele Kisten zu rücken sind — physische Palette und Kasse driften nie auseinander.']],
    ['Veranstaltungsplaner', '/events', ['Event als Aufgaben-Board statt Zettel-Chaos — alle To-dos mit Status.', 'Eckdaten einmal eingeben → sofort auf der Website beworben.', 'Werbematerial automatisch (Insta, Flyer, WhatsApp) aus Event-Daten + Vereins-Design — ein Klick zum Teilen.', 'Live-Ticketstand öffentlich („nur noch X") schafft Dringlichkeit.']],
    ['Auto-Reihenfolge', '/events', ['Algorithmus baut die beste Auftrittsreihenfolge — maximale Umziehzeit, gute Mischung.', 'Planer behält die Kontrolle (fixieren, Hinweise), App übernimmt die Tüftelei.', 'Spart Stunden und vermeidet „die Kinder sind zweimal hintereinander dran".']],
    ['Live-Regie', '/live', ['Der geplante Ablauf läuft live am Abend; Last-Minute-Änderungen erreichen sofort alle.', 'Aktive bekommen Push „ihr seid gleich dran" — kein verpasster Einsatz, ruhiger hinter der Bühne.']],
    ['Saalplanung', '/events', ['Saalplan per Drag & Drop, direkt am iPad im Saal — Plätze werden live gezählt.', 'Lange Tischreihen als Block verschieben, Stühle entstehen automatisch.', 'Jedes Jahr als Vorlage wiederverwendbar.']],
    ['Klamotten-Shop', '/shop', ['Mitglieder bestellen Größe + Artikel, zahlen direkt oder bar.', 'Das Amt bekommt eine fertige Lieferanten-Liste statt von Hand zu zählen.', 'Ausgabe-Tracking: wer hat abgeholt, wer ist offen.']],
    ['Mitglieder & Ämter', '/members', ['Zentrales, aktuelles Verzeichnis statt veralteter Excel-Listen.', 'Rechte hängen an Ämtern — Übergabe an Nachfolger ist ein Klick.']],
  ];
  return (
    <div style={{ fontFamily: MFONT, color: MT.ink, background: MT.bg, padding: '34px 40px', minHeight: '100%' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
        <div style={{ maxWidth: 720 }}>
          <Kicker>Pitch · Argumente für die Vorstandssitzung</Kicker>
          <h1 style={{ fontFamily: MDISP, fontSize: 38, letterSpacing: 0.5, margin: '10px 0 10px', lineHeight: 0.95 }}>Warum die FURRIA-App den Verein besser macht</h1>
          <p style={{ fontSize: 14, fontWeight: 500, color: MSUB, lineHeight: 1.6, margin: 0 }}>Die stärksten Argumente, sortiert — von den drei Kern-Botschaften über jedes Feature bis zum Nutzen für Ämter und Mitglieder. Zum direkten Vortragen.</p>
        </div>
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6 }}>
          <window.KKBroom size={30} color="#E11D2A" band={MT.cream} />
          <span style={{ fontFamily: MDISP, fontSize: 22, letterSpacing: 1 }}>FURRIA</span>
        </div>
      </div>

      {/* 1 — core messages */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}><span style={{ width: 11, height: 11, background: '#E11D2A' }} /><span style={{ fontFamily: MDISP, fontSize: 19, letterSpacing: 0.4 }}>Die drei Kern-Botschaften</span><div style={{ flex: 1, height: 2, background: MLINE }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <PA_Core n="1" title="Wissen gehört dem Verein" body={'Heute steckt das Entscheidende in Zetteln, WhatsApp und „das weiß nur einer“. Die App macht es zum dauerhaften Vereinseigentum — Übergaben dauern Minuten statt Wochen.'} />
          <PA_Core n="2" title="Schluss mit Bargeld & Zetteln" body={'Beiträge, Bierkasse, Klamotten, Tickets, Auslagen — alles in einem System, das jederzeit sagt, wie viel Geld da ist, wer was schuldet und wofür es ausgegeben wurde.'} />
          <PA_Core n="3" title="Weniger Frust = mehr Helfer" body={'Der häufigste Grund gegen ein Amt: zu viel Papierkram. Die App nimmt genau diesen Frust raus — Ämter werden wieder machbar und attraktiver.'} />
        </div>
      </div>

      {/* 2 — per feature */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}><span style={{ width: 11, height: 11, background: '#E11D2A' }} /><span style={{ fontFamily: MDISP, fontSize: 19, letterSpacing: 0.4 }}>Pro Feature — was es besser macht</span><div style={{ flex: 1, height: 2, background: MLINE }} /></div>
        <div style={{ columnCount: 3, columnGap: 14 }}>
          {FEATURES.map((f) => <PA_Feature key={f[0]} title={f[0]} route={f[1]} points={f[2]} />)}
        </div>
      </div>

      {/* 3 — per stakeholder */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}><span style={{ width: 11, height: 11, background: '#E11D2A' }} /><span style={{ fontFamily: MDISP, fontSize: 19, letterSpacing: 0.4 }}>Was es pro Zielgruppe bringt</span><div style={{ flex: 1, height: 2, background: MLINE }} /></div>
        <div style={{ display: 'flex', gap: 14 }}>
          <PA_StakeCol tone="#E11D2A" kicker="Für Vorstand & Ämter" title="Weniger Aufwand, voller Überblick" points={[['Überblick auf einen Blick', 'Finanzen, Bestände, offene Posten, Ticketverkauf — jederzeit aktuell statt Hinterhertelefonieren.'], ['Deutlich weniger Verwaltung', 'Buchhaltung, Listen, Werbung, Reihenfolge laufen halb-automatisch.'], ['Saubere Dokumentation', 'Für Mitgliederversammlung, Kassenprüfung und Finanzamt — auf Knopfdruck, keine Nachtschichten.'], ['Geteilte Last', 'Aufgaben sind sichtbar und übergebbar, nicht an eine Person geklebt.']]} />
          <PA_StakeCol tone="#2F6DA8" kicker="Für die Mitglieder" title="Alles an einem Ort, fair & modern" points={[['Alles an einem Ort', 'Statt fünf WhatsApp-Gruppen: nächster Termin, mein Auftritt, offener Betrag, Programm.'], ['Bequem zahlen', 'Per Handy statt passend Bargeld besorgen.'], ['Transparenz & Vertrauen', 'Jeder sieht, dass es fair und sauber zugeht — was gezahlt ist, was offen.'], ['Mehr Gemeinschaft', 'Push-Infos, Galerie, Sponsoren-Scoreboard — modern und verbunden.']]} />
        </div>
      </div>

      {/* 4 — killer args */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}><span style={{ width: 11, height: 11, background: '#E11D2A' }} /><span style={{ fontFamily: MDISP, fontSize: 19, letterSpacing: 0.4 }}>Die übergreifenden Killer-Argumente</span><div style={{ flex: 1, height: 2, background: MLINE }} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            ['Ausfallsicherheit', 'Keine Abhängigkeit mehr von einzelnen Personen oder deren Zetteln.'],
            ['Transparenz schafft Vertrauen', 'Bei Geld im Verein besonders wichtig.'],
            ['Zeit fürs Wesentliche', 'Weniger Orga, mehr Karneval.'],
            ['Nachwuchs & Sponsoren', 'Ein digital organisierter Verein wirkt attraktiv.'],
            ['Zukunftssicher', 'Web-App heute, später echte Handy-App mit Push & Widgets — ohne Neubau.'],
            ['Eine Investition, vielfacher Nutzen', 'Dasselbe System trägt Website, interne App und später die Gäste-App.'],
          ].map(([h, b]) => (
            <div key={h} style={{ background: MT.panel2, border: `1px solid ${MLINE2}`, borderRadius: 11, padding: '14px 15px' }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 3 }}>{h}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: MSUB, lineHeight: 1.5 }}>{b}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MockCover, IAModel, IARoutes, AgentBriefing, BuildBoard, PitchArguments });
