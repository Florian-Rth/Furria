import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkNewsProofFacts, KkNewsProofKind } from '../../news-proof-types';
import { KkNewsProofBar } from './KkNewsProofBar';
import { KkNewsProofSwatch } from './KkNewsProofSwatch';

interface KkNewsProofSilhouetteProps {
  kind: KkNewsProofKind;
  facts: KkNewsProofFacts;
}

const BANNER = {
  aspectRatio: kkTokens.aspectRatio.banner,
  borderRadius: 0.5,
  typography: 'caption',
};
const THUMB = { width: 16, height: 16, flexShrink: 0, borderRadius: 0.5 };

export const KkNewsProofSilhouette: FC<KkNewsProofSilhouetteProps> = ({ kind, facts }) => {
  const banner = <KkNewsProofSwatch facts={facts} sx={BANNER} />;

  if (kind === 'lead') {
    return (
      <Stack sx={{ gap: 0.5 }}>
        {banner}
        <KkNewsProofBar width="90%" strong />
        <KkNewsProofBar width="70%" />
      </Stack>
    );
  }
  if (kind === 'row') {
    return (
      <Stack sx={{ gap: 0.75, pt: 0.5 }}>
        <Stack direction="row" sx={{ gap: 0.5, alignItems: 'center' }}>
          <Stack sx={{ flex: 1, gap: 0.5, minWidth: 0 }}>
            <KkNewsProofBar width="90%" strong />
            <KkNewsProofBar width="60%" />
          </Stack>
          <KkNewsProofSwatch facts={facts} sx={THUMB} />
        </Stack>
        <KkNewsProofBar width="80%" />
        <KkNewsProofBar width="66%" />
      </Stack>
    );
  }
  if (kind === 'card') {
    return (
      <Stack sx={{ gap: 0.5, p: 0.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        {banner}
        <KkNewsProofBar width="80%" strong />
      </Stack>
    );
  }
  return (
    <Stack
      sx={{
        width: '82%',
        alignSelf: 'flex-end',
        gap: 0.5,
        p: 0.5,
        bgcolor: 'action.hover',
        borderRadius: 1,
        borderTopRightRadius: 2,
      }}
    >
      {banner}
      <KkNewsProofBar width="85%" strong />
    </Stack>
  );
};
