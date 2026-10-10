import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { CSSProperties, FC } from 'react';
import { kkMotion } from '../kk-motion';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';
import { KkNewsProofPeekTile } from './internal/ui/KkNewsProofPeekTile';
import type { KkNewsProofFacts, KkNewsProofLabels } from './news-proof-types';
import { KK_NEWS_PROOF_KINDS } from './news-proof-types';

const RISE_STYLE: CSSProperties = { minWidth: 0 };

interface KkNewsProofStripProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
  liveKey: number;
  onOpen: () => void;
  sx?: KkSx;
}

export const KkNewsProofStrip: FC<KkNewsProofStripProps> = ({
  facts,
  labels,
  liveKey,
  onOpen,
  sx,
}) => {
  const tiles = KK_NEWS_PROOF_KINDS.map((kind, order) => (
    <KkNewsProofPeekTile
      key={kind}
      kind={kind}
      facts={facts}
      labels={labels}
      liveKey={liveKey}
      order={order}
    />
  ));

  return (
    <motion.div
      key={liveKey}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={kkMotion.layoutGlide}
      style={RISE_STYLE}
    >
      <ButtonBase
        aria-label={labels.open}
        onClick={onOpen}
        data-kk-news-proof-strip
        sx={[
          (theme) => ({
            width: '100%',
            px: 1.25,
            py: 1,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            borderRadius: `${kkTokens.radius.base}px`,
            boxShadow: kkTokens.shadow.rest,
            '&.Mui-focusVisible': {
              outlineWidth: 2,
              outlineStyle: 'solid',
              outlineColor: (theme.vars ?? theme).palette.primary.main,
              outlineOffset: 2,
            },
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <Stack direction="row" sx={{ width: '100%', gap: 1.5, alignItems: 'flex-start' }}>
          {tiles}
        </Stack>
      </ButtonBase>
    </motion.div>
  );
};
