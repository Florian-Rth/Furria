import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkJobPanelGroupHeadProps {
  text: string;
  aside: string | null;
}

export const KkJobPanelGroupHead: FC<KkJobPanelGroupHeadProps> = ({ text, aside }) => {
  const asideText =
    aside === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}
      >
        {aside}
      </Typography>
    );

  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, minWidth: 0 }}>
      <Typography
        component="h3"
        variant="caption"
        sx={{
          flex: 1,
          fontWeight: 900,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          color: 'text.secondary',
          lineHeight: 1.2,
        }}
      >
        {text}
      </Typography>
      {asideText}
    </Stack>
  );
};
