import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, MouseEvent } from 'react';
import { focusRing } from '../internal/focus-ring';
import { redInk } from '../internal/red-ink';
import { nextRovingId } from '../internal/roving-focus';
import { kkTokens } from '../tokens';
import type { KkStudioFChoice } from './studio-f-types';

const OPTION_HEIGHT = '2.25rem';
const OPTION_WIDTH = '3rem';

const optionPaint =
  (slowed: boolean) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      position: 'relative',
      width: OPTION_WIDTH,
      height: OPTION_HEIGHT,
      borderRadius: `${kkTokens.radius.pill}px`,
      typography: 'caption',
      fontWeight: 800,
      fontVariantNumeric: 'tabular-nums',
      color: palette.text.secondary,
      transition: 'color 180ms ease-out, background-color 180ms ease-out',
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: `calc((${kkTokens.tapTarget} - ${OPTION_HEIGHT}) / -2) 0`,
      },
      '&[aria-checked="true"]': {
        backgroundColor: palette.background.paper,
        boxShadow: kkTokens.shadow.rest,
        ...(slowed ? redInk(theme) : { color: palette.text.primary }),
      },
      ...focusRing(theme),
    };
  };

interface KkStudioFSpeedProps {
  label: string;
  options: readonly KkStudioFChoice[];
  value: string;
  slowed: boolean;
  onChange: (id: string) => void;
}

export const KkStudioFSpeed: FC<KkStudioFSpeedProps> = ({
  label,
  options,
  value,
  slowed,
  onChange,
}) => {
  const ids = options.map((option) => option.id);
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    const id = event.currentTarget.dataset.kkStudioFRate;

    if (id !== undefined) {
      onChange(id);
    }
  };
  const move = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = nextRovingId(ids, value, event.key);

    if (target === null) {
      return;
    }
    event.preventDefault();
    onChange(target);
  };
  const items = options.map((option) => {
    const checked = option.id === value;

    return (
      <ButtonBase
        key={option.id}
        role="radio"
        aria-checked={checked}
        tabIndex={checked ? 0 : -1}
        data-kk-studio-f-rate={option.id}
        onClick={choose}
        sx={optionPaint(slowed)}
      >
        {option.label}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      onKeyDown={move}
      data-kk-studio-f-speed
      sx={(theme) => ({
        alignItems: 'center',
        flexShrink: 0,
        p: 0.25,
        pl: 1,
        gap: 0.25,
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: (theme.vars ?? theme).palette.action.hover,
        color: (theme.vars ?? theme).palette.text.secondary,
      })}
    >
      <SpeedRoundedIcon fontSize="small" sx={{ mr: 0.25 }} />
      {items}
    </Stack>
  );
};
