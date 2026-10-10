import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkNewsProofFacts, KkNewsProofKind, KkNewsProofLabels } from '../../news-proof-types';
import { KkNewsProofLiveTick } from './KkNewsProofLiveTick';
import { KkNewsProofSilhouette } from './KkNewsProofSilhouette';

interface KkNewsProofPeekTileProps {
  kind: KkNewsProofKind;
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
  liveKey: number;
  order: number;
}

export const KkNewsProofPeekTile: FC<KkNewsProofPeekTileProps> = ({
  kind,
  facts,
  labels,
  liveKey,
  order,
}) => {
  const labelColor = facts.changed ? 'primary.main' : 'text.secondary';

  return (
    <Stack sx={{ position: 'relative', flex: 1, minWidth: 0, gap: 0.75 }}>
      <Stack sx={{ height: 58, justifyContent: 'flex-start', minWidth: 0 }}>
        <KkNewsProofSilhouette kind={kind} facts={facts} />
      </Stack>
      <Typography
        variant="caption"
        noWrap
        sx={{ color: labelColor, fontWeight: 700, lineHeight: 1.2, textAlign: 'center' }}
      >
        {labels.tiles[kind]}
      </Typography>
      <KkNewsProofLiveTick label={labels.live} liveKey={liveKey} order={order} />
    </Stack>
  );
};
