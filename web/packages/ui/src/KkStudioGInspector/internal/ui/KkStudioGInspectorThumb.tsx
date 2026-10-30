import type { FC } from 'react';
import { KkPhoto } from '../../../KkPhoto';
import { kkTokens } from '../../../tokens';

interface KkStudioGInspectorThumbProps {
  poster: string;
  alt: string;
}

export const KkStudioGInspectorThumb: FC<KkStudioGInspectorThumbProps> = ({ poster, alt }) => (
  <KkPhoto
    alt={alt}
    image={{ src: poster }}
    aspectRatio="16 / 9"
    fit="cover"
    sx={{ width: '100%', maxWidth: '16rem', borderRadius: `${kkTokens.radius.bar * 2}px` }}
  />
);
