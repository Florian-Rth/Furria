import type { FC } from 'react';
import { LinkPageChecking } from '@/features/link-page/components/LinkPageChecking';
import { LinkPageFailed } from '@/features/link-page/components/LinkPageFailed';
import type { IntakePage } from '../hooks/use-intake-page';
import { IntakeClosed } from './IntakeClosed';
import { IntakeDone } from './IntakeDone';
import { IntakeOpen } from './IntakeOpen';

interface IntakeBodyProps {
  page: IntakePage;
}

export const IntakeBody: FC<IntakeBodyProps> = ({ page }) => {
  switch (page.stage) {
    case 'open':
      return <IntakeOpen page={page} />;
    case 'done':
      return <IntakeDone submitted={page.submitted} />;
    case 'checking':
      return <LinkPageChecking />;
    case 'failed':
      return <LinkPageFailed retrying={page.checking} onRetry={page.recheck} />;
    default:
      return <IntakeClosed reason={page.stage} />;
  }
};
