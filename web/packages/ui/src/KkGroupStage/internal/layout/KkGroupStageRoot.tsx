import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import type { KkSx } from '../../../kk-sx';
import type { KkGroupStageJubilee } from '../group-stage-jubilee';
import { groupStageRevealAt } from '../group-stage-motion';
import { GROUP_STAGE_STEPS } from '../group-stage-reveal';
import { KkGroupStageEdge } from '../ui/KkGroupStageEdge';
import { KkGroupStageEyebrow } from '../ui/KkGroupStageEyebrow';
import { KkGroupStageJubileeSeal } from '../ui/KkGroupStageJubileeSeal';
import { KkGroupStageScrim } from '../ui/KkGroupStageScrim';
import { KkGroupStageTitle } from '../ui/KkGroupStageTitle';
import { KkGroupStageWatermark } from '../ui/KkGroupStageWatermark';
import { KkGroupStageBody } from './KkGroupStageBody';
import { KkGroupStageField } from './KkGroupStageField';
import { KkGroupStageMedia } from './KkGroupStageMedia';

const NO_BURST = 0;
const ONE_BURST = 1;

const INK_INSET = {
  px: { xs: 2.5, desktop: 4 },
  py: { xs: 2, desktop: 3 },
};

interface KkGroupStageRootProps {
  tone: KkGroupTone;
  name: string;
  kindLabel: string | null;
  jubilee?: KkGroupStageJubilee | null;
  media?: ReactNode;
  children?: ReactNode;
  sx?: KkSx;
}

export const KkGroupStageRoot: FC<KkGroupStageRootProps> = ({
  tone,
  name,
  kindLabel,
  jubilee = null,
  media,
  children,
  sx,
}) => {
  const reducedMotion = useReducedMotion();
  const mediaSlot = media === undefined ? null : <KkGroupStageMedia>{media}</KkGroupStageMedia>;
  const fireKey = reducedMotion ? NO_BURST : ONE_BURST;

  const seal =
    jubilee === null ? null : (
      <KkGroupStageJubileeSeal
        yearsLabel={jubilee.yearsLabel}
        caption={jubilee.caption}
        fireKey={fireKey}
      />
    );

  const body = children === undefined ? null : <KkGroupStageBody>{children}</KkGroupStageBody>;

  return (
    <Stack data-kk-group-stage sx={[{ minWidth: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
      <KkGroupStageField tone={tone}>
        {mediaSlot}
        <KkGroupStageWatermark />
        <KkGroupStageScrim />
        {seal}
        <Stack
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            minWidth: 0,
            justifyContent: 'flex-end',
            gap: { xs: 0.5, desktop: 0.75 },
            ...INK_INSET,
          }}
        >
          <KkGroupStageEyebrow
            label={kindLabel}
            sx={groupStageRevealAt(GROUP_STAGE_STEPS.eyebrow)}
          />
          <KkGroupStageTitle name={name} sx={groupStageRevealAt(GROUP_STAGE_STEPS.title)} />
        </Stack>
      </KkGroupStageField>
      <KkGroupStageEdge tone={tone} />
      {body}
    </Stack>
  );
};
