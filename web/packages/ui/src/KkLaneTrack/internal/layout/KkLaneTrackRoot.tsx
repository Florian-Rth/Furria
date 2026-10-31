import Box from '@mui/material/Box';
import type { FC, PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { LANE_HEAD, LANE_HEAD_VAR, LANE_WIDTH_VAR } from '../lane-geometry';

interface KkLaneTrackRootProps extends PropsWithChildren {
  label: string;
  width: number;
  scrollerRef: (node: HTMLDivElement | null) => void;
  onZoom: (direction: 1 | -1) => void;
}

export const KkLaneTrackRoot: FC<KkLaneTrackRootProps> = ({
  label,
  width,
  scrollerRef,
  onZoom,
  children,
}) => {
  const [node, setNode] = useState<HTMLDivElement | null>(null);
  const attach = (element: HTMLDivElement | null): void => {
    setNode(element);
    scrollerRef(element);
  };

  useEffect(() => {
    if (node === null) {
      return;
    }
    const wheel = (event: WheelEvent): void => {
      if (!event.ctrlKey && !event.metaKey) {
        return;
      }
      event.preventDefault();
      onZoom(event.deltaY < 0 ? 1 : -1);
    };
    node.addEventListener('wheel', wheel, { passive: false });

    return () => {
      node.removeEventListener('wheel', wheel);
    };
  }, [node, onZoom]);

  return (
    <Box
      ref={attach}
      role="group"
      aria-label={label}
      data-kk-lane-track
      sx={{
        position: 'relative',
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
        overscrollBehavior: 'contain',
        containerType: 'inline-size',
        scrollbarWidth: 'thin',
      }}
    >
      <Box
        sx={{
          [LANE_WIDTH_VAR]: `${width}px`,
          [LANE_HEAD_VAR]: LANE_HEAD,
          position: 'relative',
          width: `calc(100cqw + var(${LANE_WIDTH_VAR}))`,
          minHeight: '100%',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};
