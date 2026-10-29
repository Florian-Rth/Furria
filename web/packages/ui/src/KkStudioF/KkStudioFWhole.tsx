import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';

const TRACK_WIDTH = '2.25rem';
const TRACK_HEIGHT = '1.375rem';
const KNOB = '1rem';
const KNOB_INSET = '0.1875rem';
const KNOB_TRAVEL = `calc(${TRACK_WIDTH} - ${KNOB} - 2 * ${KNOB_INSET})`;

const switchPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    height: kkTokens.tapTarget,
    gap: 1,
    pl: 0.5,
    borderRadius: `${kkTokens.radius.pill}px`,
    typography: 'body2',
    fontWeight: 800,
    whiteSpace: 'nowrap',
    color: palette.text.secondary,
    transition: 'color 180ms ease-out',
    '& [data-kk-studio-f-track]': {
      position: 'relative',
      width: TRACK_WIDTH,
      height: TRACK_HEIGHT,
      flexShrink: 0,
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: palette.action.selected,
      transition: 'background-color 200ms ease-out',
    },
    '& [data-kk-studio-f-knob]': {
      position: 'absolute',
      top: KNOB_INSET,
      left: KNOB_INSET,
      width: KNOB,
      height: KNOB,
      borderRadius: `${kkTokens.radius.pill}px`,
      backgroundColor: palette.background.paper,
      boxShadow: kkTokens.shadow.floating,
      transition: `transform 220ms cubic-bezier(0.22, 0.61, 0.36, 1)`,
    },
    '&[aria-checked="true"]': { color: palette.text.primary },
    '&[aria-checked="true"] [data-kk-studio-f-track]': {
      backgroundColor: palette.primary.main,
    },
    '&[aria-checked="true"] [data-kk-studio-f-knob]': {
      transform: `translateX(${KNOB_TRAVEL})`,
    },
    '&.Mui-disabled': { opacity: kkTokens.opacity.dimmed },
    ...focusRing(theme),
  };
};

interface KkStudioFWholeProps {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

export const KkStudioFWhole: FC<KkStudioFWholeProps> = ({
  label,
  checked,
  disabled = false,
  onToggle,
}) => (
  <ButtonBase
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={onToggle}
    data-kk-studio-f-whole
    sx={switchPaint}
  >
    {label}
    <Box component="span" data-kk-studio-f-track>
      <Box component="span" data-kk-studio-f-knob />
    </Box>
  </ButtonBase>
);
