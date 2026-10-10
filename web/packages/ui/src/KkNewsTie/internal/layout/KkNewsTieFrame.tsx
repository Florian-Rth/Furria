import type { FC, PropsWithChildren } from 'react';
import type { KkNewsLink } from '../../../internal/news-surface/news-link';
import { KkCard } from '../../../KkCard/KkCard';
import type { KkSx } from '../../../kk-sx';

interface KkNewsTieFrameProps extends PropsWithChildren {
  label: string;
  link: KkNewsLink;
  sx?: KkSx;
}

export const KkNewsTieFrame: FC<KkNewsTieFrameProps> = ({ label, link, sx, children }) => (
  <KkCard sx={sx}>
    <KkCard.Action component={link.component} to={link.to} aria-label={label}>
      <KkCard.Body>{children}</KkCard.Body>
    </KkCard.Action>
  </KkCard>
);
