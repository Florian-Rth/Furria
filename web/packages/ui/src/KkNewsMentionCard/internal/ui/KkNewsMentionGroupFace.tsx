import type { FC } from 'react';
import type { KkPictureUrls } from '../../../image-source';
import { toImageSource } from '../../../image-source';
import type { KkGroupTone } from '../../../internal/group-tone';
import { KkPhoto } from '../../../KkPhoto';
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
  const placeholderTone = tone ?? undefined;

  return (
    <KkPhoto
      alt=""
      image={image}
      aspectRatio={kkTokens.aspectRatio.groupPicture}
      placeholderLabel={initials}
      tone={placeholderTone}
      sx={{ borderRadius: 0, borderBottom: kkTokens.line.hair, borderColor: 'divider' }}
    />
  );
};
