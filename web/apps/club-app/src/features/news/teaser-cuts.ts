export type TeaserSurface = 'card' | 'lead' | 'whatsapp';

export type TeaserVariant = 'body1' | 'body2';

export interface TeaserSurfaceFit {
  surface: TeaserSurface;
  variant: TeaserVariant;
  width: number;
  lines: number;
}

export interface TeaserCut {
  surface: TeaserSurface;
  index: number;
}

export type TextMeasure = (text: string, variant: TeaserVariant) => number;

export const TEASER_SURFACES: readonly TeaserSurfaceFit[] = [
  { surface: 'card', variant: 'body2', width: 296, lines: 2 },
  { surface: 'whatsapp', variant: 'body2', width: 252, lines: 2 },
  { surface: 'lead', variant: 'body1', width: 520, lines: 3 },
];

const WORD_PATTERN = /\S+\s*/g;

export const lineCutOf = (
  text: string,
  fit: Pick<TeaserSurfaceFit, 'variant' | 'width' | 'lines'>,
  measure: TextMeasure,
): number | null => {
  let line = 1;
  let lineText = '';
  for (const match of text.matchAll(WORD_PATTERN)) {
    const word = match[0];
    const candidate = lineText + word;
    if (lineText.length > 0 && measure(candidate.trimEnd(), fit.variant) > fit.width) {
      line += 1;
      if (line > fit.lines) {
        return match.index;
      }
      lineText = word;
    } else {
      lineText = candidate;
    }
  }
  return null;
};

export const teaserCutsOf = (
  text: string,
  surfaces: readonly TeaserSurfaceFit[],
  measure: TextMeasure,
): TeaserCut[] =>
  surfaces
    .flatMap((fit) => {
      const index = lineCutOf(text, fit, measure);
      return index === null ? [] : [{ surface: fit.surface, index }];
    })
    .sort((left, right) => left.index - right.index);

export const greyFromOf = (cuts: readonly TeaserCut[], surfaceCount: number): number | null =>
  cuts.length === 0 || cuts.length < surfaceCount
    ? null
    : Math.max(...cuts.map((cut) => cut.index));
