import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

const SETTLE_MS = 140;

interface KkEightsReelRootProps extends PropsWithChildren {
  label: string;
  index: number;
  onIndex: (index: number) => void;
}

const stillMotion = (): boolean => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const KkEightsReelRoot: FC<KkEightsReelRootProps> = ({
  label,
  index,
  onIndex,
  children,
}) => {
  const node = useRef<HTMLDivElement>(null);
  const settle = useRef<number | null>(null);
  const shown = useRef(index);
  const latestOnIndex = useRef(onIndex);

  useEffect(() => {
    latestOnIndex.current = onIndex;
  });

  useEffect(
    () => () => {
      if (settle.current !== null) {
        window.clearTimeout(settle.current);
      }
    },
    [],
  );

  useEffect(() => {
    const reel = node.current;
    if (reel === null || reel.clientHeight <= 0) {
      return;
    }
    const at = Math.round(reel.scrollTop / reel.clientHeight);
    shown.current = index;
    if (at !== index) {
      reel.scrollTo({
        top: index * reel.clientHeight,
        behavior: stillMotion() ? 'auto' : 'smooth',
      });
    }
  }, [index]);

  const scrolled = (): void => {
    if (settle.current !== null) {
      window.clearTimeout(settle.current);
    }
    settle.current = window.setTimeout(() => {
      const reel = node.current;
      if (reel === null || reel.clientHeight <= 0) {
        return;
      }
      const at = Math.round(reel.scrollTop / reel.clientHeight);
      if (at !== shown.current) {
        shown.current = at;
        latestOnIndex.current(at);
      }
    }, SETTLE_MS);
  };

  return (
    <Box
      ref={node}
      role="region"
      aria-label={label}
      aria-roledescription="Karten"
      data-kk-eights-reel
      onScroll={scrolled}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        overscrollBehavior: 'contain',
        scrollSnapType: 'y mandatory',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {children}
    </Box>
  );
};
