import type { FC, PropsWithChildren } from 'react';
import { KkVisuallyHidden } from '../../../KkVisuallyHidden';

interface KkRichTextLinkProps extends PropsWithChildren {
  href: string;
  note: string;
}

export const KkRichTextLink: FC<KkRichTextLinkProps> = ({ href, note, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" data-kk-rich-text-link>
    {children}
    <KkVisuallyHidden>{` (${note})`}</KkVisuallyHidden>
  </a>
);
