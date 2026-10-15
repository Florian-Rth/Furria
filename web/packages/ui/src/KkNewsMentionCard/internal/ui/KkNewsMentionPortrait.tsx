import Box from '@mui/material/Box';
import type { FC } from 'react';
import type { KkPictureUrls } from '../../../image-source';
import { toImageSource } from '../../../image-source';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';

const PORTRAIT_WIDTH = 72;
const PORTRAIT_SIZES = `${PORTRAIT_WIDTH}px`;

interface KkNewsMentionPortraitProps {
  initials: string;
  picture: KkPictureUrls | null;
}

export const KkNewsMentionPortrait: FC<KkNewsMentionPortraitProps> = ({ initials, picture }) => {
  const image = toImageSource(picture, 'portrait', PORTRAIT_SIZES);

  return (
    <Box
      data-kk-news-mention-face="person"
      sx={{
        width: PORTRAIT_WIDTH,
        flexShrink: 0,
        aspectRatio: kkTokens.aspectRatio.portrait,
        borderRadius: `${kkTokens.radius.base}px`,
        border: kkTokens.line.hair,
        borderColor: 'divider',
      }}
    >
      <KkPhoto alt="" image={image} placeholderLabel={initials} fill />
    </Box>
  );
};
