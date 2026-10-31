import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';

const SETTLE_MS = 140;

interface KkLaneCardsRootProps extends PropsWithChildren {
  label: string;
  index: number;
  onIndex: (index: number) => void;
}

const indexOf = (node: HTMLElement): number =>
  node.clientWidth <= 0 ? 0 : Math.round(node.scrollLeft / node.clientWidth);

export const KkLaneCardsRoot: FC<KkLaneCardsRootProps> = ({ label, index, onIndex, children }) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const timer = useRef<number | null>(null);
  const report = useRef(onIndex);

  useEffect(() => {
    report.current = onIndex;
  });

  useEffect(() => {
    if (node === null || indexOf(node) === index) {
      return;
    }
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    node.scrollTo({ left: index * node.clientWidth, behavior: still ? 'instant' : 'smooth' });
  }, [node, index]);

  useEffect(() => {
    if (node === null) {
      return;
    }
    const settle = (): void => {
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
      timer.current = window.setTimeout(() => {
        report.current(indexOf(node));
      }, SETTLE_MS);
    };
    node.addEventListener('scroll', settle, { passive: true });

    return () => {
      node.removeEventListener('scroll', settle);
      if (timer.current !== null) {
        window.clearTimeout(timer.current);
      }
    };
  }, [node]);

  return (
    <Stack
      ref={setNode}
      direction="row"
      role="region"
      aria-label={label}
      aria-roledescription="carousel"
      data-kk-lane-cards
      sx={{
        minWidth: 0,
        minHeight: 0,
        overflowX: 'auto',
        overflowY: 'hidden',
        scrollSnapType: 'x mandatory',
        overscrollBehaviorX: 'contain',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {children}
    </Stack>
  );
};
