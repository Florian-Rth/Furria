import type { RefObject } from 'react';
import { useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import { textMeterOf } from '../../../internal/text-meter';
import type { FacetFit } from './facet-fit';
import { fitFacetsOf } from './facet-fit';
import type { FacetPiece } from './facet-pieces';

export const FACET_ICON_EM = 1.25;
export const FACET_ICON_GAP_EM = 0.2;

export interface FacetFitView {
  metaRef: RefObject<HTMLSpanElement | null>;
  fits: readonly FacetFit[] | null;
}

const signatureOf = (pieces: readonly FacetPiece[]): string =>
  pieces.map((piece) => `${piece.lead}${piece.icon ?? ''}${piece.text}`).join('\n');

const fitsIn = (meta: HTMLElement, pieces: readonly FacetPiece[]): FacetFit[] => {
  const fontSize = Number.parseFloat(window.getComputedStyle(meta).fontSize);
  const iconWidth = Number.isNaN(fontSize) ? 0 : fontSize * (FACET_ICON_EM + FACET_ICON_GAP_EM);

  return fitFacetsOf(pieces, meta.getBoundingClientRect().width, {
    widthOf: textMeterOf(meta),
    iconWidth,
  });
};

export const useFacetFit = (pieces: readonly FacetPiece[], enabled: boolean): FacetFitView => {
  const metaRef = useRef<HTMLSpanElement>(null);
  const [fits, setFits] = useState<readonly FacetFit[] | null>(null);
  const signature = signatureOf(pieces);

  const fitInto = useEffectEvent((meta: HTMLElement): void => {
    setFits(fitsIn(meta, pieces));
  });

  useLayoutEffect(() => {
    const meta = metaRef.current;
    let live = true;

    if (meta === null || !enabled || signature.length === 0) {
      return;
    }

    const measure = (): void => {
      if (live) {
        fitInto(meta);
      }
    };

    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(meta);
    void document.fonts.ready.then(measure);

    return () => {
      live = false;
      observer.disconnect();
    };
  }, [signature, enabled]);

  return { metaRef, fits: enabled ? fits : null };
};
