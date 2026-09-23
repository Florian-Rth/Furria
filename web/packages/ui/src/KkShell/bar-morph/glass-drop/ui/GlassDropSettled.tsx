import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkBroomMark } from '../../../../KkBroomMark';
import type { KkBarSnapshot } from '../../../bar-morph';
import { useKkHandoverStage } from '../../../handover-stage';
import { KkShellBarMark } from '../../../internal/layout/KkShellBarMark';
import { KkShellBarBack } from '../../../internal/ui/KkShellBarBack';
import { KkShellBarClose } from '../../../internal/ui/KkShellBarClose';
import { KkShellBarSwap } from '../../../internal/ui/KkShellBarSwap';
import { KkShellBarTitle } from '../../../internal/ui/KkShellBarTitle';
import { KkShellBarWordmark } from '../../../internal/ui/KkShellBarWordmark';
import type { GlassDropArrival } from '../logic/glass-drop-text';
import { GlassDropRipple } from './GlassDropRipple';

const BROOM_SIZE = 30;

interface GlassDropSettledProps {
  snapshot: KkBarSnapshot;
  arrival: GlassDropArrival | null;
  live: boolean;
}

export const GlassDropSettled: FC<GlassDropSettledProps> = ({ snapshot, arrival, live }) => {
  const stage = useKkHandoverStage();
  const Swap = stage?.Swap ?? KkShellBarSwap;
  const { kind, lead, title, origin } = snapshot;

  if (kind === 'fullscreen' && origin !== null) {
    return (
      <GlassDropRipple arrival={arrival} live={live}>
        <KkShellBarClose origin={origin} title={title} />
      </GlassDropRipple>
    );
  }

  const titleLine = <KkShellBarTitle>{title}</KkShellBarTitle>;
  const restLine =
    origin === null ? <KkShellBarWordmark /> : <KkShellBarTitle>{origin.label}</KkShellBarTitle>;
  const leading =
    lead === 'title' ? (
      titleLine
    ) : (
      <Swap rest={restLine} title={titleLine} restText={origin?.label ?? null} titleText={title} />
    );
  const text = (
    <GlassDropRipple arrival={arrival} live={live}>
      {leading}
    </GlassDropRipple>
  );

  if (origin !== null) {
    return <KkShellBarBack origin={origin}>{text}</KkShellBarBack>;
  }

  return (
    <Stack
      direction="row"
      data-kk-shell-bar-home
      sx={{ alignItems: 'center', gap: 0.25, minWidth: 0 }}
    >
      <KkShellBarMark>
        <KkBroomMark size={BROOM_SIZE} sx={{ color: 'primary.main' }} />
      </KkShellBarMark>
      {text}
    </Stack>
  );
};
