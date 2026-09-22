import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { inkWashSurface } from './internal/ink-wash';
import { KkGroupToneRail } from './internal/KkGroupToneRail';
import { rowDividerTop } from './internal/row-divider';
import { kkTokens } from './tokens';

const SELECTED_WASH_LIGHT = '8%';
const SELECTED_WASH_DARK = '13%';
const RAIL_GUTTER = 1.5;

const selectedPaint = (theme: Theme, selected: boolean): CSSObject =>
  selected ? inkWashSurface(theme, SELECTED_WASH_LIGHT, SELECTED_WASH_DARK) : {};

interface KkRegisterRowProps extends PropsWithChildren {
  groupTone?: KkGroupTone;
  selected?: boolean;
  dimmed?: boolean;
}

export const KkRegisterRow: FC<KkRegisterRowProps> = ({
  groupTone,
  selected = false,
  dimmed = false,
  children,
}) => {
  const rail = groupTone === undefined ? null : <KkGroupToneRail tone={groupTone} />;
  const opacity = dimmed ? kkTokens.opacity.dimmed : 1;

  return (
    <Stack
      direction="row"
      data-kk-register-row
      sx={(theme) => ({
        gap: RAIL_GUTTER,
        minWidth: 0,
        py: 1.25,
        px: { xs: 0.5, desktop: 1 },
        opacity,
        borderRadius: `${kkTokens.radius.base}px`,
        ...rowDividerTop,
        ...selectedPaint(theme, selected),
      })}
    >
      {rail}
      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Stack>
    </Stack>
  );
};
