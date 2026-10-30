import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';

interface KkEightsStripToolsProps extends PropsWithChildren {
  label: string;
  wrap?: boolean;
}

const NARROW = '@container kk-eights-strip (max-width: 28rem)';

export const KkEightsStripTools: FC<KkEightsStripToolsProps> = ({
  label,
  wrap = true,
  children,
}) => (
  <Stack
    direction="row"
    role="toolbar"
    aria-label={label}
    data-wrap={wrap}
    sx={{
      gap: 0.5,
      minWidth: 0,
      flexWrap: 'nowrap',
      overflowX: 'auto',
      scrollbarWidth: 'none',
      '&[data-wrap="true"]': {
        flexWrap: 'wrap',
        overflowX: 'visible',
        [NARROW]: {
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'max-content',
          gridTemplateRows: 'repeat(2, auto)',
          justifyItems: 'start',
          overflowX: 'auto',
        },
      },
    }}
  >
    {children}
  </Stack>
);
