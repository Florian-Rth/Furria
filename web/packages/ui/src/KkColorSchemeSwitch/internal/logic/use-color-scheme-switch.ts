import type { KeyboardEvent } from 'react';
import { nextRovingId } from '../../../internal/roving-focus';
import type { OriginRect } from '../../../reveal-geometry';
import type { KkColorSchemeMode } from '../../../theme-color';
import { useKkModeTransition } from '../../../use-kk-mode-transition';
import type { KkColorSchemeChoice } from '../../color-scheme-switch-types';

export const SCHEME_SEGMENT_ATTRIBUTE = 'data-kk-scheme-segment';

interface ColorSchemeSwitch {
  mode: KkColorSchemeMode;
  selectedIndex: number;
  choose: (mode: KkColorSchemeMode, origin: OriginRect) => void;
  move: (event: KeyboardEvent<HTMLDivElement>) => void;
}

export const useColorSchemeSwitch = (
  choices: readonly KkColorSchemeChoice[],
): ColorSchemeSwitch => {
  const { mode, switchTo } = useKkModeTransition();
  const modes = choices.map((choice) => choice.mode);
  const selectedIndex = modes.indexOf(mode);

  const choose = (next: KkColorSchemeMode, origin: OriginRect): void => {
    if (next !== mode) {
      switchTo(next, origin);
    }
  };

  const move = (event: KeyboardEvent<HTMLDivElement>): void => {
    const target = nextRovingId(modes, mode, event.key);
    const next = choices.find((choice) => choice.mode === target);
    const segment = event.currentTarget.querySelector<HTMLButtonElement>(
      `[${SCHEME_SEGMENT_ATTRIBUTE}="${target}"]`,
    );

    if (next === undefined || segment === null) {
      return;
    }
    event.preventDefault();
    segment.focus();
    choose(next.mode, segment.getBoundingClientRect());
  };

  return { mode, selectedIndex, choose, move };
};
