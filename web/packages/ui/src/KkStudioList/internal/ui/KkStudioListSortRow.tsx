import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import type { ComponentProps, FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { KkStudioListRow } from './KkStudioListRow';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioListSortRowProps extends ComponentProps<typeof KkStudioListRow> {
  rowRef: (element: Element | null) => void;
  handleRef: (element: Element | null) => void;
  handleLabel: string;
  dragging: boolean;
}

export const KkStudioListSortRow: FC<KkStudioListSortRowProps> = ({
  rowRef,
  handleRef,
  handleLabel,
  dragging,
  ...row
}) => (
  <Stack
    direction="row"
    ref={rowRef}
    data-dragging={dragging}
    sx={(theme) => ({
      flexShrink: 0,
      alignItems: 'center',
      borderRadius: `${kkTokens.radius.base - 4}px`,
      transition: 'box-shadow 160ms ease-out',
      '&[data-dragging="true"]': {
        zIndex: 3,
        backgroundColor: palette(theme).background.paper,
        boxShadow: kkTokens.shadow.floating,
      },
    })}
  >
    <Box sx={{ flex: 1, minWidth: 0, display: 'grid' }}>
      <KkStudioListRow {...row} />
    </Box>
    <ButtonBase
      ref={handleRef}
      disableRipple
      aria-label={handleLabel}
      sx={(theme) => ({
        flexShrink: 0,
        width: kkTokens.tapTarget,
        height: kkTokens.tapTarget,
        borderRadius: `${kkTokens.radius.base - 4}px`,
        color: 'text.secondary',
        touchAction: 'none',
        cursor: 'grab',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        ...focusRing(theme),
      })}
    >
      <KkIcon name="drag" />
    </ButtonBase>
  </Stack>
);
