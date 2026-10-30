import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkStudioGViewerSwapProps {
  label: string;
  onSwap: () => void;
}

export const KkStudioGViewerSwap: FC<KkStudioGViewerSwapProps> = ({ label, onSwap }) => (
  <ButtonBase
    aria-label={label}
    onClick={onSwap}
    data-kk-studio-g-swap
    sx={(theme) => ({
      position: 'absolute',
      inset: 0,
      zIndex: 3,
      borderRadius: 'inherit',
      justifyContent: 'flex-end',
      alignItems: 'flex-start',
      ...focusRing(theme),
    })}
  >
    <Box
      aria-hidden
      sx={(theme) => ({
        display: 'grid',
        placeItems: 'center',
        m: 0.5,
        width: '1.375rem',
        height: '1.375rem',
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: (theme.vars ?? theme).palette.background.paper,
        color: (theme.vars ?? theme).palette.text.primary,
        boxShadow: kkTokens.shadow.rest,
        '& svg': { width: '0.875rem', height: '0.875rem' },
      })}
    >
      <OpenInFullRoundedIcon />
    </Box>
  </ButtonBase>
);
