import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { lineClamp } from '../../../internal/line-clamp';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const ONE_LINE = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

interface KkStudioCMomentStepProps {
  position: string;
  name: string;
  meta: string;
  description: string | null;
  quiet?: boolean;
  sx?: KkSx;
}

export const KkStudioCMomentStep: FC<KkStudioCMomentStepProps> = ({
  position,
  name,
  meta,
  description,
  quiet = false,
  sx,
}) => {
  const nameInk = quiet ? 'text.secondary' : 'text.primary';
  const detail =
    description === null ? null : (
      <Typography
        component="p"
        sx={{ typography: 'body2', color: 'text.secondary', m: 0, ...lineClamp(2) }}
      >
        {description}
      </Typography>
    );

  return (
    <Stack
      data-kk-studio-c-step
      sx={[{ minWidth: 0, flex: 1, rowGap: 0.25 }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Stack direction="row" sx={{ alignItems: 'baseline', columnGap: 0.75, minWidth: 0 }}>
        <Box
          component="span"
          sx={{
            typography: 'caption',
            fontWeight: 800,
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            flexShrink: 0,
          }}
        >
          {position}
        </Box>
        <Typography
          component="h2"
          sx={{
            typography: 'h4',
            textTransform: 'uppercase',
            letterSpacing: kkTokens.type.tracking.display,
            color: nameInk,
            ...ONE_LINE,
          }}
        >
          {name}
        </Typography>
      </Stack>
      <Typography
        component="span"
        sx={{
          typography: 'caption',
          fontWeight: 700,
          color: 'text.secondary',
          fontVariantNumeric: 'tabular-nums',
          ...ONE_LINE,
        }}
      >
        {meta}
      </Typography>
      {detail}
    </Stack>
  );
};
