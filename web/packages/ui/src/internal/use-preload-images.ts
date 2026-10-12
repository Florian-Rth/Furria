import { useEffect, useRef } from 'react';
import type { KkImageSource } from '../image-source';

const signatureOf = (source: KkImageSource): string => `${source.src}|${source.srcSet ?? ''}`;

const preload = (source: KkImageSource): void => {
  const image = new Image();
  image.decoding = 'async';
  if (source.sizes !== undefined) {
    image.sizes = source.sizes;
  }
  if (source.srcSet !== undefined) {
    image.srcset = source.srcSet;
  }
  image.src = source.src;
  void image.decode().catch(() => undefined);
};

export const usePreloadImages = (sources: readonly KkImageSource[]): void => {
  const preloaded = useRef(new Set<string>());

  useEffect(() => {
    sources
      .filter((source) => !preloaded.current.has(signatureOf(source)))
      .forEach((source) => {
        preloaded.current.add(signatureOf(source));
        preload(source);
      });
  });
};
