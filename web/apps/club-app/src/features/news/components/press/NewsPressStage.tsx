import { KkPressStage } from '@furria/ui';
import type { FC, ReactNode } from 'react';
import type { PressRun } from '../../hooks/use-press-run';
import { PUBLIC_NEWS_PATH, WEBSITE_HOST } from '../../news-copy';
import { ANNOUNCE_FAILED, ANNOUNCE_PUBLISHED, ANNOUNCE_RUNNING } from '../../press-copy';
import type { PressPhase } from '../../press-run';
import { isPressBusy, isStamped, pressAddressOf } from '../../press-run';
import type { NewsPublication } from '../../types';
import { NewsPressStamp } from './NewsPressStamp';

const announcementOf = (
  phase: PressPhase,
  failed: boolean,
  post: NewsPublication | null,
): string => {
  if (failed) {
    return ANNOUNCE_FAILED;
  }
  if (isStamped(phase) && post !== null) {
    return `${ANNOUNCE_PUBLISHED} ${pressAddressOf(WEBSITE_HOST, PUBLIC_NEWS_PATH, post.slug)}`;
  }
  return isPressBusy(phase) ? ANNOUNCE_RUNNING : '';
};

interface NewsPressStageProps {
  run: PressRun;
  signer: string;
  children: ReactNode;
}

export const NewsPressStage: FC<NewsPressStageProps> = ({ run, signer, children }) => {
  const announcement = announcementOf(run.phase, run.failed, run.result);
  const stamp =
    isStamped(run.phase) && run.result !== null ? (
      <NewsPressStamp key={run.runKey} kind={run.kind} post={run.result} signer={signer} />
    ) : null;

  return (
    <KkPressStage
      phase={run.phase}
      failed={run.failed}
      runKey={run.runKey}
      announcement={announcement}
      stamp={stamp}
    >
      {children}
    </KkPressStage>
  );
};
