import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';

interface KkJobPanelContextProps {
  owner: string | null;
  title: string;
  meta: string | null;
}

export const KkJobPanelContext: FC<KkJobPanelContextProps> = ({ owner, title, meta }) => {
  const metaLine =
    meta === null ? null : (
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', fontVariantNumeric: 'tabular-nums', lineHeight: 1.3 }}
      >
        {meta}
      </Typography>
    );

  const ownerLine =
    owner === null ? null : (
      <Typography
        variant="overline"
        sx={{
          lineHeight: 1.2,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.section,
          color: 'text.secondary',
        }}
      >
        {owner}
      </Typography>
    );

  return (
    <Stack sx={{ gap: 0.25, minWidth: 0 }}>
      {ownerLine}
      <Typography
        variant="h4"
        component="h2"
        sx={{ overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}
      >
        {title}
      </Typography>
      {metaLine}
    </Stack>
  );
};
