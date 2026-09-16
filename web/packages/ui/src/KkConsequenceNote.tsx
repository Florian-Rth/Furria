import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { applyScheme, schemeInk } from './internal/scheme-paint';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { kkTokens } from './tokens';

interface KkConsequenceNoteProps extends PropsWithChildren {
  sx?: KkSx;
}

export const KkConsequenceNote: FC<KkConsequenceNoteProps> = ({ sx, children }) => (
  <Stack
    direction="row"
    data-kk-consequence-note
    sx={[
      {
        alignItems: 'flex-start',
        gap: 1.5,
        minWidth: 0,
        bgcolor: 'background.paper',
        borderWidth: kkTokens.line.hair,
        borderStyle: 'solid',
        borderColor: 'divider',
        borderRadius: `${kkTokens.radius.base}px`,
        px: 1.75,
        py: 1.5,
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    <KkIcon
      name="bolt"
      size="small"
      sx={(theme) => ({
        ...applyScheme(theme, schemeInk(kkTokens.color.light.goldInk, kkTokens.color.dark.goldInk)),
        flexShrink: 0,
        mt: 0.125,
      })}
    />
    <Typography
      component="span"
      variant="body2"
      sx={{ color: 'text.secondary', minWidth: 0, textWrap: 'pretty' }}
    >
      {children}
    </Typography>
  </Stack>
);
