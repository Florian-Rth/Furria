import type { RefObject } from 'react';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { documentOffsetOf, HEADLINE_SELECTOR, onRemeasure } from './tusch-dom';

export interface TuschShadowBox {
  left: number;
  top: number;
  width: number;
  text: string;
}

export interface TuschHeadlineShadow {
  wrapperRef: RefObject<HTMLDivElement | null>;
  box: TuschShadowBox | null;
}

const shadowBoxOf = (wrapper: HTMLElement | null): TuschShadowBox | null => {
  const headline = wrapper?.querySelector(HEADLINE_SELECTOR) ?? null;

  if (wrapper === null || !(headline instanceof HTMLElement)) {
    return null;
  }

  const origin = documentOffsetOf(wrapper);
  const offset = documentOffsetOf(headline);

  return {
    left: offset.left - origin.left,
    top: offset.top - origin.top,
    width: headline.offsetWidth,
    text: headline.textContent ?? '',
  };
};

const sameBox = (a: TuschShadowBox | null, b: TuschShadowBox | null): boolean =>
  a?.left === b?.left && a?.top === b?.top && a?.width === b?.width && a?.text === b?.text;

export const useTuschHeadlineShadow = (): TuschHeadlineShadow => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<TuschShadowBox | null>(null);

  const measureNow = useEffectEvent((): void => {
    const next = shadowBoxOf(wrapperRef.current);
    setBox((current) => (sameBox(current, next) ? current : next));
  });

  useEffect(() => onRemeasure(measureNow), []);

  return { wrapperRef, box };
};
