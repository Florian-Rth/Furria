import type { FC } from 'react';
import { LinkPageChecking } from '@/features/link-page/components/LinkPageChecking';
import { LinkPageFailed } from '@/features/link-page/components/LinkPageFailed';
import { LinkPageFrame } from '@/features/link-page/components/LinkPageFrame';
import { useLinkUploadPage } from '../hooks/use-link-upload-page';
import { LinkUploadClosed } from './LinkUploadClosed';
import { LinkUploadOpen } from './LinkUploadOpen';

export const LinkUploadScreen: FC = () => {
  const page = useLinkUploadPage();

  switch (page.stage) {
    case 'open':
      return (
        <LinkPageFrame>
          <LinkUploadOpen page={page} />
        </LinkPageFrame>
      );
    case 'checking':
      return (
        <LinkPageFrame>
          <LinkPageChecking />
        </LinkPageFrame>
      );
    case 'failed':
      return (
        <LinkPageFrame>
          <LinkPageFailed retrying={page.checking} onRetry={page.onRecheck} />
        </LinkPageFrame>
      );
    default:
      return (
        <LinkPageFrame>
          <LinkUploadClosed reason={page.stage} />
        </LinkPageFrame>
      );
  }
};
