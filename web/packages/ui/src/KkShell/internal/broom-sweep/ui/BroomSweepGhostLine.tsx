import Stack from '@mui/material/Stack';
import type { FC, Ref } from 'react';
import { KkShellBarTitle } from '../../../internal/ui/KkShellBarTitle';
import { KkShellBarWordmark } from '../../../internal/ui/KkShellBarWordmark';
import type { BroomSweepGhost } from '../logic/broom-sweep-plan';
import { SWEEP_VAR, varOf } from '../logic/broom-sweep-vars';

interface BroomSweepGhostLineProps {
  ghost: BroomSweepGhost;
  ref?: Ref<HTMLDivElement>;
}

export const BroomSweepGhostLine: FC<BroomSweepGhostLineProps> = ({ ghost, ref }) => {
  const line = ghost.wordmark ? (
    <KkShellBarWordmark />
  ) : (
    <KkShellBarTitle>{ghost.text}</KkShellBarTitle>
  );

  return (
    <Stack
      direction="row"
      ref={ref}
      data-kk-broom-sweep-ghost
      sx={{
        position: 'absolute',
        top: '50%',
        left: varOf(SWEEP_VAR.textLeft, '0px'),
        whiteSpace: 'nowrap',
        maxWidth: varOf(SWEEP_VAR.ghostRoom, 'none'),
        transform: 'translateY(-50%)',
        clipPath: varOf(SWEEP_VAR.ghostClip, 'none'),
        opacity: varOf(SWEEP_VAR.ghostOpacity, '0'),
      }}
    >
      {line}
    </Stack>
  );
};
