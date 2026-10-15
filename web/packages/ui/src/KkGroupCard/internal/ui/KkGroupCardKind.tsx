import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneInkPaint } from '../../../internal/group-tone';
import { lineClamp } from '../../../internal/line-clamp';
import { kkTokens } from '../../../tokens';

const KIND_LINES = 1;

interface KkGroupCardKindProps {
  tone: KkGroupTone;
  kind: string;
}

export const KkGroupCardKind: FC<KkGroupCardKindProps> = ({ tone, kind }) => (
  <Typography
    variant="caption"
    component="p"
    data-kk-group-card-kind
    sx={(theme) => ({
      fontWeight: 700,
      letterSpacing: kkTokens.type.tracking.tight,
      lineHeight: 1.3,
      ...lineClamp(KIND_LINES),
      ...groupToneInkPaint(theme, tone),
    })}
  >
    {kind}
  </Typography>
);
