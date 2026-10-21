import Stack from '@mui/material/Stack';
import type { CSSObject } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkImageSource } from '../../../image-source';
import { KkAvatar } from '../../../KkAvatar/KkAvatar';
import { TILE_AUTHOR_GAP } from '../tile-paint';

const AUTHOR_FRAME: CSSObject = { alignItems: 'center', gap: TILE_AUTHOR_GAP, minWidth: 0 };
const NAME_ROW: CSSObject = {
  alignItems: 'baseline',
  columnGap: 0.75,
  flexWrap: 'wrap',
  minWidth: 0,
};
const NAME_PAINT: CSSObject = { fontWeight: 800, lineHeight: 1.25, color: 'text.primary' };
const OFFICE_PAINT: CSSObject = { fontWeight: 600, lineHeight: 1.25, color: 'text.secondary' };

interface KkStartTileAuthorProps {
  name: string;
  initials: string;
  image: KkImageSource | null;
  office?: string;
}

export const KkStartTileAuthor: FC<KkStartTileAuthorProps> = ({
  name,
  initials,
  image,
  office,
}) => {
  const officeLine =
    office === undefined ? null : (
      <Typography component="span" variant="caption" sx={OFFICE_PAINT}>
        {office}
      </Typography>
    );

  return (
    <Stack direction="row" data-kk-start-tile-author sx={AUTHOR_FRAME}>
      <KkAvatar initials={initials} image={image} size="small" />
      <Stack direction="row" sx={NAME_ROW}>
        <Typography component="span" variant="body2" sx={NAME_PAINT}>
          {name}
        </Typography>
        {officeLine}
      </Stack>
    </Stack>
  );
};
