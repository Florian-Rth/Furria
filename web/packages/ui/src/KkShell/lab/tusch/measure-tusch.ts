import { documentOffsetOf, glyphOf, HEADLINE_SELECTOR, TUSCH_HEADER_SELECTOR } from './tusch-dom';
import type { TuschGeometry, TuschHeadlineBox } from './tusch-score';

export interface TuschStaging {
  geometry: TuschGeometry;
  headlineText: string | null;
  headlineWidth: number | null;
  ringX: number;
}

const SLOT_TEXT_SELECTOR = '[data-tusch-title="print"]';
const COPY_TEXT_SELECTOR = '[data-tusch-headline="print"]';

const headlineBoxOf = (element: HTMLElement): TuschHeadlineBox => ({
  ...documentOffsetOf(element),
  width: element.offsetWidth,
  height: element.offsetHeight,
  glyph: glyphOf(element),
});

const textWidthOf = (element: Element): number => {
  const range = document.createRange();
  range.selectNodeContents(element);

  return range.getBoundingClientRect().width;
};

export const measureTusch = (
  slot: HTMLElement | null,
  copy: HTMLElement | null,
  chrome: HTMLElement | null,
): TuschStaging | null => {
  const slotText = slot?.querySelector(SLOT_TEXT_SELECTOR) ?? null;
  const copyText = copy?.querySelector(COPY_TEXT_SELECTOR) ?? null;

  if (!(slotText instanceof HTMLElement) || copyText === null) {
    return null;
  }

  const headline = document.querySelector(`${TUSCH_HEADER_SELECTOR} ${HEADLINE_SELECTOR}`);
  const slotOffset = documentOffsetOf(slotText);
  const chromeLeft = chrome === null ? 0 : documentOffsetOf(chrome).left;
  const headlineBox = headline instanceof HTMLElement ? headlineBoxOf(headline) : null;

  return {
    geometry: {
      headline: headlineBox,
      slot: {
        ...slotOffset,
        height: slotText.offsetHeight,
        glyph: glyphOf(slotText),
      },
      copyGlyph: glyphOf(copyText),
    },
    headlineText: headline?.textContent ?? null,
    headlineWidth: headlineBox?.width ?? null,
    ringX: slotOffset.left + textWidthOf(slotText) / 2 - chromeLeft,
  };
};

export const sameStaging = (a: TuschStaging | null, b: TuschStaging | null): boolean =>
  a?.headlineText === b?.headlineText &&
  a?.headlineWidth === b?.headlineWidth &&
  a?.ringX === b?.ringX;
