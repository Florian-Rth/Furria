import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';
import { glassOf } from '../player-paint';

export interface KkStudioDPlayerSpeedOption {
  value: number;
  text: string;
}

interface KkStudioDPlayerSpeedProps {
  label: string;
  options: readonly KkStudioDPlayerSpeedOption[];
  value: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (value: number) => void;
}

export const KkStudioDPlayerSpeed: FC<KkStudioDPlayerSpeedProps> = ({
  label,
  options,
  value,
  open,
  onOpenChange,
  onChange,
}) => {
  const current = options.find((option) => option.value === value)?.text ?? '';
  const slowed = value < 1;
  const buttonLabel = `${label} ${current}`;

  const toggle = (): void => {
    onOpenChange(!open);
  };
  const close = (): void => {
    onOpenChange(false);
  };

  const choices = options.map((option) => {
    const choose = (): void => {
      onChange(option.value);
      onOpenChange(false);
    };
    const chosen = option.value === value;

    return (
      <ButtonBase
        key={option.value}
        role="menuitemradio"
        aria-checked={chosen}
        onClick={choose}
        sx={(theme) => ({
          height: kkTokens.tapTarget,
          px: 2,
          justifyContent: 'flex-end',
          borderRadius: `${kkTokens.radius.base * 0.6}px`,
          color: chosen ? (theme.vars ?? theme).palette.primary.main : 'text.primary',
          ...focusRing(theme),
        })}
      >
        <Typography
          variant="subtitle1"
          component="span"
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {option.text}
        </Typography>
      </ButtonBase>
    );
  });

  return (
    <Box sx={{ position: 'relative' }}>
      <Box
        aria-hidden
        onClick={close}
        sx={{ position: 'fixed', inset: 0, display: open ? 'block' : 'none' }}
      />
      <Stack
        role="menu"
        aria-label={label}
        aria-hidden={!open}
        sx={(theme) => ({
          position: 'absolute',
          right: 0,
          bottom: `calc(100% + ${theme.spacing(1)})`,
          minWidth: '7rem',
          p: 0.5,
          borderRadius: `${kkTokens.radius.base}px`,
          ...glassOf(theme),
          backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.background.default} 94%, transparent)`,
          boxShadow: kkTokens.shadow.floating,
          transformOrigin: 'bottom right',
          opacity: open ? 1 : 0,
          transform: open ? 'scale(1)' : 'scale(.92)',
          pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity .2s ease-out, transform .2s cubic-bezier(.2,.8,.2,1)',
        })}
      >
        {choices}
      </Stack>
      <ButtonBase
        aria-label={buttonLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggle}
        data-kk-studio-d-speed
        sx={(theme) => {
          const palette = (theme.vars ?? theme).palette;
          return {
            height: kkTokens.tapTarget,
            minWidth: '4.25rem',
            px: 1.5,
            borderRadius: `${kkTokens.radius.pill}px`,
            ...glassOf(theme),
            ...(slowed && { borderColor: palette.primary.main, color: palette.primary.main }),
            transition: 'transform .12s ease-out',
            '&:active': { transform: 'scale(.95)' },
            ...focusRing(theme),
          };
        }}
      >
        <Typography
          variant="body2"
          component="span"
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
        >
          {current}
        </Typography>
      </ButtonBase>
    </Box>
  );
};
