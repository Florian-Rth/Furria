import { KkFocusTopGroup } from './internal/layout/KkFocusTopGroup';
import { KkFocusTopRoot } from './internal/layout/KkFocusTopRoot';
import { KkFocusTopSpacer } from './internal/layout/KkFocusTopSpacer';
import { KkFocusTopButton } from './internal/ui/KkFocusTopButton';
import { KkFocusTopPlay } from './internal/ui/KkFocusTopPlay';
import { KkFocusTopReadout } from './internal/ui/KkFocusTopReadout';

export const KkFocusTop = Object.assign(KkFocusTopRoot, {
  Group: KkFocusTopGroup,
  Spacer: KkFocusTopSpacer,
  Button: KkFocusTopButton,
  Play: KkFocusTopPlay,
  Readout: KkFocusTopReadout,
});
