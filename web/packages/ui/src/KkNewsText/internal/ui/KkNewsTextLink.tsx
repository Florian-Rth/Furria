import type { FC, PropsWithChildren } from 'react';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';

interface KkNewsTextLinkProps extends PropsWithChildren {
  href: string;
  note: string;
}

export const KkNewsTextLink: FC<KkNewsTextLinkProps> = ({ href, note, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" data-kk-news-text-link>
    {children}
    <KkVisuallyHidden>{` (${note})`}</KkVisuallyHidden>
  </a>
);
