import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkNewsProofFacts, KkNewsProofLabels } from '../../news-proof-types';
import { KkNewsProofClampText } from './KkNewsProofClampText';
import { KkNewsProofMedia } from './KkNewsProofMedia';

interface KkNewsWhatsAppProofProps {
  facts: KkNewsProofFacts;
  labels: KkNewsProofLabels;
}

const BUBBLE_RADIUS = `${kkTokens.radius.base}px`;
const PREVIEW_RADIUS = kkTokens.radius.base - 4;

export const KkNewsWhatsAppProof: FC<KkNewsWhatsAppProofProps> = ({ facts, labels }) => {
  const stamp = `${facts.clock} ${labels.readMark}`;

  return (
    <Stack
      data-kk-news-proof="whatsapp"
      sx={{
        alignItems: 'flex-end',
        p: 1.5,
        bgcolor: 'background.default',
        borderRadius: BUBBLE_RADIUS,
      }}
    >
      <Stack
        sx={{
          width: '86%',
          gap: 0.75,
          p: 0.75,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          borderRadius: BUBBLE_RADIUS,
          borderTopRightRadius: 4,
          boxShadow: kkTokens.shadow.rest,
        }}
      >
        <Stack sx={{ gap: 0.25, bgcolor: 'action.hover', borderRadius: `${PREVIEW_RADIUS}px` }}>
          <KkNewsProofMedia
            facts={facts}
            labels={labels}
            sx={{
              aspectRatio: kkTokens.aspectRatio.banner,
              borderRadius: `${PREVIEW_RADIUS}px ${PREVIEW_RADIUS}px 0 0`,
              typography: 'h3',
            }}
          />
          <Stack sx={{ gap: 0.25, px: 1, pb: 1, pt: 0.5 }}>
            <KkNewsProofClampText
              text={facts.title}
              placeholder={labels.untitled}
              lines={1}
              variant="body2"
              sx={{ fontWeight: 800 }}
            />
            <KkNewsProofClampText
              text={facts.teaser}
              placeholder={labels.teaserPlaceholder}
              lines={2}
              variant="caption"
              sx={{ color: 'text.secondary' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {facts.host}
            </Typography>
          </Stack>
        </Stack>
        <Typography variant="caption" sx={{ alignSelf: 'flex-end', color: 'text.secondary' }}>
          {stamp}
        </Typography>
      </Stack>
    </Stack>
  );
};
