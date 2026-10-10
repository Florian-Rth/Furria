import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { KkCoverPicture } from '../../../KkCoverPicture';
import type { KkPictureUrls } from '../../../picture-sources';
import { toPictureSourceSet } from '../../../picture-sources';
import { kkTokens } from '../../../tokens';

const GROUP_PICTURE_ASPECT = 3 / 2;
const CARD_SIZES = '18rem';

interface KkNewsMentionGroupFaceProps {
  initials: string;
  tone: KkGroupTone | null;
  picture: KkPictureUrls | null;
}

export const KkNewsMentionGroupFace: FC<KkNewsMentionGroupFaceProps> = ({
  initials,
  tone,
  picture,
}) => {
  const face =
    picture === null ? (
      initials
    ) : (
      <KkCoverPicture
        source={picture.mediumUrl}
        sourceSet={toPictureSourceSet(picture, GROUP_PICTURE_ASPECT)}
        sizes={CARD_SIZES}
        alt=""
      />
    );

  return (
    <Stack
      data-kk-news-mention-face="group"
      sx={(theme) => ({
        aspectRatio: kkTokens.aspectRatio.groupPicture,
        alignItems: 'center',
        justifyContent: 'center',
        typography: 'display',
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        letterSpacing: kkTokens.type.tracking.display,
        bgcolor: 'action.hover',
        borderBottom: kkTokens.line.hair,
        borderColor: 'divider',
        ...(tone === null || picture !== null ? {} : groupToneFieldPaint(theme, tone)),
      })}
    >
      {face}
    </Stack>
  );
};
