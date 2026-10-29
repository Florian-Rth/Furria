export const SMALLEST_STAGE_SIDE_METRES = 2;
export const LARGEST_STAGE_SIDE_METRES = 40;

const METRES_PATTERN = /^\d+(?:[.,]\d{1,2})?$/;
const DECIMAL_COMMA = ',';
const DECIMAL_POINT = '.';
const STAGE_SIZE_UNIT = 'm';
const SIZE_SEPARATOR = '×';

const formMetres = new Intl.NumberFormat('de-DE', {
  maximumFractionDigits: 2,
  useGrouping: false,
});

const sizeMetres = new Intl.NumberFormat('de-DE', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

export interface StageSize {
  widthMetres: number;
  depthMetres: number;
}

export const parseMetres = (text: string): number | null => {
  const trimmed = text.trim();

  return METRES_PATTERN.test(trimmed)
    ? Number(trimmed.replace(DECIMAL_COMMA, DECIMAL_POINT))
    : null;
};

const isWithinStageBounds = (metres: number | null): metres is number =>
  metres !== null && metres >= SMALLEST_STAGE_SIDE_METRES && metres <= LARGEST_STAGE_SIDE_METRES;

export const isStageSide = (text: string): boolean => isWithinStageBounds(parseMetres(text));

export const stageSizeOf = (widthText: string, depthText: string): StageSize | null => {
  const widthMetres = parseMetres(widthText);
  const depthMetres = parseMetres(depthText);

  if (!isWithinStageBounds(widthMetres) || !isWithinStageBounds(depthMetres)) {
    return null;
  }

  return { widthMetres, depthMetres };
};

export const formatFormMetres = (metres: number): string => formMetres.format(metres);

export const formatStageSize = (size: StageSize): string =>
  `${sizeMetres.format(size.widthMetres)} ${SIZE_SEPARATOR} ${sizeMetres.format(size.depthMetres)} ${STAGE_SIZE_UNIT}`;
