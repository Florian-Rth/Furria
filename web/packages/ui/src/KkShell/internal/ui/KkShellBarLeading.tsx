import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkBroomMark } from '../../../KkBroomMark';
import { useKkHandoverStage } from '../../handover-stage';
import type { KkScreenKind, KkScreenOrigin } from '../../screen-declaration';
import { KkShellBarMark } from '../layout/KkShellBarMark';
import { KkShellBarBack } from './KkShellBarBack';
import { KkShellBarClose } from './KkShellBarClose';
import { KkShellBarSwap } from './KkShellBarSwap';
import { KkShellBarTitle } from './KkShellBarTitle';
import { KkShellBarWordmark } from './KkShellBarWordmark';

export type KkShellBarLead = 'brand' | 'title';

const BROOM_SIZE = 30;

interface KkShellBarLeadingProps {
  kind: KkScreenKind;
  lead: KkShellBarLead;
  title: string;
  origin?: KkScreenOrigin;
}

export const KkShellBarLeading: FC<KkShellBarLeadingProps> = ({ kind, lead, title, origin }) => {
  const stage = useKkHandoverStage();
  const Swap = stage?.Swap ?? KkShellBarSwap;

  if (kind === 'fullscreen' && origin !== undefined) {
    return <KkShellBarClose origin={origin} title={title} />;
  }

  const titleLine = <KkShellBarTitle>{title}</KkShellBarTitle>;
  const restLine =
    origin === undefined ? (
      <KkShellBarWordmark />
    ) : (
      <KkShellBarTitle>{origin.label}</KkShellBarTitle>
    );
  const leading =
    lead === 'title' ? (
      titleLine
    ) : (
      <Swap rest={restLine} title={titleLine} restText={origin?.label ?? null} titleText={title} />
    );

  if (origin !== undefined) {
    return <KkShellBarBack origin={origin}>{leading}</KkShellBarBack>;
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
      {leading}
    </Stack>
  );
};
