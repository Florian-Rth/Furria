import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { kkTokens } from '../../../tokens';

type KkBandTone = 'accent' | 'plain';

interface KkBandSectionRootProps extends PropsWithChildren {
  decoration?: ReactNode;
  tone?: KkBandTone;
  sx?: SxProps<Theme>;
}

const toneStyles: Record<KkBandTone, { bgcolor: string; color: string }> = {
  accent: { bgcolor: 'primary.main', color: 'primary.contrastText' },
  plain: { bgcolor: 'background.paper', color: 'text.primary' },
};

export const KkBandSectionRoot: FC<KkBandSectionRootProps> = ({
  decoration,
  tone = 'accent',
  sx,
  children,
}) => (
  <Stack
    component="section"
    data-kk-band-section
    sx={[
      {
        position: 'relative',
        overflow: 'hidden',
        px: kkTokens.layout.gutterX,
        py: kkTokens.layout.bandY,
        ...toneStyles[tone],
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {decoration}
    <Container maxWidth="xl" disableGutters sx={{ position: 'relative', zIndex: 1 }}>
      {children}
    </Container>
  </Stack>
);
