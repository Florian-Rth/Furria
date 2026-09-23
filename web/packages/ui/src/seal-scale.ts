export interface KkSealScale {
  dateLabel: 'display' | 'h1';
  caption: 'body2' | 'caption';
}

const POSTER_SEAL_FLOOR = 140;

export const toSealScale = (size: number): KkSealScale =>
  size >= POSTER_SEAL_FLOOR
    ? { dateLabel: 'display', caption: 'body2' }
    : { dateLabel: 'h1', caption: 'caption' };
