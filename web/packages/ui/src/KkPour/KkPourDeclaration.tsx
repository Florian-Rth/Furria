import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { raisedSurface } from '../internal/raised-surface';
import { KkIcon } from '../KkIcon';
import type { KkSx } from '../kk-sx';
import { kkTokens } from '../tokens';

const cardPaint = (theme: Theme): CSSObject => ({
  gap: 0.75,
  p: 1.5,
  minWidth: 0,
  borderRadius: `${kkTokens.radius.base}px`,
  borderWidth: kkTokens.line.hair,
  borderStyle: 'solid',
  borderColor: 'divider',
  ...raisedSurface(theme),
});

interface KkPourDeclarationProps {
  title: string;
  lead: string;
  owner: string;
  rest: string;
  sx?: KkSx;
}

export const KkPourDeclaration: FC<KkPourDeclarationProps> = ({ title, lead, owner, rest, sx }) => (
  <Stack
    component="section"
    aria-label={title}
    data-kk-pour-declaration
    sx={[cardPaint, ...(Array.isArray(sx) ? sx : [sx])]}
  >
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
      <KkIcon name="handshake" size="small" sx={{ color: 'text.secondary' }} />
      <Typography
        variant="caption"
        sx={{
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.label,
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {title}
      </Typography>
    </Stack>
    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
      {lead}
      <Typography component="strong" variant="body2" sx={{ fontWeight: 900 }}>
        {owner}
      </Typography>
      {rest}
    </Typography>
  </Stack>
);
