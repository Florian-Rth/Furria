import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { KkNoticeCard } from '../../../KkNotice/internal/ui/KkNoticeCard';
import { KkNoticeRise } from '../../../KkNotice/internal/ui/KkNoticeRise';
import { useKkNoticeManager } from '../../../KkNotice/notice-store';
import { kkTokens } from '../../../tokens';

const { chromeGap } = kkTokens.shell;
const NOTICE_REGION_LABEL = 'Hinweise';

export const KkShellNotice: FC = () => {
  const { current, isOpen, system, labels, dismiss, finishExit } = useKkNoticeManager();

  const urgent =
    current === null ? null : (
      <KkNoticeRise key={current.id} open={isOpen} onExited={finishExit}>
        <KkNoticeCard notice={current} labels={labels} onDismiss={dismiss} />
      </KkNoticeRise>
    );

  const quiet =
    system === null ? null : (
      <KkNoticeRise key={system.id} open>
        <KkNoticeCard notice={system} labels={labels} onDismiss={null} />
      </KkNoticeRise>
    );

  return (
    <Stack
      role="status"
      aria-live="polite"
      aria-label={NOTICE_REGION_LABEL}
      data-kk-shell-notice
      sx={{ minWidth: 0, gap: `${chromeGap}px`, '&:empty': { display: 'none' } }}
    >
      {urgent}
      {quiet}
    </Stack>
  );
};
