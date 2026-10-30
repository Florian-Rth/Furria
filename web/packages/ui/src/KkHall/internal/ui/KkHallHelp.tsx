import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import type { FC, MouseEvent, PropsWithChildren } from 'react';
import { useState } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { HALL_GLYPHS } from './hall-glyphs';

const ANCHOR = { vertical: 'bottom', horizontal: 'left' } as const;

interface KkHallHelpProps extends PropsWithChildren {
  label: string;
}

export const KkHallHelp: FC<KkHallHelpProps> = ({ label, children }) => {
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
        {HALL_GLYPHS.keys}
      </ButtonBase>
      <Popover
        open={anchor !== null}
        anchorEl={anchor}
        anchorOrigin={ANCHOR}
        onClose={close}
        disablePortal
        slotProps={{ paper: { sx: { p: 2, mt: 1, maxWidth: '22rem' } } }}
      >
        {children}
      </Popover>
    </>
  );
};
