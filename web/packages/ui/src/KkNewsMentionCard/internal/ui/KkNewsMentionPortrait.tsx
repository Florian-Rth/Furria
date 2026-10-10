import Box from '@mui/material/Box';
import type { FC } from 'react';
import { KkAvatar } from '../../../KkAvatar';
import { KkCoverPicture } from '../../../KkCoverPicture';
import type { KkPictureUrls } from '../../../picture-sources';
import { toPictureSourceSet } from '../../../picture-sources';
import { kkTokens } from '../../../tokens';

const PORTRAIT_ASPECT = 4 / 5;
const PORTRAIT_WIDTH = 72;
const PORTRAIT_SIZES = `${PORTRAIT_WIDTH}px`;

interface KkNewsMentionPortraitProps {
  initials: string;
  picture: KkPictureUrls | null;
}

export const KkNewsMentionPortrait: FC<KkNewsMentionPortraitProps> = ({ initials, picture }) =>
  picture === null ? (
    <KkAvatar initials={initials} size="large" />
  ) : (
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
      <KkCoverPicture
        source={picture.smallUrl}
        sourceSet={toPictureSourceSet(picture, PORTRAIT_ASPECT)}
        sizes={PORTRAIT_SIZES}
        alt=""
        sx={{ borderRadius: `${kkTokens.radius.base}px` }}
      />
    </Box>
  );
