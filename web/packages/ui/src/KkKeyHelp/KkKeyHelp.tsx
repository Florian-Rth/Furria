import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import type { FC, MouseEvent, PropsWithChildren } from 'react';
import { useState } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';

export type KkKeyHelpOpening = 'down' | 'up';

const PLACES = {
  down: {
    anchor: { vertical: 'bottom', horizontal: 'left' },
    origin: { vertical: 'top', horizontal: 'left' },
    gap: { mt: 1 },
  },
  up: {
    anchor: { vertical: 'top', horizontal: 'right' },
    origin: { vertical: 'bottom', horizontal: 'right' },
    gap: { mb: 1 },
  },
} as const;

interface KkKeyHelpProps extends PropsWithChildren {
  label: string;
  opens?: KkKeyHelpOpening;
}

export const KkKeyHelp: FC<KkKeyHelpProps> = ({ label, opens = 'down', children }) => {
  const place = PLACES[opens];
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const open = (event: MouseEvent<HTMLElement>): void => {
    setAnchor(event.currentTarget);
  };
  const close = (): void => {
    setAnchor(null);
  };

  return (
    <>
      <ButtonBase
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={anchor !== null}
        onClick={open}
        sx={(theme) => ({
          width: kkTokens.tapTarget,
          height: kkTokens.tapTarget,
          borderRadius: '50%',
          color: (theme.vars ?? theme).palette.text.secondary,
          backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.paper} 80%, transparent)`,
          '&:active': { transform: 'scale(0.94)' },
          transition: kkTokens.motion.press,
          '@media (hover: none) and (pointer: coarse)': { display: 'none' },
          ...focusRing(theme),
        })}
      >
        <KeyboardRoundedIcon aria-hidden fontSize="medium" />
      </ButtonBase>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        anchorOrigin={place.anchor}
        transformOrigin={place.origin}
        onClose={close}
        slotProps={{ paper: { sx: { p: 2, maxWidth: '22rem', ...place.gap } } }}
      >
        {children}
      </Popover>
    </>
  );
};
