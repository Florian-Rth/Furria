export type GridMove = 'up' | 'down' | 'left' | 'right' | 'first' | 'last';

const MOVES: Readonly<Record<string, GridMove>> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Home: 'first',
  End: 'last',
};

export const gridMoveOf = (key: string): GridMove | null => MOVES[key] ?? null;

interface GridPlace {
  column: number;
  row: number;
}

const placeOf = (grid: readonly (readonly string[])[], key: string): GridPlace | null => {
  const column = grid.findIndex((keys) => keys.includes(key));

  return column === -1 ? null : { column, row: grid[column]?.indexOf(key) ?? 0 };
};

const sideStep = (
  grid: readonly (readonly string[])[],
  place: GridPlace,
  step: number,
): string | null => {
  for (let column = place.column + step; column >= 0 && column < grid.length; column += step) {
    const keys = grid[column] ?? [];
    if (keys.length > 0) {
      return keys[Math.min(place.row, keys.length - 1)] ?? null;
    }
  }

  return null;
};

export const nextGridKeyOf = (
  grid: readonly (readonly string[])[],
  current: string,
  move: GridMove,
): string | null => {
  const place = placeOf(grid, current);
  if (place === null) {
    return null;
  }

  const keys = grid[place.column] ?? [];
  switch (move) {
    case 'up':
      return keys[place.row - 1] ?? null;
    case 'down':
      return keys[place.row + 1] ?? null;
    case 'first':
      return keys[0] ?? null;
    case 'last':
      return keys[keys.length - 1] ?? null;
    case 'left':
      return sideStep(grid, place, -1);
    case 'right':
      return sideStep(grid, place, 1);
  }
};
