import type { FC } from 'react';
import { useLinkUploadPage } from '../hooks/use-link-upload-page';
import { LinkUploadChecking } from './LinkUploadChecking';
import { LinkUploadClosed } from './LinkUploadClosed';
import { LinkUploadFailed } from './LinkUploadFailed';
import { LinkUploadFrame } from './LinkUploadFrame';
import { LinkUploadOpen } from './LinkUploadOpen';

export const LinkUploadScreen: FC = () => {
  const page = useLinkUploadPage();

  switch (page.stage) {
    case 'open':
      return (
        <LinkUploadFrame>
          <LinkUploadOpen page={page} />
        </LinkUploadFrame>
      );
    case 'checking':
      return (
        <LinkUploadFrame>
          <LinkUploadChecking />
        </LinkUploadFrame>
      );
    case 'failed':
      return (
        <LinkUploadFrame>
          <LinkUploadFailed retrying={page.checking} onRetry={page.onRecheck} />
        </LinkUploadFrame>
      );
    default:
      return (
        <LinkUploadFrame>
          <LinkUploadClosed reason={page.stage} />
        </LinkUploadFrame>
      );
  }
};
