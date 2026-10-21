import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { KkAppTile } from './KkAppTile';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

const halo = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.12); opacity: 0.55; }
`;

const settle = keyframes`
  from { opacity: 0; transform: translate3d(0, 0.75rem, 0) scale(0.9); }
  to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
`;

const COLUMNS = 4;
const SLOTS = 12;
const OWN_SLOT = 6;
const TILE = 48;
const SLOT_STAGGER_SECONDS = 0.04;
const HALO_GAP = '-0.5rem';

interface KkHomeScreenHintProps {
  appLabel: string;
  sx?: KkSx;
}

export const KkHomeScreenHint: FC<KkHomeScreenHintProps> = ({ appLabel, sx }) => {
  const slots = Array.from({ length: SLOTS }, (_slot, index) => {
    const delay = `${index * SLOT_STAGGER_SECONDS}s`;
    const isOwn = index === OWN_SLOT;
    const face = isOwn ? (
      <Box sx={{ position: 'relative' }}>
        <Box
          aria-hidden
          sx={(theme) => ({
            position: 'absolute',
            inset: HALO_GAP,
            borderRadius: `${kkTokens.radius.base + 4}px`,
            border: `${kkTokens.line.section}px dashed`,
            borderColor: (theme.vars ?? theme).palette.warning.main,
            animation: `${halo} 1.4s ease-in-out infinite`,
          })}
        />
        <KkAppTile label={appLabel} size={TILE} />
      </Box>
    ) : (
      <Box
        sx={{
          width: TILE,
          height: TILE,
          borderRadius: `${kkTokens.radius.base}px`,
          bgcolor: 'divider',
        }}
      />
    );

    return (
      <Stack
        key={index}
        aria-hidden={!isOwn}
        sx={{
          alignItems: 'center',
          rowGap: 0.5,
          animation: `${settle} 0.4s ease-out ${delay} both`,
        }}
      >
        {face}
        <Typography
          variant="caption"
          sx={{ fontWeight: isOwn ? 800 : 400, color: isOwn ? 'text.primary' : 'transparent' }}
        >
          {isOwn ? appLabel : '·'}
        </Typography>
      </Stack>
    );
  });

  return (
    <Box
      data-kk-home-screen-hint
      sx={[
        {
          display: 'grid',
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
          rowGap: 1.5,
          px: 2,
          py: 2.5,
          borderRadius: `${kkTokens.radius.base}px`,
          border: `${kkTokens.line.hair}px solid`,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {slots}
    </Box>
  );
};
