import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import type { KkGroupTone } from './internal/group-tone';
import { KkGroupToneRail } from './internal/KkGroupToneRail';
import { rowDividerTop } from './internal/row-divider';

const RAIL_GUTTER = 1.5;

interface KkRegisterExpansionProps extends PropsWithChildren {
  groupTone?: KkGroupTone;
}

export const KkRegisterExpansion: FC<KkRegisterExpansionProps> = ({ groupTone, children }) => {
  const rail = groupTone === undefined ? null : <KkGroupToneRail tone={groupTone} />;

  return (
    <Stack
      direction="row"
      data-kk-register-expansion
      sx={{
        gap: RAIL_GUTTER,
        minWidth: 0,
        pt: 2,
        pb: 2.5,
        px: { xs: 0.5, desktop: 1 },
        ...rowDividerTop,
      }}
    >
      {rail}
      <Stack sx={{ flexGrow: 1, minWidth: 0 }}>{children}</Stack>
    </Stack>
  );
};
