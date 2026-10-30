import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export interface KkEightsBarZoomOption {
  key: string;
  text: string;
  label: string;
}

interface KkEightsBarZoomProps {
  label: string;
  options: readonly KkEightsBarZoomOption[];
  value: string;
  onChoose: (key: string) => void;
}

export const KkEightsBarZoom: FC<KkEightsBarZoomProps> = ({ label, options, value, onChoose }) => {
  const buttons = options.map((option) => {
    const choose = (): void => {
      onChoose(option.key);
    };

    return (
      <ButtonBase
        key={option.key}
        aria-label={option.label}
        aria-pressed={option.key === value}
        data-chosen={option.key === value}
        onClick={choose}
        sx={(theme) => ({
          minWidth: '2.75rem',
          minHeight: '2.25rem',
          px: 0.75,
          borderRadius: `${kkTokens.radius.base - 4}px`,
          color: palette(theme).text.secondary,
          '&[data-chosen="true"]': {
            color: palette(theme).text.primary,
            backgroundColor: palette(theme).background.paper,
            boxShadow: kkTokens.shadow.rest,
          },
          ...focusRing(theme),
        })}
      >
        <Typography
          component="span"
          variant="body2"
          sx={{ fontWeight: 800, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
        >
          {option.text}
        </Typography>
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="group"
      aria-label={label}
      aria-keyshortcuts="+ -"
      sx={(theme) => ({
        flexShrink: 0,
        p: 0.25,
        gap: 0.25,
        borderRadius: `${kkTokens.radius.base}px`,
        backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 7%, transparent)`,
      })}
    >
      {buttons}
    </Stack>
  );
};
