import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkNewsProofing } from '../internal/news-surface/news-proofing';
import { NewsProofingContext } from '../internal/news-surface/news-proofing';
import { PROOF_PHONE_WIDTH } from './internal/logic/proof-phone-width';
import { KkNewsProofSurfacePanel } from './internal/ui/KkNewsProofSurfacePanel';
import type { KkNewsProofFacts, KkNewsProofKind, KkNewsProofLabels } from './news-proof-types';
import { KK_NEWS_PROOF_KINDS } from './news-proof-types';

export type KkNewsProofArrangement = 'stack' | 'columns';

const COLUMNS: readonly (readonly KkNewsProofKind[])[] = [
  ['lead', 'row'],
  ['card', 'whatsapp'],
];

interface KkNewsProofPanelsProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
  liveKey: number;
  arrangement?: KkNewsProofArrangement;
  onOpen?: () => void;
}

export const KkNewsProofPanels: FC<KkNewsProofPanelsProps> = ({
  facts,
  labels,
  liveKey,
  arrangement = 'stack',
  onOpen,
}) => {
  const proofing: KkNewsProofing = {
    untitled: labels.untitled,
    teaserPlaceholder: labels.teaserPlaceholder,
  };
  const isScaled = arrangement === 'columns';
  const panelOf = (kind: KkNewsProofKind) => (
    <KkNewsProofSurfacePanel
      key={kind}
      kind={kind}
      facts={facts}
      labels={labels}
      liveKey={liveKey}
      order={KK_NEWS_PROOF_KINDS.indexOf(kind)}
      isScaled={isScaled}
      onOpen={onOpen}
    />
  );
  const columns = COLUMNS.map((kinds) => {
    const columnPanels = kinds.map(panelOf);
    return (
      <Grid key={kinds.join('-')} size={6} sx={{ minWidth: 0 }}>
        <Stack sx={{ gap: 2, minWidth: 0 }}>{columnPanels}</Stack>
      </Grid>
    );
  });
  const stacked = KK_NEWS_PROOF_KINDS.map((kind) => (
    <Box key={kind} sx={{ width: { xs: '100%', sm: PROOF_PHONE_WIDTH }, minWidth: 0 }}>
      {panelOf(kind)}
    </Box>
  ));
  const panels = isScaled ? (
    <Grid container spacing={2}>
      {columns}
    </Grid>
  ) : (
    <Stack
      direction="row"
      sx={{
        gap: 3,
        minWidth: 0,
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      {stacked}
    </Stack>
  );

  return <NewsProofingContext.Provider value={proofing}>{panels}</NewsProofingContext.Provider>;
};
