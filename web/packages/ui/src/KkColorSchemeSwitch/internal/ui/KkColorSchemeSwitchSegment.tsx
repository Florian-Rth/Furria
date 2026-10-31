import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, MouseEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkSunMoonMorphIcon } from '../../../KkSunMoonMorphIcon';
import type { OriginRect } from '../../../reveal-geometry';
import type { KkColorSchemeMode } from '../../../theme-color';
import { kkTokens } from '../../../tokens';
import type { KkColorSchemeChoice } from '../../color-scheme-switch-types';

const segmentPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  zIndex: 1,
  flex: '1 1 0',
  minWidth: 0,
  py: 1,
  borderRadius: `${kkTokens.radius.pill}px`,
  color: 'text.secondary',
  transition: theme.transitions.create('color', {
    duration: theme.transitions.duration.short,
  }),
  ...focusRing(theme),
  '&[aria-checked="true"]': { color: 'background.paper' },
  '& [data-kk-scheme-glyph]': {
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.standard,
    }),
  },
  '&[aria-checked="true"] [data-kk-scheme-glyph]': { opacity: 0, transitionDuration: '0ms' },
  '@media (hover: hover)': {
    '&:hover:not([aria-checked="true"])': { color: 'text.primary' },
  },
});

const labelPaint: CSSObject = {
  typography: 'caption',
  fontWeight: 800,
  lineHeight: 1.2,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: '100%',
};

interface KkColorSchemeSwitchSegmentProps {
  choice: KkColorSchemeChoice;
  selected: boolean;
  onChoose: (mode: KkColorSchemeMode, origin: OriginRect) => void;
}

export const KkColorSchemeSwitchSegment: FC<KkColorSchemeSwitchSegmentProps> = ({
  choice,
  selected,
  onChoose,
}) => {
  const choose = (event: MouseEvent<HTMLButtonElement>): void => {
    onChoose(choice.mode, event.currentTarget.getBoundingClientRect());
  };

  return (
    <ButtonBase
      role="radio"
      aria-checked={selected}
      tabIndex={selected ? 0 : -1}
      data-kk-scheme-segment={choice.mode}
      onClick={choose}
      sx={segmentPaint}
    >
      <Stack sx={{ alignItems: 'center', gap: 0.5, minWidth: 0, px: 0.5 }}>
        <Stack data-kk-scheme-glyph>
          <KkSunMoonMorphIcon scheme={choice.mode} />
        </Stack>
        <Box component="span" sx={labelPaint}>
          {choice.label}
        </Box>
      </Stack>
    </ButtonBase>
  );
};
