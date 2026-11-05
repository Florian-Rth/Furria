import type { BoardPanel, StartBeerDeskPanel } from './schemas';

const DESK_LINES = 1;
const LEADING_KINDS: readonly BoardPanel['kind'][] = ['calendar', 'practice'];

const isBeerDesk = (panel: BoardPanel): panel is StartBeerDeskPanel => panel.kind === 'beerDesk';

export const withBeerDesk = (
  panels: readonly BoardPanel[],
  openBeerPotId: number | null,
): BoardPanel[] => {
  if (openBeerPotId === null) {
    return [...panels];
  }

  const desk: StartBeerDeskPanel = {
    kind: 'beerDesk',
    shownCount: DESK_LINES,
    beerPotId: openBeerPotId,
  };
  const afterLeading = panels.filter((panel) => LEADING_KINDS.includes(panel.kind)).length;

  return [...panels.slice(0, afterLeading), desk, ...panels.slice(afterLeading)];
};

export const beerDeskOf = (panels: readonly BoardPanel[]): StartBeerDeskPanel | null =>
  panels.find(isBeerDesk) ?? null;
