import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../internal/focus-ring';
import { KkIcon } from '../../KkIcon';
import { kkTokens } from '../../tokens';

const RESTING_OPACITY = 0.85;
const DISABLED_OPACITY = 0.35;

interface KkShowcaseAddTileProps {
  label: string;
  disabled: boolean;
  onAdd: () => void;
}

export const KkShowcaseAddTile: FC<KkShowcaseAddTileProps> = ({ label, disabled, onAdd }) => (
  <Stack role="listitem" sx={{ minWidth: 0 }}>
    <ButtonBase
      onClick={onAdd}
      disabled={disabled}
      sx={(theme: Theme) => ({
        aspectRatio: '1 / 1',
        width: '100%',
        flexDirection: 'column',
        rowGap: 0.5,
        color: 'warning.main',
        border: `${kkTokens.line.section}px dashed`,
        borderColor: 'warning.main',
        borderRadius: `${kkTokens.radius.bar}px`,
        opacity: disabled ? DISABLED_OPACITY : RESTING_OPACITY,
        transition: 'opacity 160ms ease-out',
        '&:hover': { opacity: 1 },
        ...focusRing(theme),
      })}
    >
      <KkIcon name="add" size="large" />
      <Typography
        component="span"
        variant="overline"
        sx={{ fontFamily: kkTokens.font.display, letterSpacing: kkTokens.type.tracking.display }}
      >
        {label}
      </Typography>
    </ButtonBase>
  </Stack>
);
