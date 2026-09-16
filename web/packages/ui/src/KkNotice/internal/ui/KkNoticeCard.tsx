import Collapse from '@mui/material/Collapse';
import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { useState } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { applyScheme } from '../../../internal/scheme-paint';
import { useReducedMotion } from '../../../internal/use-reduced-motion';
import { KkIconButton } from '../../../KkIconButton';
import { kkTokens } from '../../../tokens';
import type { KkNoticeLabels, KkNoticeRequest } from '../../notice-declaration';
import { awaitsAnswer } from '../logic/notice-queue';
import { noticeEdgeScheme } from '../logic/notice-tone';
import { KkNoticeActions } from './KkNoticeActions';
import { KkNoticeDetail } from './KkNoticeDetail';
import { KkNoticeLine } from './KkNoticeLine';
import { KkNoticeToggle } from './KkNoticeToggle';

const { detailGap } = kkTokens.shell.notice;
const CARD_DENSITY = 1;
const INSTANT = 0;
const HEAD_GAP = 0.5;

interface KkNoticeCardProps {
  notice: KkNoticeRequest;
  labels: KkNoticeLabels;
  onDismiss: (() => void) | null;
}

export const KkNoticeCard: FC<KkNoticeCardProps> = ({ notice, labels, onDismiss }) => {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();
  const expandable = awaitsAnswer(notice);
  const toggleLabel = expanded ? labels.collapse : labels.expand;
  const lineHeight = expandable ? undefined : kkTokens.tapTarget;
  const collapseTimeout = reducedMotion ? INSTANT : undefined;

  const toggle = (): void => {
    setExpanded(!expanded);
  };

  const line = (
    <KkNoticeLine
      tone={notice.tone}
      message={notice.message}
      icon={notice.icon}
      sx={{ flexGrow: 1, minHeight: lineHeight }}
    />
  );

  const head = expandable ? (
    <KkNoticeToggle expanded={expanded} label={toggleLabel} onSelect={toggle}>
      {line}
    </KkNoticeToggle>
  ) : (
    line
  );

  const dismiss =
    onDismiss === null ? null : (
      <KkIconButton label={labels.dismiss} icon="close" size="small" onClick={onDismiss} />
    );

  const detail = notice.detail === undefined ? null : <KkNoticeDetail rows={notice.detail} />;
  const actions =
    notice.actions === undefined ? null : <KkNoticeActions actions={notice.actions} />;

  const body = expandable ? (
    <Collapse in={expanded} timeout={collapseTimeout} unmountOnExit>
      <Stack sx={{ minWidth: 0, gap: detailGap, pt: 0.5, pb: 1 }}>
        {detail}
        {actions}
      </Stack>
    </Collapse>
  ) : null;

  return (
    <KkChrome
      density={CARD_DENSITY}
      sx={(theme) => ({
        borderWidth: kkTokens.line.section,
        pl: 1.75,
        pr: 0.75,
        ...applyScheme(theme, noticeEdgeScheme(notice.tone), {
          light: { boxShadow: kkTokens.shadow.raised },
          dark: { boxShadow: kkTokens.chrome.dark.lift },
        }),
      })}
    >
      <Stack direction="row" sx={{ minWidth: 0, alignItems: 'center', gap: HEAD_GAP }}>
        {head}
        {dismiss}
      </Stack>
      {body}
    </KkChrome>
  );
};
