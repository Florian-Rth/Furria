import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KK_STUDIO_I_WIDE } from '../../../KkStudioIEditor/studio-i-editor-query';
import { kkTokens } from '../../../tokens';

interface KkStudioIRailGroupHeadProps {
  name: string;
  meta: string;
}

export const KkStudioIRailGroupHead: FC<KkStudioIRailGroupHeadProps> = ({ name, meta }) => (
  <Stack
    direction="row"
    sx={{ alignItems: 'baseline', gap: 1, minWidth: 0, px: 0.5, [KK_STUDIO_I_WIDE]: { px: 1 } }}
  >
    <Typography
      variant="overline"
      sx={{
        fontWeight: kkTokens.eyebrow.fontWeight,
        letterSpacing: kkTokens.eyebrow.letterSpacing,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
      }}
    >
      {name}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      {meta}
    </Typography>
  </Stack>
);
