import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import type { KkPictureUrls } from '../../../image-source';
import { toImageSource } from '../../../image-source';
import type { KkGroupTone } from '../../../internal/group-tone';
import { groupToneFieldPaint } from '../../../internal/group-tone';
import { KkCoverPicture } from '../../../KkCoverPicture';
import { kkTokens } from '../../../tokens';

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
  const image = toImageSource(picture, 'groupPicture', CARD_SIZES);
  const face = image === null ? initials : <KkCoverPicture image={image} alt="" />;

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
        ...(tone === null || image !== null ? {} : groupToneFieldPaint(theme, tone)),
      })}
    >
      {face}
    </Stack>
  );
};
