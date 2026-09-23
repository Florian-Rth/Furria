import {
  documentOffsetOf,
  FANFARE_HEADER_SELECTOR,
  glyphOf,
  HEADLINE_SELECTOR,
} from './fanfare-dom';
import type { FanfareGeometry, FanfareHeadlineBox } from './fanfare-score';

export interface FanfareStaging {
  geometry: FanfareGeometry;
  headlineText: string | null;
  headlineWidth: number | null;
  ringX: number;
}

const SLOT_TEXT_SELECTOR = '[data-fanfare-title="print"]';
const COPY_TEXT_SELECTOR = '[data-fanfare-headline="print"]';

const headlineBoxOf = (element: HTMLElement): FanfareHeadlineBox => ({
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

export const measureFanfare = (
  slot: HTMLElement | null,
  copy: HTMLElement | null,
  chrome: HTMLElement | null,
): FanfareStaging | null => {
  const slotText = slot?.querySelector(SLOT_TEXT_SELECTOR) ?? null;
  const copyText = copy?.querySelector(COPY_TEXT_SELECTOR) ?? null;

  if (!(slotText instanceof HTMLElement) || copyText === null) {
    return null;
  }

  const headline = document.querySelector(`${FANFARE_HEADER_SELECTOR} ${HEADLINE_SELECTOR}`);
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

export const sameStaging = (a: FanfareStaging | null, b: FanfareStaging | null): boolean =>
  a?.headlineText === b?.headlineText &&
  a?.headlineWidth === b?.headlineWidth &&
  a?.ringX === b?.ringX;
