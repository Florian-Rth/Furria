import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkFocusGlyphName } from '../../../KkFocusGlyph';
import { KkFocusGlyph } from '../../../KkFocusGlyph';
import { kkTokens } from '../../../tokens';
import type { KkFocusLane } from '../lane-heights';
import { LANE_HEIGHTS } from '../lane-heights';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkFocusLanesNameProps {
  lane: KkFocusLane;
  glyph: KkFocusGlyphName;
  text: string;
  meta: string | null;
}

export const KkFocusLanesName: FC<KkFocusLanesNameProps> = ({ lane, glyph, text, meta }) => {
  const metaLine =
    meta === null ? null : (
      <Typography
        component="span"
        variant="caption"
        sx={{
          color: 'text.secondary',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {meta}
      </Typography>
    );

  return (
    <Stack
      sx={(theme) => ({
        height: LANE_HEIGHTS[lane],
        minWidth: 0,
        px: 1,
        justifyContent: 'center',
        borderBottom: `${kkTokens.line.hair}px solid ${palette(theme).divider}`,
        '&:last-of-type': { borderBottom: 'none' },
      })}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 0.5, minWidth: 0, color: 'text.secondary' }}
      >
        <KkFocusGlyph name={glyph} />
        <Typography
          component="span"
          variant="caption"
          sx={{
            fontWeight: 800,
            color: 'text.primary',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {text}
        </Typography>
      </Stack>
      {metaLine}
    </Stack>
  );
};
