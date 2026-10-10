import Box from '@mui/material/Box';
import type { Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { KkCoverPicture } from '../KkCoverPicture';
import { KkNewsPoster } from '../KkNewsPoster';
import { kkTokens } from '../tokens';

const STRUCK_FILTER = 'grayscale(1)';

interface KkPressRowThumbProps {
  picture: string | null;
  struck: boolean;
}

export const KkPressRowThumb: FC<KkPressRowThumbProps> = ({ picture, struck }) => {
  const image =
    picture === null ? (
      <KkNewsPoster tone={null} word="" />
    ) : (
      <KkCoverPicture source={picture} alt="" />
    );

  return (
    <Box
      aria-hidden
      data-kk-press-row-thumb
      sx={(theme: Theme) => ({
        display: 'grid',
        width: theme.spacing(8),
        flexShrink: 0,
        aspectRatio: kkTokens.aspectRatio.banner,
        borderRadius: 1,
        outline: `${kkTokens.line.hair}px solid`,
        outlineColor: (theme.vars ?? theme).palette.divider,
        outlineOffset: -kkTokens.line.hair,
        filter: struck ? STRUCK_FILTER : 'none',
        opacity: struck ? kkTokens.opacity.dimmed : 1,
        '& > img': { borderRadius: 1 },
      })}
    >
      {image}
    </Box>
  );
};
