import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { inkWash } from '../internal/ink-wash';
import { KkModeTransitionStyles } from '../KkModeTransitionStyles';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import type { KkColorSchemeChoice } from './color-scheme-switch-types';
import { useColorSchemeSwitch } from './internal/logic/use-color-scheme-switch';
import { KkColorSchemeSwitchSegment } from './internal/ui/KkColorSchemeSwitchSegment';
import { KkColorSchemeSwitchThumb } from './internal/ui/KkColorSchemeSwitchThumb';

const trackPaint = (theme: Theme): CSSObject => ({
  position: 'relative',
  minWidth: 0,
  p: 0.5,
  borderRadius: `${kkTokens.radius.pill}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  backgroundColor: inkWash(theme, '5%'),
});

interface KkColorSchemeSwitchProps {
  label: string;
  choices: readonly KkColorSchemeChoice[];
  sx?: KkSx;
}

export const KkColorSchemeSwitch: FC<KkColorSchemeSwitchProps> = ({ label, choices, sx }) => {
  const { mode, selectedIndex, choose, move } = useColorSchemeSwitch(choices);
  const thumb =
    selectedIndex < 0 ? null : (
      <KkColorSchemeSwitchThumb scheme={mode} index={selectedIndex} count={choices.length} />
    );
  const segments = choices.map((choice) => (
    <KkColorSchemeSwitchSegment
      key={choice.mode}
      choice={choice}
      selected={choice.mode === mode}
      onChoose={choose}
    />
  ));

  return (
    <Stack
      direction="row"
      role="radiogroup"
      aria-label={label}
      onKeyDown={move}
      data-kk-color-scheme-switch
      sx={[trackPaint, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <KkModeTransitionStyles />
      {thumb}
      {segments}
    </Stack>
  );
};
