# Änderungen seit dem letzten Handoff (App-Shell / Layout D)

Nur die Deltas. Alles andere aus `README.md` (Struktur, Verhalten, Zustände, Typo, Navigation) bleibt unverändert gültig.

## 1. Hell und dunkel werden nicht mehr gemischt
Vorher waren Bühne und Vorhang **auch im Light-Mode dunkel** (`#15110E`). Das war ein Fehler: ein schwarzer Block in einer hellen App mischt zwei Modi.

**Jetzt:** im Light-Mode sind Bühne, Vorhang und Desktop-Schiene **hell**. Trennung entsteht über Tonstufen + Haarlinien, nicht über einen dunklen Block. Dark-Mode ist strukturell unverändert (nur dunkle Werte).

Betroffen: alle Textfarben, Haarlinien, Icons, Badges und der Ghost-Button in Bühne und Vorhang laufen jetzt über die Palette statt über fest verdrahtete Cream-Werte.

| Element | vorher (light) | jetzt (light) |
|---|---|---|
| Bühne | `#15110E`, Text cream | heller Verlauf, Text `#1A1411` |
| Vorhang (mobil) | `#15110E`, Anton in cream | Hintergrund `#FDFCFA`, Anton in Ink, aktiver Eintrag rot |
| Desktop-Schiene | `#15110E` | `#FFFFFF` + `1.5px` Haarlinie rechts |
| Badges im Vorhang | Gold `#F4B400` | `#9a7200` (Kontrast auf hell) |
| Ghost-Action („Ausgleichen") | `rgba(251,244,230,0.14)` / cream | `rgba(26,20,17,0.07)` / Ink |
| Check-Kreis „Alles erledigt" | `rgba(46,158,91,0.22)` / `#5FD08D` | `rgba(46,158,91,0.12)` / `#2E9E5B` |
| Roter Glow hinter der Bühne | `rgba(225,29,42,0.26)` | `rgba(225,29,42,0.10)` |

**Ausnahme, bewusst:** der schwebende Menü-Knopf bleibt in beiden Modi dunkles Ink mit cremefarbenem Text. Er ist ein Button, keine Fläche — das mischt die Modi nicht.

Der **Login-Screen** ist von dieser Regel ausgenommen: dort ist die dunkle Bühne neben dem hellen Formular gewollt.

## 2. Hintergrund und Flächen getauscht
Vorher: Cream/Beige `#FBF4E6` war der **Hintergrund**, Karten waren weiß.
Jetzt umgekehrt — der Beige-Ton trägt die **Flächen**, der Grund ist fast weiß. Drei Tonstufen:

| Rolle | light | dark |
|---|---|---|
| Chrome (Bühne, Schiene) | `#FFFFFF` | `#0E0B0A` |
| Grund (Body/Sheet) | `#FDFCFA` | `#161110` |
| Fläche (Karten) | `#FBF4E6` | `#1E1817` |

**Neu: alle Inhaltsblöcke liegen auf Karten** statt frei auf dem Grund. Karte = Flächenfarbe + `1.5px` Haarlinie (`rgba(26,20,17,0.08)` / `rgba(251,244,230,0.10)`) + `border-radius: 16px`, Innenabstand `4px 16px` bei Listen (die Zeilen bringen ihr eigenes `padding: 12px 0` mit), `14px 16px` bei einzeiligen Karten.
Betrifft: `Deine Woche`, `Dein Auftritt`, `Neu im Verein` (Desktop) und die drei Aufgaben-Karten in der Desktop-Bühne.
Die Sektionsköpfe (rotes Quadrat + Anton-Label + Haarlinie) bleiben **außerhalb** der Karte.

## 3. Die Bühne ist als Kopfbereich hervorgehoben
Statt einer flachen Fläche:
- **Verlauf** light `linear-gradient(168deg, #FFFFFF 0%, #FFFDF8 46%, #FDF6E9 100%)` · dark `linear-gradient(168deg, #17100E 0%, #0E0B0A 58%)`
- **Schlagschatten** nach unten, hebt die Bühne über den Inhalt: light `0 10px 26px rgba(26,20,17,0.07)` · dark `0 12px 30px rgba(0,0,0,0.45)`
- Bühne liegt auf einer höheren Ebene als das Sheet (`z-index` über dem Body)
- der rote Glow bleibt, oben rechts, jetzt dezent
- **keine** farbigen Kanten oder Streifen (eine rote Unterkante und ein goldener Randstreifen waren zwischenzeitlich drin und sind wieder entfernt)
- Innenabstand leicht gewachsen: mobil `6px 20px 22px`, Desktop `26px 40px 30px`

Im Light-Mode hat das Sheet **keinen** oberen Radius und **keinen** Schatten mehr (`border-radius: 0`) — es ist der Body, kein aufgelegtes Sheet. Im Dark-Mode bleibt `22px 22px 0 0` mit Schatten.

## Aktualisierte Tokens
| Token | light | dark |
|---|---|---|
| Chrome / Bühne (Basis) | `#FFFFFF` | `#0E0B0A` |
| Bühnen-Verlauf | `168deg, #FFFFFF → #FFFDF8 → #FDF6E9` | `168deg, #17100E → #0E0B0A` |
| Bühnen-Schatten | `0 10px 26px rgba(26,20,17,0.07)` | `0 12px 30px rgba(0,0,0,0.45)` |
| Grund | `#FDFCFA` | `#161110` |
| Fläche / Karte | `#FBF4E6` | `#1E1817` |
| Karten-Haarlinie | `rgba(26,20,17,0.08)` | `rgba(251,244,230,0.10)` |
| Haarlinie in der Bühne | `rgba(26,20,17,0.10)` | `rgba(251,244,230,0.11)` |
| Glow (Bühne) | `rgba(225,29,42,0.10)` | `rgba(225,29,42,0.26)` |
| Glow (Vorhang/Schiene, gold) | `rgba(244,180,0,0.16)` | `rgba(244,180,0,0.14)` |
| Karten-Radius | `16px` | `16px` |

Rot bleibt Akzent und Aktion, nie Textfarbe. Keine neuen Schriften, Radien oder Farben außerhalb dieser Tabelle.

## Umsetzungshinweis
Die Palette liegt in `src/fcc-app-shell-d.jsx` in **einer** Funktion `dpal(dark)` — beide Modi mit identischen Schlüsseln. Jedes farbtragende Element liest daraus (`c.stageBg`, `c.card`, `c.sInk`, `c.ghostBg` …), nichts ist mehr fest verdrahtet. Für die Produktion: dieselben Schlüssel als CSS-Variablen unter `:root` / `[data-theme="dark"]` anlegen und die Komponenten nur noch die Variablen benutzen.

## Dateien
- `src/fcc-app-shell-d.jsx` — ersetzt die Version aus dem letzten Paket
- `app-shell.html` — unverändert, zeigt jetzt die neue Fassung (mobil hell/dunkel je 3 Zustände, Desktop hell/dunkel)
