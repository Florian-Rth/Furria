import type { FlapGlyphTone } from '../../../internal/flap/FlapGlyph';
import type { FlapTileTone } from '../../../internal/flap/FlapTile';
import type { SplitFlapPose } from '../../../internal/flap/flap-pose';
import type { FlapFaceWidth } from './deck-fit';
import { deckFacesOf, deckForCell, orderedFacesOf } from './deck-fit';
import type { FlapCell } from './flap-cells';
import type { FlapTrack } from './flap-keyframes';
import { flapKeyframesOf } from './flap-keyframes';
import type { FlapSchedule, FlapTurnRun } from './flap-schedule';
import { isTurnRun } from './flap-schedule';
import type { GreetingRect } from './greeting-geometry';

export interface FlapDeal {
  faces: readonly string[];
  ordered: boolean;
}

export interface TwinLayout {
  boxes: readonly (GreetingRect | null)[];
  deals: readonly FlapDeal[];
}

export interface TwinCell {
  key: string;
  box: GreetingRect;
  faces: string[];
  track: FlapTrack;
  glyph: FlapGlyphTone;
}

export interface TwinBoard {
  tone: FlapTileTone;
  cells: TwinCell[];
}

export interface GreetingDecks {
  deck: readonly string[];
  nameDeck: readonly string[] | null;
}

const RIGHT_ANGLE = 90;
const DEGREES_PER_HALF_TURN = 180;

const NO_DEAL: FlapDeal = { faces: [], ordered: false };

const usesNameDeck = (cell: FlapCell, decks: GreetingDecks): boolean =>
  cell.role === 'name' && decks.nameDeck !== null && decks.nameDeck.length > 0;

export const dealOf = (
  cell: FlapCell,
  width: number,
  decks: GreetingDecks,
  widthOf: FlapFaceWidth,
): FlapDeal => {
  const ordered = usesNameDeck(cell, decks);
  const source = ordered ? (decks.nameDeck ?? []) : decks.deck;

  return { faces: deckForCell(width, source, widthOf), ordered };
};

export const twinFacesOf = (run: FlapTurnRun, deal: FlapDeal, seed: number): string[] => {
  const count = Math.max(0, ...run.faces.map((face) => (face.kind === 'deck' ? face.slot + 1 : 0)));
  const dealt = deal.ordered
    ? orderedFacesOf(deal.faces, count)
    : deckFacesOf(deal.faces, seed, run.cell, count);

  return run.faces.map((face) => (face.kind === 'text' ? face.text : (dealt[face.slot] ?? '')));
};

export const twinOf = (
  id: string,
  schedule: FlapSchedule,
  cells: readonly FlapCell[],
  layout: TwinLayout,
  seed: number,
): TwinBoard => {
  const tracks = flapKeyframesOf(schedule);

  const twinCells = schedule.runs.filter(isTurnRun).flatMap((run) => {
    const box = layout.boxes[run.cell] ?? null;
    const track = tracks.find((candidate) => candidate.cell === run.cell);
    const cell = cells[run.cell];

    if (box === null || track === undefined || cell === undefined) {
      return [];
    }

    return [
      {
        key: `${id}:${run.cell}`,
        box,
        faces: twinFacesOf(run, layout.deals[run.cell] ?? NO_DEAL, seed),
        track,
        glyph: cell.accent ? 'accent' : 'ink',
      } satisfies TwinCell,
    ];
  });

  return { tone: schedule.tone, cells: twinCells };
};

export const twinFaceAt = (faces: readonly string[], index: number, ahead: number): string =>
  faces[Math.min(Math.max(Math.floor(index) + ahead, 0), faces.length - 1)] ?? '';

export const twinPoseOf = (fall: number, land: number, cover: number): SplitFlapPose => ({
  fall,
  land,
  reveal: 1 - Math.cos((fall * Math.PI) / DEGREES_PER_HALF_TURN),
  cover,
  presence: 0,
  fallen: fall <= -RIGHT_ANGLE,
});
