export interface PhotoPrint {
  key: string;
  src: string | null;
  aspect: string;
  tilt: number;
}

export interface PhotoColumn {
  key: string;
  photos: PhotoPrint[];
}

const PRINTS_PER_COLUMN = 4;
const ASPECTS = ['4 / 5', '3 / 2', '1 / 1', '4 / 5', '3 / 4', '3 / 2'] as const;
const TILTS = [-2, 1.5, -1, 2.5, -1.5, 1] as const;

export const photoColumnsOf = (photos: readonly string[], columnCount: number): PhotoColumn[] =>
  Array.from({ length: columnCount }, (_, columnIndex) => ({
    key: `column-${columnIndex}`,
    photos: Array.from({ length: PRINTS_PER_COLUMN }, (__, row) => {
      const slot = row * columnCount + columnIndex;
      const src = photos.length === 0 ? null : (photos[slot % photos.length] ?? null);

      return {
        key: `print-${slot}`,
        src,
        aspect: ASPECTS[slot % ASPECTS.length] ?? '1 / 1',
        tilt: TILTS[slot % TILTS.length] ?? 0,
      };
    }),
  }));
