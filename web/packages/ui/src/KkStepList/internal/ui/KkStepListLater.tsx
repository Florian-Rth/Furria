import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { stepLabel } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

const ICON_EXTENT = '1rem';

export interface KkStepLaterItem {
  icon: KkIconName;
  label: string;
}

const laterPaint = (theme: Theme): CSSObject => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: 0.75,
  width: '100%',
  minHeight: kkTokens.tapTarget,
  px: 1.5,
  py: 1.25,
  textAlign: 'left',
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': { backgroundColor: 'action.hover' } },
});

interface KkStepListLaterProps {
  eyebrow: string;
  items: readonly KkStepLaterItem[];
  onSelect: () => void;
}

export const KkStepListLater: FC<KkStepListLaterProps> = ({ eyebrow, items, onSelect }) => {
  const shown = items.map((item) => (
    <Stack
      key={item.label}
      component="li"
      direction="row"
      sx={{ alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}
    >
      <KkIcon name={item.icon} sx={{ width: ICON_EXTENT, height: ICON_EXTENT }} />
      {item.label}
    </Stack>
  ));

  return (
    <ButtonBase onClick={onSelect} data-kk-step-list-later sx={laterPaint}>
      <Box component="span" sx={{ ...stepLabel, color: 'text.disabled' }}>
        {eyebrow}
      </Box>
      <Stack
        component="ul"
        direction="row"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          flexWrap: 'wrap',
          columnGap: 1.5,
          rowGap: 0.5,
          typography: 'caption',
          fontWeight: 700,
          color: 'text.disabled',
        }}
      >
        {shown}
      </Stack>
    </ButtonBase>
  );
};
