import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

const SETTLE_MS = 140;

interface KkFocusCardsRootProps extends PropsWithChildren {
  label: string;
  index: number;
  onSettle: (index: number) => void;
}

const nearestOf = (strip: HTMLElement): number => {
  const middle = strip.scrollLeft + strip.clientWidth / 2;
  let best = 0;
  let distance = Number.POSITIVE_INFINITY;

  for (const [index, card] of [...strip.children].entries()) {
    if (card instanceof HTMLElement) {
      const gap = Math.abs(card.offsetLeft + card.offsetWidth / 2 - middle);
      if (gap < distance) {
        distance = gap;
        best = index;
      }
    }
  }

  return best;
};

export const KkFocusCardsRoot: FC<KkFocusCardsRootProps> = ({
  label,
  index,
  onSettle,
  children,
}) => {
  const strip = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | null>(null);
  const shown = useRef(index);
  const settle = useRef(onSettle);

  useEffect(() => {
    settle.current = onSettle;
  });

  useEffect(() => {
    const node = strip.current;
    const card = node?.children[index];
    if (node === null || !(card instanceof HTMLElement) || nearestOf(node) === index) {
      shown.current = index;
      return;
    }
    shown.current = index;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({
      left: card.offsetLeft - (node.clientWidth - card.offsetWidth) / 2,
      behavior: still ? 'auto' : 'smooth',
    });
  }, [index]);

  useEffect(() => {
    const node = strip.current;
    if (node === null) {
      return;
    }
    const land = (): void => {
      timer.current = null;
      const nearest = nearestOf(node);
      if (nearest !== shown.current) {
        shown.current = nearest;
        settle.current(nearest);
      }
    };
    const scrolled = (): void => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(land, SETTLE_MS);
    };
    node.addEventListener('scroll', scrolled, { passive: true });

    return () => {
      node.removeEventListener('scroll', scrolled);
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, []);

  return (
    <Stack
      ref={strip}
      direction="row"
      role="region"
      aria-roledescription="Karussell"
      aria-label={label}
      data-kk-focus-cards
      sx={{
        gap: 1,
        px: 2,
        overflowX: 'auto',
        overflowY: 'clip',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        overscrollBehaviorX: 'contain',
      }}
    >
      {children}
    </Stack>
  );
};
