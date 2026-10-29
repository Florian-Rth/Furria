import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PointerEventHandler, PropsWithChildren, ReactNode, Ref } from 'react';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const EDGE_FADE =
  'linear-gradient(to right, transparent 0, black 1.5rem, black calc(100% - 1.5rem), transparent 100%)';
const HEAD = '0.875rem';

const viewportPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  flex: 1,
  minWidth: 0,
  overflow: 'clip',
  touchAction: 'pan-y',
  cursor: 'grab',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  '&:active': { cursor: 'grabbing' },
  borderTopWidth: kkTokens.line.section,
  borderTopStyle: 'solid',
  borderTopColor: (theme.vars ?? theme).palette.text.primary,
});

const fadePaint: CSSObject = {
  maskImage: EDGE_FADE,
  WebkitMaskImage: EDGE_FADE,
};

const playheadPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: 0,
  bottom: 0,
  left: '50%',
  width: kkTokens.line.section,
  transform: 'translateX(-50%)',
  backgroundColor: (theme.vars ?? theme).palette.primary.main,
  pointerEvents: 'none',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '50%',
    width: HEAD,
    height: HEAD,
    transform: 'translate(-50%, -45%) rotate(45deg)',
    borderRadius: `${kkTokens.radius.bar}px`,
    backgroundColor: (theme.vars ?? theme).palette.primary.main,
  },
});

interface KkStudioCTimelineRootProps extends PropsWithChildren {
  label: string;
  labels: ReactNode;
  viewportRef: Ref<HTMLDivElement>;
  onPointerDown: PointerEventHandler<HTMLDivElement>;
  onPointerMove: PointerEventHandler<HTMLDivElement>;
  onPointerUp: PointerEventHandler<HTMLDivElement>;
  onPointerCancel: PointerEventHandler<HTMLDivElement>;
  sx?: KkSx;
}

export const KkStudioCTimelineRoot: FC<KkStudioCTimelineRootProps> = ({
  label,
  labels,
  viewportRef,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  sx,
  children,
}) => (
  <Stack
    direction="row"
    component="section"
    aria-label={label}
    data-kk-studio-c-timeline
    sx={[{ minWidth: 0, alignItems: 'stretch' }, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    {labels}
    <Box
      ref={viewportRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      data-kk-studio-c-viewport
      sx={viewportPaint}
    >
      <Box sx={fadePaint}>{children}</Box>
      <Box aria-hidden data-kk-studio-c-playhead sx={playheadPaint} />
    </Box>
  </Stack>
);
