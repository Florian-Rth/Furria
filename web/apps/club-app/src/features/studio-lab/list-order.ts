export interface SpotHolding {
  spotId: number;
  number: number;
  personId: number | null;
}

export const reordered = <Item>(items: readonly Item[], from: number, to: number): Item[] => {
  const moving = items[from];
  if (moving === undefined || from === to || to < 0 || to >= items.length) {
    return [...items];
  }
  const rest = items.filter((_, index) => index !== from);

  return [...rest.slice(0, to), moving, ...rest.slice(to)];
};

export const withHolderMoved = (
  holdings: readonly SpotHolding[],
  personId: number,
  toSpotId: number | null,
): SpotHolding[] => {
  const from = holdings.find((holding) => holding.personId === personId);
  const to = holdings.find((holding) => holding.spotId === toSpotId);
  if (from !== undefined && from.spotId === toSpotId) {
    return [...holdings];
  }

  return holdings.map((holding) => {
    if (from !== undefined && holding.spotId === from.spotId) {
      return { ...holding, personId: to?.personId ?? null };
    }
    if (to !== undefined && holding.spotId === to.spotId) {
      return { ...holding, personId };
    }

    return holding;
  });
};
