import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, KeyboardEvent, ReactNode } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';
import { studioFGlass } from './internal/logic/studio-f-glass';

export type KkStudioFViewChoice = 'video' | 'stage';

const OPTION_HEIGHT = '2.25rem';

const GLYPHS: Record<KkStudioFViewChoice, ReactNode> = {
  video: <VideocamRoundedIcon fontSize="small" />,
  stage: <GridViewRoundedIcon fontSize="small" />,
};

const optionPaint = (theme: Theme): CSSObject => {
  const palette = (theme.vars ?? theme).palette;

  return {
    position: 'relative',
    height: OPTION_HEIGHT,
    gap: 0.5,
    px: 1.25,
    borderRadius: `${kkTokens.radius.pill}px`,
    typography: 'caption',
    fontWeight: 800,
    color: palette.text.secondary,
    transition: 'color 180ms ease-out, background-color 180ms ease-out',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: `calc((${kkTokens.tapTarget} - ${OPTION_HEIGHT}) / -2) 0`,
    },
    '&[aria-checked="true"]': {
      color: palette.text.primary,
      backgroundColor: palette.background.paper,
      boxShadow: kkTokens.shadow.rest,
    },
    '&.Mui-disabled': { opacity: 0.4 },
    ...focusRing(theme),
  };
};

interface KkStudioFViewOption {
  id: KkStudioFViewChoice;
  label: string;
  disabled: boolean;
}

interface KkStudioFViewToggleProps {
  label: string;
  value: KkStudioFViewChoice;
  options: readonly KkStudioFViewOption[];
  onChange: (value: KkStudioFViewChoice) => void;
}

export const KkStudioFViewToggle: FC<KkStudioFViewToggleProps> = ({
  label,
  value,
  options,
  onChange,
}) => {
  const move = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }
    const target = options.find((option) => option.id !== value && !option.disabled);
    if (target !== undefined) {
      event.preventDefault();
      onChange(target.id);
    }
  };
  const items = options.map((option) => {
    const checked = option.id === value;
    const choose = (): void => {
      onChange(option.id);
    };

    return (
      <ButtonBase
        key={option.id}
        role="radio"
        aria-checked={checked}
        tabIndex={checked ? 0 : -1}
        disabled={option.disabled}
        onClick={choose}
        data-kk-studio-f-view={option.id}
        sx={optionPaint}
      >
        {GLYPHS[option.id]}
        <Box component="span">{option.label}</Box>
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      onKeyDown={move}
      data-kk-studio-f-view-toggle
      sx={(theme) => ({
        p: 0.25,
        gap: 0.25,
        borderRadius: `${kkTokens.radius.pill}px`,
        ...studioFGlass(theme),
      })}
    >
      {items}
    </Stack>
  );
};
