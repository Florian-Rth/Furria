import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

export interface KkStudioGViewerSightOption {
  key: string;
  text: string;
}

interface KkStudioGViewerSightProps {
  label: string;
  options: readonly KkStudioGViewerSightOption[];
  current: string;
  onPick: (key: string) => void;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioGViewerSight: FC<KkStudioGViewerSightProps> = ({
  label,
  options,
  current,
  onPick,
}) => {
  const buttons = options.map((option) => {
    const on = option.key === current;
    const pick = (): void => {
      onPick(option.key);
    };

    return (
      <ButtonBase
        key={option.key}
        role="radio"
        aria-checked={on}
        onClick={pick}
        sx={(theme) => ({
          px: 1.25,
          minHeight: '2rem',
          borderRadius: `${kkTokens.radius.pill}px`,
          backgroundColor: on ? palette(theme).text.primary : 'transparent',
          color: on ? palette(theme).background.paper : palette(theme).text.secondary,
          transition: 'background-color 180ms ease-out, color 180ms ease-out',
          ...focusRing(theme),
        })}
      >
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'inherit', lineHeight: 1 }}>
          {option.text}
        </Typography>
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      data-kk-studio-g-sight
      sx={(theme) => ({
        p: 0.25,
        gap: 0.25,
        flexShrink: 0,
        borderRadius: `${kkTokens.radius.pill}px`,
        boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
      })}
    >
      {buttons}
    </Stack>
  );
};
