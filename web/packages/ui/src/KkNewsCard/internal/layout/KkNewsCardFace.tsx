import type { FC, PropsWithChildren } from 'react';
import type { KkNewsLink } from '../../../internal/news-surface/news-link';
import { KkCard } from '../../../KkCard/KkCard';

interface KkNewsCardFaceProps extends PropsWithChildren {
  label: string;
  link: KkNewsLink | undefined;
}

export const KkNewsCardFace: FC<KkNewsCardFaceProps> = ({ label, link, children }) => {
  if (link === undefined) {
    return children;
  }

  return (
    <KkCard.Action component={link.component} to={link.to} aria-label={label}>
      {children}
    </KkCard.Action>
  );
};
