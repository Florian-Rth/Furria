import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { LANE_STICKY_LEFT } from '../lane-geometry';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkLaneTrackSetupState = 'next' | 'later';

interface KkLaneTrackSetupProps {
  number: number;
  text: string;
  hint: string;
  label: string;
  state: KkLaneTrackSetupState;
  disabled: boolean;
  onPress: () => void;
}

export const KkLaneTrackSetup: FC<KkLaneTrackSetupProps> = ({
  number,
  text,
  hint,
  label,
  state,
  disabled,
  onPress,
}) => (
  <ButtonBase
    onClick={onPress}
    disabled={disabled}
    aria-label={label}
    data-kk-lane-setup={state}
    sx={(theme) => ({
      position: 'sticky',
      left: LANE_STICKY_LEFT,
      zIndex: 2,
      gap: 1,
      minHeight: kkTokens.tapTarget,
      width: 'max-content',
      maxWidth: '20rem',
      px: 1.25,
      py: 0.25,
      borderRadius: `${kkTokens.radius.chip}px`,
      color: palette(theme).text.secondary,
      backgroundColor: palette(theme).background.paper,
      border: `${kkTokens.line.hair}px dashed ${palette(theme).divider}`,
      '&[data-kk-lane-setup="next"]': {
        color: palette(theme).primary.contrastText,
        backgroundColor: palette(theme).primary.main,
        border: `${kkTokens.line.hair}px solid ${palette(theme).primary.main}`,
        boxShadow: kkTokens.shadow.floating,
      },
      '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
      ...focusRing(theme),
    })}
  >
    <Typography
      component="span"
      variant="subtitle2"
      sx={{
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        fontVariantNumeric: 'tabular-nums',
        color: 'inherit',
      }}
    >
      {number}
    </Typography>
    <Stack sx={{ minWidth: 0, alignItems: 'flex-start' }}>
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ fontWeight: 800, color: 'inherit', lineHeight: 1.25, maxWidth: '100%' }}
      >
        {text}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        noWrap
        sx={{ color: 'inherit', lineHeight: 1.25, maxWidth: '100%' }}
      >
        {hint}
      </Typography>
    </Stack>
  </ButtonBase>
);
