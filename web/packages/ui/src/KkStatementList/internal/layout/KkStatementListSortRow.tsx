import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { rowDividerTop } from '../../../internal/row-divider';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';

const rowPaint = (theme: Theme): CSSObject => ({
  alignItems: 'center',
  minWidth: 0,
  ...rowDividerTop,
  '&[data-dragging="true"]': {
    position: 'relative',
    zIndex: 3,
    borderRadius: `${kkTokens.radius.base}px`,
    borderTopColor: 'transparent',
    backgroundColor: (theme.vars ?? theme).palette.background.paper,
    boxShadow: kkTokens.shadow.floating,
  },
});

const handlePaint = (theme: Theme): CSSObject => ({
  flexShrink: 0,
  width: kkTokens.tapTarget,
  height: kkTokens.tapTarget,
  borderRadius: `${kkTokens.radius.base}px`,
  color: 'text.secondary',
  touchAction: 'none',
  cursor: 'grab',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  WebkitTouchCallout: 'none',
  ...focusRing(theme),
});

interface KkStatementListSortRowProps extends PropsWithChildren {
  rowRef: (element: Element | null) => void;
  handleRef: (element: Element | null) => void;
  handleLabel: string;
  dragging: boolean;
}

export const KkStatementListSortRow: FC<KkStatementListSortRowProps> = ({
  rowRef,
  handleRef,
  handleLabel,
  dragging,
  children,
}) => (
  <Stack
    component="li"
    direction="row"
    ref={rowRef}
    data-dragging={dragging}
    data-kk-statement-list-row
    sx={rowPaint}
  >
    {children}
    <ButtonBase ref={handleRef} disableRipple aria-label={handleLabel} sx={handlePaint}>
      <KkIcon name="drag" />
    </ButtonBase>
  </Stack>
);
