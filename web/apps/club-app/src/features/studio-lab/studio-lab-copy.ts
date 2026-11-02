import { formatReadoutMetres } from '@furria/studio/drag-readout';
import type { GesturePrecisionTier } from '@furria/studio/gesture-recogniser';
import type { CountAt } from '@furria/studio/music-timeline';

export const STUDIO_LAB_SECTION = 'Studio: Bedienung mit dem Finger';
export const STUDIO_LAB_EMPTY = 'Für diesen Auftritt gibt es noch keine Musik im Studio.';
export const STUDIO_LAB_NO_ACT = 'Kein Auftritt gefunden, an dem du mitwirkst.';
export const STUDIO_LAB_LOADING = 'Studio wird geladen …';

export const LIFT_LABEL = 'Anzeige beim Ziehen';
export const LIFT_CHOICES = [
  { id: 'lifted', label: 'Wert über dem Finger' },
  { id: 'loupe', label: 'Lupe' },
] as const;

export const PRECISION_LABEL = 'Feinziehen';
export const PRECISION_CHOICES = [
  { id: 'distance', label: 'Finger wegziehen' },
  { id: 'hold', label: 'Erst halten' },
] as const;

export const SELECTION_LABEL = 'Langes Drücken';
export const SELECTION_CHOICES = [
  { id: 'sheet', label: 'Aktionen unten' },
  { id: 'toolbar', label: 'Leiste an der Auswahl' },
] as const;

export const GLIDE_LABEL = 'Nach dem Wischen';
export const GLIDE_CHOICES = [
  { id: 'free', label: 'Frei auslaufen' },
  { id: 'snap', label: 'Auf Schritt einrasten' },
] as const;

export const SCRUB_LABEL = 'Zeitleiste';
export const SCRUB_CHOICES = [
  { id: 'fixed', label: 'Feste Ansicht' },
  { id: 'centre', label: 'Mittellinie' },
] as const;

export const TIMELINE_AREA = 'Musik-Zeitleiste';
export const STAGE_AREA = 'Bühne';
export const KEY_LANE_AREA = 'Wegpunkte auf der Zeitleiste';
export const RAIL_AREA = 'Schrittleiste';

export const PLAY = 'Abspielen';
export const PAUSE = 'Anhalten';
export const UNDO = 'Rückgängig';
export const FIT = 'Ganze Musik zeigen';

export const TIMELINE_HINT_DISTANCE =
  'Tippen spult. Zwei Finger zoomen und schieben. Griff ziehen ändert Schnitt oder Schrittgrenze – Finger nach oben oder unten wegziehen macht es feiner.';
export const TIMELINE_HINT_HOLD =
  'Tippen spult. Zwei Finger zoomen und schieben. Griff ziehen ändert Schnitt oder Schrittgrenze – erst kurz halten, dann ziehen macht es feiner.';
export const TIMELINE_HINT_CENTRE_DISTANCE =
  'Wischen schiebt die Musik unter der Linie durch und läuft frei aus. Tippen spult. Zwei Finger zoomen. Griff ziehen ändert Schnitt oder Schrittgrenze – Finger nach oben oder unten wegziehen macht es feiner.';
export const TIMELINE_HINT_CENTRE_HOLD =
  'Wischen schiebt die Musik unter der Linie durch und läuft frei aus. Tippen spult. Zwei Finger zoomen. Griff ziehen ändert Schnitt oder Schrittgrenze – erst kurz halten, dann ziehen macht es feiner.';
export const STAGE_HINT =
  'Punkt ziehen setzt einen Wegpunkt zur aktuellen Zeit. Lang drücken wählt mehrere. Raute auf dem Weg ziehen biegt ihn. Zwei Finger zoomen die Bühne.';
export const RAIL_HINT =
  'Wischen schiebt die Schritte. Tippen auf einen Schritt wiederholt ihn, nochmal tippen hebt das auf.';
export const LISTS_HINT =
  'Am Griff ziehen ordnet die Lieder. Namen auf einen anderen Platz ziehen tauscht die Besetzung – auf dem Handy erst kurz halten.';

export const SONGS_TITLE = 'Liedfolge';
export const SPOTS_TITLE = 'Plätze';
export const OPEN_SPOT = 'frei';
export const MOVE_SONG = 'Lied verschieben';

export const SELECTION_SHEET_TITLE = 'Auswahl';
export const SELECTION_CLOSE = 'Schließen';
export const CLEAR_SELECTION = 'Abwählen';
export const MIRROR_SELECTION = 'Spiegeln';
export const LINE_UP_SELECTION = 'Reihe';
export const SELECTION_TOOLBAR = 'Aktionen für die Auswahl';

const PRECISION_BADGES: Record<GesturePrecisionTier, string | null> = {
  full: null,
  half: 'halb',
  quarter: 'viertel',
  fine: 'fein',
};

export const precisionBadgeOf = (tier: GesturePrecisionTier): string | null =>
  PRECISION_BADGES[tier];

export const countDetailOf = (count: CountAt | null): string | null =>
  count === null ? null : `${count.eight + 1}. Acht · ${count.count}`;

export const selectedCountOf = (count: number): string =>
  count === 1 ? '1 Punkt gewählt' : `${count} Punkte gewählt`;

export const spotLabelOf = (number: number): string => `Platz ${number}`;

export const stagePlaceOf = (rightMetres: number, backMetres: number): string =>
  `${formatReadoutMetres(rightMetres)} ${rightMetres < 0 ? 'links' : 'rechts'} · ${formatReadoutMetres(backMetres)} hinten`;
