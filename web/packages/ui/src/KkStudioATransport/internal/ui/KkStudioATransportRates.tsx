import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';
import { kkTokens } from '../../../tokens';

export interface KkStudioATransportRate {
  value: number;
  label: string;
  name: string;
}

interface KkStudioATransportRatesProps {
  label: string;
  rates: readonly KkStudioATransportRate[];
  value: number;
  onSelect: (value: number) => void;
}

export const KkStudioATransportRates: FC<KkStudioATransportRatesProps> = ({
  label,
  rates,
  value,
  onSelect,
}) => {
  const options = rates.map((rate) => {
    const selected = rate.value === value;
    const select = (): void => {
      onSelect(rate.value);
    };

    return (
      <ButtonBase
        key={rate.value}
        role="radio"
        aria-label={rate.name}
        aria-checked={selected}
        onClick={select}
        sx={(theme) => {
          const palette = (theme.vars ?? theme).palette;
          return {
            flex: 1,
            minWidth: 0,
            height: '2rem',
            borderRadius: `${kkTokens.radius.pill}px`,
            typography: 'caption',
            fontFamily: kkTokens.font.display,
            fontVariantNumeric: 'tabular-nums',
            transition: 'background-color .18s, color .18s',
            ...(selected
              ? { backgroundColor: palette.text.primary, color: palette.background.paper }
              : { color: palette.text.secondary }),
            ...focusRing(theme),
          };
        }}
      >
        {rate.label}
      </ButtonBase>
    );
  });

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: 0.25,
        p: 0.25,
        pl: 1,
        borderRadius: `${kkTokens.radius.pill}px`,
        backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} 6%, transparent)`,
      })}
    >
      <KkStudioAGlyph name="tempo" size="0.9375rem" sx={{ color: 'text.secondary', mr: 0.25 }} />
      {options}
    </Stack>
  );
};
