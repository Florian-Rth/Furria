import Stack from '@mui/material/Stack';
import type { FC, ReactNode } from 'react';
import type { KkImageSource } from '../image-source';
import type { KkClubIcon } from '../internal/club-icon';
import type { KkGroupTone } from '../internal/group-tone';
import { lineClamp } from '../internal/line-clamp';
import { KkCard } from '../KkCard/KkCard';
import { KkMeta } from '../KkMeta';
import type { KkSx } from '../kk-sx';
import { KkGroupCardFace } from './internal/layout/KkGroupCardFace';
import { KkGroupCardCrest } from './internal/ui/KkGroupCardCrest';
import { KkGroupCardKind } from './internal/ui/KkGroupCardKind';
import { KkGroupCardSignal } from './internal/ui/KkGroupCardSignal';

const NAME_LINES = 2;
const LEAD_LINES = 1;
const MEMBER_LINES = 1;
const FALLBACK_ICON: KkClubIcon = 'broom';
const BODY_INSET = { xs: 1.5, desktop: 2 };

interface KkGroupCardProps {
  tone: KkGroupTone;
  icon: KkClubIcon | null;
  image: KkImageSource | null;
  name: string;
  kind: string | null;
  signal?: string | null;
  lead: string;
  avatars: ReactNode;
  memberLine: string;
  onSelect: () => void;
  sx?: KkSx;
}

export const KkGroupCard: FC<KkGroupCardProps> = ({
  tone,
  icon,
  image,
  name,
  kind,
  signal,
  lead,
  avatars,
  memberLine,
  onSelect,
  sx,
}) => {
  const crestIcon = icon ?? FALLBACK_ICON;
  const kindLine = kind === null ? null : <KkGroupCardKind tone={tone} kind={kind} />;
  const signalLine =
    signal === undefined || signal === null ? null : <KkGroupCardSignal label={signal} />;

  return (
    <KkCard sx={sx}>
      <KkGroupCardFace onSelect={onSelect}>
        <KkGroupCardCrest tone={tone} icon={crestIcon} image={image} />
        <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.5, p: BODY_INSET }}>
          <KkCard.Title clamp={NAME_LINES}>{name}</KkCard.Title>
          {kindLine}
          {signalLine}
          <KkMeta sx={lineClamp(LEAD_LINES)}>{lead}</KkMeta>
          <Stack
            direction="row"
            sx={{ mt: 'auto', pt: 1, gap: 1.25, alignItems: 'center', minWidth: 0 }}
          >
            {avatars}
            <KkMeta sx={lineClamp(MEMBER_LINES)}>{memberLine}</KkMeta>
          </Stack>
        </Stack>
      </KkGroupCardFace>
    </KkCard>
  );
};
