const ELEVEN = 11;

export const showsElevenStar = (value: number): boolean =>
  Number.isInteger(value) && value > 0 && value % ELEVEN === 0;
