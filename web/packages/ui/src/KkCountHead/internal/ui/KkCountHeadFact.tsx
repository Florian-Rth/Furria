import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkClubIcon } from '../../../internal/club-icon';
import { KkClubIconGlyph } from '../../../KkClubIconGlyph';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { TABULAR } from '../../../KkStartTile/internal/tile-paint';

const FACT: CSSObject = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  whiteSpace: 'nowrap',
  color: 'text.secondary',
};
const ICON_PAINT: CSSObject = { width: '1rem', height: '1rem', flexShrink: 0 };
const TEXT_PAINT: CSSObject = {
  ...TABULAR,
  fontWeight: 700,
  lineHeight: 'inherit',
  color: 'inherit',
};

interface KkCountHeadFactProps {
  text: string;
  icon?: KkIconName;
  glyph?: KkClubIcon;
}

export const KkCountHeadFact: FC<KkCountHeadFactProps> = ({ text, icon, glyph }) => {
  const iconMark = icon === undefined ? null : <KkIcon name={icon} sx={ICON_PAINT} />;
  const glyphMark = glyph === undefined ? null : <KkClubIconGlyph icon={glyph} sx={ICON_PAINT} />;

  return (
    <Stack component="li" direction="row" sx={FACT}>
      {iconMark}
      {glyphMark}
      <Typography component="span" variant="caption" sx={TEXT_PAINT}>
        {text}
      </Typography>
    </Stack>
  );
};
