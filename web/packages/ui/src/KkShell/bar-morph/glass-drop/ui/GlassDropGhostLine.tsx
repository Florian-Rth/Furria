import type { FC } from 'react';
import { KkShellBarTitle } from '../../../internal/ui/KkShellBarTitle';
import { KkShellBarWordmark } from '../../../internal/ui/KkShellBarWordmark';
import type { GlassDropLine } from '../logic/glass-drop-plan';

interface GlassDropGhostLineProps {
  line: GlassDropLine;
}

export const GlassDropGhostLine: FC<GlassDropGhostLineProps> = ({ line }) =>
  line.kind === 'wordmark' ? (
    <KkShellBarWordmark />
  ) : (
    <KkShellBarTitle>{line.text}</KkShellBarTitle>
  );
